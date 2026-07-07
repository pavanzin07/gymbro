import { describe, it, expect } from 'vitest';
import { mergeStates, syncConfigured } from '../../src/sync.js';

function mkState(overrides = {}) {
  return {
    profile: { weight: 80 },
    choices: { kcal: 'b', prot: 'b', fat: 'b' },
    progress: { weight: [], measures: [], waterGoalMl: 2000, days: {} },
    sessions: [],
    goals: [],
    characters: [],
    activeChar: 0,
    wallet: { owned: ['short_black'], spent: 0 },
    routines: [],
    mealTemplate: [],
    mealDiary: {},
    targets: { kcal: 2200, prot: 160, carb: 230, fat: 70 },
    ...overrides
  };
}

describe('syncConfigured', () => {
  it('sem variáveis de ambiente, sync fica desligado', () => {
    expect(syncConfigured()).toBe(false);
  });
});

describe('mergeStates', () => {
  it('o estado mais novo vence nos campos simples', () => {
    const oldS = mkState({ profile: { weight: 90 }, targets: { kcal: 3000, prot: 200, carb: 300, fat: 90 } });
    const newS = mkState({ profile: { weight: 80 } });
    const m = mergeStates(newS, 2000, oldS, 1000);
    expect(m.profile.weight).toBe(80);
    expect(m.targets.kcal).toBe(2200);
  });

  it('ordem dos argumentos não importa, só o timestamp', () => {
    const oldS = mkState({ profile: { weight: 90 } });
    const newS = mkState({ profile: { weight: 80 } });
    const m = mergeStates(oldS, 1000, newS, 2000);
    expect(m.profile.weight).toBe(80);
  });

  it('dias de check-in exclusivos do lado antigo são preservados', () => {
    const oldS = mkState();
    oldS.progress.days['2026-07-01'] = { workout: true };
    oldS.progress.days['2026-07-02'] = { diet: true };
    const newS = mkState();
    newS.progress.days['2026-07-02'] = { workout: true, diet: false };
    newS.progress.days['2026-07-03'] = { workout: true };
    const m = mergeStates(newS, 2000, oldS, 1000);
    expect(m.progress.days['2026-07-01']).toEqual({ workout: true });      // veio do antigo
    expect(m.progress.days['2026-07-02']).toEqual({ workout: true, diet: false }); // novo vence no conflito
    expect(m.progress.days['2026-07-03']).toEqual({ workout: true });
  });

  it('datas do diário alimentar exclusivas do lado antigo são preservadas', () => {
    const oldS = mkState();
    oldS.mealDiary['2026-07-01'] = [{ id: 'a', name: 'Almoço', foods: [{ kcal: '500' }] }];
    const newS = mkState();
    newS.mealDiary['2026-07-02'] = [{ id: 'b', name: 'Jantar', foods: [] }];
    const m = mergeStates(newS, 2000, oldS, 1000);
    expect(Object.keys(m.mealDiary).sort()).toEqual(['2026-07-01', '2026-07-02']);
    expect(m.mealDiary['2026-07-01'][0].foods[0].kcal).toBe('500');
  });

  it('sessões são unidas sem duplicar (chave data+rotina)', () => {
    const oldS = mkState({ sessions: [
      { date: '2026-07-01', routineId: 'r1', volume: 1000 },
      { date: '2026-07-02', routineId: 'r1', volume: 1100 }
    ] });
    const newS = mkState({ sessions: [
      { date: '2026-07-02', routineId: 'r1', volume: 1200 },
      { date: '2026-07-03', routineId: 'r2', volume: 900 }
    ] });
    const m = mergeStates(newS, 2000, oldS, 1000);
    expect(m.sessions).toHaveLength(3);
    expect(m.sessions.map(s => s.date)).toEqual(['2026-07-01', '2026-07-02', '2026-07-03']);
    expect(m.sessions.find(s => s.date === '2026-07-02').volume).toBe(1200); // novo vence
  });

  it('registros de peso são unidos por data e ordenados', () => {
    const oldS = mkState();
    oldS.progress.weight = [{ date: '2026-07-01', v: 82 }];
    const newS = mkState();
    newS.progress.weight = [{ date: '2026-07-05', v: 81 }];
    const m = mergeStates(newS, 2000, oldS, 1000);
    expect(m.progress.weight.map(w => w.date)).toEqual(['2026-07-01', '2026-07-05']);
  });

  it('lado remoto vazio/nulo não quebra o merge', () => {
    const local = mkState({ profile: { weight: 77 } });
    const m = mergeStates(local, 2000, null, 0);
    expect(m.profile.weight).toBe(77);
  });

  it('não muta os estados originais', () => {
    const oldS = mkState();
    oldS.progress.days['2026-07-01'] = { workout: true };
    const newS = mkState();
    const before = JSON.stringify(newS);
    mergeStates(newS, 2000, oldS, 1000);
    expect(JSON.stringify(newS)).toBe(before);
  });
});
