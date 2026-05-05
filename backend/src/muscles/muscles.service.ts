import { Injectable, NotFoundException } from '@nestjs/common';
import { MuscleGroup } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MusclesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(group?: MuscleGroup) {
    return this.prisma.client.muscle.findMany({
      where: group ? { group } : undefined,
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.client.muscle.findUnique({ where: { id } });
    if (!row) throw new NotFoundException();
    return row;
  }
}
