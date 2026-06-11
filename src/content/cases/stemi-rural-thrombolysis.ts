import type { CaseDefinition } from '../../lib/types';

const PHARM_THROMB = {
  label: {
    en: 'Pharmaco-invasive STEMI strategy',
    zh: 'STEMI药物-介入综合策略',
    ms: 'Strategi STEMI farmako-invasif',
    ta: 'மருந்து-ஊடுருவல் STEMI உத்தி',
  },
  body: {
    en: 'When primary PCI within 120 minutes of first medical contact is not feasible, fibrinolysis (tenecteplase) within 30 minutes of arrival, followed by transfer for early (2–24 h) angiography, beats waiting for PCI. ESC 2023 ACS.',
    zh: '若首次医疗接触120分钟内无法行直接PCI,应在到院30分钟内予溶栓(替奈普酶),随后转送行早期(2-24小时)冠脉造影,优于等待PCI。ESC 2023 ACS。',
    ms: 'Apabila PCI primer dalam 120 minit hubungan perubatan pertama tidak boleh dilaksanakan, fibrinolisis (tenecteplase) dalam 30 minit ketibaan, diikuti pemindahan untuk angiografi awal (2–24 j), mengatasi menunggu PCI. ESC 2023 ACS.',
    ta: 'முதல் மருத்துவ தொடர்பின் 120 நிமிடங்களுக்குள் முதன்மை PCI சாத்தியமில்லாதபோது, வந்த 30 நிமிடங்களுக்குள் ஃபைப்ரினோலிசிஸ் (tenecteplase), அதைத் தொடர்ந்து ஆரம்ப (2–24 ம) ஆஞ்சியோகிராஃபிக்கு மாற்றம், PCI-க்காக காத்திருப்பதை விட சிறந்தது. ESC 2023 ACS.',
  },
};

const SCDF_HEMS = {
  label: {
    en: 'SCDF inter-facility critical transfer',
    zh: 'SCDF院际危重转运',
    ms: 'Pemindahan kritikal antara fasiliti SCDF',
    ta: 'SCDF வசதிகளுக்கிடையேயான அவசர இடமாற்றம்',
  },
  body: {
    en: 'Inter-facility transfers for time-critical conditions use SCDF Critical Care Ambulance with a doctor/nurse escort. Pre-arrival activation of receiving cath lab + monitored escort cuts door-to-balloon.',
    zh: '时间紧迫的院际转运使用SCDF重症救护车并配医师/护士陪同。提前激活接收医院导管室+监护陪同可缩短门到球囊时间。',
    ms: 'Pemindahan antara fasiliti untuk keadaan kritikal masa menggunakan Ambulans Rawatan Kritikal SCDF dengan iringan doktor/jururawat. Pengaktifan awal makmal kateter penerima + iringan dipantau memendekkan pintu-ke-belon.',
    ta: 'நேர-முக்கிய நிலைமைகளுக்கான வசதிகளுக்கிடையேயான இடமாற்றங்கள் மருத்துவர்/செவிலியர் துணையுடன் SCDF அவசர சிகிச்சை ஆம்புலன்ஸைப் பயன்படுத்துகின்றன. பெறும் கேத் ஆய்வகத்தை முன்கூட்டியே செயல்படுத்துதல் + கண்காணிக்கப்பட்ட துணை கதவு-முதல்-பலூனைக் குறைக்கிறது.',
  },
};

const STEMI_BLEEDING = {
  label: {
    en: 'Lytic contraindications + bleeding risk',
    zh: '溶栓禁忌与出血风险',
    ms: 'Kontraindikasi litik + risiko pendarahan',
    ta: 'லிடிக் முரண்பாடுகள் + இரத்தப்போக்கு ஆபத்து',
  },
  body: {
    en: 'Absolute contraindications include any prior intracranial haemorrhage, recent ischaemic stroke <3 mo, active bleeding, suspected aortic dissection. Age >75 favours half-dose tenecteplase.',
    zh: '绝对禁忌:既往任何颅内出血、近3个月内缺血性中风、活动性出血、疑似主动脉夹层。年龄>75岁应使用半量替奈普酶。',
    ms: 'Kontraindikasi mutlak termasuk sebarang pendarahan intrakranial terdahulu, strok iskemia baru-baru ini <3 bulan, pendarahan aktif, disyaki diseksi aorta. Umur >75 mengutamakan tenecteplase separuh dos.',
    ta: 'முழுமையான முரண்பாடுகளில் முந்தைய எந்த மண்டையோட்டுக்குள் இரத்தப்போக்கு, சமீபத்திய இஸ்கீமிக் பக்கவாதம் <3 மாதம், செயலில் இரத்தப்போக்கு, சந்தேகிக்கப்படும் பெருநாடி பிளவு ஆகியவை அடங்கும். வயது >75 அரை-அளவு tenecteplase-ஐ விரும்புகிறது.',
  },
};

export const stemiRuralThrombolysisCase: CaseDefinition = {
  id: 'stemi-rural-thrombolysis',
  title: {
    en: 'STEMI at an offshore clinic — pharmaco-invasive transfer',
    zh: '近海诊所STEMI — 药物-介入策略转送',
    ms: 'STEMI di klinik luar pesisir — pemindahan farmako-invasif',
    ta: 'கடல் வெளிப்புற கிளினிக்கில் STEMI — மருந்து-ஊடுருவல் இடமாற்றம்',
  },
  blurb: {
    en: 'Mr Tan, 58, on a 6-month rotation at the small Pulau Ubin GP clinic. Crushing chest pain x 40 min, diaphoretic. ECG: inferior + RV STEMI. The nearest cathlab (CGH) is 95 minutes away by boat + ambulance.',
    zh: '陈先生,58岁,在乌敏岛小诊所轮调6个月。胸痛压榨感40分钟、大汗。心电图:下壁+右室STEMI。最近的导管室(CGH)由船+救护车需95分钟。',
    ms: 'Encik Tan, 58, dalam giliran 6 bulan di klinik GP kecil Pulau Ubin. Sakit dada menghimpit x 40 min, berpeluh. ECG: STEMI inferior + RV. Makmal kateter terdekat (CGH) 95 minit jauh dengan bot + ambulans.',
    ta: 'திரு டான், 58, புலாவ் உபின் சிறிய GP கிளினிக்கில் 6-மாத சுழற்சியில். நசுக்கும் மார்பு வலி x 40 நிமிடம், வியர்வை. ECG: கீழ் + RV STEMI. அருகிலுள்ள கேத் ஆய்வகம் (CGH) படகு + ஆம்புலன்ஸ் மூலம் 95 நிமிடம் தொலைவில்.',
  },
  category: 'acute',
  primaryFacility: 'cgh',
  involvedFacilities: ['cgh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: false,
  acuteTimer: {
    goalMin: 30,
    goalLabel: 'Lytic decision by',
    missedFlag: 'reperfusion-delayed',
  },
  guidelines: [PHARM_THROMB, SCDF_HEMS, STEMI_BLEEDING],
  pathway: [
    {
      id: 'island-decision',
      department: 'gp-room',
      facility: 'cgh',
      durationMin: 15,
      costSGD: 0,
      charge: 'a&e',
      framing: {
        patient: {
          en: 'Pain is bad. They show you the ECG strip. Boat or needle, they ask.',
          zh: '剧痛。他们把心电图给你看。问你:坐船还是打针。',
          ms: 'Sakit teruk. Mereka tunjuk jalur ECG. Bot atau jarum, mereka tanya.',
          ta: 'வலி கடுமை. ECG பட்டையைக் காட்டுகிறார்கள். படகா ஊசியா என்று கேட்கிறார்கள்.',
        },
        caregiver: {
          en: 'You speak to the nurse on the line. Time is muscle.',
          zh: '你与护士通话。时间就是心肌。',
          ms: 'Anda bercakap dengan jururawat di talian. Masa ialah otot.',
          ta: 'தொலைபேசியில் செவிலியருடன் பேசுகிறீர்கள். நேரமே தசை.',
        },
        staff: {
          en: 'Inferior + RV STEMI. PCI window is 120 min FMC-to-device. Transfer takes 95 min. Lytic + transfer is the strategy.',
          zh: '下壁+右室STEMI。PCI窗口为首次医疗接触至器械120分钟。转送需95分钟。溶栓+转送是策略。',
          ms: 'STEMI inferior + RV. Tetingkap PCI ialah 120 min FMC-ke-peranti. Pemindahan ambil 95 min. Litik + pemindahan ialah strateginya.',
          ta: 'கீழ் + RV STEMI. PCI சாளரம் 120 நிமிடம் FMC-முதல்-சாதனம். இடமாற்றம் 95 நிமிடம் ஆகும். லிடிக் + இடமாற்றம் தான் உத்தி.',
        },
      },
      decision: {
        id: 'reperfusion',
        prompt: {
          en: 'Reperfusion strategy on the island?',
          zh: '岛上的再灌注策略?',
          ms: 'Strategi reperfusi di pulau?',
          ta: 'தீவில் மறு-இரத்த ஓட்ட உத்தி?',
        },
        weight: 2,
        reference: PHARM_THROMB,
        options: [
          {
            id: 'lytic-then-pci',
            label: {
              en: 'Tenecteplase now (age-adjusted) + activate SCDF transfer to CGH cath lab; pre-notify.',
              zh: '现在予替奈普酶(按年龄调整)+ 启动SCDF转送至CGH导管室;提前通知。',
              ms: 'Tenecteplase sekarang (disesuaikan umur) + aktifkan pemindahan SCDF ke makmal kateter CGH; beri amaran awal.',
              ta: 'இப்போது tenecteplase (வயது-சரிசெய்யப்பட்டது) + CGH கேத் ஆய்வகத்திற்கு SCDF இடமாற்றத்தைச் செயல்படுத்து; முன்னறிவிப்பு.',
            },
            score: 10,
            rationale: {
              en: 'Pharmaco-invasive strategy: clot now, definitive PCI within 2-24 h. Best outcome when PCI window is exceeded.',
              zh: '药物-介入策略:先溶栓,2-24小时内行确定性PCI。在PCI窗口超出时获益最大。',
              ms: 'Strategi farmako-invasif: lisiskan sekarang, PCI muktamad dalam 2-24 j. Hasil terbaik apabila tetingkap PCI dilampaui.',
              ta: 'மருந்து-ஊடுருவல் உத்தி: இப்போது கரைக்கவும், 2-24 மணியில் இறுதி PCI. PCI சாளரம் தாண்டியபோது சிறந்த முடிவு.',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'transfer-only',
            label: {
              en: 'Skip lytic; transfer directly for primary PCI.',
              zh: '不溶栓;直接转送做直接PCI。',
              ms: 'Langkau litik; pindah terus untuk PCI primer.',
              ta: 'லிடிக்கைத் தவிர்; முதன்மை PCI-க்கு நேரடியாக மாற்று.',
            },
            score: 2,
            rationale: {
              en: 'Wastes the reperfusion window. PCI > 120 min FMC-to-device favours lytic-first.',
              zh: '浪费再灌注窗口。首次医疗接触至器械>120分钟时,应先溶栓。',
              ms: 'Membazir tetingkap reperfusi. PCI > 120 min FMC-ke-peranti mengutamakan litik-dahulu.',
              ta: 'மறு-இரத்த ஓட்ட சாளரத்தை வீணாக்குகிறது. PCI > 120 நிமிடம் FMC-முதல்-சாதனம் லிடிக்-முதலை விரும்புகிறது.',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'full-dose-elderly',
            label: {
              en: 'Full-dose tenecteplase regardless of age.',
              zh: '不考虑年龄,全量替奈普酶。',
              ms: 'Tenecteplase dos penuh tanpa mengira umur.',
              ta: 'வயதைப் பொருட்படுத்தாமல் முழு-அளவு tenecteplase.',
            },
            score: 4,
            rationale: {
              en: '>75 y warrants half-dose to reduce intracranial bleed risk; this patient is 58, full dose is fine — but the principle should be remembered.',
              zh: '>75岁应用半量降低颅内出血风险;本例58岁可全量,但原则需牢记。',
              ms: '>75 thn memerlukan separuh dos untuk mengurangkan risiko pendarahan intrakranial; pesakit ini 58, dos penuh boleh — tetapi prinsipnya perlu diingat.',
              ta: '>75 வயது மண்டையோட்டுக்குள் இரத்தப்போக்கு ஆபத்தைக் குறைக்க அரை-அளவு தேவை; இந்த நோயாளி 58, முழு அளவு சரி — ஆனால் கொள்கையை நினைவில் கொள்ள வேண்டும்.',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'observe',
            label: {
              en: 'Observe — pain may settle.',
              zh: '观察 — 可能自行缓解。',
              ms: 'Perhati — sakit mungkin reda.',
              ta: 'கவனி — வலி குறையலாம்.',
            },
            score: -10,
            rationale: {
              en: 'STEMI does not self-resolve safely. Catastrophic.',
              zh: 'STEMI不会安全自行缓解。灾难性后果。',
              ms: 'STEMI tidak reda sendiri dengan selamat. Bencana.',
              ta: 'STEMI பாதுகாப்பாக தானாக தீராது. பேரழிவு.',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'arrival-cgh',
      department: 'cathlab',
      facility: 'cgh',
      durationMin: 95,
      costSGD: 9500,
      charge: 'inpatient-procedure',
      framing: {
        patient: {
          en: 'You\'re in a moving box of beeps. Someone\'s hand on your wrist.',
          zh: '你在一个会响的移动箱里。有人按着你的手腕。',
          ms: 'Anda dalam kotak bergerak penuh bunyi bip. Tangan seseorang di pergelangan tangan anda.',
          ta: 'பீப் ஒலிகள் நிறைந்த நகரும் பெட்டியில் இருக்கிறீர்கள். யாரோ ஒருவரின் கை உங்கள் மணிக்கட்டில்.',
        },
        caregiver: {
          en: 'You meet the ambulance at the jetty.',
          zh: '你在码头接救护车。',
          ms: 'Anda menemui ambulans di jeti.',
          ta: 'படகுத்துறையில் ஆம்புலன்ஸைச் சந்திக்கிறீர்கள்.',
        },
        staff: {
          en: 'CGH cath lab activated, ECG resolved — successful lysis. Plan early angio.',
          zh: 'CGH导管室已激活,心电图回落 — 溶栓成功。计划早期造影。',
          ms: 'Makmal kateter CGH diaktifkan, ECG reda — lisis berjaya. Rancang angio awal.',
          ta: 'CGH கேத் ஆய்வகம் செயல்படுத்தப்பட்டது, ECG தீர்ந்தது — வெற்றிகரமான லிசிஸ். ஆரம்ப ஆஞ்சியோவைத் திட்டமிடு.',
        },
      },
      decision: {
        id: 'post-lytic-window',
        prompt: {
          en: 'Post-lytic angiography window?',
          zh: '溶栓后造影时机?',
          ms: 'Tetingkap angiografi selepas litik?',
          ta: 'லிடிக்கிற்குப் பிந்தைய ஆஞ்சியோகிராஃபி சாளரம்?',
        },
        weight: 1,
        reference: PHARM_THROMB,
        options: [
          {
            id: 'two-to-24',
            label: {
              en: 'Angiogram within 2-24 h regardless of resolution.',
              zh: '无论缓解情况,2-24小时内造影。',
              ms: 'Angiogram dalam 2-24 j tanpa mengira peleraian.',
              ta: 'தீர்வைப் பொருட்படுத்தாமல் 2-24 மணியில் ஆஞ்சியோகிராம்.',
            },
            score: 10,
            rationale: {
              en: 'Routine early angio after lysis reduces re-infarction (STREAM, EARLY-MYO).',
              zh: '溶栓后常规早期造影减少再梗死(STREAM、EARLY-MYO)。',
              ms: 'Angio awal rutin selepas lisis mengurangkan infarksi semula (STREAM, EARLY-MYO).',
              ta: 'லிசிஸுக்குப் பிறகு வழக்கமான ஆரம்ப ஆஞ்சியோ மறு-இன்ஃபார்க்ஷனைக் குறைக்கிறது (STREAM, EARLY-MYO).',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'rescue-only',
            label: {
              en: 'Only catheterise if lysis fails clinically.',
              zh: '只在临床溶栓失败时才造影。',
              ms: 'Kateter hanya jika litik gagal secara klinikal.',
              ta: 'லிசிஸ் மருத்துவ ரீதியாக தோல்வியடைந்தால் மட்டுமே கேத்தீட்டர்.',
            },
            score: 3,
            rationale: {
              en: 'Outdated. Even successful lysis benefits from routine early invasive assessment.',
              zh: '已过时。即使溶栓成功,常规早期介入仍获益。',
              ms: 'Lapuk. Walaupun lisis berjaya, ia mendapat manfaat daripada penilaian invasif awal rutin.',
              ta: 'காலாவதியானது. வெற்றிகரமான லிசிஸ் கூட வழக்கமான ஆரம்ப ஊடுருவல் மதிப்பீட்டால் பயனடைகிறது.',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
