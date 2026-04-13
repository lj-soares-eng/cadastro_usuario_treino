import { Injectable } from '@nestjs/common';
import * as os from 'os';
import * as si from 'systeminformation';

/* Tipo de dado para as métricas de administração */
export type AdminMetricsPayload = {
  timestamp: number;
  activeAdminConnections: number;
  cpuPercent: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    systemUsed: number;
    systemTotal: number;
  };
  network: {
    rxBytesPerSec: number;
    txBytesPerSec: number;
  } | null;
};

/* Serviço de métricas de sistema */
@Injectable()
export class SystemMetricsService {
  /* Último uso da CPU */
  private lastCpuUsage = process.cpuUsage();
  /* Última amostra */
  private lastSampleAt = Date.now();

  /* Função para amostrar as métricas */
  async sample(activeAdminConnections: number): Promise<AdminMetricsPayload> {
    /* Obtém a data e hora atual */
    const now = Date.now();
    const dtSec = Math.max((now - this.lastSampleAt) / 1000, 0.001);
    /* Obtém o delta da CPU */
    const cpuDelta = process.cpuUsage(this.lastCpuUsage);
    /* Obtém o tempo de uso da CPU */
    const cpuUserSec = cpuDelta.user / 1e6;
    /* Obtém o tempo de uso da CPU */
    const cpuSysSec = cpuDelta.system / 1e6;
    /* Obtém o tempo de uso da CPU */
    const cpuBusySec = cpuUserSec + cpuSysSec;
    const cpus = Math.max(1, os.cpus().length);
    /* Obtém o percentual de uso da CPU */
    const cpuPercent = Math.min(
      100,
      (cpuBusySec / dtSec / cpus) * 100,
    );
    /* Atualiza o último uso da CPU */
    this.lastCpuUsage = process.cpuUsage();
    /* Atualiza a última amostra */
    this.lastSampleAt = now;

    /* Obtém as métricas de memória */
    const pm = process.memoryUsage();
    /* Obtém o total de memória do sistema */
    const systemTotal = os.totalmem();
    /* Obtém o total de memória usada */
    const systemUsed = systemTotal - os.freemem();

    let network: AdminMetricsPayload['network'] = null;
    try {
      const stats = await si.networkStats();
      /* Obtém o total de bytes recebidos */
      let rxBytesPerSec = 0;
      /* Obtém o total de bytes enviados */
      let txBytesPerSec = 0;
      for (const row of stats) {
        rxBytesPerSec += row.rx_sec ?? 0;
        txBytesPerSec += row.tx_sec ?? 0;
      }
      /* Obtém as métricas de rede */
        network = {
        rxBytesPerSec: Math.max(0, rxBytesPerSec),
        txBytesPerSec: Math.max(0, txBytesPerSec),
      };
    } catch {
      /* Define as métricas de rede como null */
      network = null;
    }

    /* Retorna as métricas */
    return {
      timestamp: now,
      activeAdminConnections,
      cpuPercent,
      memory: {
        heapUsed: pm.heapUsed,
        heapTotal: pm.heapTotal,
        rss: pm.rss,
        systemUsed,
        systemTotal,
      },
      network,
    };
  }
}
