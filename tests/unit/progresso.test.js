import { describe, it, expect, beforeEach } from 'vitest';
import { S, replaceState } from '../../src/state.js';
import { computeStreak } from '../../src/progresso.js';

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

function dateOffset(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

beforeEach(() => {
  replaceState(baseState());
});

describe('computeStreak (sequência de dias)', () => {
  it('conta 0 quando não há nenhum dia marcado', () => {
    expect(computeStreak(d => d.workout)).toBe(0);
  });

  it('conta a sequência de dias consecutivos terminando hoje', () => {
    S.progress.days[dateOffset(0)] = { workout: true };
    S.progress.days[dateOffset(1)] = { workout: true };
    S.progress.days[dateOffset(2)] = { workout: true };
    S.progress.days[dateOffset(3)] = { workout: false };
    expect(computeStreak(d => d.workout)).toBe(3);
  });

  it('se hoje ainda não bateu, começa a contar a partir de ontem', () => {
    S.progress.days[dateOffset(1)] = { workout: true };
    S.progress.days[dateOffset(2)] = { workout: true };
    // hoje sem registro
    expect(computeStreak(d => d.workout)).toBe(2);
  });

  it('quebra a sequência ao encontrar um dia sem o hábito', () => {
    S.progress.days[dateOffset(0)] = { workout: true };
    S.progress.days[dateOffset(1)] = { workout: false };
    S.progress.days[dateOffset(2)] = { workout: true };
    expect(computeStreak(d => d.workout)).toBe(1);
  });
});
