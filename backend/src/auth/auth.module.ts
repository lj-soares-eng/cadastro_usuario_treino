import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtSecret } from './auth.constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ActiveSessionsService } from './active-sessions.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SessionHeartbeatGateway } from './session-heartbeat.gateway';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { WsRolesGuard } from './guards/ws-roles.guard';
import { RolesGuard } from './roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '20min' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ActiveSessionsService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    WsJwtAuthGuard,
    WsRolesGuard,
    SessionHeartbeatGateway,
  ],
  exports: [
    ActiveSessionsService,
    JwtAuthGuard,
    JwtModule,
    RolesGuard,
    WsJwtAuthGuard,
    WsRolesGuard,
  ],
})
export class AuthModule {}
