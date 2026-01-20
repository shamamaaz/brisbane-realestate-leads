import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  async getOverview() {
    return this.adminService.getOverview();
  }
}
