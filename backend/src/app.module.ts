import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { ExercisesModule } from './exercises/exercises.module';
import { WorkoutLabelsModule } from './workout-labels/workout-labels.module';
import { MusclesModule } from './muscles/muscles.module';
import { TrackingFieldsModule } from './tracking-fields/tracking-fields.module';
import { PersonalRecordsModule } from './personal-records/personal-records.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    WorkoutsModule,
    ExercisesModule,
    WorkoutLabelsModule,
    MusclesModule,
    TrackingFieldsModule,
    PersonalRecordsModule,
    StatsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
