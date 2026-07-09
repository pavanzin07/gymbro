import { describe, it, expect, beforeEach } from 'vitest';
import { S, replaceState } from '../../src/state.js';
import { gerarDia, PLANOS, ESTILOS } from '../../src/gerador-dieta.js';
import { EVID_DIETA } from '../../src/data/evidencia.js';

function baseState(overrides = {}) {
  return {
    profile: { restrictions: [] },
    choices: { kcal: 'b', prot: 'b', fat: 'b' },
    progress: { weight: [], measures: [], waterGoalMl: 2000, days: {} },
    sessions: [], goals: [], characters: [], activeChar: 0,
    wallet: { owned: ['short_black'], spent: 0 }, routines: [],
    mealTemplate: [], mealDiary: {},
    targets: { kcal: 2600, prot: 160, carb: 280, fat: 75 },
    ...overrides
  };
}
beforeEach(() => replaceState(baseState()));

describe('gerarDia — estrutura', () => {
  it('3/4/5 refeições geram a quantidade certa, com nomes certos', () => {
    expect(gerarDia({ refeicoes: 3 }).meals.map(m => m.name)).toEqual(['Café da manhã', 'Almoço', 'Jantar']);
    expect(gerarDia({ refeicoes: 4 }).meals).toHaveLength(4);
    const cinco = gerarDia({ refeicoes: 5 }).meals.map(m => m.name);
    expect(cinco).toHaveLength(5);
    expect(cinco).toContain('Lanche da tarde');
  });
  it('alimentos seguem o schema do diário (macros em string, id e qty presentes)', () => {
    gerarDia({ refeicoes: 4 }).meals.forEach(m => m.foods.forEach(f => {
      expect(typeof f.kcal).toBe('string');
      expect(typeof f.prot).toBe('string');
      expect(f.id).toBeTruthy();
      expect(f.qty).toBeTruthy();
    }));
  });
});

describe('gerarDia — fecha as metas', () => {
  it('kcal chega perto do alvo (complementos fecham o buraco)', () => {
    const d = gerarDia({ refeicoes: 4 });
    expect(d.totais.kcal).toBeGreaterThanOrEqual(d.alvo.kcal - Math.max(120, d.alvo.kcal * 0.08) - 90);
    expect(d.totais.kcal).toBeLessThanOrEqual(d.alvo.kcal * 1.15);
  });
  it('proteína fica a até ~12g do alvo', () => {
    const d = gerarDia({ refeicoes: 4 });
    expect(d.totais.prot).toBeGreaterThanOrEqual(d.alvo.prot - 13);
  });
  it('funciona com metas menores (cutting) sem estourar demais', () => {
    S.targets = { kcal: 1800, prot: 140, carb: 160, fat: 60 };
    const d = gerarDia({ refeicoes: 3 });
    expect(d.totais.kcal).toBeLessThanOrEqual(1800 * 1.2);
    expect(d.totais.prot).toBeGreaterThanOrEqual(140 - 13);
  });
});

describe('gerarDia — restrições', () => {
  const ANIMAL = /frango|patinho|tilápia|salmão|atum|carne|whey|iogurte|queijo|leite|requeijão|ovo|omelete/i;
  it('vegano: nenhum alimento de origem animal no dia inteiro', () => {
    S.profile.restrictions = ['vegano'];
    const d = gerarDia({ refeicoes: 5 });
    d.meals.forEach(m => m.foods.forEach(f => {
      expect(f.name).not.toMatch(ANIMAL);
    }));
  });
  it('sem lactose: nada de whey/iogurte/queijo/leite', () => {
    S.profile.restrictions = ['lactose'];
    const d = gerarDia({ refeicoes: 4 });
    d.meals.forEach(m => m.foods.forEach(f => {
      expect(f.name).not.toMatch(/whey|iogurte|queijo|leite|requeijão/i);
    }));
  });
});

describe('gerarDia — variação e evidências', () => {
  it('seeds diferentes mudam pelo menos um prato', () => {
    const a = gerarDia({ refeicoes: 4, seed: 0 }).meals.map(m => m.foods.map(f => f.name).join(','));
    const b = gerarDia({ refeicoes: 4, seed: 2 }).meals.map(m => m.foods.map(f => f.name).join(','));
    expect(a.join('|')).not.toBe(b.join('|'));
  });
  it('carrega as 5 referências de nutrição do PubMed', () => {
    const d = gerarDia({});
    expect(d.refs).toBe(EVID_DIETA);
    d.refs.forEach(r => expect(r.pmid).toMatch(/^\d{7,8}$/));
  });
  it('opções do wizard existem e estão completas', () => {
    expect(Object.keys(PLANOS)).toEqual(['3', '4', '5']);
    expect(Object.keys(ESTILOS)).toEqual(['pratico', 'variado']);
  });
});
