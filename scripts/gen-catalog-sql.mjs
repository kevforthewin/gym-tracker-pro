// Erzeugt supabase/migrations/0002_seed_catalog.sql aus src/catalog/catalog.ts
// Aufruf: node --experimental-strip-types scripts/gen-catalog-sql.mjs
import { writeFileSync } from 'node:fs';
import { CATALOG_EXERCISES, CATALOG_MANUFACTURERS, CATALOG_MODELS } from '../src/catalog/catalog.ts';

const q = (v) => (v === undefined || v === null ? 'null' : typeof v === 'number' || typeof v === 'boolean' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const insert = (table, cols, rows) =>
  `insert into public.${table} (${cols.map((c) => c[0]).join(', ')}, updated_at) values\n` +
  rows.map((r) => `  (${cols.map((c) => q(r[c[1]])).join(', ')}, 0)`).join(',\n') +
  `\non conflict (id) do update set ${cols.filter((c) => c[0] !== 'id').map((c) => `${c[0]} = excluded.${c[0]}`).join(', ')}\n  where public.${table}.created_by is null;\n`;

const sql = [
  '-- Startkatalog (generiert von scripts/gen-catalog-sql.mjs – nicht von Hand ändern)',
  '-- Nach 0001_init.sql im SQL Editor ausführen. Erneutes Ausführen aktualisiert nur Katalogzeilen.',
  insert('manufacturers', [['id', 'id'], ['name', 'name']], CATALOG_MANUFACTURERS),
  insert('exercises', [['id', 'id'], ['name', 'name'], ['type', 'type'], ['muscle_group', 'muscleGroup'], ['split', 'split'], ['free_weight', 'freeWeight']], CATALOG_EXERCISES),
  insert('equipment_models', [['id', 'id'], ['manufacturer_id', 'manufacturerId'], ['name', 'name'], ['line', 'line'], ['kind', 'kind'], ['exercise_id', 'exerciseId'], ['weight_step_kg', 'weightStepKg']], CATALOG_MODELS),
].join('\n');
writeFileSync(new URL('../supabase/migrations/0002_seed_catalog.sql', import.meta.url), sql);
console.log(`ok: ${CATALOG_MANUFACTURERS.length} Hersteller, ${CATALOG_EXERCISES.length} Übungen, ${CATALOG_MODELS.length} Modelle`);
