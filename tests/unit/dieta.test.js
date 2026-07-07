import { describe, it, expect, beforeEach } from 'vitest';
import { S, replaceState } from '../../src/state.js';
import { mealTotals, dayTotals, detectCat, comboAllowed } from '../../src/dieta.js';
import { COMBOS } from '../../src/data/alimentos.js';

function baseState(overrides = {}) {
  return {
    profile: null,
    choices: { kcal: 'b', prot: 'b', fat: 'b' },
    progress: { weight: [], measures: [], waterGoalMl: 2000, days: {} },
    sessions: [],
    goals: [],
    characters: [],
    activeChar: 0,
    wallet: { owned: ['short_black'], spent: 0 },
    routines: [],
    meals: [],
    targets: { kcal: 2200, prot: 160, carb: 230, fat: 70 },
    ...overrides
  };
}

beforeEach(() => {
  replaceState(baseState());
});

describe('mealTotals / dayTotals', () => {
  it('soma os macros dos alimentos de uma refeição', () => {
    const meal = { foods: [
      { kcal: '165', prot: '31', carb: '0', fat: '3.6' },
      { kcal: '130', prot: '2.7', carb: '28', fat: '0.3' }
    ] };
    const t = mealTotals(meal);
    expect(t.kcal).toBeCloseTo(295, 5);
    expect(t.prot).toBeCloseTo(33.7, 5);
    expect(t.carb).toBeCloseTo(28, 5);
    expect(t.fat).toBeCloseTo(3.9, 5);
  });

  it('refeição sem alimentos soma zero', () => {
    expect(mealTotals({ foods: [] })).toEqual({ kcal: 0, prot: 0, carb: 0, fat: 0 });
  });

  it('soma os totais de todas as refeições do dia', () => {
    S.meals = [
      { id: '1', name: 'Café', foods: [{ kcal: '100', prot: '10', carb: '5', fat: '2' }] },
      { id: '2', name: 'Almoço', foods: [{ kcal: '200', prot: '20', carb: '10', fat: '4' }] }
    ];
    const t = dayTotals();
    expect(t.kcal).toBe(300);
    expect(t.prot).toBe(30);
    expect(t.carb).toBe(15);
    expect(t.fat).toBe(6);
  });
});

describe('detectCat (detecção de categoria pelo nome da refeição)', () => {
  it('identifica café da manhã, almoço, lanche e jantar por palavras-chave', () => {
    expect(detectCat('Café da manhã')).toBe('cafe');
    expect(detectCat('Almoço')).toBe('almoco');
    expect(detectCat('Lanche da tarde')).toBe('lanche');
    expect(detectCat('Jantar')).toBe('janta');
    expect(detectCat('Pré-treino')).toBe('lanche');
    expect(detectCat('Refeição qualquer')).toBe('');
  });
});

describe('comboAllowed (filtro por restrição alimentar)', () => {
  it('sem restrições, todos os combos são permitidos', () => {
    S.profile = { restrictions: [] };
    COMBOS.forEach(c => expect(comboAllowed(c)).toBe(true));
  });

  it('vegano bloqueia combos com carne, laticínio ou ovo', () => {
    S.profile = { restrictions: ['vegano'] };
    const veganCombos = COMBOS.filter(c => comboAllowed(c));
    veganCombos.forEach(c => {
      expect(c.tags.meat).toBeFalsy();
      expect(c.tags.lac).toBeFalsy();
      expect(c.tags.egg).toBeFalsy();
    });
    expect(veganCombos.length).toBeLessThan(COMBOS.length);
  });

  it('sem lactose bloqueia apenas combos com laticínio', () => {
    S.profile = { restrictions: ['lactose'] };
    COMBOS.forEach(c => {
      if (c.tags.lac) expect(comboAllowed(c)).toBe(false);
    });
  });
});
