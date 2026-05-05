import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as PrismaClientPackage from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client: InstanceType<typeof PrismaClientPackage.PrismaClient>;

  constructor() {
    this.client = new PrismaClientPackage.PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
      }),
    });
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
