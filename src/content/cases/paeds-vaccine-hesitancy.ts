import type { CaseDefinition } from '../../lib/types';

const NCIS_SG = {
  label: {
    en: 'Singapore National Childhood Immunisation Schedule (NCIS)',
    zh: '新加坡国家儿童免疫计划(NCIS)',
    ms: 'Jadual Imunisasi Kanak-kanak Kebangsaan Singapura (NCIS)',
    ta: 'சிங்கப்பூர் தேசிய குழந்தைப் பருவ நோய்த்தடுப்பு அட்டவணை (NCIS)',
  },
  body: {
    en: 'Mandatory: DTaP-IPV-Hib-HepB, MMR, varicella, PCV. Catch-up schedules at polyclinics. Some vaccines (e.g. MMR) are required by law under the Infectious Diseases Act — refusal triggers a default-care notice, not a forced vaccination.',
    zh: '强制:DTaP-IPV-Hib-HepB、MMR、水痘、肺炎球菌结合疫苗。综合诊疗所有补种安排。部分疫苗(如MMR)依传染病法令为法定要求 — 拒绝会触发"违规通知",而非强制接种。',
    ms: 'Wajib: DTaP-IPV-Hib-HepB, MMR, varisela, PCV. Jadual susulan di poliklinik. Sesetengah vaksin (cth. MMR) diwajibkan oleh undang-undang di bawah Akta Penyakit Berjangkit — penolakan mencetuskan notis penjagaan ingkar, bukan vaksinasi paksa.',
    ta: 'கட்டாயம்: DTaP-IPV-Hib-HepB, MMR, வைரஸ் அம்மை, PCV. பாலிகிளினிக்குகளில் பிந்தைய அட்டவணைகள். சில தடுப்பூசிகள் (எ.கா. MMR) தொற்று நோய்கள் சட்டத்தின் கீழ் சட்டப்படி கட்டாயம் — மறுப்பு கட்டாய தடுப்பூசி அல்ல, ஒரு இயல்புநிலை-பராமரிப்பு அறிவிப்பை மட்டுமே தூண்டும்.',
  },
};

const MOTIVATIONAL = {
  label: {
    en: 'Motivational interviewing for vaccine hesitancy',
    zh: '疫苗犹豫的动机式访谈',
    ms: 'Temu bual motivasi untuk keraguan vaksin',
    ta: 'தடுப்பூசி தயக்கத்திற்கான ஊக்கமளிக்கும் நேர்காணல்',
  },
  body: {
    en: 'Open questions, reflective listening, summarise concerns, ask permission before sharing info. Coercion entrenches refusal; presumptive language (e.g. "today she\'s due for MMR") raises uptake without coercion.',
    zh: '开放式提问、反思性倾听、归纳顾虑、分享信息前先征得同意。强迫会让拒绝更顽固;预设性语言(如"她今天该打MMR了")在不强迫下提高接种率。',
    ms: 'Soalan terbuka, mendengar secara reflektif, rumuskan kebimbangan, minta kebenaran sebelum berkongsi maklumat. Paksaan mengukuhkan penolakan; bahasa anggapan (cth. "hari ini tiba masa MMR-nya") meningkatkan penerimaan tanpa paksaan.',
    ta: 'திறந்த கேள்விகள், பிரதிபலிப்பு கேட்டல், கவலைகளைச் சுருக்குதல், தகவல் பகிர்வதற்கு முன் அனுமதி கேட்டல். வற்புறுத்தல் மறுப்பை வலுப்படுத்தும்; முன்வைப்பு மொழி (எ.கா. "இன்று அவளுக்கு MMR நேரம்") வற்புறுத்தல் இல்லாமல் ஏற்பை அதிகரிக்கும்.',
  },
};

const KKH_PEWS = {
  label: {
    en: 'KKH paediatric services + PEWS',
    zh: 'KKH儿科服务与PEWS',
    ms: 'Perkhidmatan pediatrik KKH + PEWS',
    ta: 'KKH குழந்தை மருத்துவ சேவைகள் + PEWS',
  },
  body: {
    en: 'KK Women\'s and Children\'s Hospital runs paediatric subspecialties + a 24/7 Children\'s Emergency. PEWS (Paediatric Early Warning Score) triggers escalation.',
    zh: 'KK妇幼医院设有儿科亚专科及24小时儿童急诊。PEWS(小儿早期预警评分)触发升级。',
    ms: 'Hospital Wanita dan Kanak-kanak KK menjalankan subkepakaran pediatrik + Kecemasan Kanak-kanak 24/7. PEWS (Skor Amaran Awal Pediatrik) mencetuskan peningkatan.',
    ta: 'KK மகளிர் மற்றும் குழந்தைகள் மருத்துவமனை குழந்தை மருத்துவ துணைச்சிறப்புகள் + 24/7 குழந்தைகள் அவசர சிகிச்சையை நடத்துகிறது. PEWS (குழந்தை மருத்துவ முன்னெச்சரிக்கை மதிப்பெண்) மேலதிக நடவடிக்கையைத் தூண்டுகிறது.',
  },
};

export const paedsVaccineHesitancyCase: CaseDefinition = {
  id: 'paeds-vaccine-hesitancy',
  title: {
    en: 'Vaccine-hesitant parent at a polyclinic — MMR conversation',
    zh: '综合诊疗所遇疫苗犹豫家长 — MMR对话',
    ms: 'Ibu bapa ragu vaksin di poliklinik — perbualan MMR',
    ta: 'பாலிகிளினிக்கில் தடுப்பூசி தயக்கம் கொண்ட பெற்றோர் — MMR உரையாடல்',
  },
  blurb: {
    en: 'A worried mother brings her 18-month-old to the polyclinic for review. She has been reading online and asks to skip the MMR. Her child is otherwise well; the next visit will be at 5 years.',
    zh: '焦虑的母亲带18个月大女儿来综合诊疗所复诊。她在网上读了一些信息,提出不想打MMR。孩子目前健康;下次到5岁才会复诊。',
    ms: 'Seorang ibu yang bimbang membawa anaknya berusia 18 bulan ke poliklinik untuk semakan. Dia membaca dalam talian dan meminta untuk melangkau MMR. Anaknya sihat; lawatan seterusnya pada usia 5 tahun.',
    ta: 'கவலைப்படும் ஒரு தாய் தனது 18-மாத குழந்தையை பாலிகிளினிக்கிற்கு மதிப்பாய்விற்காக அழைத்து வருகிறார். அவர் இணையத்தில் படித்துவிட்டு MMR-ஐத் தவிர்க்கக் கேட்கிறார். குழந்தை நலமாக உள்ளது; அடுத்த வருகை 5 வயதில்.',
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
        patient: { en: 'Your daughter sits on your lap, kicking. You hold the phone with the article open.', zh: '女儿坐在你腿上踢脚。你手里拿着开着文章的手机。', ms: 'Anak perempuan anda duduk di pangkuan, menendang-nendang. Anda memegang telefon dengan artikel terbuka.', ta: 'உங்கள் மகள் உங்கள் மடியில் அமர்ந்து உதைக்கிறாள். கட்டுரை திறந்திருக்கும் தொலைபேசியை நீங்கள் பிடித்திருக்கிறீர்கள்.' },
        caregiver: { en: 'You feel braced for an argument and ready to leave.', zh: '你做好了被劝说的准备,也准备好随时离开。', ms: 'Anda berasa bersedia untuk berbalah dan bersedia untuk pergi.', ta: 'வாக்குவாதத்திற்குத் தயாராகவும் வெளியேறத் தயாராகவும் உணர்கிறீர்கள்.' },
        staff: { en: 'Hesitant — not refusing. Coercion will entrench; motivational interviewing opens the door.', zh: '是犹豫,不是拒绝。强迫会让她更抗拒;动机式访谈才能打开门。', ms: 'Ragu — bukan menolak. Paksaan akan mengukuhkan; temu bual motivasi membuka pintu.', ta: 'தயக்கம் — மறுப்பு அல்ல. வற்புறுத்தல் வலுப்படுத்தும்; ஊக்கமளிக்கும் நேர்காணல் கதவைத் திறக்கும்.' },
      },
      decision: {
        id: 'opening-move',
        prompt: { en: 'Opening move with this mother?', zh: '对这位母亲的开场方式?', ms: 'Langkah pembukaan dengan ibu ini?', ta: 'இந்தத் தாயுடன் தொடக்க நடவடிக்கை?' },
        weight: 1.5,
        reference: MOTIVATIONAL,
        options: [
          {
            id: 'open-question',
            label: { en: 'Acknowledge concern, ask open question, reflect — then ask permission to share the evidence.', zh: '认可她的担忧,开放式提问,反思 — 再征得同意后分享证据。', ms: 'Akui kebimbangan, tanya soalan terbuka, reflek — kemudian minta kebenaran untuk berkongsi bukti.', ta: 'கவலையை ஒப்புக்கொள், திறந்த கேள்வி கேள், பிரதிபலி — பின்பு ஆதாரத்தைப் பகிர அனுமதி கேள்.' },
            score: 10,
            rationale: { en: 'Motivational interviewing — highest uptake without damaging trust.', zh: '动机式访谈 — 在不损害信任的前提下提高接种率。', ms: 'Temu bual motivasi — penerimaan tertinggi tanpa merosakkan kepercayaan.', ta: 'ஊக்கமளிக்கும் நேர்காணல் — நம்பிக்கையைச் சேதப்படுத்தாமல் அதிகபட்ச ஏற்பு.' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'lecture',
            label: { en: 'Recite the evidence quickly; tell her to vaccinate.', zh: '快速念证据;告诉她必须打。', ms: 'Baca bukti dengan cepat; suruh dia memberi vaksin.', ta: 'ஆதாரத்தை வேகமாகச் சொல்; தடுப்பூசி போடச் சொல்.' },
            score: -2,
            rationale: { en: 'Coercion + info-dump entrenches refusal even when the facts are correct.', zh: '强迫+信息轰炸即使事实正确也会让她更抗拒。', ms: 'Paksaan + limpahan maklumat mengukuhkan penolakan walaupun fakta betul.', ta: 'வற்புறுத்தல் + தகவல் குவிப்பு உண்மைகள் சரியாக இருந்தாலும் மறுப்பை வலுப்படுத்தும்.' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'threat',
            label: { en: 'Warn her of legal penalties under the IDA.', zh: '警告她依传染病法令的法律后果。', ms: 'Beri amaran tentang hukuman undang-undang di bawah IDA.', ta: 'IDA-வின் கீழ் சட்ட தண்டனைகள் குறித்து எச்சரி.' },
            score: -4,
            rationale: { en: 'Threats damage the relationship and miss the actual law (default-care notice, not penalty for one decision).', zh: '威胁损害医患关系,而且与实际法律(违规通知,非单次决定的处罚)不符。', ms: 'Ancaman merosakkan hubungan dan tersilap undang-undang sebenar (notis penjagaan ingkar, bukan hukuman untuk satu keputusan).', ta: 'அச்சுறுத்தல்கள் உறவைச் சேதப்படுத்தி உண்மையான சட்டத்தைத் தவறவிடும் (ஒரு முடிவுக்கான தண்டனை அல்ல, இயல்புநிலை-பராமரிப்பு அறிவிப்பு).' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'agree-skip',
            label: { en: 'Agree to skip — "we can do it next time".', zh: '同意不打 — "下次再说"。', ms: 'Setuju untuk melangkau — "kita boleh buat kali seterusnya".', ta: 'தவிர்க்க ஒப்புக்கொள் — "அடுத்த முறை செய்யலாம்".' },
            score: -3,
            rationale: { en: 'Next visit is 5 y away; deferral here means a full pre-school window unprotected.', zh: '下次随访要5岁;此刻推迟意味着整个学龄前缺乏保护。', ms: 'Lawatan seterusnya 5 tahun lagi; penangguhan di sini bermakna seluruh tempoh prasekolah tidak dilindungi.', ta: 'அடுத்த வருகை 5 ஆண்டுகள் தொலைவில்; இங்கு தாமதம் முழு பள்ளி-முன் காலகட்டமும் பாதுகாப்பின்றி இருப்பதைக் குறிக்கும்.' },
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
        patient: { en: 'You feel less defensive now. You ask about side effects.', zh: '你不那么紧绷了。你问起副作用。', ms: 'Anda berasa kurang defensif kini. Anda bertanya tentang kesan sampingan.', ta: 'இப்போது குறைவான தற்காப்பு உணர்கிறீர்கள். பக்க விளைவுகள் பற்றிக் கேட்கிறீர்கள்.' },
        caregiver: { en: 'She wants to think it over with her husband.', zh: '她想回家与丈夫商量。', ms: 'Dia mahu memikirkannya bersama suaminya.', ta: 'அவர் கணவருடன் சேர்ந்து யோசிக்க விரும்புகிறார்.' },
        staff: { en: 'Movement — readiness ruler at 5/10. Plan, don\'t push.', zh: '有进展 — 准备度尺评5/10。安排计划,不强推。', ms: 'Ada kemajuan — pembaris kesediaan pada 5/10. Rancang, jangan paksa.', ta: 'முன்னேற்றம் — தயார்நிலை அளவுகோல் 5/10. திட்டமிடு, வற்புறுத்தாதே.' },
      },
      decision: {
        id: 'plan-followup',
        prompt: { en: 'How do you close the visit?', zh: '如何结束这次就诊?', ms: 'Bagaimana anda menamatkan lawatan?', ta: 'வருகையை எப்படி முடிக்கிறீர்கள்?' },
        weight: 1,
        reference: MOTIVATIONAL,
        options: [
          {
            id: 'short-followup',
            label: { en: 'Book a short follow-up in 2 weeks; send NCIS leaflet + trusted links + safety-net for vaccine-preventable illness.', zh: '2周内短期复诊;发送NCIS资料+可信链接+疫苗可预防疾病的安全网建议。', ms: 'Tempah susulan pendek dalam 2 minggu; hantar risalah NCIS + pautan dipercayai + jaring keselamatan untuk penyakit boleh dicegah vaksin.', ta: '2 வாரங்களில் ஒரு குறுகிய பின்தொடர்தலை பதிவு செய்; NCIS துண்டுப்பிரசுரம் + நம்பகமான இணைப்புகள் + தடுப்பூசியால் தடுக்கக்கூடிய நோய்க்கான பாதுகாப்பு-வலை அனுப்பு.' },
            score: 10,
            rationale: { en: 'Keeps the door open, supports the deliberation, preserves the next opportunity.', zh: '保持门开,支持其思考,保留下次机会。', ms: 'Mengekalkan pintu terbuka, menyokong pertimbangan, mengekalkan peluang seterusnya.', ta: 'கதவைத் திறந்தே வைக்கிறது, ஆலோசனையை ஆதரிக்கிறது, அடுத்த வாய்ப்பைப் பாதுகாக்கிறது.' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-no-followup',
            label: { en: 'Discharge with verbal advice only.', zh: '只口头交代后让她回家。', ms: 'Lepaskan dengan nasihat lisan sahaja.', ta: 'வாய்மொழி அறிவுரையுடன் மட்டும் அனுப்பு.' },
            score: -1,
            rationale: { en: 'Misses the short-loop opportunity that converts hesitancy.', zh: '错失能转化犹豫的短回路机会。', ms: 'Terlepas peluang gelung pendek yang menukar keraguan.', ta: 'தயக்கத்தை மாற்றும் குறுகிய-சுழற்சி வாய்ப்பைத் தவறவிடுகிறது.' },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
