import { describe, it, expect } from 'vitest';
import { estimate1RM } from '../../src/conquistas.js';

describe('estimate1RM (1RM estimado a partir de carga x reps)', () => {
  it('retorna null quando não há reps registradas', () => {
    expect(estimate1RM(100, 0)).toBeNull();
    expect(estimate1RM(100, null)).toBeNull();
  });

  it('estima o 1RM com a fórmula load*(1+reps/30)', () => {
    expect(estimate1RM(100, 30)).toBe(200); // 100*(1+1)
    expect(estimate1RM(60, 8)).toBe(Math.round(60 * (1 + 8 / 30)));
  });
});
