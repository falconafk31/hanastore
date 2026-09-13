import { Controller, Post, Delete, Get, Query, UseInterceptors, UploadedFile, UseGuards, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('storage')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('upload')
  @Roles('admin', 'operator')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.storageService.upload(file, 'equipment');
  }

  @Delete(':key')
  @Roles('admin')
  delete(@Param('key') key: string) {
    // key may contain slashes - use query param alternative? For simplicity allow param
    return this.storageService.delete(decodeURIComponent(key));
  }

  @Get('signed-url')
  @Roles('admin', 'operator', 'customer')
  signedUrl(@Query('key') key: string, @Query('expiresIn') expiresIn?: string) {
    return this.storageService.getSignedUrl(key, expiresIn ? parseInt(expiresIn, 10) : 3600);
  }
}
