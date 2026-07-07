import { describe, it, expect, beforeEach } from 'vitest';
import { S, replaceState } from '../../src/state.js';
import { computeMetrics, gcat, calorieOptions, proteinOptions, fatOptions, applyChoices } from '../../src/perfil.js';

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

describe('computeMetrics (Mifflin-St Jeor + fator de atividade)', () => {
  it('calcula TMB para homem e aplica o fator de atividade com acréscimo por sessões', () => {
    const p = { sex: 'M', age: '25', height: '175', weight: '80', trainDays: '3', otherDays: '0', lifestyle: 'lev' };
    const m = computeMetrics(p);
    expect(m.bmr).toBe(1774); // 10*80+6.25*175-5*25+5 = 1773.75 -> arredonda 1774
    expect(m.pal).toBeCloseTo(1.42, 2); // base 1.30 (leve) + min(3*0.04,0.25)=0.12
    expect(m.tdee).toBe(2519); // round(1773.75*1.42)
  });

  it('calcula TMB para mulher com fórmula diferente (-161 em vez de +5)', () => {
    const p = { sex: 'F', age: '30', height: '165', weight: '60', trainDays: '4', otherDays: '0', lifestyle: 'sed' };
    const m = computeMetrics(p);
    expect(m.bmr).toBe(Math.round(10 * 60 + 6.25 * 165 - 5 * 30 - 161));
  });

  it('nunca deixa o fator de atividade passar de 1.80 mesmo com muitas sessões', () => {
    const p = { sex: 'M', age: '25', height: '180', weight: '90', trainDays: '10', otherDays: '10', lifestyle: 'ati' };
    const m = computeMetrics(p);
    expect(m.pal).toBeLessThanOrEqual(1.80);
  });
});

describe('gcat (categoria do objetivo)', () => {
  it('mapeia perder/definir para cut, massa/peso para bulk, e o resto para perf', () => {
    expect(gcat('perder')).toBe('cut');
    expect(gcat('definir')).toBe('cut');
    expect(gcat('massa')).toBe('bulk');
    expect(gcat('peso')).toBe('bulk');
    expect(gcat('forca')).toBe('perf');
    expect(gcat('esporte')).toBe('perf');
  });
});

describe('calorieOptions (3 opções + % de recomendação)', () => {
  it('sempre retorna exatamente 3 opções, arredondadas em múltiplos de 10', () => {
    const opts = calorieOptions(2500, 'massa');
    expect(opts).toHaveLength(3);
    opts.forEach(o => expect(o.kcal % 10).toBe(0));
  });

  it('para objetivo de perda gera déficit crescente entre as opções a/b/c', () => {
    const [a, b, c] = calorieOptions(2500, 'perder');
    expect(a.kcal).toBeGreaterThan(b.kcal);
    expect(b.kcal).toBeGreaterThan(c.kcal);
    expect(c.kcal).toBeLessThan(2500);
  });

  it('para ganho de massa gera superávit crescente entre as opções', () => {
    const [a, b, c] = calorieOptions(2500, 'massa');
    expect(a.kcal).toBeLessThan(b.kcal);
    expect(b.kcal).toBeLessThan(c.kcal);
    expect(a.kcal).toBeGreaterThan(2500);
  });
});

describe('proteinOptions / fatOptions (faixas por kg)', () => {
  it('proteína cobre 1.6 a 2.2 g/kg em 3 opções', () => {
    const opts = proteinOptions(80, 'massa');
    expect(opts.map(o => o.gkg)).toEqual([1.6, 1.9, 2.2]);
    expect(opts[0].g).toBe(Math.round(80 * 1.6));
    expect(opts[2].g).toBe(Math.round(80 * 2.2));
  });

  it('gordura cobre 0.8 a 1.2 g/kg em 3 opções', () => {
    const opts = fatOptions(80, 'massa');
    expect(opts.map(o => o.gkg)).toEqual([0.8, 1.0, 1.2]);
    expect(opts[0].g).toBe(Math.round(80 * 0.8));
    expect(opts[2].g).toBe(Math.round(80 * 1.2));
  });
});

describe('applyChoices (opção escolhida vira meta; carboidrato preenche o resto)', () => {
  it('aplica a opção "b" (padrão) de cada macro e calcula o carboidrato pelo resto das calorias', () => {
    S.profile = { sex: 'M', age: '25', height: '175', weight: '80', goal: 'massa', trainDays: '3', otherDays: '0', lifestyle: 'lev' };
    applyChoices();
    const m = computeMetrics(S.profile);
    const [, protB] = proteinOptions(80, 'massa');
    const [, fatB] = fatOptions(80, 'massa');
    const [, kcalB] = calorieOptions(m.tdee, 'massa');
    expect(S.targets.kcal).toBe(kcalB.kcal);
    expect(S.targets.prot).toBe(protB.g);
    expect(S.targets.fat).toBe(fatB.g);
    expect(S.targets.carb).toBe(Math.max(0, Math.round((kcalB.kcal - protB.g * 4 - fatB.g * 9) / 4)));
  });

  it('permite personalizar calorias/proteína/gordura via choices custom', () => {
    S.profile = { sex: 'M', age: '25', height: '175', weight: '80', goal: 'massa', trainDays: '3', otherDays: '0', lifestyle: 'lev' };
    S.choices = { kcal: 'custom', kcalCustom: 3000, prot: 'custom', protCustom: 200, fat: 'custom', fatCustom: 90 };
    applyChoices();
    expect(S.targets.kcal).toBe(3000);
    expect(S.targets.prot).toBe(200);
    expect(S.targets.fat).toBe(90);
    expect(S.targets.carb).toBe(Math.round((3000 - 200 * 4 - 90 * 9) / 4));
  });

  it('não faz nada se não houver perfil', () => {
    S.profile = null;
    const before = { ...S.targets };
    applyChoices();
    expect(S.targets).toEqual(before);
  });
});
