import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { Modal } from '../../../shared/components/modal/modal';
import { CreateExerciseForm } from '../create-exercise-form/create-exercise-form';
import { CreateLabelForm } from '../create-label-form/create-label-form';
import {
  CreateExerciseDto,
  CreateWorkoutDto,
  CreateWorkoutLabelDto,
  ExerciseSummary,
  Muscle,
  TrackingField,
  WorkoutLabel,
} from '../../../core/types';
import { CreateWorkoutForm } from '../create-workout-form/create-workout-form';
import { MusclesService } from '../../../core/services/muscles';
import { TrackingFieldsService } from '../../../core/services/tracking-fields';
import { WorkoutLabelsService } from '../../../core/services/workout-labels';
import { CreateEntityKind } from '../tab-bar/tab-bar';
import { WorkoutsService } from '../../../core/services/workouts';
import { ExercisesService } from '../../../core/services/exercises';

@Component({
  selector: 'app-create-entity-modal',
  imports: [Modal, CreateExerciseForm, CreateLabelForm, CreateWorkoutForm],
  templateUrl: './create-entity-modal.html',
  styleUrl: './create-entity-modal.css',
})
export class CreateEntityModal implements OnInit {
  private musclesService = inject(MusclesService);
  private trackingFieldsService = inject(TrackingFieldsService);
  private workoutLabelsService = inject(WorkoutLabelsService);

  @Input({ required: true }) kind!: CreateEntityKind;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<{ id: string; kind: CreateEntityKind }>();

  protected loading = signal(false);
  protected error = signal<string | null>(null);

  private workoutsService = inject(WorkoutsService);
  private exercisesService = inject(ExercisesService);

  muscles = signal<Muscle[]>([]);
  trackingFields = signal<TrackingField[]>([]);
  exercises = signal<ExerciseSummary[]>([]);
  labels = signal<WorkoutLabel[]>([]);

  async ngOnInit() {
    if (this.kind === 'exercise') {
      const [muscles, trackingFields, exercises] = await Promise.all([
        this.musclesService.findAll(),
        this.trackingFieldsService.findAll(),
        this.exercisesService.findAll(),
      ]);

      this.muscles.set(muscles);
      this.trackingFields.set(trackingFields);
      this.exercises.set(exercises);
    }

    if (this.kind === 'workout' || this.kind === 'label') {
      const labels = await this.workoutLabelsService.findAll();
      this.labels.set(labels);
    }
  }

  async submitExercise(exercise: CreateExerciseDto) {
    const data = await this.exercisesService.create(exercise);
    this.created.emit({ id: data.id, kind: 'exercise' });
  }

  async submitWorkout(workout: CreateWorkoutDto) {
    const data = await this.workoutsService.create(workout);
    this.created.emit({ id: data.id, kind: 'workout' });
  }

  async submitLabel(label: CreateWorkoutLabelDto) {
    const data = await this.workoutLabelsService.create(label);
    this.created.emit({ id: data.id, kind: 'label' });
  }
}
