export type UnitType = 'WEIGHT' | 'DISTANCE' | 'TIME' | 'PACE' | 'CALORIES' | 'NUM';

export interface TrackingField {
  id: string;
  key: string;
  label: string;
  unitType: UnitType;
  createdAt: string;
  updatedAt: string;
}
