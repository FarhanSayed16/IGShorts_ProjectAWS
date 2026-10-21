#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { IgshortsStack } from '../lib/igshorts-stack.js';

const app = new cdk.App();

// Target AWS Region: ap-south-1 (Mumbai)
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'ap-south-1',
};

new IgshortsStack(app, 'IgshortsStagingStack', {
  env,
  stage: 'staging',
  description: 'IGshorts Production-Grade Staging Infrastructure (ap-south-1)',
});

app.synth();
