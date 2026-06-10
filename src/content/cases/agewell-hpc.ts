import type { CaseDefinition } from '../../lib/types';

const AGE_WELL_SG = {
  label: {
    en: 'Age Well SG (S$3.5B / 10 yr)',
    zh: 'Age Well SG(100亿新元 / 10年的健康老龄计划)',
    ms: 'Age Well SG (S$3.5B / 10 tahun)',
    ta: 'Age Well SG (S$3.5B / 10 ஆண்டுகள்)',
  },
  body: {
    en: 'National programme to help seniors age in place: Active Ageing Centres scaling to 220 by 2025, Age Well Neighbourhoods from 2026, wireless alert alarms in rental flats with seniors, and a single comprehensive long-term-care assessment from Apr 2026.',
    zh: '帮助长者在地安老的国家计划:活跃乐龄中心到2025年增至220间,2026年起设乐龄邻里,为有长者的租赁组屋安装无线警报器,并于2026年4月起采用单一综合长期照护评估。',
    ms: 'Program kebangsaan untuk membantu warga emas menua di tempat sendiri: Pusat Penuaan Aktif berkembang kepada 220 menjelang 2025, Kejiranan Age Well dari 2026, penggera amaran tanpa wayar di flat sewa berwarga emas, dan satu penilaian penjagaan jangka panjang menyeluruh dari April 2026.',
    ta: 'மூத்தோர் தாங்கள் வசிக்கும் இடத்திலேயே வயதாக உதவும் தேசிய திட்டம்: செயலூக்க முதிர்வு மையங்கள் 2025-க்குள் 220 ஆக விரிவடைதல், 2026 முதல் Age Well அண்டைச்சூழல்கள், மூத்தோர் வசிக்கும் வாடகை வீடுகளில் கம்பியில்லா எச்சரிக்கை அலாரங்கள், மற்றும் ஏப்ரல் 2026 முதல் ஒரே விரிவான நீண்டகால-பராமரிப்பு மதிப்பீடு.',
  },
};

const HPC_PLUS = {
  label: {
    en: 'HPC+ (Enhanced Home Personal Care)',
    zh: 'HPC+(增强型居家个人照护)',
    ms: 'HPC+ (Penjagaan Peribadi Rumah Dipertingkat)',
    ta: 'HPC+ (மேம்படுத்தப்பட்ட வீட்டு தனிநபர் பராமரிப்பு)',
  },
  body: {
    en: 'Home Personal Care with 24/7 remote fall monitoring, rolling out island-wide by end-2025; eligible-senior enrolment from 1 Apr 2026. Bundles personal care + light nursing + monitoring so a frail senior living alone can stay home safely.',
    zh: '附24小时远程跌倒监测的居家个人照护,2025年底前全岛推行;合资格长者自2026年4月1日起登记。整合个人照护+轻度护理+监测,让独居体弱长者安全居家。',
    ms: 'Penjagaan Peribadi Rumah dengan pemantauan jatuh jarak jauh 24/7, dilancarkan seluruh negara menjelang akhir 2025; pendaftaran warga emas layak dari 1 April 2026. Menggabungkan penjagaan peribadi + kejururawatan ringan + pemantauan supaya warga emas uzur yang tinggal sendiri boleh kekal di rumah dengan selamat.',
    ta: '24/7 தொலைநிலை விழுதல் கண்காணிப்புடன் கூடிய வீட்டு தனிநபர் பராமரிப்பு, 2025 இறுதிக்குள் தீவு முழுவதும் அறிமுகம்; தகுதியான மூத்தோர் பதிவு 1 ஏப்ரல் 2026 முதல். தனிநபர் பராமரிப்பு + இலகு செவிலியம் + கண்காணிப்பை இணைத்து, தனியாக வாழும் பலவீனமான மூத்தவர் வீட்டில் பாதுகாப்பாக இருக்க உதவுகிறது.',
  },
};

const AIC = {
  label: {
    en: 'AIC care coordination + caregiver support',
    zh: '整合护理机构(AIC)护理协调 + 照护者支持',
    ms: 'Koordinasi penjagaan AIC + sokongan penjaga',
    ta: 'AIC பராமரிப்பு ஒருங்கிணைப்பு + பராமரிப்பாளர் ஆதரவு',
  },
  body: {
    en: 'The Agency for Integrated Care coordinates community / home-care, the Home Caregiving Grant (S$400/mo), Caregivers Training Grant, and links to Active Ageing Centres. Single comprehensive LTC assessment determines eligibility from Apr 2026.',
    zh: '整合护理机构协调社区 / 居家照护、居家护理补助(每月400新元)、照护者培训补助,并衔接活跃乐龄中心。2026年4月起以单一综合长期照护评估确定资格。',
    ms: 'Agensi Penjagaan Bersepadu menyelaras penjagaan komuniti / rumah, Geran Penjagaan Rumah (S$400/bln), Geran Latihan Penjaga, dan pautan ke Pusat Penuaan Aktif. Satu penilaian LTC menyeluruh menentukan kelayakan dari April 2026.',
    ta: 'ஒருங்கிணைந்த பராமரிப்பு நிறுவனம் சமூக / வீட்டு-பராமரிப்பு, வீட்டு பராமரிப்பு மானியம் (S$400/மாதம்), பராமரிப்பாளர் பயிற்சி மானியம், மற்றும் செயலூக்க முதிர்வு மையங்களுடன் இணைப்புகளை ஒருங்கிணைக்கிறது. ஏப்ரல் 2026 முதல் ஒரே விரிவான LTC மதிப்பீடு தகுதியைத் தீர்மானிக்கிறது.',
  },
};

export const ageWellHpcCase: CaseDefinition = {
  id: 'agewell-hpc',
  title: {
    en: 'Frailty + falls — Age Well SG, HPC+ and ageing in place',
    zh: '体弱与跌倒 — Age Well SG、HPC+与在地安老',
    ms: 'Keuzuran + jatuh — Age Well SG, HPC+ dan menua di tempat sendiri',
    ta: 'பலவீனம் + விழுதல் — Age Well SG, HPC+ மற்றும் வசிக்கும் இடத்திலேயே வயதாதல்',
  },
  blurb: {
    en: 'Mdm Chua, 79, lives alone in a rental flat (wireless alert alarm fitted in 2025). Pioneer Generation, early dementia, two falls this year. Today her befriender finds her on the floor; the alarm had already alerted. She is brought to KTPH ED.',
    zh: 'Chua女士,79岁,独居于租赁组屋(2025年已装无线警报器)。建国一代、早期失智,今年已跌倒两次。今天义务探访者发现她倒在地上;警报器已先发出警示。她被送往KTPH急诊。',
    ms: 'Mdm Chua, 79, tinggal sendiri di flat sewa (penggera amaran tanpa wayar dipasang pada 2025). Generasi Perintis, demensia awal, dua kali jatuh tahun ini. Hari ini sukarelawannya menemuinya di lantai; penggera telah memberi amaran. Dia dibawa ke Kecemasan KTPH.',
    ta: 'திருமதி சுவா, 79, ஒரு வாடகை வீட்டில் தனியாக வாழ்கிறார் (2025-இல் கம்பியில்லா எச்சரிக்கை அலாரம் பொருத்தப்பட்டது). முன்னோடி தலைமுறை, ஆரம்ப மறதி நோய், இந்த ஆண்டு இரண்டு முறை விழுந்துள்ளார். இன்று அவரது தோழர் அவரைத் தரையில் காண்கிறார்; அலாரம் ஏற்கனவே எச்சரித்தது. அவர் KTPH அவசர சிகிச்சைக்கு கொண்டு வரப்படுகிறார்.',
  },
  category: 'outpatient',
  primaryFacility: 'ktph',
  involvedFacilities: ['home', 'ktph'],
  profileKey: 'frailSenior',
  allowsWardChoice: false,
  guidelines: [AGE_WELL_SG, HPC_PLUS, AIC],
  pathway: [
    {
      id: 'ed-assess',
      department: 'ed',
      facility: 'ktph',
      durationMin: 120,
      costSGD: 130,
      charge: 'a&e',
      framing: {
        patient: {
          en: 'Bright lights, many questions. Nothing is broken, they say, but you cannot remember if you ate today. You want to go home.',
          zh: '灯光刺眼,问题很多。他们说没骨折,但你记不起今天有没有吃饭。你想回家。',
          ms: 'Lampu terang, banyak soalan. Tiada yang patah, kata mereka, tetapi anda tidak ingat sama ada anda makan hari ini. Anda mahu pulang.',
          ta: 'பிரகாசமான விளக்குகள், பல கேள்விகள். எதுவும் முறியவில்லை என்கிறார்கள், ஆனால் இன்று சாப்பிட்டீர்களா என்பது உங்களுக்கு நினைவில்லை. நீங்கள் வீட்டிற்குச் செல்ல விரும்புகிறீர்கள்.',
        },
        caregiver: {
          en: 'You are the befriender. You worry she cannot keep living alone, but you know she dreads a nursing home.',
          zh: '你是义务探访者。你担心她无法继续独居,但你知道她很怕住进疗养院。',
          ms: 'Anda sukarelawannya. Anda risau dia tidak boleh terus tinggal sendiri, tetapi anda tahu dia takut akan rumah jagaan.',
          ta: 'நீங்கள் அவரது தோழர். அவர் தொடர்ந்து தனியாக வாழ முடியாது என்று கவலைப்படுகிறீர்கள், ஆனால் அவர் முதியோர் இல்லத்தை அஞ்சுகிறார் என்பது உங்களுக்குத் தெரியும்.',
        },
        staff: {
          en: 'No fracture on X-ray. Frailty, early dementia, recurrent falls, lives alone. The acute issue is small; the function + safety issue is large.',
          zh: 'X光无骨折。体弱、早期失智、反复跌倒、独居。急性问题不大;功能与安全问题很大。',
          ms: 'Tiada patah pada X-ray. Keuzuran, demensia awal, jatuh berulang, tinggal sendiri. Isu akut kecil; isu fungsi + keselamatan besar.',
          ta: 'எக்ஸ்-கதிரில் முறிவு இல்லை. பலவீனம், ஆரம்ப மறதி நோய், மீண்டும் மீண்டும் விழுதல், தனியாக வாழ்தல். கடுமையான பிரச்சினை சிறியது; செயல்பாடு + பாதுகாப்பு பிரச்சினை பெரியது.',
        },
      },
      decision: {
        id: 'disposition',
        prompt: {
          en: 'No acute injury. Disposition for a frail senior who lives alone and wants to go home?',
          zh: '无急性损伤。对一位独居、想回家的体弱长者,如何处置?',
          ms: 'Tiada kecederaan akut. Pelupusan untuk warga emas uzur yang tinggal sendiri dan mahu pulang?',
          ta: 'கடுமையான காயம் இல்லை. தனியாக வாழும், வீட்டிற்குச் செல்ல விரும்பும் பலவீனமான மூத்தவருக்கான தீர்வு?',
        },
        reference: AGE_WELL_SG,
        weight: 1.5,
        options: [
          {
            id: 'comprehensive-geriatric',
            label: {
              en: 'Comprehensive geriatric assessment + falls workup; refer to AIC for a single comprehensive LTC assessment; plan supported discharge home.',
              zh: '综合老年评估 + 跌倒检查;转介AIC做单一综合长期照护评估;规划有支持的居家出院。',
              ms: 'Penilaian geriatrik menyeluruh + siasatan jatuh; rujuk AIC untuk satu penilaian LTC menyeluruh; rancang discaj pulang dengan sokongan.',
              ta: 'விரிவான முதியோர் மதிப்பீடு + விழுதல் ஆய்வு; ஒரே விரிவான LTC மதிப்பீட்டிற்கு AIC-க்கு பரிந்துரை; ஆதரவுடன் வீட்டிற்கு அனுப்புதலைத் திட்டமிடு.',
            },
            score: 10,
            rationale: {
              en: 'Falls + frailty + cognition need a structured assessment, not just "medically cleared". Age Well SG / AIC route enables ageing in place with the right supports.',
              zh: '跌倒+体弱+认知需要结构化评估,而非仅"医学上无碍"。Age Well SG / AIC路径可在适当支持下实现在地安老。',
              ms: 'Jatuh + keuzuran + kognisi memerlukan penilaian berstruktur, bukan sekadar "selamat dari segi perubatan". Laluan Age Well SG / AIC membolehkan menua di tempat sendiri dengan sokongan yang betul.',
              ta: 'விழுதல் + பலவீனம் + அறிவாற்றலுக்கு "மருத்துவ ரீதியாக சரி" என்பது மட்டுமல்ல, ஒரு கட்டமைக்கப்பட்ட மதிப்பீடு தேவை. Age Well SG / AIC வழி சரியான ஆதரவுடன் வசிக்கும் இடத்திலேயே வயதாக உதவுகிறது.',
            },
            effects: { setFlags: ['cga-done'] },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'admit-social',
            label: {
              en: 'Admit to an acute ward indefinitely until a nursing-home bed is found.',
              zh: '收入急性病房,无限期等到有疗养院床位。',
              ms: 'Masukkan ke wad akut tanpa had sehingga katil rumah jagaan ditemui.',
              ta: 'முதியோர் இல்ல படுக்கை கிடைக்கும் வரை வரம்பின்றி கடுமையான வார்டில் சேர்.',
            },
            score: 2,
            rationale: {
              en: 'A social admission to an acute bed risks deconditioning and delirium, blocks acute capacity, and pre-empts her wish to age in place before alternatives are explored.',
              zh: '为社会因素占用急性床位有失能与谵妄风险,占用急性资源,且在探索替代方案前就否定了她在地安老的意愿。',
              ms: 'Kemasukan sosial ke katil akut berisiko penyahkondisian dan delirium, menyekat kapasiti akut, dan menafikan hasratnya menua di tempat sendiri sebelum alternatif diterokai.',
              ta: 'கடுமையான படுக்கைக்கான சமூக சேர்க்கை உடல் தளர்வு மற்றும் மயக்க அபாயம், கடுமையான கொள்ளளவைத் தடுக்கிறது, மற்றும் மாற்றுகள் ஆராயப்படுவதற்கு முன் வசிக்கும் இடத்திலேயே வயதாக வேண்டும் என்ற அவரது விருப்பத்தை மறுக்கிறது.',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'discharge-bare',
            label: {
              en: 'Discharge home now with a falls leaflet; no services arranged.',
              zh: '现在就让她带着跌倒须知出院;不安排任何服务。',
              ms: 'Discaj pulang sekarang dengan risalah jatuh; tiada perkhidmatan diatur.',
              ta: 'இப்போதே விழுதல் துண்டுப்பிரசுரத்துடன் வீட்டிற்கு அனுப்பு; எந்த சேவையும் ஏற்பாடு செய்யப்படவில்லை.',
            },
            score: -4,
            rationale: {
              en: 'A bare discharge of a frail senior who lives alone after a fall predicts rapid re-presentation and injury. Services must be arranged before she goes home.',
              zh: '跌倒后让独居体弱长者空手出院,预示快速复诊与受伤。回家前必须先安排服务。',
              ms: 'Discaj kosong warga emas uzur yang tinggal sendiri selepas jatuh meramalkan kemunculan semula dan kecederaan yang cepat. Perkhidmatan mesti diatur sebelum dia pulang.',
              ta: 'விழுந்த பிறகு தனியாக வாழும் பலவீனமான மூத்தவரை வெறுமனே அனுப்புவது விரைவான மறுவருகை மற்றும் காயத்தை முன்னறிவிக்கிறது. அவர் வீட்டிற்குச் செல்வதற்கு முன் சேவைகள் ஏற்பாடு செய்யப்பட வேண்டும்.',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
    {
      id: 'home-package',
      department: 'discharge',
      facility: 'ktph',
      durationMin: 60,
      costSGD: 0,
      charge: 'community-hospital',
      caregiverBurden: { timeOffWorkHours: 3, financialWorry: 5, sleepDebt: 3 },
      framing: {
        patient: {
          en: 'They talk about someone coming to help at home, and a button you can press. You like that you would not have to leave your flat.',
          zh: '他们谈到会有人到家里帮忙,还有一个你可以按的按钮。你喜欢不必离开自己的组屋。',
          ms: 'Mereka bercakap tentang seseorang datang membantu di rumah, dan butang yang anda boleh tekan. Anda suka kerana anda tidak perlu meninggalkan flat anda.',
          ta: 'வீட்டில் உதவ யாரோ வருவது பற்றியும், நீங்கள் அழுத்தக்கூடிய ஒரு பொத்தான் பற்றியும் பேசுகிறார்கள். உங்கள் வீட்டை விட்டு வெளியேற வேண்டியதில்லை என்பது உங்களுக்குப் பிடிக்கிறது.',
        },
        caregiver: {
          en: 'A care coordinator explains HPC+ and a grant that helps with costs. It feels, for the first time, manageable.',
          zh: '一位护理协调员说明HPC+和一项帮补费用的补助。这第一次让人觉得应付得来。',
          ms: 'Seorang penyelaras penjagaan menerangkan HPC+ dan geran yang membantu kos. Buat pertama kali, ia terasa boleh diuruskan.',
          ta: 'ஒரு பராமரிப்பு ஒருங்கிணைப்பாளர் HPC+ மற்றும் செலவுகளுக்கு உதவும் மானியத்தை விளக்குகிறார். முதல் முறையாக, இது சமாளிக்கக்கூடியதாக உணர்கிறது.',
        },
        staff: {
          en: 'CGA done: home hazards, medication review, vision check. Plan ageing-in-place package matched to a frail PG senior living alone.',
          zh: '已完成综合老年评估:居家危险、用药审视、视力检查。为独居的建国一代体弱长者匹配在地安老配套。',
          ms: 'CGA selesai: bahaya rumah, semakan ubat, semakan penglihatan. Rancang pakej menua di tempat sendiri yang sepadan dengan warga emas PG uzur yang tinggal sendiri.',
          ta: 'CGA முடிந்தது: வீட்டு ஆபத்துகள், மருந்து மதிப்பாய்வு, பார்வை சோதனை. தனியாக வாழும் பலவீனமான PG மூத்தவருக்கு ஏற்ற வசிக்கும் இடத்திலேயே வயதாகும் தொகுப்பைத் திட்டமிடு.',
        },
      },
      decision: {
        id: 'home-care-package',
        prompt: {
          en: 'Build the ageing-in-place package?',
          zh: '如何搭建在地安老配套?',
          ms: 'Bina pakej menua di tempat sendiri?',
          ta: 'வசிக்கும் இடத்திலேயே வயதாகும் தொகுப்பை உருவாக்கவா?',
        },
        reference: HPC_PLUS,
        weight: 1.5,
        options: [
          {
            id: 'hpc-plus-bundle',
            label: {
              en: 'HPC+ home personal care with 24/7 fall monitoring + Home Caregiving Grant + Active Ageing Centre enrolment + OT home-hazard fixes + medication review; keep the alert alarm.',
              zh: 'HPC+居家个人照护加24小时跌倒监测 + 居家护理补助 + 活跃乐龄中心登记 + 职能治疗师居家危险整改 + 用药审视;保留警报器。',
              ms: 'Penjagaan peribadi rumah HPC+ dengan pemantauan jatuh 24/7 + Geran Penjagaan Rumah + pendaftaran Pusat Penuaan Aktif + pembaikan bahaya rumah OT + semakan ubat; kekalkan penggera amaran.',
              ta: '24/7 விழுதல் கண்காணிப்புடன் கூடிய HPC+ வீட்டு தனிநபர் பராமரிப்பு + வீட்டு பராமரிப்பு மானியம் + செயலூக்க முதிர்வு மைய பதிவு + OT வீட்டு-ஆபத்து சரிசெய்தல் + மருந்து மதிப்பாய்வு; எச்சரிக்கை அலாரத்தை வைத்திரு.',
            },
            score: 10,
            rationale: {
              en: 'Layered Age Well SG supports let her stay home safely: monitoring catches falls, the grant offsets cost, the AAC reduces isolation, hazard fixes cut recurrence. This is the model the reforms are built for.',
              zh: '多层Age Well SG支持让她安全居家:监测可发现跌倒,补助抵消费用,乐龄中心减少孤立,危险整改降低复发。这正是改革所设计的模式。',
              ms: 'Sokongan Age Well SG berlapis membolehkannya kekal di rumah dengan selamat: pemantauan menangkap jatuh, geran mengurangkan kos, AAC mengurangkan pengasingan, pembaikan bahaya mengurangkan keberulangan. Inilah model yang dibina oleh reformasi.',
              ta: 'அடுக்கப்பட்ட Age Well SG ஆதரவுகள் அவரை வீட்டில் பாதுகாப்பாக இருக்க அனுமதிக்கின்றன: கண்காணிப்பு விழுதலைப் பிடிக்கிறது, மானியம் செலவைக் குறைக்கிறது, AAC தனிமையைக் குறைக்கிறது, ஆபத்து சரிசெய்தல் மீண்டும் நிகழ்வதைக் குறைக்கிறது. சீர்திருத்தங்கள் கட்டமைக்கப்பட்ட மாதிரி இதுவே.',
            },
            outcome: {
              patient: { en: 'You go home. Someone will visit tomorrow.', zh: '你回家了。明天会有人来探访。', ms: 'Anda pulang. Seseorang akan melawat esok.', ta: 'நீங்கள் வீட்டிற்குச் செல்கிறீர்கள். நாளை யாரோ வருவார்கள்.' },
              caregiver: { en: 'You program the new number into your phone.', zh: '你把新号码存进手机。', ms: 'Anda program nombor baru ke dalam telefon anda.', ta: 'புதிய எண்ணை உங்கள் தொலைபேசியில் பதிவு செய்கிறீர்கள்.' },
              staff: { en: 'HPC+ referral accepted; grant application filed.', zh: 'HPC+转介获接受;已提交补助申请。', ms: 'Rujukan HPC+ diterima; permohonan geran difailkan.', ta: 'HPC+ பரிந்துரை ஏற்கப்பட்டது; மானிய விண்ணப்பம் தாக்கல் செய்யப்பட்டது.' },
            },
          },
          {
            id: 'family-only',
            label: {
              en: 'Discharge to family supervision only (daughter is overseas); revisit if problems.',
              zh: '仅交由家人看顾出院(女儿在海外);有问题再就诊。',
              ms: 'Discaj kepada penyeliaan keluarga sahaja (anak perempuan di luar negara); datang semula jika ada masalah.',
              ta: 'குடும்ப மேற்பார்வைக்கு மட்டும் அனுப்பு (மகள் வெளிநாட்டில்); பிரச்சினைகள் இருந்தால் மீண்டும் வா.',
            },
            score: -2,
            rationale: {
              en: 'Her only family is overseas — "family supervision" is not real here. Without formal services she is back to square one.',
              zh: '她唯一的家人在海外 — 此处"家人看顾"并不存在。没有正式服务,她又回到原点。',
              ms: 'Satu-satunya keluarganya di luar negara — "penyeliaan keluarga" tidak wujud di sini. Tanpa perkhidmatan rasmi dia kembali ke titik permulaan.',
              ta: 'அவரது ஒரே குடும்பம் வெளிநாட்டில் — இங்கு "குடும்ப மேற்பார்வை" உண்மையானதல்ல. முறையான சேவைகள் இல்லாமல் அவர் மீண்டும் தொடக்கப் புள்ளிக்கே வருகிறார்.',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
          {
            id: 'nursing-home-default',
            label: {
              en: 'Default to nursing-home placement as the safest option.',
              zh: '默认安排入住疗养院,视为最安全选项。',
              ms: 'Pilih penempatan rumah jagaan sebagai pilihan paling selamat.',
              ta: 'பாதுகாப்பான தேர்வாக முதியோர் இல்ல சேர்க்கையை இயல்பாக்கு.',
            },
            score: 1,
            rationale: {
              en: 'Institutional care suits some, but defaulting to it against her wishes — before trying a supported home package — is neither person-centred nor aligned with Age Well SG\'s ageing-in-place intent.',
              zh: '机构照护适合部分人,但在未尝试有支持的居家配套前、违背其意愿地默认入住,既非以人为本,也不符合Age Well SG在地安老的宗旨。',
              ms: 'Penjagaan institusi sesuai untuk sesetengah orang, tetapi memilihnya bertentangan dengan kehendaknya — sebelum mencuba pakej rumah bersokongan — bukan berpusatkan orang dan tidak selari dengan hasrat menua di tempat sendiri Age Well SG.',
              ta: 'நிறுவன பராமரிப்பு சிலருக்கு ஏற்றது, ஆனால் ஆதரவுடன் கூடிய வீட்டுத் தொகுப்பை முயற்சிப்பதற்கு முன் — அவரது விருப்பத்திற்கு எதிராக அதை இயல்பாக்குவது நபர்-மையமானதும் அல்ல, Age Well SG-இன் வசிக்கும் இடத்திலேயே வயதாகும் நோக்கத்துடன் ஒத்துப்போவதும் இல்லை.',
            },
            outcome: { patient: { en: '', zh: '' }, caregiver: { en: '', zh: '' }, staff: { en: '', zh: '' } },
          },
        ],
      },
    },
  ],
};
