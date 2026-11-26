import { beforeEach, describe, expect, it } from 'vitest';
import { CATALOG_EXERCISES, CATALOG_MODELS, LEGACY_MODEL_ALIAS, VERIFIED_CATALOG_MODELS, modelTitle } from './catalog';
import { exerciseForProduct } from './mapModels';
import { db, resetDb, setMeta, seedCatalog } from '../local/db';

describe('Herstellerkatalog', () => {
  it('geprüfte Modelle: eindeutige IDs, gültige Übungen, Quelle', () => {
    const ex = new Set(CATALOG_EXERCISES.map((e) => e.id));
    const ids = CATALOG_MODELS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(VERIFIED_CATALOG_MODELS.length).toBeGreaterThan(250);
    for (const m of VERIFIED_CATALOG_MODELS) {
      expect(ex.has(m.exerciseId!)).toBe(true);
      expect(m.sourceUrl).toMatch(/^https:\/\//);
    }
    for (const mf of ['hoist', 'matrix', 'hammer-strength', 'life-fitness'])
      expect(CATALOG_MODELS.filter((m) => m.manufacturerId === mf).every((m) => m.verified)).toBe(true);
  });

  it('Produktnamen werden sinnvoll Übungen zugeordnet', () => {
    expect(exerciseForProduct('Iso-Lateral Incline Press')).toBe('incline-chest-press');
    expect(exerciseForProduct('Pectoral Fly/Rear Deltoid')).toBe('butterfly');
    expect(exerciseForProduct('Rear Delt Fly')).toBe('reverse-fly');
    expect(exerciseForProduct('Prone Leg Curl')).toBe('leg-curl-lying');
    expect(exerciseForProduct('Seated Calf Raise')).toBe('seated-calf-raise');
    expect(exerciseForProduct('Glute Ham / Reverse Hyper')).toBe('back-extension');
    expect(exerciseForProduct('Vertical Smith Machine')).toBeNull();
    const roc = CATALOG_MODELS.find((m) => m.id === 'hoist--rs-2301')!;
    expect(modelTitle(roc, { name: 'Hoist' })).toBe('Chest Press · Hoist ROC-IT Selectorized');
  });

  describe('Umstellung v1 → v2', () => {
    beforeEach(async () => {
      await resetDb();
    });
    it('Geräte mit altem, generiertem Modell zeigen danach auf das echte Modell', async () => {
      await db.equipmentModels.put({ id: 'hoist--roc-it--chest-press', manufacturerId: 'hoist', name: 'Brustpresse', kind: 'selectorized', updatedAt: 0 });
      await db.gymMachines.bulkPut([
        { id: 'a', gymId: 'g', exerciseId: 'chest-press', modelId: 'hoist--roc-it--chest-press', label: 'BP', weightStepKg: 2.5, updatedAt: 1 },
        { id: 'b', gymId: 'g', exerciseId: 'pullover', modelId: 'hoist--roc-it--pullover', label: 'PO', weightStepKg: 2.5, updatedAt: 1 },
      ]);
      await setMeta('catalogVersion', 1);
      await seedCatalog();
      expect((await db.gymMachines.get('a'))!.modelId).toBe(LEGACY_MODEL_ALIAS['hoist--roc-it--chest-press']);
      expect((await db.gymMachines.get('a'))!.modelId).toBe('hoist--rs-2301');
      expect((await db.gymMachines.get('b'))!.modelId).toBeUndefined();
      expect(await db.equipmentModels.get('hoist--roc-it--chest-press')).toBeUndefined();
    });
  });
});
