import { describe, it, expect } from 'vitest';
import { generateLessonPlan } from './lesson-plan';
import type { CaseDefinition, DecisionLogEntry } from './types';

const caseDef: CaseDefinition = {
  id: 'sample',
  title: 'Sample case — anterior STEMI',
  blurb: 'Patient summary goes here.',
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  guidelines: [{ label: 'MOH CPG', body: 'Body text' }],
  historical: false,
  pathway: [
    {
      id: 'n1',
      department: 'ed',
      durationMin: 10,
      framing: { patient: '', caregiver: '', staff: '' },
      decision: {
        id: 'd1',
        prompt: 'Best loading?',
        weight: 1,
        reference: { label: 'ESC 2023', body: '' },
        options: [
          {
            id: 'good',
            label: 'Aspirin + ticagrelor',
            rationale: 'Best ischaemic-event reduction.',
            score: 10,
            outcome: { patient: '', caregiver: '', staff: '' },
          },
          {
            id: 'bad',
            label: 'No loading',
            rationale: 'Unsafe.',
            score: -5,
            outcome: { patient: '', caregiver: '', staff: '' },
          },
        ],
      },
    },
  ],
};

const log: DecisionLogEntry[] = [
  { nodeId: 'n1', decisionId: 'd1', optionId: 'bad', scoreEarned: -5, maxScore: 10 },
];

describe('generateLessonPlan', () => {
  it('produces a markdown summary with title, score, decisions, references', () => {
    const md = generateLessonPlan({
      caseDef,
      log,
      elapsedGameMin: 75,
      totalCostSGD: 500,
    });
    expect(md).toContain('# Sample case — anterior STEMI');
    expect(md).toContain('## Summary');
    expect(md).toContain('Score');
    expect(md).toContain('## Decisions');
    expect(md).toContain('## References');
    expect(md).toContain('Aspirin + ticagrelor');
    expect(md).toContain('Differs from best-practice');
    expect(md).toContain('MOH CPG');
  });

  it('includes patient + caregiver-burden context when provided', () => {
    const md = generateLessonPlan({
      caseDef,
      log,
      elapsedGameMin: 75,
      totalCostSGD: 500,
      profile: { name: 'Mr Tan', wardClass: 'C', chasTier: 'orange', hasIntegratedShield: false },
      burden: { timeOffWorkHours: 12, financialWorry: 40, sleepDebt: 22 },
    });
    expect(md).toContain('Mr Tan');
    expect(md).toContain('ward C');
    expect(md).toContain('off work');
  });

  it('embeds per-decision reflection notes as blockquotes when provided', () => {
    const md = generateLessonPlan({
      caseDef,
      log,
      elapsedGameMin: 60,
      totalCostSGD: 0,
      notes: { d1: 'Forgot ticagrelor dose.\nReview ESC 2023 §6.' },
    });
    expect(md).toContain('> Forgot ticagrelor dose.');
    expect(md).toContain('> Review ESC 2023 §6.');
  });

  it('omits the reflection blockquote when the note is empty whitespace', () => {
    const md = generateLessonPlan({
      caseDef,
      log,
      elapsedGameMin: 60,
      totalCostSGD: 0,
      notes: { d1: '   \n  ' },
    });
    expect(md).not.toContain('> ');
  });

  it('renders a Patient journey section when journey ids are supplied', () => {
    const cd = {
      ...caseDef,
      pathway: [
        {
          id: 'triage',
          department: 'triage',
          facility: 'ttsh',
          durationMin: 5,
          framing: {
            patient: '',
            caregiver: '',
            staff: 'Vitals: BP 102/64, HR 96, SpO2 95%. Triage P1.',
          },
        },
        ...caseDef.pathway,
      ],
    };
    const md = generateLessonPlan({
      caseDef: cd,
      log,
      elapsedGameMin: 75,
      totalCostSGD: 500,
      journey: ['triage', 'n1'],
    });
    expect(md).toContain('## Patient journey');
    expect(md).toContain('ttsh');
    expect(md).toContain('Vitals: BP 102/64');
  });

  it('omits the Patient journey section when every stop has empty staff framing', () => {
    const md = generateLessonPlan({
      caseDef,
      log,
      elapsedGameMin: 75,
      totalCostSGD: 500,
      journey: ['n1'],
    });
    expect(md).not.toContain('## Patient journey');
  });

  it('emits citation block for historical cases', () => {
    const hist = { ...caseDef, historical: true, citations: ['MOH SARS report 2004'] };
    const md = generateLessonPlan({
      caseDef: hist,
      log,
      elapsedGameMin: 60,
      totalCostSGD: 0,
    });
    expect(md).toContain('Historical scenario');
    expect(md).toContain('MOH SARS report 2004');
  });
});
