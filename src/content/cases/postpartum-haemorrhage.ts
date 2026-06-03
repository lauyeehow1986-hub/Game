import type { CaseDefinition } from '../../lib/types';

const FIGO_PPH = {
  label: { en: 'FIGO 2022 PPH protocol', zh: 'FIGO 2022产后出血方案' },
  body: {
    en: 'PPH = ≥500 mL after vaginal birth or ≥1000 mL after CS. First-line: uterine massage + uterotonics (oxytocin), TXA within 3 h, bimanual compression. Escalation: balloon tamponade, B-Lynch, internal iliac ligation, hysterectomy.',
    zh: '产后出血:阴道分娩≥500 mL或剖宫产≥1000 mL。一线:子宫按摩+宫缩剂(缩宫素)、3小时内TXA、双手压迫。升级:球囊填塞、B-Lynch、髂内动脉结扎、子宫切除。',
  },
};

const KKH_MATERNAL = {
  label: { en: 'KKH maternal critical care', zh: 'KKH产科重症照护' },
  body: {
    en: 'KKH runs a maternal HDU + dedicated obstetric anaesthetic team. Major-haemorrhage protocol activates blood bank for 4U PRBC + 4U FFP + 1U platelets. Escalation to interventional radiology for uterine artery embolisation.',
    zh: 'KKH设有产科HDU与专属产科麻醉团队。大量出血方案可启动血库:4U红细胞+4U血浆+1U血小板。升级至介入放射行子宫动脉栓塞。',
  },
};

const TXA = {
  label: { en: 'WOMAN trial — TXA in PPH', zh: 'WOMAN试验 — 产后出血中的TXA' },
  body: {
    en: 'Tranexamic acid 1 g IV within 3 hours of PPH onset reduces death from bleeding. No effect on thrombosis incidence. Second 1 g if bleeding continues at 30 minutes.',
    zh: '产后出血发生3小时内静脉TXA 1g可降低出血死亡。不增加血栓发生率。30分钟时仍出血可第二次1g。',
  },
};

export const postpartumHaemorrhageCase: CaseDefinition = {
  id: 'postpartum-haemorrhage',
  title: {
    en: 'Postpartum haemorrhage at KKH — escalation drill',
    zh: 'KKH产后出血 — 升级演练',
  },
  blurb: {
    en: 'Mrs Lim, 32, G2P2, vaginal birth 20 minutes ago. Estimated blood loss 800 mL and rising, BP 92/56, HR 112, uterus boggy. Crash call to the bedside.',
    zh: '林太太,32岁,G2P2,20分钟前阴道分娩。出血量估800 mL并增加,血压92/56,心率112,子宫松软。床旁紧急呼救。',
  },
  category: 'acute',
  primaryFacility: 'kkh',
  involvedFacilities: ['kkh'],
  profileKey: 'youngAdult',
  allowsWardChoice: false,
  acuteTimer: {
    goalMin: 20,
    goalLabel: 'TXA + uterotonics by',
    missedFlag: 'pph-delayed',
  },
  guidelines: [FIGO_PPH, KKH_MATERNAL, TXA],
  pathway: [
    {
      id: 'first-bundle',
      department: 'ot',
      facility: 'kkh',
      durationMin: 15,
      costSGD: 600,
      charge: 'a&e',
      framing: {
        patient: { en: 'You feel cold. Everything is moving very fast.', zh: '你觉得冷。一切都在飞快进行。' },
        caregiver: { en: 'Your husband is asked to step back from the bedside.', zh: '丈夫被请到床旁外。' },
        staff: { en: 'PPH 800 mL, deteriorating. First bundle is non-negotiable.', zh: '产后出血800 mL,恶化中。第一组合无商量余地。' },
      },
      decision: {
        id: 'initial-bundle',
        prompt: { en: 'First 5 minutes — initial bundle?', zh: '最初5分钟 — 初始组合?' },
        weight: 2,
        reference: FIGO_PPH,
        options: [
          {
            id: 'massage-oxy-txa',
            label: { en: 'Bimanual uterine massage + IV oxytocin 10U + IV TXA 1g + 2nd large-bore IV + crossmatch + call obs senior.', zh: '双手子宫按摩+静脉缩宫素10U+静脉TXA 1g+第二条大孔径静脉+配血+呼叫产科上级。' },
            score: 10,
            rationale: { en: 'The full first-line bundle. TXA within 3 h reduces mortality (WOMAN). Massage + oxytocin is the cornerstone.', zh: '完整一线组合。3小时内TXA降低死亡(WOMAN)。按摩+缩宫素是基石。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'oxytocin-only',
            label: { en: 'Oxytocin only; observe for response.', zh: '仅缩宫素;观察反应。' },
            score: 3,
            rationale: { en: 'Single agent under-responds — uterotonics + TXA + mechanical measures together.', zh: '单一用药效果不足 — 应联合宫缩剂+TXA+机械措施。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'imaging-first',
            label: { en: 'Bedside ultrasound first to look for retained products.', zh: '先床旁超声查胎盘残留。' },
            score: -2,
            rationale: { en: 'Imaging without stabilising = wasted minutes; address atony + bleeding now.', zh: '未稳定即影像 = 浪费分钟;先处理宫缩乏力与出血。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'escalation',
      department: 'ot',
      facility: 'kkh',
      durationMin: 30,
      costSGD: 3500,
      charge: 'inpatient-procedure',
      framing: {
        patient: { en: 'Bleeding continues. They mention a balloon.', zh: '继续出血。他们提到球囊。' },
        caregiver: { en: 'Your husband signs the consent.', zh: '丈夫签了同意书。' },
        staff: { en: 'Failed first-line — escalate now. Massive haemorrhage protocol.', zh: '一线失败 — 立即升级。启动大量出血方案。' },
      },
      decision: {
        id: 'escalate',
        prompt: { en: 'Escalation step?', zh: '升级步骤?' },
        weight: 1.5,
        reference: KKH_MATERNAL,
        options: [
          {
            id: 'mhp-balloon',
            label: { en: 'Activate massive haemorrhage protocol + Bakri balloon + repeat TXA at 30 min + alert IR for embolisation.', zh: '启动大量出血方案+Bakri球囊+30分钟时重复TXA+预警介入放射准备栓塞。' },
            score: 10,
            rationale: { en: 'Layered escalation: mechanical tamponade + protocolised blood support + IR on standby. Hysterectomy is last resort.', zh: '分层升级:机械填塞+方案化血制品+介入放射待命。子宫切除是最后手段。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'straight-hyst',
            label: { en: 'Go straight to hysterectomy.', zh: '直接子宫切除。' },
            score: -3,
            rationale: { en: 'Premature — uterine-preserving options exist; reserve for refractory bleeding.', zh: '过早 — 还有保留子宫的选项;难治性出血时才用。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'wait',
            label: { en: 'Wait — vitals may stabilise.', zh: '等待 — 生命体征可能稳定。' },
            score: -8,
            rationale: { en: 'Bleeding shock kills fast. Acting late costs uteri and lives.', zh: '出血性休克致死迅速。延迟会损失子宫与生命。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'recovery',
      department: 'ward',
      facility: 'kkh',
      durationMin: 1440,
      costSGD: 2200,
      charge: 'inpatient-ward',
      framing: {
        patient: { en: 'You wake up sore but alive. The baby is brought to you.', zh: '你醒来酸痛但活着。宝宝被抱到你身边。' },
        caregiver: { en: 'Your husband is shaking. You hold his hand.', zh: '丈夫在颤抖。你握住他的手。' },
        staff: { en: 'Bleeding controlled. Now: debrief + iron + thromboprophylaxis after bleeding settled + maternal mental-health screen.', zh: '出血已控制。下一步:复盘+补铁+出血止后给VTE预防+产妇心理健康筛查。' },
      },
      decision: {
        id: 'recovery-plan',
        prompt: { en: 'Day-1 plan?', zh: '第1天计划?' },
        weight: 1,
        reference: FIGO_PPH,
        options: [
          {
            id: 'full-debrief',
            label: { en: 'Iron replacement + LMWH 12 h after bleeding stopped + structured debrief + EPDS at 6 weeks.', zh: '补铁+止血后12小时LMWH+结构化复盘+6周EPDS筛查。' },
            score: 10,
            rationale: { en: 'Closes the loop physiologically + psychologically; PPH is a risk factor for postnatal depression.', zh: '生理+心理双闭环;产后出血是产后抑郁的危险因素。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-fast',
            label: { en: 'Discharge as soon as Hb steady; skip debrief.', zh: '血红蛋白稳定即出院;略过复盘。' },
            score: -1,
            rationale: { en: 'Misses the prophylaxis + mental-health window.', zh: '错失预防与心理健康窗口。' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
