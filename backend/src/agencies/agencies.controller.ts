import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Request, UploadedFile, UseGuards, UseInterceptors, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../auth/entities/user.entity';
import { AgenciesService } from './agencies.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Controller('api/agencies')
export class AgenciesController {
  constructor(private readonly agenciesService: AgenciesService) {}

  @Get()
  getAllAgencies() {
    return this.agenciesService.getAllAgencies();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyAgency(@Request() req: any) {
    if (!req.user?.agencyId) {
      throw new ForbiddenException('Agency not found');
    }
    return this.agenciesService.getAgencyById(req.user.agencyId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateAgency(
    @Request() req: any,
    @Param('id') id: number,
    @Body() payload: any,
  ) {
    if (req.user.role === UserRole.AGENCY_ADMIN && Number(id) !== req.user.agencyId) {
      throw new ForbiddenException('Access denied');
    }
    return this.agenciesService.updateAgency(Number(id), payload);
  }

  @Post(':id/logo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'agency-logos');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeExt = ext && ext.length <= 6 ? ext : '.png';
        cb(null, `agency-logo-${Date.now()}${safeExt}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Only image files are allowed.'), false);
      }
      return cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  async uploadLogo(
    @Request() req: any,
    @Param('id') id: number,
    @UploadedFile() file?: any,
  ) {
    const agencyId = Number(id);
    if (req.user.role === UserRole.AGENCY_ADMIN && agencyId !== req.user.agencyId) {
      throw new ForbiddenException('Access denied');
    }
    if (!file) {
      throw new BadRequestException('Logo file is required.');
    }
    const logoUrl = `/uploads/agency-logos/${file.filename}`;
    return this.agenciesService.updateAgency(agencyId, { logoUrl });
  }

  @Get('lookup')
  async lookupByPostcode(@Query('postcode') postcode: string) {
    if (!postcode) {
      return {
        success: false,
        message: 'Postcode is required',
        agencies: []
      };
    }

    const agencies = await this.agenciesService.findAgenciesByPostcode(postcode);
    
    if (agencies.length === 0) {
      // If no exact match, return nearest agency
      return {
        success: true,
        message: 'No agencies found for this postcode, suggesting nearby agency',
        agencies: [await this.agenciesService.findNearestAgency()],
        exact: false
      };
    }

    return {
      success: true,
      message: 'Agencies found for this postcode',
      agencies: agencies,
      exact: true
    };
  }
}
