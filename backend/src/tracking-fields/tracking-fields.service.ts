import { Injectable } from '@nestjs/common';
import { CreateTrackingFieldDto } from './dto/create-tracking-field.dto';
import { UpdateTrackingFieldDto } from './dto/update-tracking-field.dto';

@Injectable()
export class TrackingFieldsService {
  create(createTrackingFieldDto: CreateTrackingFieldDto) {
    return 'This action adds a new trackingField';
  }

  findAll() {
    return `This action returns all trackingFields`;
  }

  findOne(id: number) {
    return `This action returns a #${id} trackingField`;
  }

  update(id: number, updateTrackingFieldDto: UpdateTrackingFieldDto) {
    return `This action updates a #${id} trackingField`;
  }

  remove(id: number) {
    return `This action removes a #${id} trackingField`;
  }
}
