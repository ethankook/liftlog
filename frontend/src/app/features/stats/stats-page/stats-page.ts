import { Component, computed, effect, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntityRefreshService } from '../../../core/services/entity-refresh';
import { StatsService } from '../../../core/services/stats';
import { ExerciseStat, MuscleGroupStat, MuscleStat, Stats } from '../../../core/types';
import { Chip } from '../../../shared/components/chip/chip';

type MuscleMode = 'muscle' | 'group';
type ExerciseMode = 'group' | 'muscle';

interface CardItem {
  key: string;
  name: string;
  subtitle: string | null;
  accent: string;
  value: string;
  unit: string;
  chip: { label: string; color: string } | null;
}

interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-stats-page',
  imports: [Chip, FormsModule, NgTemplateOutlet],
  templateUrl: './stats-page.html',
  styleUrl: './stats-page.css',
})
export class StatsPage {
  private statsService = inject(StatsService);
  private entityRefresh = inject(EntityRefreshService);

  protected loading = signal(true);
  protected error = signal<string | null>(null);
  protected stats = signal<Stats | null>(null);

  protected topMode = signal<MuscleMode>('muscle');
  protected bottomMode = signal<MuscleMode>('muscle');
  protected exerciseMode = signal<ExerciseMode>('group');
  protected exerciseFilter = signal<string>('');

  protected topItems = computed<CardItem[]>(() => {
    const data = this.stats();
    if (!data) return [];
    return this.topMode() === 'muscle'
      ? data.topMuscles.map((m) => this.muscleToItem(m))
      : data.topMuscleGroups.map((g) => this.groupToItem(g));
  });

  protected bottomItems = computed<CardItem[]>(() => {
    const data = this.stats();
    if (!data) return [];
    return this.bottomMode() === 'muscle'
      ? data.bottomMuscles.map((m) => this.muscleToItem(m))
      : data.bottomMuscleGroups.map((g) => this.groupToItem(g));
  });

  protected exerciseFilterOptions = computed<FilterOption[]>(() => {
    const data = this.stats();
    if (!data) return [];
    if (this.exerciseMode() === 'group') {
      return data.topExercisesByGroup.map((g) => ({
        value: `group:${g.group}`,
        label: this.formatGroup(g.group),
      }));
    }
    return data.topExercisesByMuscle.map((m) => ({
      value: `muscle:${m.muscleId}`,
      label: m.muscleName,
    }));
  });

  protected exerciseItems = computed<CardItem[]>(() => {
    const data = this.stats();
    if (!data) return [];
    const filter = this.exerciseFilter();
    let exercises: ExerciseStat[];
    if (!filter) {
      exercises = data.topExercises;
    } else if (filter.startsWith('group:')) {
      const group = filter.slice(6);
      exercises = data.topExercisesByGroup.find((g) => g.group === group)?.exercises ?? [];
    } else if (filter.startsWith('muscle:')) {
      const muscleId = filter.slice(7);
      exercises = data.topExercisesByMuscle.find((m) => m.muscleId === muscleId)?.exercises ?? [];
    } else {
      exercises = data.topExercises;
    }
    return exercises.map((e) => this.exerciseToItem(e));
  });

  constructor() {
    effect(() => {
      this.entityRefresh.workoutVersion();
      this.entityRefresh.exerciseVersion();
      this.entityRefresh.labelVersion();
      void this.loadStats();
    });
  }

  protected setTopMode(mode: MuscleMode) {
    this.topMode.set(mode);
  }

  protected setBottomMode(mode: MuscleMode) {
    this.bottomMode.set(mode);
  }

  protected setExerciseMode(mode: ExerciseMode) {
    if (this.exerciseMode() === mode) return;
    this.exerciseMode.set(mode);
    this.exerciseFilter.set('');
  }

  protected formatSets(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  protected formatRank(value: number): string {
    return value.toString().padStart(2, '0');
  }

  protected formatGroup(group: string): string {
    const word = group.replace(/_/g, ' ').toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  protected labelChipColor(color: string | null): string {
    return color ?? 'var(--color-border)';
  }

  private muscleToItem(m: MuscleStat): CardItem {
    return {
      key: m.muscleId,
      name: m.name,
      subtitle: this.formatGroup(m.group),
      accent: m.color,
      value: this.formatSets(m.sets),
      unit: 'sets',
      chip: null,
    };
  }

  private groupToItem(g: MuscleGroupStat): CardItem {
    return {
      key: g.group,
      name: this.formatGroup(g.group),
      subtitle: `${g.muscleCount} muscle${g.muscleCount === 1 ? '' : 's'}`,
      accent: g.color,
      value: this.formatSets(g.sets),
      unit: 'sets',
      chip: null,
    };
  }

  private exerciseToItem(e: ExerciseStat): CardItem {
    return {
      key: e.exerciseId,
      name: e.name,
      subtitle: null,
      accent: e.primaryMuscle.color,
      value: this.formatSets(e.sets),
      unit: 'sets',
      chip: { label: e.primaryMuscle.name, color: e.primaryMuscle.color },
    };
  }

  private async loadStats() {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.stats.set(await this.statsService.get());
    } catch (error) {
      this.error.set(this.getErrorMessage(error, 'Failed to load stats.'));
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
