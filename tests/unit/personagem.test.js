import { describe, it, expect, beforeEach } from 'vitest';
import { S, replaceState } from '../../src/state.js';
import { characterMetrics, goalProgress, svgAvatar, newCharObj } from '../../src/personagem.js';
import { RACES, HAIRSTYLES, EYECOLORS, EYESTYLES } from '../../src/data/racas.js';

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

describe('characterMetrics (XP, moedas e nível derivados)', () => {
  it('começa zerado: nível 1, 0 XP, 0 moedas', () => {
    const m = characterMetrics();
    expect(m.level).toBe(1);
    expect(m.xp).toBe(0);
    expect(m.coins).toBe(0);
  });

  it('soma XP e moedas de 1 dia de treino+dieta+água batida e 1 PR, e desbloqueia as conquistas correspondentes', () => {
    S.progress.days['2024-01-01'] = { workout: true, diet: true, waterMl: 2000 };
    S.progress.waterGoalMl = 2000;
    S.routines = [{ id: 'r1', exercises: [
      { name: 'Supino', musc: 'Peito', history: [{ date: '2024-01-01', load: 50, reps: 8 }] }
    ] }];
    const m = characterMetrics();
    // xp = W*50 + D*30 + water*10 + prCount*40 + achN*30 (first_w + first_pr = 2 conquistas)
    expect(m.xp).toBe(1 * 50 + 1 * 30 + 1 * 10 + 1 * 40 + 2 * 30);
    expect(m.coinsEarned).toBe(1 * 10 + 1 * 8 + 1 * 3 + 1 * 15 + (20 + 30));
    expect(m.coins).toBe(m.coinsEarned); // nada gasto ainda
    expect(m.achN).toBe(2);
  });

  it('nível sobe conforme a curva de XP (xpForLevel = (nível-1)² × 60)', () => {
    // 190 XP fica entre o nível 2 (60xp) e o nível 3 (240xp)
    S.progress.days['2024-01-01'] = { workout: true, diet: true, waterMl: 2000 };
    S.progress.waterGoalMl = 2000;
    S.routines = [{ id: 'r1', exercises: [
      { name: 'Supino', musc: 'Peito', history: [{ date: '2024-01-01', load: 50, reps: 8 }] }
    ] }];
    const m = characterMetrics();
    expect(m.xp).toBe(190);
    expect(m.level).toBe(2);
    expect(m.curBase).toBe(60);
    expect(m.nextBase).toBe(240);
    expect(m.xpInto).toBe(130);
    expect(m.xpNext).toBe(180);
  });

  it('desconta o que já foi gasto na loja das moedas disponíveis', () => {
    S.progress.days['2024-01-01'] = { workout: true };
    S.wallet.spent = 5;
    const m = characterMetrics();
    expect(m.coins).toBe(m.coinsEarned - 5);
  });

  it('nunca deixa o saldo de moedas ficar negativo', () => {
    S.wallet.spent = 99999;
    const m = characterMetrics();
    expect(m.coins).toBe(0);
  });
});

describe('goalProgress (progresso de metas customizadas)', () => {
  it('meta de carga: progresso e conclusão a partir do PR do exercício', () => {
    S.routines = [{ id: 'r1', exercises: [
      { name: 'Supino', musc: 'Peito', history: [{ date: '2024-01-01', load: 50, reps: 8 }, { date: '2024-01-02', load: 70, reps: 5 }] }
    ] }];
    const pr = goalProgress({ type: 'carga', exercise: 'Supino', target: 100 });
    expect(pr.cur).toBe(70);
    expect(pr.pct).toBe(70);
    expect(pr.done).toBe(false);

    const done = goalProgress({ type: 'carga', exercise: 'Supino', target: 70 });
    expect(done.done).toBe(true);
  });

  it('meta de peso (emagrecer): progresso entre o peso inicial e o alvo', () => {
    S.progress.weight = [{ date: '2024-01-01', v: 75 }];
    const g = { type: 'peso', target: 70, start: 80, dir: 'lose' };
    const pr = goalProgress(g);
    expect(pr.cur).toBe(75);
    expect(pr.pct).toBe(50); // (80-75)/(80-70)*100
    expect(pr.done).toBe(false);
  });

  it('meta de água: conta dias em que a meta de água foi batida', () => {
    S.progress.waterGoalMl = 2000;
    S.progress.days = {
      '2024-01-01': { waterMl: 2000 },
      '2024-01-02': { waterMl: 2500 },
      '2024-01-03': { waterMl: 500 }
    };
    const pr = goalProgress({ type: 'agua', target: 5 });
    expect(pr.cur).toBe(2);
    expect(pr.pct).toBe(40);
  });

  it('meta de treinos: conta dias com treino concluído, sem passar de 100%', () => {
    S.progress.days = {
      '2024-01-01': { workout: true },
      '2024-01-02': { workout: true },
      '2024-01-03': { workout: true }
    };
    const pr = goalProgress({ type: 'treinos', target: 2 });
    expect(pr.cur).toBe(3);
    expect(pr.pct).toBe(100);
    expect(pr.done).toBe(true);
  });

  it('meta de sequência: usa a mesma lógica de streak terminando hoje', () => {
    S.progress.days[dateOffset(0)] = { workout: true };
    S.progress.days[dateOffset(1)] = { workout: true };
    const pr = goalProgress({ type: 'sequencia', target: 5 });
    expect(pr.cur).toBe(2);
    expect(pr.pct).toBe(40);
    expect(pr.done).toBe(false);
  });
});

describe('svgAvatar (renderização anime + customização)', () => {
  it('newCharObj traz os novos campos de customização', () => {
    const c = newCharObj();
    expect(c.eyeColor).toBeTypeOf('number');
    expect(c.eyeStyle).toBeTruthy();
    expect(c.hairStyle).toBeTruthy();
  });

  it('gera SVG válido pra toda combinação de raça × expressão × estilo de cabelo sem quebrar', () => {
    RACES.forEach(r => EYESTYLES.forEach(ex => HAIRSTYLES.forEach(hs => {
      const ch = { ...newCharObj(), race: r.k, eyeStyle: ex.k, hairStyle: hs.k };
      replaceState(baseState({ characters: [ch], activeChar: 0 }));
      const svg = svgAvatar();
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('</svg>');
    })));
  });

  it('respeita a cor dos olhos escolhida no desenho', () => {
    const ch = { ...newCharObj(), eyeColor: 3, hairStyle: 'curto' };
    replaceState(baseState({ characters: [ch], activeChar: 0 }));
    expect(svgAvatar()).toContain(EYECOLORS[3]);
  });

  it('todos os equipamentos juntos renderizam sem erro', () => {
    const ch = { ...newCharObj(), equipped: { head: 'helm_horned', neck: 'chain', wrists: 'wrist', hands: 'sword', belt: 'belt', top: 'armor_plate', bottom: 'greaves', feet: 'boots_leather', cape: 'cape_red' } };
    replaceState(baseState({ characters: [ch], activeChar: 0, wallet: { owned: [], spent: 0 } }));
    expect(svgAvatar()).toContain('</svg>');
  });
});
