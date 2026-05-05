import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.client.user.findUnique({
      where: { id },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.client.user.findUnique({
      where: { username },
    });
  }

  async updateRefreshTokenHash(id: string, refreshTokenHash: string) {
    return this.prisma.client.user.update({
      where: { id },
      data: { refreshTokenHash },
    });
  }

  async clearRefreshTokenHash(id: string) {
    return this.prisma.client.user.update({
      where: { id },
      data: { refreshTokenHash: null },
    });
  }
}
