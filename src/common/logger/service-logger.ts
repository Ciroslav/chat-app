import { Logger, LoggerService } from '@nestjs/common';

export class ServiceLogger implements LoggerService {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }
  private serviceName: string;
  private logger = new Logger();

  log(message: string) {
    this.logger.log(`\x1b[33m[${this.serviceName}]\x1b[32m ${message}`);
  }

  error(message: string, trace?: string) {
    this.logger.error(
      `\x1b[33m[${this.serviceName}]\x1b[31m ${message}`,
      trace,
    );
  }

  warn(message: string) {
    this.logger.warn(`\x1b[33m[${this.serviceName}]\x1b[30m ${message}`);
  }

  debug(message: string) {
    this.logger.debug(`\x1b[33m[${this.serviceName}]\x1b[30m ${message}`);
  }

  verbose(message: string) {
    this.logger.verbose(`\x1b[33m[${this.serviceName}]\x1b[30m ${message}`);
  }
}
