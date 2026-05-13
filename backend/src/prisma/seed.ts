import * as PrismaClientPackage from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashSecret } from '../auth/secret-hash';

const prisma = new PrismaClientPackage.PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

function toSlug(name: string): string {
  return name.toLowerCase().replaceAll(' ', '_');
}

async function main() {
  await seedAdminUser();
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
    {
      name: 'Upper Chest',
      group: PrismaClientPackage.MuscleGroup.CHEST,
      color: '#ef6f6c',
    },
    {
      name: 'Mid Chest',
      group: PrismaClientPackage.MuscleGroup.CHEST,
      color: '#d95d67',
    },
    {
      name: 'Lower Chest',
      group: PrismaClientPackage.MuscleGroup.CHEST,
      color: '#c44f5b',
    },

    {
      name: 'Front Delt',
      group: PrismaClientPackage.MuscleGroup.SHOULDER,
      color: '#f59e0b',
    },
    {
      name: 'Side Delt',
      group: PrismaClientPackage.MuscleGroup.SHOULDER,
      color: '#eab308',
    },
    {
      name: 'Rear Delt',
      group: PrismaClientPackage.MuscleGroup.SHOULDER,
      color: '#ca8a04',
    },

    {
      name: 'Long Head Triceps',
      group: PrismaClientPackage.MuscleGroup.TRICEP,
      color: '#8b5cf6',
    },
    {
      name: 'Lateral Head Triceps',
      group: PrismaClientPackage.MuscleGroup.TRICEP,
      color: '#7c3aed',
    },
    {
      name: 'Medial Head Triceps',
      group: PrismaClientPackage.MuscleGroup.TRICEP,
      color: '#6d28d9',
    },

    {
      name: 'Long Head Biceps',
      group: PrismaClientPackage.MuscleGroup.BICEP,
      color: '#3b82f6',
    },
    {
      name: 'Short Head Biceps',
      group: PrismaClientPackage.MuscleGroup.BICEP,
      color: '#2563eb',
    },
    {
      name: 'Brachialis',
      group: PrismaClientPackage.MuscleGroup.BICEP,
      color: '#1d4ed8',
    },

    {
      name: 'Lats',
      group: PrismaClientPackage.MuscleGroup.BACK,
      color: '#14b8a6',
    },
    {
      name: 'Upper Traps',
      group: PrismaClientPackage.MuscleGroup.BACK,
      color: '#0d9488',
    },
    {
      name: 'Mid Traps',
      group: PrismaClientPackage.MuscleGroup.BACK,
      color: '#0f766e',
    },
    {
      name: 'Lower Traps',
      group: PrismaClientPackage.MuscleGroup.BACK,
      color: '#115e59',
    },
    {
      name: 'Rhomboids',
      group: PrismaClientPackage.MuscleGroup.BACK,
      color: '#0f766e',
    },
    {
      name: 'Erector Spinae',
      group: PrismaClientPackage.MuscleGroup.BACK,
      color: '#134e4a',
    },

    {
      name: 'Upper Abs',
      group: PrismaClientPackage.MuscleGroup.CORE,
      color: '#22c55e',
    },
    {
      name: 'Lower Abs',
      group: PrismaClientPackage.MuscleGroup.CORE,
      color: '#16a34a',
    },
    {
      name: 'Obliques',
      group: PrismaClientPackage.MuscleGroup.CORE,
      color: '#15803d',
    },

    {
      name: 'Wrist Flexors',
      group: PrismaClientPackage.MuscleGroup.FOREARM,
      color: '#40f5dd',
    },
    {
      name: 'Wrist Extensors',
      group: PrismaClientPackage.MuscleGroup.FOREARM,
      color: '#16bbb6',
    },

    {
      name: 'Quads',
      group: PrismaClientPackage.MuscleGroup.LEGS,
      color: '#f97316',
    },
    {
      name: 'Hamstrings',
      group: PrismaClientPackage.MuscleGroup.LEGS,
      color: '#ea580c',
    },
    {
      name: 'Glutes',
      group: PrismaClientPackage.MuscleGroup.LEGS,
      color: '#fb7185',
    },
    {
      name: 'Calves',
      group: PrismaClientPackage.MuscleGroup.LEGS,
      color: '#f43f5e',
    },
    {
      name: 'Hip Adductors',
      group: PrismaClientPackage.MuscleGroup.LEGS,
      color: '#e11d48',
    },
    {
      name: 'Hip Abductors',
      group: PrismaClientPackage.MuscleGroup.LEGS,
      color: '#be123c',
    },
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
    {
      key: 'weight',
      label: 'Weight',
      unitType: PrismaClientPackage.UnitType.WEIGHT,
    },
    { key: 'reps', label: 'Reps', unitType: PrismaClientPackage.UnitType.NUM },
    {
      key: 'repsPerSide',
      label: 'repsPerSide',
      unitType: PrismaClientPackage.UnitType.NUM,
    },

    {
      key: 'distance',
      label: 'Distance',
      unitType: PrismaClientPackage.UnitType.DISTANCE,
    },
    { key: 'time', label: 'Time', unitType: PrismaClientPackage.UnitType.TIME },
    { key: 'pace', label: 'Pace', unitType: PrismaClientPackage.UnitType.PACE },
    {
      key: 'calories',
      label: 'Calories',
      unitType: PrismaClientPackage.UnitType.CALORIES,
    },
    {
      key: 'restTime',
      label: 'Rest Time',
      unitType: PrismaClientPackage.UnitType.TIME,
    },
    { key: 'rpe', label: 'RPE', unitType: PrismaClientPackage.UnitType.NUM },
  ];

  for (const field of fields) {
    await prisma.trackingField.upsert({
      where: { key: field.key },
      update: field,
      create: field,
    });
  }
}

async function seedAdminUser() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'ADMIN_USERNAME and ADMIN_PASSWORD are required for seeding',
    );
  }

  const passwordHash = await hashSecret(password);

  await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash,
    },
    create: {
      username,
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
