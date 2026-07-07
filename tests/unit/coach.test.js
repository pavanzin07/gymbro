import { describe, it, expect } from 'vitest';
import { suggestNextLoad, maxLoadByDate, analyzeExercise } from '../../src/coach.js';

describe('suggestNextLoad', () => {
  it('sugere ~2,5% a mais, arredondado pra 0,5 kg', () => {
    expect(suggestNextLoad(100)).toBe(102.5);
    expect(suggestNextLoad(80)).toBe(82);
    expect(suggestNextLoad(60)).toBe(61.5);
  });
  it('incremento mínimo de 0,5 kg em cargas leves', () => {
    expect(suggestNextLoad(10)).toBe(10.5);
    expect(suggestNextLoad(4)).toBe(4.5);
  });
});

describe('maxLoadByDate', () => {
  it('agrupa por data pegando a maior carga, ordenado', () => {
    const s = maxLoadByDate([
      { date: '2026-07-03', load: 80 },
      { date: '2026-07-01', load: 70 },
      { date: '2026-07-03', load: 85 },
      { date: '2026-07-01', load: 75 }
    ]);
    expect(s).toEqual([
      { date: '2026-07-01', load: 75 },
      { date: '2026-07-03', load: 85 }
    ]);
  });
  it('lida com lista vazia/nula', () => {
    expect(maxLoadByDate([])).toEqual([]);
    expect(maxLoadByDate(null)).toEqual([]);
  });
});

describe('analyzeExercise', () => {
  const e = (date, load) => ({ date, load, reps: 8 });

  it('menos de 2 datas → começando', () => {
    expect(analyzeExercise([]).status).toBe('comecando');
    expect(analyzeExercise([e('2026-07-01', 80)]).status).toBe('comecando');
  });

  it('3 sessões com a mesma carga → estagnado, com sugestão de próxima carga', () => {
    const a = analyzeExercise([e('2026-07-01', 80), e('2026-07-03', 80), e('2026-07-05', 80)]);
    expect(a.status).toBe('estagnado');
    expect(a.tip).toContain('82');
  });

  it('carga subindo → progredindo', () => {
    const a = analyzeExercise([e('2026-07-01', 80), e('2026-07-03', 82.5), e('2026-07-05', 85)]);
    expect(a.status).toBe('progredindo');
  });

  it('carga caindo → regredindo', () => {
    const a = analyzeExercise([e('2026-07-01', 85), e('2026-07-03', 80), e('2026-07-05', 77.5)]);
    expect(a.status).toBe('regredindo');
  });

  it('só as últimas 4 datas contam (histórico velho não interfere)', () => {
    const a = analyzeExercise([
      e('2026-06-01', 100), // fora da janela
      e('2026-07-01', 80), e('2026-07-03', 80), e('2026-07-05', 80), e('2026-07-07', 80)
    ]);
    expect(a.status).toBe('estagnado');
  });

  it('duas entradas na mesma data usam a maior carga', () => {
    const a = analyzeExercise([
      e('2026-07-01', 80), { date: '2026-07-01', load: 90, reps: 3 },
      e('2026-07-03', 95)
    ]);
    expect(a.status).toBe('progredindo');
    expect(a.msg).toContain('90');
    expect(a.msg).toContain('95');
  });
});
