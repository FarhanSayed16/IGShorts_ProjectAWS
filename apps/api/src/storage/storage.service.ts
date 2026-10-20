import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly config: ConfigService) {}

  async saveFile(fileName: string, buffer: Buffer): Promise<string> {
    const safeName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const stamped = `${Date.now()}-${safeName}`;
    const dir = path.join(process.cwd(), 'storage', 'uploads');
    await mkdir(dir, { recursive: true });
    const target = path.join(dir, stamped);
    await writeFile(target, buffer);
    this.logger.log(`Saved import file to ${target}`);

    const bucket = this.config.get<string>('app.s3BucketImports') || '';
    if (bucket) {
      try {
        await this.uploadToS3(bucket, `imports/${stamped}`, buffer);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown S3 error';
        this.logger.error(`S3 upload failed (local copy retained for parse): ${message}`);
      }
    }

    return target;
  }

  private async uploadToS3(bucket: string, key: string, body: Buffer) {
    const { PutObjectCommand, S3Client } = await import('@aws-sdk/client-s3');
    const region = this.config.get<string>('app.awsRegion') || 'ap-south-1';
    const client = new S3Client({ region });
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    );
    this.logger.log(`Copied import file to s3://${bucket}/${key}`);
  }
}
