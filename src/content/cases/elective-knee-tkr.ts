import type { CaseDefinition } from '../../lib/types';

const ERAS = {
  label: { en: 'ERAS for joint arthroplasty', zh: '关节置换ERAS加速康复方案' },
  body: {
    en: 'Enhanced Recovery After Surgery for TKR: pre-op education + carb load, regional + multimodal anaesthesia, opioid-sparing analgesia, same-day mobilisation, no routine drains, structured PT. Length-of-stay drops without compromising safety.',
    zh: '全膝关节置换术(TKR)的术后加速康复:术前宣教+碳水化合物负荷、区域+多模式麻醉、阿片节俭式镇痛、当天下床、不常规放置引流、结构化物理治疗。住院时间缩短而安全性不降。',
  },
};

const SG_PATHWAY_TKR = {
  label: { en: 'Singapore TKR right-siting + financing', zh: '新加坡TKR适当分流与费用' },
  body: {
    en: 'Subsidised public TKR (TTSH / SGH / NUH) is bundled and predictable; private is faster but full out-of-pocket plus IP cover. Step-down to a community hospital for rehab is the norm for socially-isolated seniors.',
    zh: '公立(TTSH / SGH / NUH)的津贴TKR采用打包收费,可预测;私立速度快但费用全自付加IP保险。社会支持弱的长者通常转往社区医院康复。',
  },
};

const DVT_PROPHYLAXIS = {
  label: { en: 'VTE prophylaxis post-arthroplasty', zh: '关节置换后静脉血栓栓塞预防' },
  body: {
    en: 'Mechanical (IPC) + chemical (LMWH or rivaroxaban) for at least 10-14 days post-op, longer for high-risk. Aspirin alone has selective evidence but is inferior in higher-risk cohorts.',
    zh: '机械(IPC间歇充气加压)+药物(低分子肝素或利伐沙班)预防,术后至少10-14天,高危者更长。阿司匹林单用在选择性人群有证据,但在高危人群中疗效较差。',
  },
};

export const electiveKneeTkrCase: CaseDefinition = {
  id: 'elective-knee-tkr',
  title: {
    en: 'Elective TKR — ERAS pathway at TTSH',
    zh: '择期TKR — TTSH ERAS路径',
  },
  blurb: {
    en: 'Mdm Lim, 71, severe right knee OA, listed for TKR. Pre-admission clinic asks how the next ten days should unfold. The right answers shrink her stay without dropping her on the kerb.',
    zh: 'Lim女士,71岁,右膝重度骨关节炎,已排期行TKR。术前评估门诊在规划接下来的十天。正确的安排能缩短住院又不让她"被丢出院"。',
  },
  category: 'elective',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh', 'ych'],
  profileKey: 'retiredAuntie',
  allowsWardChoice: true,
  guidelines: [ERAS, SG_PATHWAY_TKR, DVT_PROPHYLAXIS],
  pathway: [
    {
      id: 'pre-op',
      department: 'soc',
      facility: 'ttsh',
      durationMin: 60,
      costSGD: 90,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 5 },
      framing: {
        patient: { en: 'Forms, swabs, an X-ray, and a class about what to expect.', zh: '填表、拭子、一张X光、还有一堂"预期会怎样"的课。' },
        caregiver: { en: 'You write down the post-op plan in big letters.', zh: '你把术后计划用大字记下来。' },
        staff: { en: 'Pre-admission: ERAS counselling + carb load + regional anaesthesia consent + VTE risk score + step-down plan.', zh: '术前评估:ERAS宣教+碳水负荷+区域麻醉同意+VTE风险评估+转入社区医院康复计划。' },
      },
      decision: {
        id: 'eras-bundle',
        prompt: { en: 'Which pre-op bundle for an ERAS TKR pathway?', zh: 'ERAS TKR路径的术前组合?' },
        weight: 1.5,
        reference: ERAS,
        options: [
          {
            id: 'full-eras',
            label: { en: 'ERAS counselling + carb drink + spinal + adductor canal block + step-down booking.', zh: 'ERAS宣教+碳水饮+脊麻+收肌管阻滞+预订社区医院床位。' },
            score: 10,
            rationale: {
              en: 'Matches the evidence bundle. Spinal + ACB shortens LOS, opioid-spares, supports same-day mobilisation. Step-down booking prevents bed block.',
              zh: '符合证据组合。脊麻+收肌管阻滞缩短住院、节俭阿片、支持当天下床。提前预订康复床位避免占床。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'fast-fluid',
            label: { en: 'Standard fast + general anaesthesia + opioid PCA.', zh: '标准禁食+全麻+阿片自控镇痛(PCA)。' },
            score: 4,
            rationale: {
              en: 'Works but underuses ERAS gains: prolongs LOS, more nausea, slower mobilisation.',
              zh: '可行但未享受ERAS益处:住院延长、恶心增多、下床更慢。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'private-fast-track',
            label: { en: 'Refer to a private surgeon for fast-track surgery next week (full self-pay).', zh: '转介私人外科下周快速手术(全额自费)。' },
            score: 2,
            rationale: {
              en: 'Faster, but full out-of-pocket on a MG senior — the public ERAS path is right-sited financially.',
              zh: '更快但立国一代长者要全额自付 — 公立ERAS路径在费用上更合适。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'post-op',
      department: 'ward',
      facility: 'ttsh',
      durationMin: 1440,
      costSGD: 6800,
      charge: 'inpatient-procedure',
      framing: {
        patient: { en: 'You stand the same evening. It hurts but it works.', zh: '当晚就站起来,虽然痛,但能行。' },
        caregiver: { en: 'The physio is patient and firm.', zh: '物理治疗师耐心又坚定。' },
        staff: { en: 'Day-0 mobilisation done. Now VTE prophylaxis + discharge planning.', zh: '术后第0天已下床。下一步:VTE预防+出院规划。' },
      },
      decision: {
        id: 'vte-prophylaxis',
        prompt: { en: 'VTE prophylaxis + discharge target?', zh: 'VTE预防与出院目标?' },
        weight: 1.2,
        reference: DVT_PROPHYLAXIS,
        options: [
          {
            id: 'lmwh-step-down',
            label: { en: 'LMWH 14 days + IPC inpatient + step-down to YCH for rehab.', zh: '低分子肝素14天+院内IPC+转YCH康复。' },
            score: 10,
            rationale: {
              en: 'Chemical + mechanical prophylaxis is guideline-standard; community-hospital step-down preserves the ERAS gain.',
              zh: '药物+机械联合预防符合指南;转社区医院康复保住ERAS的收益。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'aspirin-home',
            label: { en: 'Aspirin alone + discharge straight home.', zh: '单用阿司匹林+直接出院回家。' },
            score: 3,
            rationale: {
              en: 'Aspirin has selective evidence — in a 71-y-o with limited home support, LMWH is safer and step-down is appropriate.',
              zh: '阿司匹林只在选择性人群有证据 — 对独居支持不足的71岁患者,低分子肝素更安全,且应转社区医院。',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'no-prophylaxis',
            label: { en: 'No prophylaxis — she mobilises early.', zh: '不预防 — 反正早期下床。' },
            score: -8,
            rationale: { en: 'Post-arthroplasty VTE risk persists despite mobilisation; prophylaxis is mandatory.', zh: '关节置换后即使下床早,VTE风险仍持续;必须预防。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
