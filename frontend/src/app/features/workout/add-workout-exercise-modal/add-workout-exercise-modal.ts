import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from '../../../shared/components/modal/modal';
import { Button } from '../../../shared/components/action-button/action-button';
import { MusclesService } from '../../../core/services/muscles';
import {
  CreateExerciseDto,
  ExerciseSummary,
  Muscle,
  MuscleGroup,
  TrackingField,
  UpdateExerciseDto,
} from '../../../core/types';
import { ExercisesService } from '../../../core/services/exercises';
import { ExerciseCard } from '../../exercise/exercise-card/exercise-card';
import { CreateExerciseForm } from '../../shell/create-exercise-form/create-exercise-form';
import { TrackingFieldsService } from '../../../core/services/tracking-fields';
import { EntityRefreshService } from '../../../core/services/entity-refresh';

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
  selector: 'app-add-workout-exercise-modal',
  imports: [FormsModule, Modal, Button, ExerciseCard, CreateExerciseForm],
  templateUrl: './add-workout-exercise-modal.html',
  styleUrl: './add-workout-exercise-modal.css',
})
export class AddWorkoutExerciseModal implements OnInit {
  @Input({ required: true }) workoutId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() added = new EventEmitter<string[]>();

  private musclesService = inject(MusclesService);
  private exercisesService = inject(ExercisesService);
  private trackingFieldsService = inject(TrackingFieldsService);
  private entityRefresh = inject(EntityRefreshService);

  protected readonly selectedExercises = signal<string[]>([]);
  protected readonly mode = signal<'select' | 'create'>('select');
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly exerciseSearch = signal('');
  protected readonly exerciseMuscleGroup = signal('');
  protected readonly exerciseMuscleId = signal('');

  protected toggleSelection(id: string) {
    this.selectedExercises.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }

  protected isSelected(id: string): boolean {
    return this.selectedExercises().includes(id);
  }

  protected readonly muscles = signal<Muscle[]>([]);
  protected readonly exercises = signal<ExerciseSummary[]>([]);
  protected readonly trackingFields = signal<TrackingField[]>([]);
  protected readonly muscleGroups = computed(() =>
    MUSCLE_GROUP_ORDER.filter((group) => this.muscles().some((muscle) => muscle.group === group)),
  );
  protected readonly musclesForSelectedGroup = computed(() => {
    const group = this.exerciseMuscleGroup();
    return this.muscles().filter((muscle) => !group || muscle.group === group);
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

  async ngOnInit() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [muscles, exercises, trackingFields] = await Promise.all([
        this.musclesService.findAll(),
        this.exercisesService.findAll(),
        this.trackingFieldsService.findAll(),
      ]);

      this.muscles.set(muscles);
      this.exercises.set(exercises);
      this.trackingFields.set(trackingFields);
    } catch {
      this.error.set('Failed to load exercises.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async addSelectedExercises() {
    if (!this.selectedExercises().length || this.submitting()) return;

    this.submitting.set(true);
    this.error.set(null);
    this.added.emit(this.selectedExercises());
  }

  protected startCreateExercise() {
    this.error.set(null);
    this.mode.set('create');
  }

  protected cancelCreateExercise() {
    this.error.set(null);
    this.submitting.set(false);
    this.mode.set('select');
  }

  protected async createExercise(payload: CreateExerciseDto | UpdateExerciseDto) {
    this.submitting.set(true);
    this.error.set(null);

    try {
      const createdExercise = await this.exercisesService.create(payload as CreateExerciseDto);
      this.exercises.update((entries) => [createdExercise, ...entries]);
      this.entityRefresh.notify('exercise');
      this.added.emit([createdExercise.id]);
    } catch {
      this.error.set('Failed to create exercise.');
      this.submitting.set(false);
    }
  }

  protected updateMuscleGroup(group: string) {
    this.exerciseMuscleGroup.set(group);
    if (
      group &&
      !this.musclesForSelectedGroup().some((muscle) => muscle.id === this.exerciseMuscleId())
    ) {
      this.exerciseMuscleId.set('');
      return;
    }

    if (!group) {
      this.exerciseMuscleId.set('');
    }
  }
}
