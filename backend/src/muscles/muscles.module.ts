import { Module } from '@nestjs/common';
import { MusclesService } from './muscles.service';
import { MusclesController } from './muscles.controller';

@Module({
  controllers: [MusclesController],
  providers: [MusclesService],
})
export class MusclesModule {}
