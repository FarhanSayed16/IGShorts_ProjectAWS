import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cwActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';

export interface IgshortsStackProps extends cdk.StackProps {
  stage: 'staging' | 'production';
}

export class IgshortsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IgshortsStackProps) {
    super(scope, id, props);

    const { stage } = props;
    const isProd = stage === 'production';
    const repoRoot = path.join(__dirname, '..', '..');
    const certificateArn = this.node.tryGetContext('certificateArn') as string | undefined;
    const alertEmail = this.node.tryGetContext('alertEmail') as string | undefined;
    const siteUrl = this.node.tryGetContext('siteUrl') as string | undefined;
    const publicProtocol = certificateArn ? 'https' : 'http';

    // 1. Networking: VPC in ap-south-1 (Mumbai)
    const vpc = new ec2.Vpc(this, 'IgshortsVpc', {
      maxAzs: 2,
      natGateways: isProd ? 2 : 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'PrivateCompute',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 28,
          name: 'PrivateIsolatedData',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // 2. Storage: S3 Bucket for imports & backups
    const importsBucket = new s3.Bucket(this, 'ImportsBucket', {
      bucketName: `igshorts-imports-${stage}-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd,
      lifecycleRules: [
        {
          id: 'ExpireTemporaryUploads',
          expiration: cdk.Duration.days(30),
          prefix: 'temp/',
        },
      ],
    });

    // 3. Secrets: Database and Application Secrets
    const dbSecret = new secretsmanager.Secret(this, 'DbCredentialsSecret', {
      secretName: `igshorts/${stage}/database`,
      description: 'Credentials for IGshorts RDS PostgreSQL database',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'igshorts_admin' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 24,
      },
    });

    const jwtSecret = new secretsmanager.Secret(this, 'AdminJwtSecret', {
      secretName: `igshorts/${stage}/admin-jwt`,
      description: 'Admin JWT signing secret',
      generateSecretString: {
        passwordLength: 48,
        excludePunctuation: true,
      },
    });

    const adminApiKeySecret = new secretsmanager.Secret(this, 'AdminApiKeySecret', {
      secretName: `igshorts/${stage}/admin-api-key`,
      description: 'Optional machine-to-machine admin API key',
      generateSecretString: {
        passwordLength: 40,
        excludePunctuation: true,
      },
    });

    const jobsSecret = new secretsmanager.Secret(this, 'JobsSecret', {
      secretName: `igshorts/${stage}/jobs-secret`,
      description: 'Shared secret for internal daily job HTTP trigger',
      generateSecretString: {
        passwordLength: 40,
        excludePunctuation: true,
      },
    });

    const adminBootstrapSecret = new secretsmanager.Secret(this, 'AdminBootstrapSecret', {
      secretName: `igshorts/${stage}/admin-bootstrap`,
      description: 'First admin login (used only when admin_users is empty)',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          email: `admin@${stage}.igshorts.internal`,
        }),
        generateStringKey: 'password',
        passwordLength: 24,
        excludePunctuation: true,
      },
    });

    // 4. Database: RDS PostgreSQL 16
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc,
      description: 'Security group for IGshorts RDS PostgreSQL database',
      allowAllOutbound: false,
    });

    const dbInstance = new rds.DatabaseInstance(this, 'PostgresDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_3,
      }),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [dbSecurityGroup],
      instanceType: isProd
        ? ec2.InstanceType.of(ec2.InstanceClass.R6G, ec2.InstanceSize.LARGE)
        : ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      credentials: rds.Credentials.fromSecret(dbSecret),
      databaseName: 'igshorts_db',
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      backupRetention: cdk.Duration.days(isProd ? 30 : 7),
      multiAz: isProd,
      deletionProtection: isProd,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.SNAPSHOT,
    });

    // 5. Compute: ECS Cluster on AWS Fargate
    const cluster = new ecs.Cluster(this, 'IgshortsCluster', {
      vpc,
      clusterName: `igshorts-${stage}-cluster`,
      containerInsights: true,
    });

    // Security Groups for ECS Services
    const ecsSecurityGroup = new ec2.SecurityGroup(this, 'EcsServiceSecurityGroup', {
      vpc,
      description: 'Security group for IGshorts ECS Fargate services',
      allowAllOutbound: true,
    });

    // Allow ECS services to connect to PostgreSQL database
    dbSecurityGroup.addIngressRule(
      ecsSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow inbound PostgreSQL connection from ECS tasks',
    );

    // 6. Application Load Balancer
    const albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc,
      description: 'Security group for IGshorts public ALB',
      allowAllOutbound: true,
    });
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP traffic');
    albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS traffic');

    const alb = new elbv2.ApplicationLoadBalancer(this, 'IgshortsAlb', {
      vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
      loadBalancerName: `igshorts-${stage}-alb`,
    });

    const httpListener = alb.addListener('HttpListener', {
      port: 80,
      open: true,
    });

    // 7. ECS Fargate Service: API Backend (Port 4000)
    const apiTaskDef = new ecs.FargateTaskDefinition(this, 'ApiTaskDef', {
      memoryLimitMiB: 1024,
      cpu: 512,
    });

    importsBucket.grantReadWrite(apiTaskDef.taskRole);
    dbSecret.grantRead(apiTaskDef.taskRole);
    jwtSecret.grantRead(apiTaskDef.taskRole);
    adminApiKeySecret.grantRead(apiTaskDef.taskRole);
    jobsSecret.grantRead(apiTaskDef.taskRole);
    adminBootstrapSecret.grantRead(apiTaskDef.taskRole);

    const apiImage = ecs.ContainerImage.fromAsset(repoRoot, {
      file: 'apps/api/Dockerfile',
    });

    const apiContainer = apiTaskDef.addContainer('api', {
      image: apiImage,
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: `igshorts-${stage}-api`,
      }),
      environment: {
        NODE_ENV: 'production',
        PORT: '4000',
        API_PREFIX: 'api/v1',
        AWS_REGION: this.region,
        S3_BUCKET_IMPORTS: importsBucket.bucketName,
        PROVIDER: 'seed',
        CRON_ENABLED: 'false',
        CORS_ORIGIN: `${publicProtocol}://${alb.loadBalancerDnsName}`,
      },
      secrets: {
        DB_HOST: ecs.Secret.fromSecretsManager(dbSecret, 'host'),
        DB_PORT: ecs.Secret.fromSecretsManager(dbSecret, 'port'),
        DB_USER: ecs.Secret.fromSecretsManager(dbSecret, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(dbSecret, 'password'),
        DB_NAME: ecs.Secret.fromSecretsManager(dbSecret, 'dbname'),
        ADMIN_JWT_SECRET: ecs.Secret.fromSecretsManager(jwtSecret),
        ADMIN_API_KEY: ecs.Secret.fromSecretsManager(adminApiKeySecret),
        JOBS_SECRET: ecs.Secret.fromSecretsManager(jobsSecret),
        ADMIN_BOOTSTRAP_EMAIL: ecs.Secret.fromSecretsManager(adminBootstrapSecret, 'email'),
        ADMIN_BOOTSTRAP_PASSWORD: ecs.Secret.fromSecretsManager(adminBootstrapSecret, 'password'),
      },
    });

    apiContainer.addPortMappings({
      containerPort: 4000,
      protocol: ecs.Protocol.TCP,
    });

    const apiService = new ecs.FargateService(this, 'ApiService', {
      cluster,
      taskDefinition: apiTaskDef,
      desiredCount: isProd ? 2 : 1,
      securityGroups: [ecsSecurityGroup],
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      serviceName: `igshorts-${stage}-api`,
    });

    // 8. ECS Fargate Service: Next.js Web Frontend (Port 3000)
    const webTaskDef = new ecs.FargateTaskDefinition(this, 'WebTaskDef', {
      memoryLimitMiB: 1024,
      cpu: 512,
    });

    const webContainer = webTaskDef.addContainer('web', {
      image: ecs.ContainerImage.fromAsset(repoRoot, {
        file: 'apps/web/Dockerfile',
        buildArgs: {
          // Same-origin via ALB `/api/*` path routing. Do not pass the ALB DNS token here —
          // Docker builds cannot resolve CloudFormation values.
          NEXT_PUBLIC_API_URL: '/api/v1',
          NEXT_PUBLIC_SITE_URL: siteUrl || '',
        },
      }),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: `igshorts-${stage}-web`,
      }),
      environment: {
        NODE_ENV: 'production',
        PORT: '3000',
        NEXT_PUBLIC_SITE_URL: `${publicProtocol}://${alb.loadBalancerDnsName}`,
        API_INTERNAL_URL: `${publicProtocol}://${alb.loadBalancerDnsName}/api/v1`,
      },
    });

    webContainer.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    });

    const webService = new ecs.FargateService(this, 'WebService', {
      cluster,
      taskDefinition: webTaskDef,
      desiredCount: isProd ? 2 : 1,
      securityGroups: [ecsSecurityGroup],
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      serviceName: `igshorts-${stage}-web`,
    });

    const webTargetProps: elbv2.AddApplicationTargetsProps = {
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [webService],
      healthCheck: {
        path: '/',
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        timeout: cdk.Duration.seconds(5),
        interval: cdk.Duration.seconds(30),
      },
    };

    const apiTargetProps: elbv2.AddApplicationTargetsProps = {
      priority: 10,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/api/*'])],
      port: 4000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [apiService],
      healthCheck: {
        path: '/api/v1/health',
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        timeout: cdk.Duration.seconds(5),
        interval: cdk.Duration.seconds(30),
      },
    };

    let edgeListener: elbv2.ApplicationListener = httpListener;
    if (certificateArn) {
      const certificate = acm.Certificate.fromCertificateArn(
        this,
        'AlbCertificate',
        certificateArn,
      );
      const httpsListener = alb.addListener('HttpsListener', {
        port: 443,
        certificates: [certificate],
        open: true,
      });
      httpListener.addAction('RedirectToHttps', {
        action: elbv2.ListenerAction.redirect({
          protocol: 'HTTPS',
          port: '443',
          permanent: true,
        }),
      });
      edgeListener = httpsListener;
    }

    edgeListener.addTargets('WebTarget', webTargetProps);
    edgeListener.addTargets('ApiTarget', apiTargetProps);

    // 9. Scheduled Daily Ingestion & Ranking Task (EventBridge)
    const pipelineTaskDef = new ecs.FargateTaskDefinition(this, 'PipelineTaskDef', {
      memoryLimitMiB: 2048,
      cpu: 1024,
    });
    importsBucket.grantReadWrite(pipelineTaskDef.taskRole);
    dbSecret.grantRead(pipelineTaskDef.taskRole);
    jwtSecret.grantRead(pipelineTaskDef.taskRole);

    pipelineTaskDef.addContainer('pipeline-runner', {
      image: apiImage,
      command: ['node', 'apps/api/dist/scripts/run-pipeline.js'],
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: `igshorts-${stage}-pipeline`,
      }),
      environment: {
        NODE_ENV: 'production',
        AWS_REGION: this.region,
        S3_BUCKET_IMPORTS: importsBucket.bucketName,
        PROVIDER: 'seed',
      },
      secrets: {
        DB_HOST: ecs.Secret.fromSecretsManager(dbSecret, 'host'),
        DB_PORT: ecs.Secret.fromSecretsManager(dbSecret, 'port'),
        DB_USER: ecs.Secret.fromSecretsManager(dbSecret, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(dbSecret, 'password'),
        DB_NAME: ecs.Secret.fromSecretsManager(dbSecret, 'dbname'),
        ADMIN_JWT_SECRET: ecs.Secret.fromSecretsManager(jwtSecret),
      },
    });

    // Scheduled EventBridge Rule: Run daily at 02:00 UTC (07:30 IST)
    const dailyRule = new events.Rule(this, 'DailyPipelineSchedule', {
      ruleName: `igshorts-${stage}-daily-pipeline`,
      description: 'Triggers daily Instagram follower ingestion and ranking recalculation',
      schedule: events.Schedule.cron({ minute: '0', hour: '2' }),
    });

    dailyRule.addTarget(
      new eventTargets.EcsTask({
        cluster,
        taskDefinition: pipelineTaskDef,
        subnetSelection: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        securityGroups: [ecsSecurityGroup],
      }),
    );

    // 10. AWS WAF: Rate Limiting & OWASP Common Protection
    const wafAcl = new wafv2.CfnWebACL(this, 'IgshortsWaf', {
      defaultAction: { allow: {} },
      scope: 'REGIONAL',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `igshorts-${stage}-waf-metrics`,
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          name: 'RateLimit2000Per5Min',
          priority: 1,
          action: { block: {} },
          statement: {
            rateBasedStatement: {
              limit: 2000,
              aggregateKeyType: 'IP',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'RateLimit2000Metric',
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'AWSManagedRulesCommonRuleSet',
          priority: 2,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesCommonRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'AWSCommonRulesMetric',
            sampledRequestsEnabled: true,
          },
        },
      ],
    });

    new wafv2.CfnWebACLAssociation(this, 'WafAlbAssociation', {
      resourceArn: alb.loadBalancerArn,
      webAclArn: wafAcl.attrArn,
    });

    // 11. Observability: CloudWatch Alarms & SNS Alerting
    const alertTopic = new sns.Topic(this, 'AlertsTopic', {
      topicName: `igshorts-${stage}-alerts`,
      displayName: `IGshorts ${stage.toUpperCase()} Operational Alerts`,
    });
    if (alertEmail) {
      alertTopic.addSubscription(new snsSubscriptions.EmailSubscription(alertEmail));
    }

    // Alarm: 5XX Errors on ALB (> 10 in 5 minutes)
    const alb5xxAlarm = new cloudwatch.Alarm(this, 'Alb5xxAlarm', {
      alarmName: `igshorts-${stage}-alb-5xx-high`,
      alarmDescription: 'Triggers when ALB records more than 10 5XX responses within 5 minutes',
      metric: alb.metrics.httpCodeElb(elbv2.HttpCodeElb.ELB_5XX_COUNT, {
        period: cdk.Duration.minutes(5),
        statistic: 'sum',
      }),
      threshold: 10,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    alb5xxAlarm.addAlarmAction(new cwActions.SnsAction(alertTopic));

    // Alarm: Stale Rankings Metric Alarm (> 36 hours)
    const staleRankingsMetric = new cloudwatch.Metric({
      namespace: 'IGshorts/Pipeline',
      metricName: 'HoursSinceLastRankingRun',
      period: cdk.Duration.hours(12),
      statistic: 'maximum',
    });

    const jobFailedMetric = new cloudwatch.Metric({
      namespace: 'IGshorts/Pipeline',
      metricName: 'JobFailed',
      period: cdk.Duration.minutes(5),
      statistic: 'sum',
    });

    const jobFailedAlarm = new cloudwatch.Alarm(this, 'JobFailedAlarm', {
      alarmName: `igshorts-${stage}-job-failed`,
      alarmDescription: 'Triggers when a daily pipeline run reports failure',
      metric: jobFailedMetric,
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    jobFailedAlarm.addAlarmAction(new cwActions.SnsAction(alertTopic));

    const staleRankingsAlarm = new cloudwatch.Alarm(this, 'StaleRankingsAlarm', {
      alarmName: `igshorts-${stage}-stale-rankings`,
      alarmDescription: 'Triggers when no ranking recalculation has occurred in more than 36 hours',
      metric: staleRankingsMetric,
      threshold: 36,
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    });
    staleRankingsAlarm.addAlarmAction(new cwActions.SnsAction(alertTopic));

    // Outputs
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: alb.loadBalancerDnsName,
      description: 'Public Application Load Balancer DNS',
    });

    new cdk.CfnOutput(this, 'S3ImportsBucket', {
      value: importsBucket.bucketName,
      description: 'S3 Bucket for Seed & Batch Ingestion Imports',
    });

    new cdk.CfnOutput(this, 'RdsEndpoint', {
      value: dbInstance.dbInstanceEndpointAddress,
      description: 'RDS PostgreSQL Endpoint Address',
    });

    new cdk.CfnOutput(this, 'AdminBootstrapSecretArn', {
      value: adminBootstrapSecret.secretArn,
      description: 'Retrieve email/password for the first admin login (Secrets Manager)',
    });
  }
}
