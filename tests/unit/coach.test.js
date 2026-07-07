import { describe, it, expect } from 'vitest';
import { suggestNextLoad, maxLoadByDate, analyzeExercise, weightTrend, adherence, volumeTrend } from '../../src/coach.js';

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

describe('weightTrend', () => {
  it('perda constante de 0,5 kg/semana é detectada', () => {
    const w = [
      { date: '2026-06-01', v: 82 },
      { date: '2026-06-08', v: 81.5 },
      { date: '2026-06-15', v: 81 },
      { date: '2026-06-22', v: 80.5 }
    ];
    const t = weightTrend(w);
    expect(t.ratePerWeek).toBeCloseTo(-0.5, 1);
    expect(t.spanDays).toBe(21);
    expect(t.last).toBe(80.5);
  });
  it('menos de 2 registros → null', () => {
    expect(weightTrend([])).toBeNull();
    expect(weightTrend([{ date: '2026-07-01', v: 80 }])).toBeNull();
  });
  it('registros fora de ordem são ordenados antes do cálculo', () => {
    const t = weightTrend([
      { date: '2026-06-15', v: 81 },
      { date: '2026-06-01', v: 82 },
      { date: '2026-06-08', v: 81.5 }
    ]);
    expect(t.ratePerWeek).toBeCloseTo(-0.5, 1);
  });
});

describe('adherence', () => {
  it('conta dias com treino/dieta na janela', () => {
    const days = {
      '2026-07-07': { workout: true, diet: true },
      '2026-07-06': { workout: true },
      '2026-07-05': { diet: true },
      '2026-06-01': { workout: true } // fora da janela de 28 dias? 2026-06-10 é o limite
    };
    const a = adherence(days, '2026-07-07', 28);
    expect(a.workout).toBe(2);
    expect(a.diet).toBe(2);
    expect(a.workoutPct).toBe(7);
  });
  it('sem dados → tudo zero', () => {
    const a = adherence({}, '2026-07-07');
    expect(a.workout).toBe(0);
    expect(a.dietPct).toBe(0);
  });
});

describe('volumeTrend', () => {
  it('compara últimos 7 dias com os 7 anteriores', () => {
    const sessions = [
      { date: '2026-07-06', volume: 3000 }, // atual
      { date: '2026-07-02', volume: 2000 }, // atual (5 dias atrás)
      { date: '2026-06-28', volume: 4000 }, // anterior (9 dias atrás)
      { date: '2026-06-20', volume: 9999 }  // fora das duas janelas
    ];
    const v = volumeTrend(sessions, '2026-07-07');
    expect(v.cur).toBe(5000);
    expect(v.prev).toBe(4000);
    expect(v.deltaPct).toBe(25);
  });
  it('sem semana anterior → deltaPct null', () => {
    const v = volumeTrend([{ date: '2026-07-06', volume: 1000 }], '2026-07-07');
    expect(v.deltaPct).toBeNull();
  });
});
