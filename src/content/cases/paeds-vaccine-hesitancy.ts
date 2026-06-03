import type { CaseDefinition } from '../../lib/types';

const NCIS_SG = {
  label: { en: 'Singapore National Childhood Immunisation Schedule (NCIS)', zh: '新加坡国家儿童免疫计划(NCIS)' },
  body: {
    en: 'Mandatory: DTaP-IPV-Hib-HepB, MMR, varicella, PCV. Catch-up schedules at polyclinics. Some vaccines (e.g. MMR) are required by law under the Infectious Diseases Act — refusal triggers a default-care notice, not a forced vaccination.',
    zh: '强制:DTaP-IPV-Hib-HepB、MMR、水痘、肺炎球菌结合疫苗。综合诊疗所有补种安排。部分疫苗(如MMR)依传染病法令为法定要求 — 拒绝会触发"违规通知",而非强制接种。',
  },
};

const MOTIVATIONAL = {
  label: { en: 'Motivational interviewing for vaccine hesitancy', zh: '疫苗犹豫的动机式访谈' },
  body: {
    en: 'Open questions, reflective listening, summarise concerns, ask permission before sharing info. Coercion entrenches refusal; presumptive language (e.g. "today she\'s due for MMR") raises uptake without coercion.',
    zh: '开放式提问、反思性倾听、归纳顾虑、分享信息前先征得同意。强迫会让拒绝更顽固;预设性语言(如"她今天该打MMR了")在不强迫下提高接种率。',
  },
};

const KKH_PEWS = {
  label: { en: 'KKH paediatric services + PEWS', zh: 'KKH儿科服务与PEWS' },
  body: {
    en: 'KK Women\'s and Children\'s Hospital runs paediatric subspecialties + a 24/7 Children\'s Emergency. PEWS (Paediatric Early Warning Score) triggers escalation.',
    zh: 'KK妇幼医院设有儿科亚专科及24小时儿童急诊。PEWS(小儿早期预警评分)触发升级。',
  },
};

export const paedsVaccineHesitancyCase: CaseDefinition = {
  id: 'paeds-vaccine-hesitancy',
  title: {
    en: 'Vaccine-hesitant parent at a polyclinic — MMR conversation',
    zh: '综合诊疗所遇疫苗犹豫家长 — MMR对话',
  },
  blurb: {
    en: 'A worried mother brings her 18-month-old to the polyclinic for review. She has been reading online and asks to skip the MMR. Her child is otherwise well; the next visit will be at 5 years.',
    zh: '焦虑的母亲带18个月大女儿来综合诊疗所复诊。她在网上读了一些信息,提出不想打MMR。孩子目前健康;下次到5岁才会复诊。',
  },
  category: 'outpatient',
  primaryFacility: 'nhgp-amk',
  involvedFacilities: ['nhgp-amk', 'kkh'],
  profileKey: 'youngAdult',
  allowsWardChoice: false,
  guidelines: [NCIS_SG, MOTIVATIONAL, KKH_PEWS],
  pathway: [
    {
      id: 'conversation',
      department: 'gp-room',
      facility: 'nhgp-amk',
      durationMin: 20,
      costSGD: 25,
      charge: 'polyclinic',
      caregiverBurden: { timeOffWorkHours: 1, financialWorry: 1 },
      framing: {
        patient: { en: 'Your daughter sits on your lap, kicking. You hold the phone with the article open.', zh: '女儿坐在你腿上踢脚。你手里拿着开着文章的手机。' },
        caregiver: { en: 'You feel braced for an argument and ready to leave.', zh: '你做好了被劝说的准备,也准备好随时离开。' },
        staff: { en: 'Hesitant — not refusing. Coercion will entrench; motivational interviewing opens the door.', zh: '是犹豫,不是拒绝。强迫会让她更抗拒;动机式访谈才能打开门。' },
      },
      decision: {
        id: 'opening-move',
        prompt: { en: 'Opening move with this mother?', zh: '对这位母亲的开场方式?' },
        weight: 1.5,
        reference: MOTIVATIONAL,
        options: [
          {
            id: 'open-question',
            label: { en: 'Acknowledge concern, ask open question, reflect — then ask permission to share the evidence.', zh: '认可她的担忧,开放式提问,反思 — 再征得同意后分享证据。' },
            score: 10,
            rationale: { en: 'Motivational interviewing — highest uptake without damaging trust.', zh: '动机式访谈 — 在不损害信任的前提下提高接种率。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'lecture',
            label: { en: 'Recite the evidence quickly; tell her to vaccinate.', zh: '快速念证据;告诉她必须打。' },
            score: -2,
            rationale: { en: 'Coercion + info-dump entrenches refusal even when the facts are correct.', zh: '强迫+信息轰炸即使事实正确也会让她更抗拒。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'threat',
            label: { en: 'Warn her of legal penalties under the IDA.', zh: '警告她依传染病法令的法律后果。' },
            score: -4,
            rationale: { en: 'Threats damage the relationship and miss the actual law (default-care notice, not penalty for one decision).', zh: '威胁损害医患关系,而且与实际法律(违规通知,非单次决定的处罚)不符。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'agree-skip',
            label: { en: 'Agree to skip — "we can do it next time".', zh: '同意不打 — "下次再说"。' },
            score: -3,
            rationale: { en: 'Next visit is 5 y away; deferral here means a full pre-school window unprotected.', zh: '下次随访要5岁;此刻推迟意味着整个学龄前缺乏保护。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'plan',
      department: 'gp-room',
      facility: 'nhgp-amk',
      durationMin: 15,
      costSGD: 0,
      charge: 'polyclinic',
      framing: {
        patient: { en: 'You feel less defensive now. You ask about side effects.', zh: '你不那么紧绷了。你问起副作用。' },
        caregiver: { en: 'She wants to think it over with her husband.', zh: '她想回家与丈夫商量。' },
        staff: { en: 'Movement — readiness ruler at 5/10. Plan, don\'t push.', zh: '有进展 — 准备度尺评5/10。安排计划,不强推。' },
      },
      decision: {
        id: 'plan-followup',
        prompt: { en: 'How do you close the visit?', zh: '如何结束这次就诊?' },
        weight: 1,
        reference: MOTIVATIONAL,
        options: [
          {
            id: 'short-followup',
            label: { en: 'Book a short follow-up in 2 weeks; send NCIS leaflet + trusted links + safety-net for vaccine-preventable illness.', zh: '2周内短期复诊;发送NCIS资料+可信链接+疫苗可预防疾病的安全网建议。' },
            score: 10,
            rationale: { en: 'Keeps the door open, supports the deliberation, preserves the next opportunity.', zh: '保持门开,支持其思考,保留下次机会。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-no-followup',
            label: { en: 'Discharge with verbal advice only.', zh: '只口头交代后让她回家。' },
            score: -1,
            rationale: { en: 'Misses the short-loop opportunity that converts hesitancy.', zh: '错失能转化犹豫的短回路机会。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
