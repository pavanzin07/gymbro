import { describe, it, expect, beforeEach } from 'vitest';
import { replaceState } from '../../src/state.js';
import { exPR } from '../../src/treino.js';

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

describe('exPR (recorde pessoal do exercício)', () => {
  it('retorna null quando o exercício não tem histórico', () => {
    expect(exPR({ history: [] })).toBeNull();
    expect(exPR({})).toBeNull();
    expect(exPR(null)).toBeNull();
  });

  it('retorna o registro com a maior carga do histórico', () => {
    const ex = { history: [
      { date: '2024-01-01', load: '50', reps: 8 },
      { date: '2024-01-02', load: '70', reps: 5 },
      { date: '2024-01-03', load: '60', reps: 6 }
    ] };
    expect(exPR(ex).load).toBe('70');
  });
});
