import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminMetricsGateway } from './admin-metrics.gateway';
import { AdminSocketAuthService } from './admin-socket-auth.service';
import { SystemMetricsService } from './system-metrics.service';

@Module({
  imports: [AuthModule],
  providers: [AdminMetricsGateway, SystemMetricsService, AdminSocketAuthService],
})
export class AdminModule {}
