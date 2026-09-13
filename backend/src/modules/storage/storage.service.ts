import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: S3Client | null = null;
  private bucket: string;
  private publicUrl: string;

  private readonly ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  private readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = this.configService.get<string>('R2_BUCKET', 'hanastore-bucket');
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL', '');

    if (endpoint && accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.logger.warn('R2 credentials not configured - storage will use placeholder/mock mode');
    }
  }

  async upload(file: Express.Multer.File, folder = 'uploads'): Promise<{ url: string; key: string }> {
    this.validateFile(file);
    const ext = file.originalname.split('.').pop();
    const key = `${folder}/${randomUUID()}.${ext}`;

    if (!this.s3) {
      // Mock mode for dev without R2
      const mockUrl = this.publicUrl ? `${this.publicUrl}/${key}` : `https://mock-r2.local/${key}`;
      this.logger.log(`Mock upload: ${key} -> ${mockUrl}`);
      return { url: mockUrl, key };
    }

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = this.publicUrl ? `${this.publicUrl}/${key}` : `${this.configService.get('R2_ENDPOINT')}/${this.bucket}/${key}`;
    return { url, key };
  }

  async delete(key: string) {
    if (!this.s3) {
      this.logger.log(`Mock delete: ${key}`);
      return { message: 'Mock deleted' };
    }
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    return { message: 'Deleted' };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (!this.s3) {
      return this.publicUrl ? `${this.publicUrl}/${key}?signed=mock` : `https://mock-r2.local/${key}?signed=mock`;
    }
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    if (!this.ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type: ${file.mimetype}. Allowed: ${this.ALLOWED_MIME.join(', ')}`);
    }
    if (file.size > this.MAX_SIZE) {
      throw new BadRequestException(`File too large: ${file.size} bytes. Max ${this.MAX_SIZE} bytes`);
    }
    // Block executable extensions
    const blocked = ['.exe', '.sh', '.bat', '.js', '.php'];
    const lower = file.originalname.toLowerCase();
    if (blocked.some((ext) => lower.endsWith(ext))) throw new BadRequestException('Executable files not allowed');
  }
}
