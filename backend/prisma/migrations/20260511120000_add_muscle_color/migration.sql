ALTER TABLE "Muscle"
ADD COLUMN "color" TEXT;

UPDATE "Muscle"
SET "color" = CASE "slug"
  WHEN 'upper_chest' THEN '#ef6f6c'
  WHEN 'mid_chest' THEN '#d95d67'
  WHEN 'lower_chest' THEN '#c44f5b'
  WHEN 'front_delt' THEN '#f59e0b'
  WHEN 'side_delt' THEN '#eab308'
  WHEN 'rear_delt' THEN '#ca8a04'
  WHEN 'long_head_triceps' THEN '#8b5cf6'
  WHEN 'lateral_head_triceps' THEN '#7c3aed'
  WHEN 'medial_head_triceps' THEN '#6d28d9'
  WHEN 'long_head_biceps' THEN '#3b82f6'
  WHEN 'short_head_biceps' THEN '#2563eb'
  WHEN 'brachialis' THEN '#1d4ed8'
  WHEN 'lats' THEN '#14b8a6'
  WHEN 'upper_traps' THEN '#0d9488'
  WHEN 'mid_traps' THEN '#0f766e'
  WHEN 'lower_traps' THEN '#115e59'
  WHEN 'rhomboids' THEN '#0f766e'
  WHEN 'erector_spinae' THEN '#134e4a'
  WHEN 'upper_abs' THEN '#22c55e'
  WHEN 'lower_abs' THEN '#16a34a'
  WHEN 'obliques' THEN '#15803d'
  WHEN 'wrist_flexors' THEN '#64748b'
  WHEN 'wrist_extensors' THEN '#475569'
  WHEN 'quads' THEN '#f97316'
  WHEN 'hamstrings' THEN '#ea580c'
  WHEN 'glutes' THEN '#fb7185'
  WHEN 'calves' THEN '#f43f5e'
  WHEN 'hip_adductors' THEN '#e11d48'
  WHEN 'hip_abductors' THEN '#be123c'
  ELSE '#6b7280'
END;

ALTER TABLE "Muscle"
ALTER COLUMN "color" SET NOT NULL;
