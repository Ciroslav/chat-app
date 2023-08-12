import { SetMetadata } from '@nestjs/common';

export const ServiceName = (name: string) => SetMetadata('serviceName', name);
