import type { CaseDefinition } from '../../lib/types';

const ERAS = {
  label: {
    en: 'ERAS for joint arthroplasty',
    zh: '关节置换ERAS加速康复方案',
    ms: 'ERAS untuk artroplasti sendi',
    ta: 'மூட்டு பொருத்துதலுக்கான ERAS',
  },
  body: {
    en: 'Enhanced Recovery After Surgery for TKR: pre-op education + carb load, regional + multimodal anaesthesia, opioid-sparing analgesia, same-day mobilisation, no routine drains, structured PT. Length-of-stay drops without compromising safety.',
    zh: '全膝关节置换术(TKR)的术后加速康复:术前宣教+碳水化合物负荷、区域+多模式麻醉、阿片节俭式镇痛、当天下床、不常规放置引流、结构化物理治疗。住院时间缩短而安全性不降。',
    ms: 'Pemulihan Dipertingkat Selepas Pembedahan untuk TKR: pendidikan pra-pembedahan + beban karbohidrat, anestesia serantau + pelbagai mod, analgesia jimat-opioid, mobilisasi hari sama, tiada salir rutin, PT berstruktur. Tempoh tinggal berkurang tanpa menjejaskan keselamatan.',
    ta: 'TKR-க்கான அறுவை சிகிச்சைக்குப் பிந்தைய மேம்பட்ட மீட்சி: அறுவைக்கு முந்தைய கல்வி + கார்போஹைட்ரேட் ஏற்றம், பிராந்திய + பல்முறை மயக்க மருந்து, ஓபியாய்டு-சிக்கன வலி நிவாரணம், அதே நாள் நடமாட்டம், வழக்கமான வடிகால் இல்லை, கட்டமைக்கப்பட்ட PT. பாதுகாப்பைக் குறைக்காமல் தங்கும் காலம் குறைகிறது.',
  },
};

const SG_PATHWAY_TKR = {
  label: {
    en: 'Singapore TKR right-siting + financing',
    zh: '新加坡TKR适当分流与费用',
    ms: 'Penempatan tepat + pembiayaan TKR Singapura',
    ta: 'சிங்கப்பூர் TKR சரியான இடம் + நிதியளிப்பு',
  },
  body: {
    en: 'Subsidised public TKR (TTSH / SGH / NUH) is bundled and predictable; private is faster but full out-of-pocket plus IP cover. Step-down to a community hospital for rehab is the norm for socially-isolated seniors.',
    zh: '公立(TTSH / SGH / NUH)的津贴TKR采用打包收费,可预测;私立速度快但费用全自付加IP保险。社会支持弱的长者通常转往社区医院康复。',
    ms: 'TKR awam bersubsidi (TTSH / SGH / NUH) adalah berpakej dan boleh diramal; swasta lebih cepat tetapi bayaran sendiri penuh tambah perlindungan IP. Turun ke hospital komuniti untuk pemulihan adalah norma bagi warga emas yang terpencil secara sosial.',
    ta: 'மானியம் பெற்ற பொது TKR (TTSH / SGH / NUH) தொகுப்பாகவும் கணிக்கக்கூடியதாகவும் உள்ளது; தனியார் வேகமானது ஆனால் முழு சொந்த-செலவு கூடுதலாக IP காப்பீடு. சமூகத்தில் தனிமைப்படுத்தப்பட்ட மூத்தோருக்கு மறுவாழ்வுக்கு சமூக மருத்துவமனைக்கு இறங்குவது வழக்கம்.',
  },
};

const DVT_PROPHYLAXIS = {
  label: {
    en: 'VTE prophylaxis post-arthroplasty',
    zh: '关节置换后静脉血栓栓塞预防',
    ms: 'Profilaksis VTE selepas artroplasti',
    ta: 'மூட்டு பொருத்துதலுக்குப் பிந்தைய VTE தடுப்பு',
  },
  body: {
    en: 'Mechanical (IPC) + chemical (LMWH or rivaroxaban) for at least 10-14 days post-op, longer for high-risk. Aspirin alone has selective evidence but is inferior in higher-risk cohorts.',
    zh: '机械(IPC间歇充气加压)+药物(低分子肝素或利伐沙班)预防,术后至少10-14天,高危者更长。阿司匹林单用在选择性人群有证据,但在高危人群中疗效较差。',
    ms: 'Mekanikal (IPC) + kimia (LMWH atau rivaroxaban) sekurang-kurangnya 10-14 hari selepas pembedahan, lebih lama untuk risiko tinggi. Aspirin sahaja mempunyai bukti terpilih tetapi lebih lemah dalam kohort berisiko tinggi.',
    ta: 'இயந்திர (IPC) + வேதியியல் (LMWH அல்லது rivaroxaban) அறுவைக்குப் பின் குறைந்தது 10-14 நாட்கள், அதிக ஆபத்துக்கு நீண்டது. ஆஸ்பிரின் மட்டும் தேர்ந்தெடுக்கப்பட்ட சான்று கொண்டது ஆனால் அதிக-ஆபத்து குழுக்களில் தாழ்ந்தது.',
  },
};

export const electiveKneeTkrCase: CaseDefinition = {
  id: 'elective-knee-tkr',
  title: {
    en: 'Elective TKR — ERAS pathway at TTSH',
    zh: '择期TKR — TTSH ERAS路径',
    ms: 'TKR elektif — laluan ERAS di TTSH',
    ta: 'தேர்வு TKR — TTSH-இல் ERAS பாதை',
  },
  blurb: {
    en: 'Mdm Lim, 71, severe right knee OA, listed for TKR. Pre-admission clinic asks how the next ten days should unfold. The right answers shrink her stay without dropping her on the kerb.',
    zh: 'Lim女士,71岁,右膝重度骨关节炎,已排期行TKR。术前评估门诊在规划接下来的十天。正确的安排能缩短住院又不让她"被丢出院"。',
    ms: 'Pn Lim, 71, OA lutut kanan teruk, disenaraikan untuk TKR. Klinik pra-kemasukan bertanya bagaimana sepuluh hari akan datang patut berlangsung. Jawapan yang betul memendekkan penginapannya tanpa menghumbannya keluar begitu sahaja.',
    ta: 'திருமதி லிம், 71, கடுமையான வலது முழங்கால் OA, TKR-க்கு பட்டியலிடப்பட்டார். அனுமதிக்கு முந்தைய கிளினிக் அடுத்த பத்து நாட்கள் எப்படி நடக்க வேண்டும் எனக் கேட்கிறது. சரியான பதில்கள் அவரைத் திடீரென வெளியேற்றாமல் தங்கும் காலத்தைக் குறைக்கின்றன.',
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
        patient: {
          en: 'Forms, swabs, an X-ray, and a class about what to expect.',
          zh: '填表、拭子、一张X光、还有一堂"预期会怎样"的课。',
          ms: 'Borang, swab, X-ray, dan satu kelas tentang apa yang dijangka.',
          ta: 'படிவங்கள், ஸ்வாப், ஒரு X-ray, மற்றும் என்ன எதிர்பார்க்கலாம் என்பது குறித்த ஒரு வகுப்பு.',
        },
        caregiver: {
          en: 'You write down the post-op plan in big letters.',
          zh: '你把术后计划用大字记下来。',
          ms: 'Anda menulis pelan selepas pembedahan dengan huruf besar.',
          ta: 'அறுவைக்குப் பிந்தைய திட்டத்தை பெரிய எழுத்துக்களில் எழுதுகிறீர்கள்.',
        },
        staff: {
          en: 'Pre-admission: ERAS counselling + carb load + regional anaesthesia consent + VTE risk score + step-down plan.',
          zh: '术前评估:ERAS宣教+碳水负荷+区域麻醉同意+VTE风险评估+转入社区医院康复计划。',
          ms: 'Pra-kemasukan: kaunseling ERAS + beban karbohidrat + persetujuan anestesia serantau + skor risiko VTE + pelan turun.',
          ta: 'அனுமதிக்கு முந்தைய: ERAS ஆலோசனை + கார்போஹைட்ரேட் ஏற்றம் + பிராந்திய மயக்க மருந்து ஒப்புதல் + VTE ஆபத்து மதிப்பெண் + இறங்கு திட்டம்.',
        },
      },
      decision: {
        id: 'eras-bundle',
        prompt: {
          en: 'Which pre-op bundle for an ERAS TKR pathway?',
          zh: 'ERAS TKR路径的术前组合?',
          ms: 'Bundel pra-pembedahan yang mana untuk laluan ERAS TKR?',
          ta: 'ERAS TKR பாதைக்கு எந்த அறுவைக்கு முந்தைய தொகுப்பு?',
        },
        weight: 1.5,
        reference: ERAS,
        options: [
          {
            id: 'full-eras',
            label: {
              en: 'ERAS counselling + carb drink + spinal + adductor canal block + step-down booking.',
              zh: 'ERAS宣教+碳水饮+脊麻+收肌管阻滞+预订社区医院床位。',
              ms: 'Kaunseling ERAS + minuman karbohidrat + spinal + blok kanal aduktor + tempahan turun.',
              ta: 'ERAS ஆலோசனை + கார்போஹைட்ரேட் பானம் + முதுகுத்தண்டு + அடக்டர் கால்வாய் தடை + இறங்கு முன்பதிவு.',
            },
            score: 10,
            rationale: {
              en: 'Matches the evidence bundle. Spinal + ACB shortens LOS, opioid-spares, supports same-day mobilisation. Step-down booking prevents bed block.',
              zh: '符合证据组合。脊麻+收肌管阻滞缩短住院、节俭阿片、支持当天下床。提前预订康复床位避免占床。',
              ms: 'Sepadan dengan bundel bukti. Spinal + ACB memendekkan LOS, menjimatkan opioid, menyokong mobilisasi hari sama. Tempahan turun mengelakkan sekatan katil.',
              ta: 'சான்று தொகுப்புடன் பொருந்துகிறது. முதுகுத்தண்டு + ACB LOS-ஐக் குறைக்கிறது, ஓபியாய்டைச் சிக்கனப்படுத்துகிறது, அதே நாள் நடமாட்டத்தை ஆதரிக்கிறது. இறங்கு முன்பதிவு படுக்கை தடையைத் தடுக்கிறது.',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'fast-fluid',
            label: {
              en: 'Standard fast + general anaesthesia + opioid PCA.',
              zh: '标准禁食+全麻+阿片自控镇痛(PCA)。',
              ms: 'Puasa standard + anestesia am + PCA opioid.',
              ta: 'நிலையான உண்ணாவிரதம் + பொது மயக்க மருந்து + ஓபியாய்டு PCA.',
            },
            score: 4,
            rationale: {
              en: 'Works but underuses ERAS gains: prolongs LOS, more nausea, slower mobilisation.',
              zh: '可行但未享受ERAS益处:住院延长、恶心增多、下床更慢。',
              ms: 'Berfungsi tetapi kurang memanfaatkan ERAS: memanjangkan LOS, lebih loya, mobilisasi lebih perlahan.',
              ta: 'வேலை செய்கிறது ஆனால் ERAS பலன்களைக் குறைவாகப் பயன்படுத்துகிறது: LOS நீட்டிக்கிறது, அதிக குமட்டல், மெதுவான நடமாட்டம்.',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'private-fast-track',
            label: {
              en: 'Refer to a private surgeon for fast-track surgery next week (full self-pay).',
              zh: '转介私人外科下周快速手术(全额自费)。',
              ms: 'Rujuk pakar bedah swasta untuk pembedahan jalur cepat minggu depan (bayar sendiri penuh).',
              ta: 'அடுத்த வாரம் விரைவு அறுவைக்கு தனியார் அறுவை மருத்துவரிடம் பரிந்துரை (முழு சொந்த-செலவு).',
            },
            score: 2,
            rationale: {
              en: 'Faster, but full out-of-pocket on a MG senior — the public ERAS path is right-sited financially.',
              zh: '更快但立国一代长者要全额自付 — 公立ERAS路径在费用上更合适。',
              ms: 'Lebih cepat, tetapi bayaran sendiri penuh bagi warga emas MG — laluan ERAS awam lebih tepat dari segi kewangan.',
              ta: 'வேகமானது, ஆனால் MG மூத்தவருக்கு முழு சொந்த-செலவு — பொது ERAS பாதை நிதி ரீதியாக சரியான இடம்.',
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
        patient: {
          en: 'You stand the same evening. It hurts but it works.',
          zh: '当晚就站起来,虽然痛,但能行。',
          ms: 'Anda berdiri pada petang yang sama. Sakit tetapi berjaya.',
          ta: 'அதே மாலையில் நிற்கிறீர்கள். வலிக்கிறது ஆனால் வேலை செய்கிறது.',
        },
        caregiver: {
          en: 'The physio is patient and firm.',
          zh: '物理治疗师耐心又坚定。',
          ms: 'Ahli fisioterapi sabar dan tegas.',
          ta: 'உடற்பயிற்சியாளர் பொறுமையாகவும் உறுதியாகவும் இருக்கிறார்.',
        },
        staff: {
          en: 'Day-0 mobilisation done. Now VTE prophylaxis + discharge planning.',
          zh: '术后第0天已下床。下一步:VTE预防+出院规划。',
          ms: 'Mobilisasi Hari-0 selesai. Sekarang profilaksis VTE + perancangan discaj.',
          ta: 'நாள்-0 நடமாட்டம் முடிந்தது. இப்போது VTE தடுப்பு + வெளியேற்ற திட்டமிடல்.',
        },
      },
      decision: {
        id: 'vte-prophylaxis',
        prompt: {
          en: 'VTE prophylaxis + discharge target?',
          zh: 'VTE预防与出院目标?',
          ms: 'Profilaksis VTE + sasaran discaj?',
          ta: 'VTE தடுப்பு + வெளியேற்ற இலக்கு?',
        },
        weight: 1.2,
        reference: DVT_PROPHYLAXIS,
        options: [
          {
            id: 'lmwh-step-down',
            label: {
              en: 'LMWH 14 days + IPC inpatient + step-down to YCH for rehab.',
              zh: '低分子肝素14天+院内IPC+转YCH康复。',
              ms: 'LMWH 14 hari + IPC pesakit dalam + turun ke YCH untuk pemulihan.',
              ta: 'LMWH 14 நாட்கள் + IPC உள்நோயாளி + மறுவாழ்வுக்கு YCH-க்கு இறக்கம்.',
            },
            score: 10,
            rationale: {
              en: 'Chemical + mechanical prophylaxis is guideline-standard; community-hospital step-down preserves the ERAS gain.',
              zh: '药物+机械联合预防符合指南;转社区医院康复保住ERAS的收益。',
              ms: 'Profilaksis kimia + mekanikal adalah standard garis panduan; turun ke hospital komuniti mengekalkan manfaat ERAS.',
              ta: 'வேதியியல் + இயந்திர தடுப்பு வழிகாட்டுதல்-தரநிலை; சமூக-மருத்துவமனை இறக்கம் ERAS பலனைப் பாதுகாக்கிறது.',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'aspirin-home',
            label: {
              en: 'Aspirin alone + discharge straight home.',
              zh: '单用阿司匹林+直接出院回家。',
              ms: 'Aspirin sahaja + discaj terus ke rumah.',
              ta: 'ஆஸ்பிரின் மட்டும் + நேராக வீட்டிற்கு வெளியேற்றம்.',
            },
            score: 3,
            rationale: {
              en: 'Aspirin has selective evidence — in a 71-y-o with limited home support, LMWH is safer and step-down is appropriate.',
              zh: '阿司匹林只在选择性人群有证据 — 对独居支持不足的71岁患者,低分子肝素更安全,且应转社区医院。',
              ms: 'Aspirin mempunyai bukti terpilih — bagi warga 71 tahun dengan sokongan rumah terhad, LMWH lebih selamat dan turun adalah wajar.',
              ta: 'ஆஸ்பிரின் தேர்ந்தெடுக்கப்பட்ட சான்று கொண்டது — வீட்டு ஆதரவு குறைந்த 71 வயதுடையவரில், LMWH பாதுகாப்பானது மற்றும் இறக்கம் பொருத்தமானது.',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'no-prophylaxis',
            label: {
              en: 'No prophylaxis — she mobilises early.',
              zh: '不预防 — 反正早期下床。',
              ms: 'Tiada profilaksis — dia bergerak awal.',
              ta: 'தடுப்பு இல்லை — அவர் முன்கூட்டியே நடமாடுகிறார்.',
            },
            score: -8,
            rationale: {
              en: 'Post-arthroplasty VTE risk persists despite mobilisation; prophylaxis is mandatory.',
              zh: '关节置换后即使下床早,VTE风险仍持续;必须预防。',
              ms: 'Risiko VTE selepas artroplasti berterusan walaupun bergerak; profilaksis adalah wajib.',
              ta: 'நடமாட்டம் இருந்தாலும் மூட்டு பொருத்துதலுக்குப் பிந்தைய VTE ஆபத்து தொடர்கிறது; தடுப்பு கட்டாயம்.',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
