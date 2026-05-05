import { Module } from '@nestjs/common';
import { TrackingFieldsService } from './tracking-fields.service';
import { TrackingFieldsController } from './tracking-fields.controller';

@Module({
  controllers: [TrackingFieldsController],
  providers: [TrackingFieldsService],
})
export class TrackingFieldsModule {}
