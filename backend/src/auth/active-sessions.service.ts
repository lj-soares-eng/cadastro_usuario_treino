import { Injectable, Logger } from '@nestjs/common';
import * as net from 'node:net';

const ACTIVE_SESSIONS_KEY = 'active_sessions';
const WEB_SESSION_TTL_SECONDS = 60;

export type SessionClientType = 'web' | 'api';

type RedisConfig = {
  host: string;
  port: number;
  password: string | null;
  db: number | null;
};

@Injectable()
export class ActiveSessionsService {
  private readonly logger = new Logger(ActiveSessionsService.name);
  private readonly redisConfig = this.parseRedisUrl();

  /* Registra sessão com score inicial por tipo de cliente. */
  async registerSession(
    jti: string,
    jwtExpUnix: number,
    clientType: SessionClientType,
  ): Promise<void> {
    const score = this.initialScore(clientType, jwtExpUnix);
    if (score <= this.unixNow()) {
      return;
    }
    await this.safeCommand(['ZADD', ACTIVE_SESSIONS_KEY, `${score}`, jti]);
  }

  /* Heartbeat web: estende só a janela volátil, nunca o exp real do JWT. */
  async touchWebSession(jti: string, jwtExpUnix: number): Promise<void> {
    const now = this.unixNow();
    const nextScore = Math.min(now + WEB_SESSION_TTL_SECONDS, jwtExpUnix);
    if (nextScore <= now) {
      await this.removeSession(jti);
      return;
    }
    await this.safeCommand(['ZADD', ACTIVE_SESSIONS_KEY, `${nextScore}`, jti]);
  }

  /* Remove sessão explicitamente (logout/beacon). */
  async removeSession(jti: string): Promise<void> {
    await this.safeCommand(['ZREM', ACTIVE_SESSIONS_KEY, jti]);
  }

  /* Limpa expirados e retorna contagem atomica em 1 round-trip. */
  async cleanupAndCountActiveSessions(now = this.unixNow()): Promise<number> {
    const script =
      "redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[1]);"+
      "return redis.call('ZCARD', KEYS[1]);";
    const result = await this.safeCommand([
      'EVAL',
      script,
      '1',
      ACTIVE_SESSIONS_KEY,
      `${now}`,
    ]);

    if (typeof result === 'number') {
      return Math.max(0, result);
    }
    if (typeof result === 'string') {
      const asNumber = Number(result);
      return Number.isFinite(asNumber) ? Math.max(0, asNumber) : 0;
    }
    return 0;
  }

  private initialScore(
    clientType: SessionClientType,
    jwtExpUnix: number,
  ): number {
    const now = this.unixNow();
    if (clientType === 'web') {
      return Math.min(now + WEB_SESSION_TTL_SECONDS, jwtExpUnix);
    }
    return jwtExpUnix;
  }

  private unixNow(): number {
    return Math.floor(Date.now() / 1000);
  }

  private parseRedisUrl(): RedisConfig | null {
    const raw = process.env.REDIS_URL;
    if (!raw) {
      this.logger.warn(
        'REDIS_URL nao definido, monitoramento ' + 
        'de sessoes ativas desabilitado.',
      );
      return null;
    }
    try {
      const parsed = new URL(raw);
      return {
        host: parsed.hostname || '127.0.0.1',
        port: parsed.port ? Number(parsed.port) : 6379,
        password: parsed.password || null,
        db: parsed.pathname ? Number(parsed.pathname.replace('/', '')) : null,
      };
    } catch (err) {
      this.logger.error(
        `REDIS_URL invalido: ${err instanceof Error ? err.message : err}`,
      );
      return null;
    }
  }

  private async safeCommand(args: string[]): Promise<number | string | null> {
    if (!this.redisConfig) {
      return null;
    }
    try {
      return await this.execRedisCommand(args);
    } catch (err) {
      this.logger.warn(
        `Falha no comando Redis ${args[0]}: ${err instanceof Error ? err.message : err}`,
      );
      return null;
    }
  }

  private execRedisCommand(args: string[]): Promise<number | string | null> {
    const cfg = this.redisConfig;
    if (!cfg) {
      return Promise.resolve(null);
    }

    const commandChain: string[][] = [];
    if (cfg.password) {
      commandChain.push(['AUTH', cfg.password]);
    }
    if (cfg.db !== null && Number.isInteger(cfg.db) && cfg.db >= 0) {
      commandChain.push(['SELECT', `${cfg.db}`]);
    }
    commandChain.push(args);

    const payload = commandChain.map((cmd) => serializeRedisCommand(cmd)).join('');

    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host: cfg.host, port: cfg.port });
      const parser = new RedisReplyParser();
      let replies: Array<number | string | null> = [];

      socket.setTimeout(2000, () => {
        socket.destroy(new Error('Timeout na conexao Redis'));
      });

      socket.on('connect', () => {
        socket.write(payload);
      });

      socket.on('data', (chunk: Buffer) => {
        try {
          replies = replies.concat(parser.push(chunk.toString('utf8')));
          if (replies.length >= commandChain.length) {
            socket.end();
          }
        } catch (err) {
          socket.destroy(err as Error);
        }
      });

      socket.on('error', (err) => {
        reject(err);
      });

      socket.on('close', (hadError) => {
        if (hadError) {
          return;
        }
        if (replies.length < commandChain.length) {
          reject(new Error('Resposta Redis incompleta'));
          return;
        }
        for (let i = 0; i < commandChain.length - 1; i ++) {
          if (replies[i] !== 'OK') {
            reject(new Error(`Redis handshake falhou em ${commandChain[i][0]}`));
            return;
          }
        }
        resolve(replies[replies.length - 1] ?? null);
      });
    });
  }
}

/* Serializa comando em protocolo RESP2. */
function serializeRedisCommand(args: string[]): string {
  const chunks = [`*${args.length}\r\n`];
  for (const arg of args) {
    chunks.push(`$${Buffer.byteLength(arg, 'utf8')}\r\n${arg}\r\n`);
  }
  return chunks.join('');
}

/* Parser mínimo para respostas simples/integer/bulk do Redis. */
class RedisReplyParser {
  private buffer = '';

  push(chunk: string): Array<number | string | null> {
    this.buffer += chunk;
    const parsed: Array<number | string | null> = [];

    while (this.buffer.length > 0) {
      const prefix = this.buffer[0];
      const lineEnd = this.buffer.indexOf('\r\n');
      if (lineEnd === -1) {
        break;
      }

      if (prefix === '+' || prefix === '-' || prefix === ':') {
        const line = this.buffer.slice(1, lineEnd);
        this.buffer = this.buffer.slice(lineEnd + 2);
        if (prefix === '+') {
          parsed.push(line);
          continue;
        }
        if (prefix === ':') {
          parsed.push(Number(line));
          continue;
        }
        throw new Error(`Redis error reply: ${line}`);
      }

      if (prefix === '$') {
        const lenRaw = this.buffer.slice(1, lineEnd);
        const len = Number(lenRaw);
        if (!Number.isFinite(len)) {
          throw new Error(`Bulk length invalido: ${lenRaw}`);
        }
        if (len === -1) {
          this.buffer = this.buffer.slice(lineEnd + 2);
          parsed.push(null);
          continue;
        }
        const totalLen = lineEnd + 2 + len + 2;
        if (this.buffer.length < totalLen) {
          break;
        }
        const start = lineEnd + 2;
        const body = this.buffer.slice(start, start + len);
        this.buffer = this.buffer.slice(totalLen);
        parsed.push(body);
        continue;
      }

      throw new Error(`Prefixo RESP nao suportado: ${prefix}`);
    }

    return parsed;
  }
}
