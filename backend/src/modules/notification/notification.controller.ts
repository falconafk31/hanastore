import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('email/test')
  @Roles('admin')
  sendTest(@Body() body: { to: string; subject: string; html: string }) {
    return this.notificationService.sendEmail(body);
  }

  @Post('whatsapp/test')
  @Roles('admin')
  sendWhatsAppTest(@Body() body: { to: string; message: string }) {
    return this.notificationService.sendWhatsApp(body.to, body.message);
  }
}
