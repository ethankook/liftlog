export type MuscleGroup =
  | 'CHEST'
  | 'SHOULDER'
  | 'TRICEP'
  | 'BACK'
  | 'BICEP'
  | 'CORE'
  | 'FOREARM'
  | 'LEGS';


export interface Muscle {
  id: string;
  name: string;
  slug: string;
  color: string;
  group: MuscleGroup;
}
