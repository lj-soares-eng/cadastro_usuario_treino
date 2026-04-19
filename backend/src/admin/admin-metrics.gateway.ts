import { Logger, OnModuleDestroy } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import { ActiveSessionsService } from '../auth/active-sessions.service';
import { AdminSocketAuthService } from './admin-socket-auth.service';
import { SystemMetricsService } from './system-metrics.service';

/* Intervalo de atualização das métricas */
const METRICS_INTERVAL_MS = 1000;

/* Função para obter a origem do CORS */
function adminCorsOrigin(): string {
  return process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
}

/* Gateway de métricas de administração */
@WebSocketGateway({
  namespace: '/admin',
  cors: {
    origin: adminCorsOrigin(),
    credentials: true,
  },
})
export class AdminMetricsGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleDestroy
{
  /* Logger */
  private readonly logger = new Logger(AdminMetricsGateway.name);
  /* Intervalo de atualização das métricas */
  private metricsInterval?: ReturnType<typeof setInterval>;

  /* Servidor WebSocket */
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly adminSocketAuth: AdminSocketAuthService,
    private readonly systemMetrics: SystemMetricsService,
    private readonly activeSessions: ActiveSessionsService,
  ) {}

  /* Função para configurar o intervalo de atualização das métricas */
  afterInit(server: Server): void {
    /* Configura o intervalo de atualização das métricas */
    this.metricsInterval = setInterval(() => {
      void this.emitMetrics(server);
    }, METRICS_INTERVAL_MS);
  }

  /* Função para limpar o intervalo de atualização das métricas */
  onModuleDestroy(): void {
    /* Limpa o intervalo de atualização das métricas */
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }

  /* Função para emitir as métricas */
  private async emitMetrics(server: Server): Promise<void> {
    try {
      const activeSessionsCount =
        await this.activeSessions.cleanupAndCountActiveSessions();
      /* Obtém as métricas */
      const payload = await this.systemMetrics.sample(
        activeSessionsCount,
      );
      /* Emite as métricas */
      server.emit('metrics', payload);
    } catch (err) {
      /* Log de erro */
      this.logger.warn(
        `Falha ao emitir métricas: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  /* Função para lidar com a conexão do cliente */
  async handleConnection(client: Socket): Promise<void> {
    /* Verifica se o cliente é um administrador */
    const ok = await this.adminSocketAuth.verifyAdminSocket(client);
    if (!ok) {
      client.disconnect(true);
      return;
    }
    client.data.adminMetricsSession = true as const;
  }
  
  /* Função para lidar com a desconexão do cliente */
  handleDisconnect(client: Socket): void {
    if (client.data.adminMetricsSession) {
      client.data.adminMetricsSession = false;
    }
  }
}
