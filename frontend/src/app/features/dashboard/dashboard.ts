import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EntityRefreshService } from '../../core/services/entity-refresh';
import { ExercisesService } from '../../core/services/exercises';
import { MusclesService } from '../../core/services/muscles';
import { TrackingFieldsService } from '../../core/services/tracking-fields';
import { WorkoutLabelsService } from '../../core/services/workout-labels';
import {
  CreateExerciseDto,
  CreateWorkoutLabelDto,
  ExerciseDetail,
  ExerciseSummary,
  Muscle,
  MuscleGroup,
  PersonalRecord,
  SetEntry,
  TrackingField,
  UpdateExerciseDto,
  UpdateWorkoutLabelDto,
  WorkoutLabel,
} from '../../core/types';
import { Button } from '../../shared/components/action-button/action-button';
import { Modal } from '../../shared/components/modal/modal';
import { ExerciseCard } from '../exercise/exercise-card/exercise-card';
import { LabelCard } from './label-card/label-card';
import { CreateExerciseForm } from '../shell/create-exercise-form/create-exercise-form';
import { CreateLabelForm } from '../shell/create-label-form/create-label-form';
import { SetCard } from '../workout/set-card/set-card';

const MUSCLE_GROUP_ORDER: MuscleGroup[] = [
  'CHEST',
  'SHOULDER',
  'BACK',
  'BICEP',
  'TRICEP',
  'CORE',
  'FOREARM',
  'LEGS',
];

@Component({
  selector: 'app-dashboard',
  imports: [
    FormsModule,
    DatePipe,
    Button,
    Modal,
    ExerciseCard,
    LabelCard,
    CreateExerciseForm,
    CreateLabelForm,
    SetCard,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private exercisesService = inject(ExercisesService);
  private labelsService = inject(WorkoutLabelsService);
  private musclesService = inject(MusclesService);
  private trackingFieldsService = inject(TrackingFieldsService);
  private entityRefresh = inject(EntityRefreshService);

  protected loading = signal(true);
  protected error = signal<string | null>(null);

  protected exercises = signal<ExerciseSummary[]>([]);
  protected labels = signal<WorkoutLabel[]>([]);
  protected muscles = signal<Muscle[]>([]);
  protected trackingFields = signal<TrackingField[]>([]);

  protected exerciseSearch = signal('');
  protected exerciseMuscleGroup = signal('');
  protected exerciseMuscleId = signal('');
  protected labelSearch = signal('');

  protected selectedExerciseId = signal<string | null>(null);
  protected selectedExerciseDetail = signal<ExerciseDetail | null>(null);
  protected exerciseModalLoading = signal(false);
  protected exerciseModalError = signal<string | null>(null);
  protected exerciseEditMode = signal(false);
  protected exerciseActionLoading = signal(false);

  protected selectedLabel = signal<WorkoutLabel | null>(null);
  protected labelModalError = signal<string | null>(null);
  protected labelActionLoading = signal(false);

  protected readonly muscleGroups = computed(() =>
    MUSCLE_GROUP_ORDER.filter((group) => this.muscles().some((muscle) => muscle.group === group)),
  );

  protected readonly musclesForSelectedGroup = computed(() => {
    const group = this.exerciseMuscleGroup();
    const muscles = this.muscles();
    return muscles.filter((muscle) => !group || muscle.group === group);
  });

  protected readonly filteredExercises = computed(() => {
    const search = this.exerciseSearch().trim().toLocaleLowerCase();
    const group = this.exerciseMuscleGroup();
    const muscleId = this.exerciseMuscleId();

    return this.exercises().filter((exercise) => {
      const matchesSearch =
        !search ||
        exercise.name.toLocaleLowerCase().includes(search) ||
        exercise.primaryMuscle.name.toLocaleLowerCase().includes(search) ||
        exercise.secondaryMuscles.some((muscle) =>
          muscle.name.toLocaleLowerCase().includes(search),
        );

      const matchesGroup =
        !group ||
        exercise.primaryMuscle.group === group ||
        exercise.secondaryMuscles.some((muscle) => muscle.group === group);

      const matchesMuscle =
        !muscleId ||
        exercise.primaryMuscleId === muscleId ||
        exercise.secondaryMuscles.some((muscle) => muscle.id === muscleId);

      return matchesSearch && matchesGroup && matchesMuscle;
    });
  });

  protected readonly filteredLabels = computed(() => {
    const search = this.labelSearch().trim().toLocaleLowerCase();
    return this.labels().filter(
      (label) => !search || label.name.toLocaleLowerCase().includes(search),
    );
  });

  protected readonly selectedExerciseTitle = computed(() => {
    const detail = this.selectedExerciseDetail();
    if (detail) return detail.name;
    const id = this.selectedExerciseId();
    return this.exercises().find((exercise) => exercise.id === id)?.name ?? 'Exercise';
  });

  protected readonly selectedExerciseFieldLabels = computed(() =>
    Object.fromEntries(
      (this.selectedExerciseDetail()?.trackedFields ?? []).map((field) => [field.key, field.label]),
    ),
  );

  constructor() {
    effect(() => {
      this.entityRefresh.exerciseVersion();
      this.entityRefresh.labelVersion();
      void this.loadDashboardData();
    });
  }

  protected async openExercise(id: string) {
    this.selectedExerciseId.set(id);
    this.selectedExerciseDetail.set(null);
    this.exerciseModalLoading.set(true);
    this.exerciseModalError.set(null);
    this.exerciseEditMode.set(false);

    try {
      this.selectedExerciseDetail.set(await this.exercisesService.findOne(id));
    } catch (error) {
      this.exerciseModalError.set(this.getErrorMessage(error, 'Failed to load exercise.'));
    } finally {
      this.exerciseModalLoading.set(false);
    }
  }

  protected closeExerciseModal() {
    this.selectedExerciseId.set(null);
    this.selectedExerciseDetail.set(null);
    this.exerciseModalError.set(null);
    this.exerciseEditMode.set(false);
    this.exerciseActionLoading.set(false);
  }

  protected async saveExercise(dto: CreateExerciseDto | UpdateExerciseDto) {
    const id = this.selectedExerciseId();
    if (!id) return;

    this.exerciseActionLoading.set(true);
    this.exerciseModalError.set(null);

    try {
      await this.exercisesService.update(id, dto as UpdateExerciseDto);
      this.selectedExerciseDetail.set(await this.exercisesService.findOne(id));
      this.exerciseEditMode.set(false);
      this.entityRefresh.notify('exercise');
    } catch (error) {
      this.exerciseModalError.set(this.getErrorMessage(error, 'Failed to save exercise.'));
    } finally {
      this.exerciseActionLoading.set(false);
    }
  }

  protected async removeExercise() {
    const id = this.selectedExerciseId();
    if (!id) return;

    this.exerciseActionLoading.set(true);
    this.exerciseModalError.set(null);

    try {
      await this.exercisesService.remove(id);
      this.closeExerciseModal();
      this.entityRefresh.notify('exercise');
    } catch (error) {
      this.exerciseModalError.set(this.getErrorMessage(error, 'Failed to remove exercise.'));
    } finally {
      this.exerciseActionLoading.set(false);
    }
  }

  protected openLabel(id: string) {
    const label = this.labels().find((entry) => entry.id === id) ?? null;
    this.selectedLabel.set(label);
    this.labelModalError.set(null);
    this.labelActionLoading.set(false);
  }

  protected closeLabelModal() {
    this.selectedLabel.set(null);
    this.labelModalError.set(null);
    this.labelActionLoading.set(false);
  }

  protected async saveLabel(dto: CreateWorkoutLabelDto | UpdateWorkoutLabelDto) {
    const label = this.selectedLabel();
    if (!label) return;

    this.labelActionLoading.set(true);
    this.labelModalError.set(null);

    try {
      const updated = await this.labelsService.update(label.id, dto);
      this.selectedLabel.set(updated);
      this.entityRefresh.notify('label');
    } catch (error) {
      this.labelModalError.set(this.getErrorMessage(error, 'Failed to save label.'));
    } finally {
      this.labelActionLoading.set(false);
    }
  }

  protected async removeLabel() {
    const label = this.selectedLabel();
    if (!label) return;

    this.labelActionLoading.set(true);
    this.labelModalError.set(null);

    try {
      await this.labelsService.remove(label.id);
      this.closeLabelModal();
      this.entityRefresh.notify('label');
    } catch (error) {
      this.labelModalError.set(this.getErrorMessage(error, 'Failed to remove label.'));
    } finally {
      this.labelActionLoading.set(false);
    }
  }

  protected updateMuscleGroup(group: string) {
    this.exerciseMuscleGroup.set(group);
    if (!this.musclesForSelectedGroup().some((muscle) => muscle.id === this.exerciseMuscleId())) {
      this.exerciseMuscleId.set('');
    }
  }

  protected recordAsSet(record: PersonalRecord): SetEntry {
    return {
      id: record.sourceSetId,
      workoutExerciseId: '',
      values: this.recordValues(record),
      notes: null,
      sortOrder: 0,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private recordValues(record: PersonalRecord): Record<string, unknown> {
    if (record.snapshot && typeof record.snapshot === 'object' && !Array.isArray(record.snapshot)) {
      return record.snapshot as Record<string, unknown>;
    }

    if (record.type === 'REPS') {
      return { reps: record.reps ?? record.value };
    }

    return { value: record.value };
  }

  private async loadDashboardData() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [exercises, labels, muscles, trackingFields] = await Promise.all([
        this.exercisesService.findAll(),
        this.labelsService.findAll(),
        this.musclesService.findAll(),
        this.trackingFieldsService.findAll(),
      ]);

      this.exercises.set(exercises);
      this.labels.set(labels);
      this.muscles.set(muscles);
      this.trackingFields.set(trackingFields);
    } catch (error) {
      this.error.set(this.getErrorMessage(error, 'Failed to load dashboard data.'));
    } finally {
      this.loading.set(false);
    }
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof (error as { error?: unknown }).error === 'object' &&
      (error as { error?: { message?: unknown } }).error?.message
    ) {
      const message = (error as { error?: { message?: unknown } }).error?.message;
      if (typeof message === 'string') return message;
      if (Array.isArray(message)) return message.join(', ');
    }

    return fallback;
  }
}
