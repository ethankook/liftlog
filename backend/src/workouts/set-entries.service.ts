import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalRecordsService } from '../personal-records/personal-records.service';
import { CreateSetEntryDto } from './dto/create-set-entry.dto';
import { ReorderSetEntriesDto } from './dto/reorder-set-entries.dto';
import { UpdateSetEntryDto } from './dto/update-set-entry.dto';

@Injectable()
export class SetEntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prs: PersonalRecordsService,
  ) {}

  async create(workoutId: string, weId: string, dto: CreateSetEntryDto) {
    const we = await this.assertWorkoutExercise(workoutId, weId);
    await this.assertValuesMatchTrackedFields(we.exerciseId, dto.values);
    const sortOrder = dto.sortOrder ?? (await this.nextSortOrder(weId));

    const created = await this.prisma.client.setEntry.create({
      data: {
        workoutExercise: { connect: { id: weId } },
        values: dto.values as Prisma.InputJsonValue,
        notes: dto.notes,
        sortOrder,
      },
    });
    await this.prs.recomputeForExercise(we.exerciseId);
    return created;
  }

  async update(
    workoutId: string,
    weId: string,
    id: string,
    dto: UpdateSetEntryDto,
  ) {
    const we = await this.assertWorkoutExercise(workoutId, weId);
    await this.assertSet(weId, id);
    if (dto.values !== undefined)
      await this.assertValuesMatchTrackedFields(we.exerciseId, dto.values);

    const data: Prisma.SetEntryUpdateInput = {};
    if (dto.values !== undefined)
      data.values = dto.values as Prisma.InputJsonValue;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    const updated = await this.prisma.client.setEntry.update({
      where: { id },
      data,
    });
    if (dto.values !== undefined)
      await this.prs.recomputeForExercise(we.exerciseId);
    return updated;
  }

  async remove(workoutId: string, weId: string, id: string) {
    const we = await this.assertWorkoutExercise(workoutId, weId);
    await this.assertSet(weId, id);
    await this.prisma.client.setEntry.delete({ where: { id } });
    await this.prs.recomputeForExercise(we.exerciseId);
  }

  async reorder(workoutId: string, weId: string, dto: ReorderSetEntriesDto) {
    await this.assertWorkoutExercise(workoutId, weId);
    const existing = await this.prisma.client.setEntry.findMany({
      where: { workoutExerciseId: weId },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((r) => r.id));
    if (
      dto.orderedIds.length !== existingIds.size ||
      dto.orderedIds.some((id) => !existingIds.has(id))
    )
      throw new ConflictException(
        'orderedIds must contain exactly the sets of this workout exercise',
      );

    return this.prisma.client.$transaction(
      dto.orderedIds.map((id, idx) =>
        this.prisma.client.setEntry.update({
          where: { id },
          data: { sortOrder: idx },
        }),
      ),
    );
  }

  private async assertWorkoutExercise(workoutId: string, weId: string) {
    const we = await this.prisma.client.workoutExercise.findUnique({
      where: { id: weId },
      select: { id: true, workoutId: true, exerciseId: true },
    });
    if (!we || we.workoutId !== workoutId)
      throw new NotFoundException('Workout exercise not found');
    return we;
  }

  private async assertSet(weId: string, id: string) {
    const set = await this.prisma.client.setEntry.findUnique({
      where: { id },
      select: { workoutExerciseId: true },
    });
    if (!set || set.workoutExerciseId !== weId)
      throw new NotFoundException('Set not found');
    return set;
  }

  private async assertValuesMatchTrackedFields(
    exerciseId: string,
    values: Record<string, unknown>,
  ) {
    const fields = await this.prisma.client.trackingField.findMany({
      where: { exercises: { some: { id: exerciseId } } },
      select: { key: true },
    });
    const allowed = new Set(fields.map((f) => f.key));
    const unknown = Object.keys(values).filter((k) => !allowed.has(k));
    if (unknown.length > 0)
      throw new BadRequestException(
        `Unknown value keys: ${unknown.join(', ')}`,
      );
    for (const k of Object.keys(values)) {
      const v = values[k];
      if (v !== null && typeof v !== 'number')
        throw new BadRequestException(`Value '${k}' must be a number or null`);
    }
  }

  private async nextSortOrder(weId: string) {
    const last = await this.prisma.client.setEntry.findFirst({
      where: { workoutExerciseId: weId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return last ? last.sortOrder + 1 : 0;
  }
}
