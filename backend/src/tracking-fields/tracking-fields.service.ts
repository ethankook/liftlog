import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrackingFieldsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.client.trackingField.findMany({
      orderBy: { label: 'asc' },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.client.trackingField.findUnique({
      where: { id },
    });
    if (!row) throw new NotFoundException();
    return row;
  }
}
