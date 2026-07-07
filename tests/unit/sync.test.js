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

describe('mergeStates — histórico de carga por exercício', () => {
  function withRoutine(hist) {
    const s = mkState();
    s.routines = [{ id: 'r1', name: 'Treino A', exercises: [
      { id: 'e1', name: 'Supino reto', sets: 3, reps: '8-10', history: hist }
    ] }];
    return s;
  }

  it('PR registrado só no lado antigo é preservado', () => {
    const oldS = withRoutine([{ date: '2026-07-01', load: 100, reps: 5 }]);
    const newS = withRoutine([{ date: '2026-07-03', load: 80, reps: 8 }]);
    const m = mergeStates(newS, 2000, oldS, 1000);
    const hist = m.routines[0].exercises[0].history;
    expect(hist).toHaveLength(2);
    expect(hist.map(h => h.date)).toEqual(['2026-07-01', '2026-07-03']);
    expect(hist[0].load).toBe(100);
  });

  it('registros idênticos não duplicam', () => {
    const entry = { date: '2026-07-01', load: 80, reps: 8 };
    const oldS = withRoutine([{ ...entry }]);
    const newS = withRoutine([{ ...entry }, { date: '2026-07-02', load: 82.5, reps: 8 }]);
    const m = mergeStates(newS, 2000, oldS, 1000);
    expect(m.routines[0].exercises[0].history).toHaveLength(2);
  });

  it('match de exercício ignora maiúsculas/minúsculas', () => {
    const oldS = withRoutine([{ date: '2026-07-01', load: 100, reps: 5 }]);
    oldS.routines[0].exercises[0].name = 'SUPINO RETO';
    const newS = withRoutine([]);
    const m = mergeStates(newS, 2000, oldS, 1000);
    expect(m.routines[0].exercises[0].history).toHaveLength(1);
  });

  it('exercício que só existe no lado antigo é ignorado (estrutura segue o novo)', () => {
    const oldS = withRoutine([]);
    oldS.routines[0].exercises.push({ id: 'e2', name: 'Crucifixo', history: [{ date: '2026-07-01', load: 20, reps: 12 }] });
    const newS = withRoutine([]);
    const m = mergeStates(newS, 2000, oldS, 1000);
    expect(m.routines[0].exercises).toHaveLength(1);
    expect(m.routines[0].exercises[0].name).toBe('Supino reto');
  });

  it('exercício em rotina diferente ainda recebe o histórico (match global por nome)', () => {
    const oldS = mkState();
    oldS.routines = [{ id: 'rX', name: 'Antigo', exercises: [
      { id: 'e9', name: 'supino reto', history: [{ date: '2026-06-20', load: 95, reps: 6 }] }
    ] }];
    const newS = withRoutine([{ date: '2026-07-03', load: 90, reps: 8 }]);
    const m = mergeStates(newS, 2000, oldS, 1000);
    const hist = m.routines[0].exercises[0].history;
    expect(hist.map(h => h.load)).toEqual([95, 90]);
  });
});
