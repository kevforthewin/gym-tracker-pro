// Erzeugt supabase/migrations/0002_seed_catalog.sql aus src/catalog/catalog.ts
// Aufruf: npm run catalog:sql
import { writeFileSync } from 'node:fs';
import { CATALOG_EXERCISES, CATALOG_MANUFACTURERS, CATALOG_MODELS, LEGACY_MODEL_ALIAS } from '../src/catalog/catalog';

type Col = [sql: string, key: string];
const q = (v: unknown) =>
  v === undefined || v === null ? 'null' : typeof v === 'number' || typeof v === 'boolean' ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
const insert = (table: string, cols: Col[], rows: object[]) =>
  `insert into public.${table} (${cols.map((c) => c[0]).join(', ')}, updated_at) values\n` +
  rows.map((r) => `  (${cols.map((c) => q((r as Record<string, unknown>)[c[1]])).join(', ')}, 0)`).join(',\n') +
  `\non conflict (id) do update set ${cols
    .filter((c) => c[0] !== 'id')
    .map((c) => `${c[0]} = excluded.${c[0]}`)
    .join(', ')}, updated_at = public.${table}.updated_at + 1\n  where public.${table}.created_by is null;\n`;

const alias = Object.entries(LEGACY_MODEL_ALIAS);
const sql = [
  '-- Startkatalog (generiert von scripts/gen-catalog-sql.ts – nicht von Hand ändern)',
  '-- Nach 0001_init.sql (und 0005_model_details.sql) im SQL Editor ausführen. Erneutes Ausführen aktualisiert nur Katalogzeilen.',
  insert('manufacturers', [['id', 'id'], ['name', 'name']], CATALOG_MANUFACTURERS),
  insert(
    'exercises',
    [['id', 'id'], ['name', 'name'], ['type', 'type'], ['muscle_group', 'muscleGroup'], ['split', 'split'], ['free_weight', 'freeWeight']],
    CATALOG_EXERCISES,
  ),
  insert(
    'equipment_models',
    [
      ['id', 'id'],
      ['manufacturer_id', 'manufacturerId'],
      ['name', 'name'],
      ['line', 'line'],
      ['kind', 'kind'],
      ['exercise_id', 'exerciseId'],
      ['weight_step_kg', 'weightStepKg'],
      ['model_number', 'modelNumber'],
      ['source_url', 'sourceUrl'],
      ['verified', 'verified'],
    ],
    CATALOG_MODELS,
  ),
  '-- Katalog v1 → v2: generierte Modelle der geprüften Hersteller durch echte ersetzen',
  ...alias.map(
    ([oldId, newId]) =>
      `update public.gym_machines set model_id = ${q(newId)}, updated_at = updated_at + 1 where model_id = ${q(oldId)};`,
  ),
  `update public.equipment_models set deleted_at = 1, updated_at = updated_at + 1 where created_by is null and deleted_at is null and id in (${alias
    .map(([o]) => q(o))
    .join(', ')});`,
  '',
].join('\n');
writeFileSync(new URL('../supabase/migrations/0002_seed_catalog.sql', import.meta.url), sql);
console.log(`ok: ${CATALOG_MANUFACTURERS.length} Hersteller, ${CATALOG_EXERCISES.length} Übungen, ${CATALOG_MODELS.length} Modelle`);
