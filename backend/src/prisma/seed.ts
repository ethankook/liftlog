import {
  MuscleGroup,
  PrismaClient,
  UnitType,
} from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

function toSlug(name: string): string {
  return name.toLowerCase().replaceAll(' ', '_');
}

async function main() {
  await seedWorkoutLabels();
  await seedMuscles();
  await seedTrackingFields();
}

async function seedWorkoutLabels() {
  const labels = [
    { name: 'Push', color: '#ef4444' },
    { name: 'Pull', color: '#3b82f6' },
    { name: 'Legs', color: '#22c55e' },
    { name: 'Upper', color: '#a855f7' },
    { name: 'Lower', color: '#f97316' },
    { name: 'Cardio', color: '#06b6d4' },
    { name: 'Sport', color: '#eab308' },
  ];

  for (const label of labels) {
    const data = {
      ...label,
      slug: toSlug(label.name),
    };

    await prisma.workoutLabel.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });
  }
}

async function seedMuscles() {
  const muscles = [
    { name: 'Upper Chest', group: MuscleGroup.CHEST },
    { name: 'Mid Chest', group: MuscleGroup.CHEST },
    { name: 'Lower Chest', group: MuscleGroup.CHEST },

    { name: 'Front Delt', group: MuscleGroup.SHOULDER },
    { name: 'Side Delt', group: MuscleGroup.SHOULDER },
    { name: 'Rear Delt', group: MuscleGroup.SHOULDER },

    { name: 'Long Head Triceps', group: MuscleGroup.TRICEP },
    { name: 'Lateral Head Triceps', group: MuscleGroup.TRICEP },
    { name: 'Medial Head Triceps', group: MuscleGroup.TRICEP },

    { name: 'Long Head Biceps', group: MuscleGroup.BICEP },
    { name: 'Short Head Biceps', group: MuscleGroup.BICEP },
    { name: 'Brachialis', group: MuscleGroup.BICEP },

    { name: 'Lats', group: MuscleGroup.BACK },
    { name: 'Upper Traps', group: MuscleGroup.BACK },
    { name: 'Mid Traps', group: MuscleGroup.BACK },
    { name: 'Lower Traps', group: MuscleGroup.BACK },
    { name: 'Rhomboids', group: MuscleGroup.BACK },
    { name: 'Erector Spinae', group: MuscleGroup.BACK },

    { name: 'Upper Abs', group: MuscleGroup.CORE },
    { name: 'Lower Abs', group: MuscleGroup.CORE },
    { name: 'Obliques', group: MuscleGroup.CORE },

    { name: 'Wrist Flexors', group: MuscleGroup.FOREARM },
    { name: 'Wrist Extensors', group: MuscleGroup.FOREARM },

    { name: 'Quads', group: MuscleGroup.LEGS },
    { name: 'Hamstrings', group: MuscleGroup.LEGS },
    { name: 'Glutes', group: MuscleGroup.LEGS },
    { name: 'Calves', group: MuscleGroup.LEGS },
    { name: 'Hip Adductors', group: MuscleGroup.LEGS },
    { name: 'Hip Abductors', group: MuscleGroup.LEGS },
  ];

  for (const muscle of muscles) {
    const data = {
      ...muscle,
      slug: toSlug(muscle.name),
    };

    await prisma.muscle.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });
  }
}

async function seedTrackingFields() {
  const fields = [
    { key: 'weight', label: 'Weight', unitType: UnitType.WEIGHT },
    { key: 'reps', label: 'Reps', unitType: UnitType.NUM },
    { key: 'distance', label: 'Distance', unitType: UnitType.DISTANCE },
    { key: 'time', label: 'Time', unitType: UnitType.TIME },
    { key: 'pace', label: 'Pace', unitType: UnitType.PACE },
    { key: 'calories', label: 'Calories', unitType: UnitType.CALORIES },
    { key: 'restTime', label: 'Rest Time', unitType: UnitType.TIME },
    { key: 'rpe', label: 'RPE', unitType: UnitType.NUM },
  ];

  for (const field of fields) {
    await prisma.trackingField.upsert({
      where: { key: field.key },
      update: field,
      create: field,
    });
  }
}

async function seedUser() {
  await prisma.user.upsert({
    where: { username: process.env.ADMIN_USERNAME },
    update: {
      passwordHash,
    },
    create: {
      username: process.env.ADMIN_USERNAME,
      passwordHash,
      refreshTokenHash: null,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
