import { describe, it, expect } from 'vitest';
import { gerarPrograma, FOCOS, VOLUMES, SPLITS } from '../../src/gerador.js';
import { EVID } from '../../src/data/evidencia.js';
import { EXLIB, exDica } from '../../src/data/exercicios.js';
import { PROGRAMAS, recomendadoPronto } from '../../src/data/programas.js';

describe('gerarPrograma — estrutura do split', () => {
  it('2 dias → 2 rotinas Full Body', () => {
    const p = gerarPrograma({ dias: 2 });
    expect(p.routines).toHaveLength(2);
    expect(p.routines[0].name).toContain('Full Body');
  });
  it('4 dias → Superior/Inferior ×2', () => {
    const p = gerarPrograma({ dias: 4 });
    expect(p.routines).toHaveLength(4);
    expect(p.routines.map(r => r.name)).toEqual(['Superiores A', 'Inferiores A', 'Superiores B', 'Inferiores B']);
  });
  it('dias fora da faixa são clampados (1→2, 7→5)', () => {
    expect(gerarPrograma({ dias: 1 }).routines).toHaveLength(2);
    expect(gerarPrograma({ dias: 7 }).routines).toHaveLength(5);
  });
  it('frequência 2x: grupos grandes aparecem em 2+ dias no split de 4', () => {
    const p = gerarPrograma({ dias: 4 });
    ['Peito', 'Costas', 'Pernas'].forEach(g => {
      const diasComGrupo = p.routines.filter(r => r.exercises.some(e => e.musc === g)).length;
      expect(diasComGrupo).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('gerarPrograma — foco define reps/descanso/séries', () => {
  it('força: compostos 4-6 reps, 180s de descanso, 4 séries', () => {
    const p = gerarPrograma({ dias: 3, foco: 'forca' });
    const comp = p.routines[0].exercises[0];
    expect(comp.reps).toBe('4-6');
    expect(comp.rest).toBe('180');
    expect(comp.sets).toBe('4');
  });
  it('resistência: compostos 12-15 reps, 75s de descanso', () => {
    const p = gerarPrograma({ dias: 3, foco: 'resistencia' });
    const comp = p.routines[0].exercises[0];
    expect(comp.reps).toBe('12-15');
    expect(comp.rest).toBe('75');
  });
  it('compostos vêm antes dos isolados em cada dia', () => {
    const p = gerarPrograma({ dias: 4, foco: 'hipertrofia' });
    p.routines.forEach(r => {
      const rests = r.exercises.map(e => Number(e.rest));
      const primeiroIso = rests.findIndex(x => x < Number(FOCOS.hipertrofia.restComp));
      if (primeiroIso >= 0) rests.slice(primeiroIso).forEach(x => expect(x).toBeLessThan(Number(FOCOS.hipertrofia.restComp)));
    });
  });
});

describe('gerarPrograma — volume', () => {
  const total = p => p.routines.reduce((a, r) => a + r.exercises.length, 0);
  it('alto > padrão > leve em quantidade de exercícios', () => {
    const leve = total(gerarPrograma({ dias: 4, volume: 'leve' }));
    const padrao = total(gerarPrograma({ dias: 4, volume: 'padrao' }));
    const alto = total(gerarPrograma({ dias: 4, volume: 'alto' }));
    expect(padrao).toBeGreaterThan(leve);
    expect(alto).toBeGreaterThan(padrao);
  });
  it('resumo semanal soma séries por grupo', () => {
    const p = gerarPrograma({ dias: 2, volume: 'padrao' });
    expect(p.semana['Pernas']).toBeGreaterThan(0);
    const somaManual = p.routines.flatMap(r => r.exercises).filter(e => e.musc === 'Pernas')
      .reduce((a, e) => a + Number(e.sets), 0);
    expect(p.semana['Pernas']).toBe(somaManual);
  });
});

describe('gerarPrograma — qualidade dos dias', () => {
  it('sem exercício repetido dentro do mesmo dia', () => {
    [2, 3, 4, 5].forEach(d => {
      gerarPrograma({ dias: d, volume: 'alto' }).routines.forEach(r => {
        const nomes = r.exercises.map(e => e.name);
        expect(new Set(nomes).size).toBe(nomes.length);
      });
    });
  });
  it('todo exercício existe na biblioteca e tem os campos do schema', () => {
    const todos = Object.values(EXLIB).flat().map(e => e.n);
    gerarPrograma({ dias: 5 }).routines.forEach(r => r.exercises.forEach(e => {
      expect(todos).toContain(e.name);
      expect(e).toMatchObject({ load: '', history: [] });
      expect(typeof e.note).toBe('string');
      expect(e.id).toBeTruthy();
    }));
  });
  it('dias diferentes variam os exercícios (Full Body A ≠ B no composto de pernas)', () => {
    const p = gerarPrograma({ dias: 2 });
    const pernasA = p.routines[0].exercises.find(e => e.musc === 'Pernas').name;
    const pernasB = p.routines[1].exercises.find(e => e.musc === 'Pernas').name;
    expect(pernasA).not.toBe(pernasB);
  });
});

describe('treinos prontos', () => {
  it('todos os presets geram programa válido com o nº certo de dias', () => {
    PROGRAMAS.forEach(p => {
      const g = gerarPrograma(p.cfg);
      expect(g.routines).toHaveLength(p.cfg.dias);
      expect(g.routines.every(r => r.exercises.length >= 3)).toBe(true);
    });
  });
  it('recomendação por perfil cobre todos os casos', () => {
    expect(recomendadoPronto({ level: 'ini', goal: 'massa' })).toBe('primeiro');
    expect(recomendadoPronto({ level: 'int', goal: 'forca' })).toBe('forca');
    expect(recomendadoPronto({ level: 'int', goal: 'perder' })).toBe('definir');
    expect(recomendadoPronto({ level: 'avc', goal: 'massa' })).toBe('ppl');
    expect(recomendadoPronto({ level: 'int', goal: 'massa' })).toBe('massa');
    expect(recomendadoPronto(null)).toBe('massa');
  });
  it('toda a biblioteca tem dica de execução pra iniciante', () => {
    Object.values(EXLIB).flat().forEach(e => {
      expect(e.d, e.n + ' sem dica').toBeTruthy();
      expect(e.d.length).toBeGreaterThan(15);
    });
  });
  it('exercícios gerados carregam a dica como nota (visível na rotina)', () => {
    gerarPrograma({ dias: 2 }).routines.forEach(r => r.exercises.forEach(ex => {
      expect(ex.note).toBe(exDica(ex.name));
      expect(ex.note.length).toBeGreaterThan(15);
    }));
  });
});

describe('base de evidências', () => {
  it('programa carrega as referências do PubMed', () => {
    const p = gerarPrograma({});
    expect(p.refs).toBe(EVID);
    expect(p.refs.length).toBeGreaterThanOrEqual(5);
    p.refs.forEach(r => {
      expect(r.pmid).toMatch(/^\d{7,8}$/);
      expect(r.achado.length).toBeGreaterThan(20);
      expect(r.decisao.length).toBeGreaterThan(20);
    });
  });
  it('todas as opções expostas no wizard existem', () => {
    expect(Object.keys(SPLITS)).toEqual(['2', '3', '4', '5']);
    expect(Object.keys(FOCOS)).toEqual(['forca', 'hipertrofia', 'resistencia']);
    expect(Object.keys(VOLUMES)).toEqual(['leve', 'padrao', 'alto']);
  });
});
