import type { CaseDefinition } from '../../lib/types';

const MOH_ACS = {
  label: {
    en: 'MOH CPG 2/2014: Acute Coronary Syndrome (superseded by ESC 2023 ACS)',
    zh: '卫生部临床指南 2/2014:急性冠脉综合征(已被 ESC 2023 ACS 取代)',
    ms: 'MOH CPG 2/2014: Sindrom Koronari Akut (digantikan oleh ESC 2023 ACS)',
    ta: 'MOH CPG 2/2014: கடுமையான கரோனரி நோய்க்குறித்தொகுப்பு (ESC 2023 ACS ஆல் மாற்றப்பட்டது)',
  },
  body: {
    en: 'Singapore Ministry of Health Clinical Practice Guidelines, ACS 2014 — largely superseded by the unified ESC 2023 ACS guideline; retained for historical context.',
    zh: '新加坡卫生部临床实践指南,ACS 2014 — 大体上已被统一的 ESC 2023 ACS 指南取代;保留作历史参考。',
    ms: 'Garis Panduan Amalan Klinikal Kementerian Kesihatan Singapura, ACS 2014 — sebahagian besarnya digantikan oleh garis panduan bersatu ESC 2023 ACS; dikekalkan untuk konteks sejarah.',
    ta: 'சிங்கப்பூர் சுகாதார அமைச்சின் மருத்துவ நடைமுறை வழிகாட்டுதல்கள், ACS 2014 — பெரும்பாலும் ஒருங்கிணைந்த ESC 2023 ACS வழிகாட்டுதலால் மாற்றப்பட்டது; வரலாற்று பின்னணிக்காக வைக்கப்பட்டுள்ளது.',
  },
};

const ESC_STEMI = {
  label: {
    en: 'ESC 2023 ACS Guidelines',
    zh: 'ESC 2023 急性冠脉综合征指南',
    ms: 'Garis Panduan ACS ESC 2023',
    ta: 'ESC 2023 ACS வழிகாட்டுதல்கள்',
  },
  body: {
    en: 'European Society of Cardiology 2023 guideline on acute coronary syndromes (unified STEMI + NSTE-ACS). Routine P2Y12 pre-treatment before angiography is now Class IIb-B (not routinely recommended). For ACS proceeding to PCI, prasugrel is preferred over ticagrelor (ISAR-REACT 5).',
    zh: '欧洲心脏病学会 2023 急性冠脉综合征指南(统一 STEMI + NSTE-ACS)。冠脉造影前常规 P2Y12 预处理现为 IIb-B 级(不常规推荐)。对于将行 PCI 的 ACS,普拉格雷优于替格瑞洛(ISAR-REACT 5)。',
    ms: 'Garis panduan Persatuan Kardiologi Eropah 2023 mengenai sindrom koronari akut (STEMI + NSTE-ACS bersatu). Pra-rawatan P2Y12 rutin sebelum angiografi kini Kelas IIb-B (tidak disyorkan secara rutin). Untuk ACS yang menuju PCI, prasugrel lebih diutamakan berbanding ticagrelor (ISAR-REACT 5).',
    ta: 'கடுமையான கரோனரி நோய்க்குறித்தொகுப்புகள் குறித்த ஐரோப்பிய இருதயவியல் சங்கம் 2023 வழிகாட்டுதல் (ஒருங்கிணைந்த STEMI + NSTE-ACS). ஆஞ்சியோகிராஃபிக்கு முன் வழக்கமான P2Y12 முன்-சிகிச்சை இப்போது Class IIb-B (வழக்கமாக பரிந்துரைக்கப்படவில்லை). PCI நோக்கி செல்லும் ACS-க்கு, ticagrelor-ஐ விட prasugrel விரும்பப்படுகிறது (ISAR-REACT 5).',
  },
};

const SCDF_TRIAGE = {
  label: {
    en: 'SCDF EMS triage protocol',
    zh: 'SCDF 院前急救分诊方案',
    ms: 'Protokol triage EMS SCDF',
    ta: 'SCDF EMS முன்னுரிமை வரிசைப்படுத்தல் நெறிமுறை',
  },
  body: {
    en: 'Singapore Civil Defence Force pre-hospital ECG and STEMI activation pathway.',
    zh: '新加坡民防部队院前心电图与 STEMI 启动流程。',
    ms: 'Laluan ECG pra-hospital dan pengaktifan STEMI Pasukan Pertahanan Awam Singapura.',
    ta: 'சிங்கப்பூர் சிவில் பாதுகாப்புப் படையின் மருத்துவமனைக்கு முந்தைய ECG மற்றும் STEMI செயல்படுத்தும் பாதை.',
  },
};

const HEALTHIER_SG = {
  label: {
    en: 'MOH Healthier SG (2023)',
    zh: '卫生部 Healthier SG(2023)',
    ms: 'MOH Healthier SG (2023)',
    ta: 'MOH Healthier SG (2023)',
  },
  body: {
    en: 'Right-siting of chronic care to a primary-care provider after acute episodes.',
    zh: '急性发作后将慢性病管理转介至基层医疗服务提供者。',
    ms: 'Penempatan tepat penjagaan kronik kepada penyedia penjagaan primer selepas episod akut.',
    ta: 'கடுமையான அத்தியாயங்களுக்குப் பிறகு நாள்பட்ட பராமரிப்பை முதன்மை பராமரிப்பு வழங்குநரிடம் சரியான இடத்தில் வைத்தல்.',
  },
};

export const stemiAcute: CaseDefinition = {
  id: 'stemi-acute',
  title: {
    en: 'Acute STEMI — 58 y/o male, central chest pain',
    zh: '急性ST段抬高心肌梗死 — 58岁男性,胸骨后疼痛',
    ms: 'STEMI Akut — lelaki 58 tahun, sakit dada tengah',
    ta: 'கடுமையான STEMI — 58 வயது ஆண், மார்பின் நடுவில் வலி',
  },
  blurb: {
    en: 'Mr Tan, 58, taxi driver. Crushing chest pain 30 min ago, radiating to the left arm. Diaphoretic. SCDF en route to TTSH.',
    zh: '陈先生,58岁,出租车司机。30分钟前发作压榨样胸痛,放射至左臂,大汗淋漓。SCDF救护车正前往陈笃生医院。',
    ms: 'Encik Tan, 58, pemandu teksi. Sakit dada menghimpit 30 minit lalu, merebak ke lengan kiri. Berpeluh. SCDF dalam perjalanan ke TTSH.',
    ta: 'திரு டான், 58, டாக்ஸி ஓட்டுநர். 30 நிமிடங்களுக்கு முன் நசுக்கும் மார்பு வலி, இடது கைக்கு பரவுகிறது. வியர்வை. SCDF TTSH நோக்கி வருகிறது.',
  },
  category: 'acute',
  primaryFacility: 'ttsh',
  involvedFacilities: ['ttsh'],
  profileKey: 'taxiDriver',
  allowsWardChoice: true,
  randomiseProfile: true,
  acuteTimer: {
    goalMin: 90,
    goalLabel: 'Door-to-balloon',
    missedFlag: 'd2b-missed',
  },
  guidelines: [MOH_ACS, ESC_STEMI, SCDF_TRIAGE, HEALTHIER_SG],
  pathway: [
    {
      id: 'arrival',
      department: 'entrance',
      durationMin: 2,
      framing: {
        patient: {
          en: 'The ambulance jolts into the bay. Bright lights, voices. The pain is still there. You wonder if you should have just rested at home.',
          zh: '救护车颠簸着驶入停靠区。刺眼的灯光,嘈杂的人声。疼痛仍在。你心想,是不是在家歇着就好了。',
          ms: 'Ambulans terhenti di teluk. Lampu terang, suara-suara. Sakit masih ada. Anda terfikir mungkin lebih baik berehat di rumah sahaja.',
          ta: 'ஆம்புலன்ஸ் வளைகுடாவிற்குள் குலுங்கி நிற்கிறது. பிரகாசமான விளக்குகள், குரல்கள். வலி இன்னும் இருக்கிறது. வீட்டிலேயே ஓய்வெடுத்திருக்கலாமோ என்று நினைக்கிறீர்கள்.',
        },
        caregiver: {
          en: "You followed in a Grab. You don't know which entrance to go to — security points you to the A&E reception.",
          zh: '你叫了Grab跟在后面。你不知道该走哪个入口 — 保安指引你到急诊接待处。',
          ms: 'Anda mengikut dengan Grab. Anda tidak tahu pintu masuk mana — pengawal keselamatan menunjukkan ke kaunter A&E.',
          ta: 'நீங்கள் Grab-இல் பின்தொடர்ந்தீர்கள். எந்த நுழைவாயில் என்று தெரியவில்லை — பாதுகாவலர் A&E வரவேற்பை நோக்கி காட்டுகிறார்.',
        },
        staff: {
          en: 'SCDF radios in: 58M, ongoing chest pain, 12-lead transmitted, suspected anterior STEMI. ETA 2 min.',
          zh: 'SCDF无线电通报:58岁男性,持续胸痛,12导联已传送,疑似前壁STEMI。预计2分钟到达。',
          ms: 'SCDF melapor melalui radio: L58, sakit dada berterusan, 12-lead dihantar, disyaki STEMI anterior. ETA 2 min.',
          ta: 'SCDF ரேடியோவில்: 58 ஆண், தொடரும் மார்பு வலி, 12-லீட் அனுப்பப்பட்டது, முன்புற STEMI சந்தேகம். ETA 2 நிமிடம்.',
        },
      },
      decision: {
        id: 'pre-hospital-activation',
        prompt: {
          en: 'SCDF transmits the pre-hospital ECG en route. As ED registrar on duty, what do you do BEFORE the patient arrives?',
          zh: 'SCDF途中传送院前心电图。作为值班急诊主治,患者到达之前你应该做什么?',
          ms: 'SCDF menghantar ECG pra-hospital dalam perjalanan. Sebagai pendaftar ED bertugas, apa yang anda buat SEBELUM pesakit tiba?',
          ta: 'SCDF வழியில் மருத்துவமனைக்கு முந்தைய ECG-ஐ அனுப்புகிறது. கடமையில் உள்ள ED பதிவாளராக, நோயாளி வருவதற்கு முன் என்ன செய்வீர்கள்?',
        },
        weight: 1,
        reference: SCDF_TRIAGE,
        options: [
          {
            id: 'activate-cathlab',
            label: {
              en: 'Activate cath lab now; alert cardiology consultant; prepare resus bay.',
              zh: '立即启动导管室;通知心内科顾问;准备抢救区。',
              ms: 'Aktifkan makmal kateter sekarang; maklumkan perunding kardiologi; sediakan teluk resusitasi.',
              ta: 'இப்போதே கேத் ஆய்வகத்தை செயல்படுத்துங்கள்; இருதயவியல் ஆலோசகரை எச்சரியுங்கள்; புத்துயிர் வளைகுடாவைத் தயார் செய்யுங்கள்.',
            },
            score: 10,
            rationale: {
              en: 'Pre-hospital ECG-triggered cath lab activation shaves ~25 min off door-to-balloon time. Singapore data (SHF NSTEMI/STEMI registry) supports early activation.',
              zh: '院前心电图触发的导管室启动可使门-球时间缩短约25分钟。新加坡心脏基金会NSTEMI/STEMI登记数据支持早期启动。',
              ms: 'Pengaktifan makmal kateter dicetuskan ECG pra-hospital mengurangkan ~25 min masa pintu-ke-belon. Data Singapura (daftar NSTEMI/STEMI SHF) menyokong pengaktifan awal.',
              ta: 'மருத்துவமனைக்கு முந்தைய ECG தூண்டிய கேத் ஆய்வக செயல்படுத்தல் கதவு-முதல்-பலூன் நேரத்தை ~25 நிமிடம் குறைக்கிறது. சிங்கப்பூர் தரவு (SHF NSTEMI/STEMI பதிவேடு) ஆரம்ப செயல்படுத்தலை ஆதரிக்கிறது.',
            },
            outcome: {
              patient: {
                en: 'Doors slide open. Three people in scrubs are already waiting for you.',
                zh: '大门滑开。三位穿手术衣的医护人员已在等候。',
                ms: 'Pintu terbuka. Tiga orang berbaju bedah sudah menunggu anda.',
                ta: 'கதவுகள் திறக்கின்றன. அறுவை சிகிச்சை உடையில் மூன்று பேர் ஏற்கனவே உங்களுக்காக காத்திருக்கிறார்கள்.',
              },
              caregiver: {
                en: 'You are still parking. By the time you reach the counter, your husband has been wheeled in.',
                zh: '你还在停车。等你赶到柜台时,丈夫已被推进抢救区。',
                ms: 'Anda masih meletak kereta. Apabila tiba di kaunter, suami anda sudah ditolak masuk.',
                ta: 'நீங்கள் இன்னும் வாகனத்தை நிறுத்துகிறீர்கள். கவுண்டரை அடையும்போது, உங்கள் கணவர் ஏற்கனவே உள்ளே தள்ளப்பட்டுவிட்டார்.',
              },
              staff: {
                en: 'Cath lab confirms — team in 12 min. Resus bay ready, clopidogrel/ticagrelor at the bedside.',
                zh: '导管室确认 — 12分钟内集结。抢救区已就绪,氯吡格雷/替格瑞洛已备好床旁。',
                ms: 'Makmal kateter mengesahkan — pasukan dalam 12 min. Teluk resusitasi sedia, clopidogrel/ticagrelor di sisi katil.',
                ta: 'கேத் ஆய்வகம் உறுதிப்படுத்துகிறது — குழு 12 நிமிடத்தில். புத்துயிர் வளைகுடா தயார், clopidogrel/ticagrelor படுக்கையருகே.',
              },
            },
          },
          {
            id: 'wait-arrival',
            label: {
              en: 'Wait until the patient arrives and you can repeat the ECG yourself.',
              zh: '等患者到达后自己再做一次心电图。',
              ms: 'Tunggu sehingga pesakit tiba dan anda boleh ulang ECG sendiri.',
              ta: 'நோயாளி வரும் வரை காத்திருந்து, நீங்களே ECG-ஐ மீண்டும் செய்யுங்கள்.',
            },
            score: 2,
            rationale: {
              en: 'Defensible but slower. Each 30 min delay to reperfusion in STEMI raises 1-year mortality by ~7.5% (Boersma et al.).',
              zh: '可辩护但更慢。STEMI再灌注每延迟30分钟,1年死亡率上升约7.5%(Boersma等)。',
              ms: 'Boleh dipertahankan tetapi lebih perlahan. Setiap 30 min kelewatan reperfusi dalam STEMI meningkatkan kematian 1-tahun sebanyak ~7.5% (Boersma et al.).',
              ta: 'பாதுகாக்கத்தக்கது ஆனால் மெதுவானது. STEMI-இல் மறு-இரத்த ஓட்டத்திற்கு ஒவ்வொரு 30 நிமிட தாமதமும் 1-ஆண்டு இறப்பை ~7.5% அதிகரிக்கிறது (Boersma et al.).',
            },
            outcome: {
              patient: {
                en: 'You are wheeled into a busy resus bay; the team only starts mobilising now.',
                zh: '你被推进繁忙的抢救区;团队此刻才开始集结。',
                ms: 'Anda ditolak ke teluk resusitasi yang sibuk; pasukan baru mula bergerak sekarang.',
                ta: 'நீங்கள் பரபரப்பான புத்துயிர் வளைகுடாவிற்குள் தள்ளப்படுகிறீர்கள்; குழு இப்போதுதான் தயாராகத் தொடங்குகிறது.',
              },
              caregiver: {
                en: 'You arrive before the cath lab team does.',
                zh: '你比导管室团队还早到。',
                ms: 'Anda tiba sebelum pasukan makmal kateter.',
                ta: 'கேத் ஆய்வக குழுவை விட நீங்கள் முன்னதாகவே வந்துவிடுகிறீர்கள்.',
              },
              staff: {
                en: 'Cath lab activates after your repeat ECG. Door-to-balloon clock starts late.',
                zh: '复查心电图后导管室才启动。门-球计时开始得晚。',
                ms: 'Makmal kateter diaktifkan selepas ECG ulangan anda. Jam pintu-ke-belon bermula lewat.',
                ta: 'உங்கள் மீள்-ECG-க்குப் பிறகு கேத் ஆய்வகம் செயல்படுகிறது. கதவு-முதல்-பலூன் கடிகாரம் தாமதமாகத் தொடங்குகிறது.',
              },
            },
            effects: { setFlags: ['delayed-activation'] },
          },
          {
            id: 'thrombolyse-prehospital',
            label: {
              en: 'Order pre-hospital thrombolysis.',
              zh: '下医嘱院前溶栓。',
              ms: 'Arahkan trombolisis pra-hospital.',
              ta: 'மருத்துவமனைக்கு முந்தைய த்ரோம்போலிசிஸை உத்தரவிடுங்கள்.',
            },
            score: -3,
            rationale: {
              en: 'Not standard in Singapore — SCDF protocols transport directly to a PCI-capable centre; thrombolysis is a fallback only when PCI is unavailable within 120 min.',
              zh: '新加坡非标准做法 — SCDF流程是直接转运至可行PCI的中心;只在120分钟内无法行PCI时溶栓才是退路。',
              ms: 'Bukan standard di Singapura — protokol SCDF mengangkut terus ke pusat berkeupayaan PCI; trombolisis hanya sandaran apabila PCI tidak tersedia dalam 120 min.',
              ta: 'சிங்கப்பூரில் தரநிலை அல்ல — SCDF நெறிமுறைகள் நேரடியாக PCI-திறன் கொண்ட மையத்திற்கு கொண்டு செல்கின்றன; 120 நிமிடத்திற்குள் PCI கிடைக்காதபோது மட்டுமே த்ரோம்போலிசிஸ் ஒரு மாற்று.',
            },
            outcome: {
              patient: {
                en: "You feel a rush of medication you don't understand.",
                zh: '你感到一阵药物在体内涌动,但不明所以。',
                ms: 'Anda merasai aliran ubat yang anda tidak faham.',
                ta: 'உங்களுக்குப் புரியாத ஒரு மருந்து உடலில் பாய்வதை உணர்கிறீர்கள்.',
              },
              caregiver: {
                en: 'Confusion at the bedside about which step is happening.',
                zh: '床旁的人在搞不清正在执行哪一步。',
                ms: 'Kekeliruan di sisi katil tentang langkah mana yang sedang berlaku.',
                ta: 'எந்த படி நடக்கிறது என்பது குறித்து படுக்கையருகே குழப்பம்.',
              },
              staff: {
                en: 'Protocol deviation flagged. Cardiology asks why thrombolysis was given when PCI was 12 min away.',
                zh: '记录违反流程。心内科质询:PCI仅12分钟外为何先溶栓?',
                ms: 'Penyimpangan protokol ditanda. Kardiologi bertanya mengapa trombolisis diberi sedangkan PCI hanya 12 min jauhnya.',
                ta: 'நெறிமுறை விலகல் குறிக்கப்பட்டது. PCI 12 நிமிடம் தொலைவில் இருக்கையில் ஏன் த்ரோம்போலிசிஸ் கொடுக்கப்பட்டது என்று இருதயவியல் கேட்கிறது.',
              },
            },
            effects: { setFlags: ['protocol-deviation', 'delayed-activation'] },
          },
        ],
      },
    },
    {
      id: 'triage',
      department: 'triage',
      durationMin: 3,
      framing: {
        patient: {
          en: 'A nurse asks your name, your IC, and presses something on your finger.',
          zh: '一位护士询问你的姓名、身份证号,并在你手指上夹了个东西。',
          ms: 'Seorang jururawat bertanya nama, IC anda, dan menekan sesuatu pada jari anda.',
          ta: 'ஒரு செவிலியர் உங்கள் பெயர், IC-ஐக் கேட்டு, உங்கள் விரலில் ஏதோ ஒன்றை அழுத்துகிறார்.',
        },
        caregiver: {
          en: 'You watch through the glass. They say "P1" — you don\'t know what that means.',
          zh: '你隔着玻璃张望。他们喊"P1" — 你不知道那是什么意思。',
          ms: 'Anda memerhati melalui kaca. Mereka kata "P1" — anda tidak tahu maksudnya.',
          ta: 'நீங்கள் கண்ணாடி வழியாக பார்க்கிறீர்கள். அவர்கள் "P1" என்கிறார்கள் — அதன் பொருள் உங்களுக்குத் தெரியாது.',
        },
        staff: {
          en: 'Vitals: BP 102/64, HR 96, SpO2 95% on RA. Triage P1. Roll straight to resus.',
          zh: '生命体征:血压102/64,心率96,室内空气SpO2 95%。分诊P1。直接推入抢救室。',
          ms: 'Vital: BP 102/64, HR 96, SpO2 95% pada RA. Triage P1. Terus ke resusitasi.',
          ta: 'உயிர் அறிகுறிகள்: BP 102/64, HR 96, அறை காற்றில் SpO2 95%. முன்னுரிமை P1. நேராக புத்துயிருக்கு.',
        },
      },
    },
    {
      id: 'ed-resus',
      department: 'ed',
      durationMin: 12,
      costSGD: 160,
      charge: 'a&e',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 8, sleepDebt: 4 },
      framing: {
        patient: {
          en: 'They keep cutting your shirt. Wires everywhere. Someone shoves a tablet.',
          zh: '他们不停剪开你的衬衫。到处是导线。有人塞给你一片药。',
          ms: 'Mereka asyik memotong baju anda. Wayar di merata tempat. Seseorang menyumbat sebiji pil.',
          ta: 'அவர்கள் உங்கள் சட்டையை வெட்டிக்கொண்டே இருக்கிறார்கள். எங்கும் கம்பிகள். யாரோ ஒரு மாத்திரையைத் திணிக்கிறார்கள்.',
        },
        caregiver: {
          en: 'You are asked about allergies, medications, last meal. You scramble to remember.',
          zh: '有人问你过敏史、用药、上一餐时间。你慌忙回想。',
          ms: 'Anda ditanya tentang alahan, ubat-ubatan, makan terakhir. Anda cuba mengingati dengan kelam-kabut.',
          ta: 'ஒவ்வாமை, மருந்துகள், கடைசி உணவு பற்றி உங்களிடம் கேட்கப்படுகிறது. நினைவுகூர முயன்று தடுமாறுகிறீர்கள்.',
        },
        staff: {
          en: 'IV access x2, FBC/UECr/troponin/coag sent. ECG repeated: 2 mm STE V1–V4. Confirmed anterior STEMI.',
          zh: '建立两条静脉通路,送检全血计数/尿素电解质肌酐/肌钙蛋白/凝血。复查心电图:V1–V4 ST抬高2mm。确诊前壁STEMI。',
          ms: 'Akses IV x2, FBC/UECr/troponin/coag dihantar. ECG diulang: 2 mm STE V1–V4. STEMI anterior disahkan.',
          ta: 'IV அணுகல் x2, FBC/UECr/troponin/coag அனுப்பப்பட்டது. ECG மீண்டும்: 2 mm STE V1–V4. முன்புற STEMI உறுதி.',
        },
      },
      decision: {
        id: 'antiplatelet-loading',
        prompt: {
          en: 'You confirm STEMI. The patient has no contraindication to dual antiplatelet therapy. What loading regimen do you give before cath lab transfer?',
          zh: '你确诊STEMI。患者无双联抗血小板治疗的禁忌证。转入导管室前给予哪种负荷方案?',
          ms: 'Anda sahkan STEMI. Pesakit tiada kontraindikasi terhadap terapi antiplatelet berganda. Regimen pemuatan apa yang anda beri sebelum pemindahan ke makmal kateter?',
          ta: 'நீங்கள் STEMI-ஐ உறுதிசெய்கிறீர்கள். நோயாளிக்கு இரட்டை ஆன்டிபிளேட்லெட் சிகிச்சைக்கு முரண்பாடு இல்லை. கேத் ஆய்வக மாற்றத்திற்கு முன் எந்த ஏற்றும் முறையை வழங்குவீர்கள்?',
        },
        weight: 1.2,
        reference: ESC_STEMI,
        options: [
          {
            id: 'asa-prasugrel',
            label: {
              en: 'Aspirin 300 mg + Prasugrel 60 mg loading.',
              zh: '阿司匹林300mg + 普拉格雷60mg负荷。',
              ms: 'Aspirin 300 mg + Prasugrel 60 mg pemuatan.',
              ta: 'ஆஸ்பிரின் 300 mg + Prasugrel 60 mg ஏற்றம்.',
            },
            score: 10,
            rationale: {
              en: 'For ACS proceeding to primary PCI, ESC 2023 prefers prasugrel over ticagrelor (Class IIa, based on ISAR-REACT 5). Aspirin + a potent P2Y12 inhibitor loaded at diagnosis remains standard for STEMI going straight to the cath lab. Avoid prasugrel if prior stroke/TIA, age ≥75, or weight <60 kg.',
              zh: '对于将行直接PCI的ACS,ESC 2023推荐普拉格雷优于替格瑞洛(IIa级,基于ISAR-REACT 5)。诊断时即给予阿司匹林+强效P2Y12抑制剂负荷,仍是直接送导管室STEMI的标准做法。既往卒中/TIA、年龄≥75或体重<60kg者避用普拉格雷。',
              ms: 'Untuk ACS menuju PCI primer, ESC 2023 mengutamakan prasugrel berbanding ticagrelor (Kelas IIa, berdasarkan ISAR-REACT 5). Aspirin + perencat P2Y12 berkuasa yang dimuatkan semasa diagnosis kekal standard untuk STEMI yang terus ke makmal kateter. Elakkan prasugrel jika strok/TIA terdahulu, umur ≥75, atau berat <60 kg.',
              ta: 'முதன்மை PCI நோக்கி செல்லும் ACS-க்கு, ESC 2023 ticagrelor-ஐ விட prasugrel-ஐ விரும்புகிறது (Class IIa, ISAR-REACT 5 அடிப்படையில்). நோயறிதலின்போது ஏற்றப்படும் ஆஸ்பிரின் + வலிமையான P2Y12 தடுப்பான் கேத் ஆய்வகத்திற்கு நேராக செல்லும் STEMI-க்கு தரநிலையாகவே உள்ளது. முந்தைய பக்கவாதம்/TIA, வயது ≥75, அல்லது எடை <60 kg எனில் prasugrel-ஐத் தவிர்க்கவும்.',
            },
            outcome: {
              patient: {
                en: 'You are told to chew the tablets. Bitter.',
                zh: '他们让你嚼碎药片。很苦。',
                ms: 'Anda diberitahu untuk mengunyah pil. Pahit.',
                ta: 'மாத்திரைகளை மென்று சாப்பிடச் சொல்கிறார்கள். கசப்பு.',
              },
              caregiver: {
                en: 'A nurse explains the medications and writes them on the board for you.',
                zh: '一位护士向你解释这些药并写在白板上。',
                ms: 'Seorang jururawat menerangkan ubat dan menulisnya di papan untuk anda.',
                ta: 'ஒரு செவிலியர் மருந்துகளை விளக்கி, உங்களுக்காக பலகையில் எழுதுகிறார்.',
              },
              staff: {
                en: 'DAPT loaded. You sign the cath lab transfer note.',
                zh: '双抗已负荷。你签署导管室转送单。',
                ms: 'DAPT dimuatkan. Anda menandatangani nota pemindahan makmal kateter.',
                ta: 'DAPT ஏற்றப்பட்டது. கேத் ஆய்வக மாற்றக் குறிப்பில் கையெழுத்திடுகிறீர்கள்.',
              },
            },
          },
          {
            id: 'asa-tica',
            label: {
              en: 'Aspirin 300 mg + Ticagrelor 180 mg loading.',
              zh: '阿司匹林300mg + 替格瑞洛180mg负荷。',
              ms: 'Aspirin 300 mg + Ticagrelor 180 mg pemuatan.',
              ta: 'ஆஸ்பிரின் 300 mg + Ticagrelor 180 mg ஏற்றம்.',
            },
            score: 9,
            rationale: {
              en: 'Aspirin + ticagrelor is a guideline-endorsed regimen for primary PCI and the right choice when prasugrel is contraindicated (prior stroke/TIA, age ≥75, low body weight). ESC 2023 now ranks prasugrel ahead of ticagrelor for ACS-PCI, but ticagrelor remains a strong option.',
              zh: '阿司匹林+替格瑞洛是直接PCI的指南认可方案,也是普拉格雷禁忌(既往卒中/TIA、年龄≥75、低体重)时的正确选择。ESC 2023对ACS-PCI已将普拉格雷排在替格瑞洛之前,但替格瑞洛仍是有力选项。',
              ms: 'Aspirin + ticagrelor ialah regimen disokong garis panduan untuk PCI primer dan pilihan tepat apabila prasugrel dikontraindikasi (strok/TIA terdahulu, umur ≥75, berat badan rendah). ESC 2023 kini meletakkan prasugrel di hadapan ticagrelor untuk ACS-PCI, tetapi ticagrelor kekal pilihan kuat.',
              ta: 'ஆஸ்பிரின் + ticagrelor என்பது முதன்மை PCI-க்கான வழிகாட்டுதல்-அங்கீகரிக்கப்பட்ட முறை மற்றும் prasugrel முரண்பாடாக இருக்கும்போது (முந்தைய பக்கவாதம்/TIA, வயது ≥75, குறைந்த எடை) சரியான தேர்வு. ESC 2023 இப்போது ACS-PCI-க்கு ticagrelor-ஐ விட prasugrel-ஐ முன்னிலைப்படுத்துகிறது, ஆனால் ticagrelor வலுவான விருப்பமாகவே உள்ளது.',
            },
            outcome: {
              patient: {
                en: 'You are told to chew two tablets. Bitter.',
                zh: '他们让你嚼两片药。很苦。',
                ms: 'Anda diberitahu untuk mengunyah dua pil. Pahit.',
                ta: 'இரண்டு மாத்திரைகளை மென்று சாப்பிடச் சொல்கிறார்கள். கசப்பு.',
              },
              caregiver: {
                en: 'A nurse explains the medications and writes them on the board for you.',
                zh: '一位护士向你解释这些药并写在白板上。',
                ms: 'Seorang jururawat menerangkan ubat dan menulisnya di papan untuk anda.',
                ta: 'ஒரு செவிலியர் மருந்துகளை விளக்கி, உங்களுக்காக பலகையில் எழுதுகிறார்.',
              },
              staff: {
                en: 'DAPT loaded. You sign the cath lab transfer note.',
                zh: '双抗已负荷。你签署导管室转送单。',
                ms: 'DAPT dimuatkan. Anda menandatangani nota pemindahan makmal kateter.',
                ta: 'DAPT ஏற்றப்பட்டது. கேத் ஆய்வக மாற்றக் குறிப்பில் கையெழுத்திடுகிறீர்கள்.',
              },
            },
          },
          {
            id: 'asa-clopi',
            label: {
              en: 'Aspirin 300 mg + Clopidogrel 600 mg loading.',
              zh: '阿司匹林300mg + 氯吡格雷600mg负荷。',
              ms: 'Aspirin 300 mg + Clopidogrel 600 mg pemuatan.',
              ta: 'ஆஸ்பிரின் 300 mg + Clopidogrel 600 mg ஏற்றம்.',
            },
            score: 7,
            rationale: {
              en: 'Acceptable, especially if bleeding risk is high or ticagrelor unavailable. Less potent platelet inhibition than ticagrelor but lower cost and broader formulary access.',
              zh: '可接受,尤其在出血风险高或无替格瑞洛时。血小板抑制不及替格瑞洛强,但成本更低、处方覆盖更广。',
              ms: 'Boleh diterima, terutama jika risiko pendarahan tinggi atau ticagrelor tidak tersedia. Perencatan platelet kurang berkuasa berbanding ticagrelor tetapi kos lebih rendah dan akses formulari lebih luas.',
              ta: 'ஏற்கத்தக்கது, குறிப்பாக இரத்தப்போக்கு அபாயம் அதிகமாக இருந்தால் அல்லது ticagrelor கிடைக்காவிட்டால். ticagrelor-ஐ விட குறைந்த வலிமையான பிளேட்லெட் தடை ஆனால் குறைந்த செலவு மற்றும் பரந்த மருந்துப் பட்டியல் அணுகல்.',
            },
            outcome: {
              patient: {
                en: 'Two tablets, water, off you go.',
                zh: '两片药,喝口水,你就被推走了。',
                ms: 'Dua pil, air, dan anda pun bergerak.',
                ta: 'இரண்டு மாத்திரைகள், தண்ணீர், நீங்கள் கிளம்புகிறீர்கள்.',
              },
              caregiver: {
                en: 'Same nurse explains; everything still feels too fast.',
                zh: '同一位护士解释;一切仍快得让你跟不上。',
                ms: 'Jururawat yang sama menerangkan; segalanya masih terasa terlalu pantas.',
                ta: 'அதே செவிலியர் விளக்குகிறார்; எல்லாமே இன்னும் மிக வேகமாக உணரப்படுகிறது.',
              },
              staff: {
                en: 'Loaded. Cardiology comfortable, especially given financial considerations.',
                zh: '已负荷。考虑到经济因素,心内科也认可。',
                ms: 'Dimuatkan. Kardiologi selesa, terutama mengambil kira pertimbangan kewangan.',
                ta: 'ஏற்றப்பட்டது. குறிப்பாக நிதி கருத்துகளைக் கருத்தில் கொண்டு, இருதயவியல் திருப்தி.',
              },
            },
          },
          {
            id: 'asa-only',
            label: {
              en: 'Aspirin 300 mg only — let cath lab pick the second agent.',
              zh: '仅阿司匹林300mg — 让导管室决定第二种药。',
              ms: 'Aspirin 300 mg sahaja — biar makmal kateter pilih agen kedua.',
              ta: 'ஆஸ்பிரின் 300 mg மட்டும் — இரண்டாவது மருந்தை கேத் ஆய்வகம் தேர்வு செய்யட்டும்.',
            },
            score: 1,
            rationale: {
              en: 'Delays effective platelet inhibition. Most centres want loading done in ED to maximise drug onset by balloon time.',
              zh: '延误有效的血小板抑制。多数中心希望在急诊完成负荷,以使药效在球囊扩张时达到最大。',
              ms: 'Melewatkan perencatan platelet berkesan. Kebanyakan pusat mahu pemuatan dibuat di ED untuk memaksimumkan permulaan ubat menjelang masa belon.',
              ta: 'பயனுள்ள பிளேட்லெட் தடையைத் தாமதப்படுத்துகிறது. பெரும்பாலான மையங்கள் பலூன் நேரத்திற்குள் மருந்து தொடக்கத்தை அதிகரிக்க ED-இல் ஏற்றம் முடிக்கப்பட வேண்டும் என விரும்புகின்றன.',
            },
            outcome: {
              patient: {
                en: 'One tablet only. Off to the lift.',
                zh: '只有一片药。被推向电梯。',
                ms: 'Satu pil sahaja. Terus ke lif.',
                ta: 'ஒரே ஒரு மாத்திரை. லிஃப்ட் நோக்கி.',
              },
              caregiver: { en: '', zh: '', ms: '', ta: '' },
              staff: {
                en: 'Cardiology fellow grumbles in the lift — would have preferred DAPT loaded.',
                zh: '心内科专培医师在电梯里嘟囔 — 本希望已负荷双抗。',
                ms: 'Felo kardiologi merungut di dalam lif — lebih suka DAPT telah dimuatkan.',
                ta: 'லிஃப்ட்டில் இருதயவியல் ஃபெலோ முணுமுணுக்கிறார் — DAPT ஏற்றப்பட்டிருந்தால் நன்றாக இருந்திருக்கும்.',
              },
            },
          },
          {
            id: 'no-antiplatelet',
            label: {
              en: 'Hold antiplatelets until cath lab confirms culprit lesion.',
              zh: '暂不予抗血小板,待导管室确认罪犯病变。',
              ms: 'Tahan antiplatelet sehingga makmal kateter mengesahkan lesi penyebab.',
              ta: 'கேத் ஆய்வகம் காரண புண்ணை உறுதிப்படுத்தும் வரை ஆன்டிபிளேட்லெட்களை நிறுத்தி வைக்கவும்.',
            },
            score: -5,
            rationale: {
              en: 'Unsafe — STEMI is a thrombotic emergency; loading must occur as early as possible.',
              zh: '不安全 — STEMI是血栓性急症;负荷应尽早进行。',
              ms: 'Tidak selamat — STEMI ialah kecemasan trombotik; pemuatan mesti dibuat seawal mungkin.',
              ta: 'பாதுகாப்பற்றது — STEMI ஒரு த்ரோம்போடிக் அவசரநிலை; ஏற்றம் முடிந்தவரை விரைவில் நடக்க வேண்டும்.',
            },
            effects: { setFlags: ['delayed-activation'] },
            outcome: {
              patient: {
                en: 'You are not given any tablets in the ED.',
                zh: '你在急诊没有拿到任何药片。',
                ms: 'Anda tidak diberi sebarang pil di ED.',
                ta: 'ED-இல் உங்களுக்கு எந்த மாத்திரையும் கொடுக்கப்படவில்லை.',
              },
              caregiver: { en: '', zh: '', ms: '', ta: '' },
              staff: {
                en: 'Cardiology consultant calls you back to ask why DAPT was withheld.',
                zh: '心内科顾问回电询问为何未给双抗。',
                ms: 'Perunding kardiologi menelefon semula bertanya mengapa DAPT ditahan.',
                ta: 'DAPT ஏன் தடுத்து வைக்கப்பட்டது என்று கேட்க இருதயவியல் ஆலோசகர் உங்களை மீண்டும் அழைக்கிறார்.',
              },
            },
          },
        ],
      },
    },
    {
      id: 'imaging-bedside',
      department: 'imaging',
      durationMin: 5,
      costSGD: 90,
      charge: 'imaging',
      framing: {
        patient: {
          en: 'They wheel you past more lights and a big machine.',
          zh: '他们推着你经过更多灯光和一台大机器。',
          ms: 'Mereka menolak anda melepasi lebih banyak lampu dan sebuah mesin besar.',
          ta: 'மேலும் விளக்குகள் மற்றும் ஒரு பெரிய இயந்திரத்தைக் கடந்து உங்களைத் தள்ளிச் செல்கிறார்கள்.',
        },
        caregiver: {
          en: 'A staff member directs you to wait outside; you can see your husband through a window.',
          zh: '一名工作人员让你在外等候;你能透过窗看到丈夫。',
          ms: 'Seorang kakitangan mengarahkan anda menunggu di luar; anda boleh melihat suami anda melalui tingkap.',
          ta: 'ஒரு பணியாளர் வெளியே காத்திருக்கச் சொல்கிறார்; ஜன்னல் வழியாக உங்கள் கணவரைப் பார்க்க முடிகிறது.',
        },
        staff: {
          en: 'Bedside CXR rules out pneumothorax / aortic dissection mimics before heparinisation. POCUS: anterior wall hypokinesis confirms territory.',
          zh: '床旁胸片在肝素化前排除气胸/主动脉夹层等类似情况。床旁超声:前壁运动减弱,确认梗死区域。',
          ms: 'CXR sisi katil menolak pneumotoraks / peniru diseksi aorta sebelum heparinisasi. POCUS: hipokinesis dinding anterior mengesahkan kawasan.',
          ta: 'ஹெப்பரின் வழங்குவதற்கு முன் படுக்கையருகே CXR நிமோதோராக்ஸ் / பெருநாடி பிளவு போன்றவற்றை விலக்குகிறது. POCUS: முன்புற சுவர் ஹைப்போகைனீசிஸ் பகுதியை உறுதிப்படுத்துகிறது.',
        },
      },
    },
    {
      id: 'cath-lab',
      department: 'cathlab',
      durationMin: 55,
      costSGD: 4200,
      charge: 'inpatient-procedure',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: 18, sleepDebt: 6 },
      framing: {
        patient: {
          en: 'A new room, more cold gel. Someone says "small prick at the wrist." You drift.',
          zh: '换了个房间,又是冰凉的凝胶。有人说"手腕扎一下"。你恍惚睡去。',
          ms: 'Bilik baru, lebih banyak gel sejuk. Seseorang berkata "cucukan kecil di pergelangan tangan." Anda terhanyut.',
          ta: 'புதிய அறை, மேலும் குளிர்ந்த ஜெல். யாரோ "மணிக்கட்டில் சிறிய குத்து" என்கிறார்கள். நீங்கள் மயங்குகிறீர்கள்.',
        },
        caregiver: {
          en: "You sit alone in the relatives' room. A volunteer brings you water. The clock on the wall stretches.",
          zh: '你独自坐在家属室。一名义工给你倒水。墙上的钟仿佛走得格外慢。',
          ms: 'Anda duduk sendirian di bilik keluarga. Seorang sukarelawan membawa air. Jam di dinding terasa lambat.',
          ta: 'உறவினர்கள் அறையில் தனியாக அமர்ந்திருக்கிறீர்கள். ஒரு தன்னார்வலர் தண்ணீர் கொண்டு வருகிறார். சுவரில் உள்ள கடிகாரம் மெதுவாக நகர்கிறது.',
        },
        staff: {
          en: 'Radial access, 6F sheath, 90 IU/kg heparin. LAD culprit, TIMI 0 → DES deployed → TIMI 3. Door-to-balloon 64 min.',
          zh: '桡动脉入路,6F鞘,肝素90 IU/kg。罪犯血管LAD,TIMI 0 → 置入药物洗脱支架 → TIMI 3。门-球时间64分钟。',
          ms: 'Akses radial, sheath 6F, heparin 90 IU/kg. LAD penyebab, TIMI 0 → DES dipasang → TIMI 3. Pintu-ke-belon 64 min.',
          ta: 'ரேடியல் அணுகல், 6F சீத், 90 IU/kg ஹெப்பரின். LAD காரணம், TIMI 0 → DES பொருத்தப்பட்டது → TIMI 3. கதவு-முதல்-பலூன் 64 நிமிடம்.',
        },
      },
      decision: {
        id: 'access-route',
        prompt: {
          en: 'The interventional cardiologist asks your preference for arterial access in this haemodynamically stable, non-shocked patient.',
          zh: '介入心脏科医生询问:对这位血流动力学稳定、未休克的患者,你倾向哪种动脉入路?',
          ms: 'Pakar kardiologi intervensi bertanya pilihan anda untuk akses arteri pada pesakit yang stabil hemodinamik dan tidak terkejut ini.',
          ta: 'இந்த ஹீமோடைனமிக்காக நிலையான, அதிர்ச்சியடையாத நோயாளியில் தமனி அணுகலுக்கான உங்கள் விருப்பத்தை இடையீட்டு இருதயவியலாளர் கேட்கிறார்.',
        },
        weight: 1,
        reference: ESC_STEMI,
        options: [
          {
            id: 'radial',
            label: {
              en: 'Radial access.',
              zh: '桡动脉入路。',
              ms: 'Akses radial.',
              ta: 'ரேடியல் அணுகல்.',
            },
            score: 10,
            rationale: {
              en: 'MATRIX and RIVAL trials show lower bleeding and mortality with radial vs femoral in ACS. Default in stable STEMI.',
              zh: 'MATRIX和RIVAL试验显示,ACS中桡动脉较股动脉出血和死亡率更低。稳定STEMI的首选。',
              ms: 'Kajian MATRIX dan RIVAL menunjukkan pendarahan dan kematian lebih rendah dengan radial berbanding femoral dalam ACS. Lalai dalam STEMI stabil.',
              ta: 'MATRIX மற்றும் RIVAL சோதனைகள் ACS-இல் ஃபெமோரலை விட ரேடியலில் குறைந்த இரத்தப்போக்கு மற்றும் இறப்பைக் காட்டுகின்றன. நிலையான STEMI-இல் இயல்புநிலை.',
            },
            outcome: {
              patient: {
                en: 'A small prick on your wrist; you barely feel it.',
                zh: '手腕上扎了一下;你几乎没感觉。',
                ms: 'Cucukan kecil di pergelangan tangan; anda hampir tidak merasainya.',
                ta: 'உங்கள் மணிக்கட்டில் ஒரு சிறிய குத்து; நீங்கள் அதை அரிதாகவே உணர்கிறீர்கள்.',
              },
              caregiver: {
                en: 'Tells you it went well — early ambulation expected.',
                zh: '医生告诉你过程顺利 — 预计可早期下床活动。',
                ms: 'Memberitahu anda ia berjalan lancar — pergerakan awal dijangka.',
                ta: 'நன்றாக நடந்தது என்று சொல்கிறார் — விரைவில் நடமாட்டம் எதிர்பார்க்கப்படுகிறது.',
              },
              staff: {
                en: 'Radial closure, smooth case, post-procedure straight to CICU.',
                zh: '桡动脉止血,过程顺利,术后直接入心脏重症监护室。',
                ms: 'Penutupan radial, kes lancar, selepas prosedur terus ke CICU.',
                ta: 'ரேடியல் மூடல், சுமூகமான வழக்கு, செயல்முறைக்குப் பிறகு நேராக CICU-க்கு.',
              },
            },
          },
          {
            id: 'femoral',
            label: {
              en: 'Femoral access.',
              zh: '股动脉入路。',
              ms: 'Akses femoral.',
              ta: 'ஃபெமோரல் அணுகல்.',
            },
            score: 5,
            rationale: {
              en: 'Reasonable if radial fails or the patient is shocked needing IABP / large-bore access. Higher access-site bleeding risk.',
              zh: '若桡动脉失败,或患者休克需主动脉内球囊反搏/大孔径通路,则属合理。入路部位出血风险更高。',
              ms: 'Munasabah jika radial gagal atau pesakit terkejut memerlukan IABP / akses lubang besar. Risiko pendarahan tapak akses lebih tinggi.',
              ta: 'ரேடியல் தோல்வியடைந்தால் அல்லது நோயாளி அதிர்ச்சியடைந்து IABP / பெரிய-துளை அணுகல் தேவைப்பட்டால் நியாயமானது. அணுகல்-இடத்தில் இரத்தப்போக்கு அபாயம் அதிகம்.',
            },
            outcome: {
              patient: {
                en: 'A bandage on your groin; you can\'t move that leg for hours.',
                zh: '腹股沟上包扎;你那条腿好几个小时不能动。',
                ms: 'Pembalut di pangkal paha; anda tidak boleh menggerakkan kaki itu berjam-jam.',
                ta: 'உங்கள் இடுப்பில் ஒரு கட்டு; பல மணி நேரம் அந்த காலை அசைக்க முடியாது.',
              },
              caregiver: { en: '', zh: '', ms: '', ta: '' },
              staff: {
                en: 'Manual compression, longer bed-rest, consider FemoStop if oozing.',
                zh: '手动压迫,卧床时间更长,若渗血考虑使用FemoStop。',
                ms: 'Mampatan manual, rehat katil lebih lama, pertimbangkan FemoStop jika berdarah.',
                ta: 'கைமுறை அழுத்தம், நீண்ட படுக்கை ஓய்வு, கசிந்தால் FemoStop கருத்தில் கொள்ளவும்.',
              },
            },
          },
          {
            id: 'thrombolyse-here',
            label: {
              en: 'Switch to in-hospital thrombolysis instead of PCI.',
              zh: '改为院内溶栓而非PCI。',
              ms: 'Beralih ke trombolisis dalam hospital dan bukan PCI.',
              ta: 'PCI-க்கு பதிலாக மருத்துவமனைக்குள் த்ரோம்போலிசிஸுக்கு மாறவும்.',
            },
            score: -10,
            rationale: {
              en: 'Already in a PCI-capable centre with team activated — primary PCI is superior to thrombolysis when achievable in time.',
              zh: '已身处可行PCI的中心且团队已启动 — 在时限内能完成时,直接PCI优于溶栓。',
              ms: 'Sudah berada di pusat berkeupayaan PCI dengan pasukan diaktifkan — PCI primer lebih baik daripada trombolisis apabila dapat dicapai tepat masa.',
              ta: 'ஏற்கனவே குழு செயல்படுத்தப்பட்ட PCI-திறன் கொண்ட மையத்தில் — நேரத்தில் சாத்தியமாகும்போது முதன்மை PCI த்ரோம்போலிசிஸை விட சிறந்தது.',
            },
            outcome: {
              patient: { en: '', zh: '', ms: '', ta: '' },
              caregiver: { en: '', zh: '', ms: '', ta: '' },
              staff: {
                en: 'Consultant overrides — proceed to PCI.',
                zh: '顾问医生否决 — 继续行PCI。',
                ms: 'Perunding membatalkan — teruskan ke PCI.',
                ta: 'ஆலோசகர் ரத்து செய்கிறார் — PCI-க்கு தொடரவும்.',
              },
            },
          },
        ],
      },
    },
    {
      id: 'cardiogenic-shock',
      department: 'icu',
      requiresAnyFlag: ['delayed-activation', 'd2b-missed', 'protocol-deviation'],
      durationMin: 60,
      costSGD: 1800,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 6, financialWorry: 18, sleepDebt: 12 },
      framing: {
        patient: {
          en: '(post-PCI hypotension; vasopressors started; Swan-Ganz line considered.)',
          zh: '(PCI术后低血压;已启用血管升压药;考虑置入Swan-Ganz导管。)',
          ms: '(hipotensi selepas PCI; vasopressor dimulakan; talian Swan-Ganz dipertimbangkan.)',
          ta: '(PCI-க்குப் பிறகு குறைந்த இரத்த அழுத்தம்; வாசோபிரஸர்கள் தொடங்கப்பட்டன; Swan-Ganz வரி பரிசீலிக்கப்படுகிறது.)',
        },
        caregiver: {
          en: 'You are pulled into the family room. The phrase "complicated" is used twice.',
          zh: '你被请进家属室。"复杂"这个词被提了两次。',
          ms: 'Anda dibawa ke bilik keluarga. Frasa "rumit" digunakan dua kali.',
          ta: 'நீங்கள் குடும்ப அறைக்கு அழைக்கப்படுகிறீர்கள். "சிக்கலானது" என்ற சொல் இரண்டு முறை பயன்படுத்தப்படுகிறது.',
        },
        staff: {
          en: 'Post-PCI cardiogenic shock — late reperfusion; large infarct territory. IABP discussion; consider tertiary mechanical circulatory support transfer.',
          zh: 'PCI术后心源性休克 — 再灌注延迟;梗死面积大。讨论主动脉内球囊反搏;考虑转至三级机械循环支持中心。',
          ms: 'Renjatan kardiogenik selepas PCI — reperfusi lewat; kawasan infark besar. Perbincangan IABP; pertimbangkan pemindahan sokongan peredaran mekanikal tertiari.',
          ta: 'PCI-க்குப் பிறகு கார்டியோஜெனிக் அதிர்ச்சி — தாமதமான மறு-இரத்த ஓட்டம்; பெரிய இன்ஃபார்க்ட் பகுதி. IABP விவாதம்; மூன்றாம்நிலை இயந்திர சுற்றோட்ட ஆதரவு மாற்றத்தைக் கருத்தில் கொள்ளவும்.',
        },
      },
      decision: {
        id: 'shock-management',
        prompt: {
          en: 'Post-PCI cardiogenic shock. SBP 78 on noradrenaline. Lactate 5.2. Echo: severe LV dysfunction. What now?',
          zh: 'PCI术后心源性休克。去甲肾上腺素下收缩压78。乳酸5.2。超声:左室功能严重不全。下一步?',
          ms: 'Renjatan kardiogenik selepas PCI. SBP 78 atas noradrenalin. Laktat 5.2. Echo: disfungsi LV teruk. Apa sekarang?',
          ta: 'PCI-க்குப் பிறகு கார்டியோஜெனிக் அதிர்ச்சி. நோராட்ரெனலினில் SBP 78. லாக்டேட் 5.2. எக்கோ: கடுமையான LV செயலிழப்பு. இப்போது என்ன?',
        },
        weight: 1.5,
        reference: ESC_STEMI,
        options: [
          {
            id: 'iabp-mcs',
            label: {
              en: 'IABP plus consider transfer to tertiary mechanical circulatory support (NHCS / NUHCS) for VA-ECMO.',
              zh: '主动脉内球囊反搏,并考虑转至三级机械循环支持中心(NHCS/NUHCS)行VA-ECMO。',
              ms: 'IABP serta pertimbangkan pemindahan ke sokongan peredaran mekanikal tertiari (NHCS / NUHCS) untuk VA-ECMO.',
              ta: 'IABP மற்றும் VA-ECMO-க்காக மூன்றாம்நிலை இயந்திர சுற்றோட்ட ஆதரவுக்கு (NHCS / NUHCS) மாற்றத்தைக் கருத்தில் கொள்ளவும்.',
            },
            score: 10,
            rationale: {
              en: 'Cardiogenic shock from STEMI requires haemodynamic support; ECMO/Impella centres are the appropriate venue when standard support insufficient.',
              zh: 'STEMI所致心源性休克需要血流动力学支持;当标准支持不足时,ECMO/Impella中心是合适的去处。',
              ms: 'Renjatan kardiogenik daripada STEMI memerlukan sokongan hemodinamik; pusat ECMO/Impella ialah tempat yang sesuai apabila sokongan standard tidak mencukupi.',
              ta: 'STEMI-இலிருந்து கார்டியோஜெனிக் அதிர்ச்சிக்கு ஹீமோடைனமிக் ஆதரவு தேவை; தரநிலை ஆதரவு போதாதபோது ECMO/Impella மையங்கள் பொருத்தமான இடம்.',
            },
            outcome: {
              patient: {
                en: '(transferred for advanced support.)',
                zh: '(转送接受高级支持。)',
                ms: '(dipindahkan untuk sokongan lanjutan.)',
                ta: '(மேம்பட்ட ஆதரவுக்காக மாற்றப்பட்டது.)',
              },
              caregiver: {
                en: 'You travel to NHCS. The team there meets you.',
                zh: '你前往NHCS。那里的团队接待了你。',
                ms: 'Anda pergi ke NHCS. Pasukan di sana menemui anda.',
                ta: 'நீங்கள் NHCS-க்கு செல்கிறீர்கள். அங்குள்ள குழு உங்களைச் சந்திக்கிறது.',
              },
              staff: {
                en: 'IABP placed; NHCS accepts; transfer overnight.',
                zh: '已置入主动脉内球囊反搏;NHCS接收;连夜转送。',
                ms: 'IABP dipasang; NHCS menerima; pemindahan semalaman.',
                ta: 'IABP பொருத்தப்பட்டது; NHCS ஏற்கிறது; இரவோடு மாற்றம்.',
              },
            },
            effects: { setFlags: ['post-shock'] },
          },
          {
            id: 'maximise-medical',
            label: {
              en: 'Maximise vasopressors and inotropes; defer mechanical support.',
              zh: '最大化血管升压药与正性肌力药;暂缓机械支持。',
              ms: 'Maksimumkan vasopressor dan inotrop; tangguhkan sokongan mekanikal.',
              ta: 'வாசோபிரஸர்கள் மற்றும் இனோட்ரோப்களை அதிகரிக்கவும்; இயந்திர ஆதரவைத் தள்ளிப்போடவும்.',
            },
            score: 4,
            rationale: {
              en: 'Acceptable while awaiting decision but vasopressors at high doses worsen myocardial demand; mechanical support discussion shouldn\'t wait.',
              zh: '在等待决策时可接受,但大剂量血管升压药会加重心肌耗氧;机械支持的讨论不应拖延。',
              ms: 'Boleh diterima sementara menunggu keputusan tetapi vasopressor dos tinggi memburukkan permintaan miokardium; perbincangan sokongan mekanikal tidak harus ditangguh.',
              ta: 'முடிவுக்காக காத்திருக்கும்போது ஏற்கத்தக்கது ஆனால் அதிக அளவு வாசோபிரஸர்கள் மாரடைப்பு தேவையை மோசமாக்குகின்றன; இயந்திர ஆதரவு விவாதம் காத்திருக்கக்கூடாது.',
            },
            outcome: { patient: { en: '', zh: '', ms: '', ta: '' }, caregiver: { en: '', zh: '', ms: '', ta: '' }, staff: { en: '', zh: '', ms: '', ta: '' } },
            effects: { setFlags: ['post-shock'] },
          },
          {
            id: 'comfort-only',
            label: {
              en: 'Comfort-only care.',
              zh: '仅舒缓护理。',
              ms: 'Penjagaan keselesaan sahaja.',
              ta: 'ஆறுதல்-மட்டும் பராமரிப்பு.',
            },
            score: -8,
            rationale: {
              en: 'Premature; reversible mechanical complications need to be assessed first.',
              zh: '为时过早;应先评估可逆的机械并发症。',
              ms: 'Terlalu awal; komplikasi mekanikal boleh balik perlu dinilai dahulu.',
              ta: 'முன்கூட்டியே; மீளக்கூடிய இயந்திர சிக்கல்கள் முதலில் மதிப்பிடப்பட வேண்டும்.',
            },
            outcome: {
              patient: { en: '', zh: '', ms: '', ta: '' },
              caregiver: {
                en: 'Family meeting requested.',
                zh: '请求召开家庭会议。',
                ms: 'Mesyuarat keluarga diminta.',
                ta: 'குடும்பக் கூட்டம் கோரப்பட்டது.',
              },
              staff: {
                en: 'Reverted on senior review.',
                zh: '经上级复核后撤回。',
                ms: 'Dikembalikan selepas semakan kanan.',
                ta: 'மூத்தவர் மறுஆய்வில் மாற்றப்பட்டது.',
              },
            },
          },
        ],
      },
    },
    {
      id: 'family-meeting',
      department: 'ward',
      requiresAnyFlag: ['post-shock', 'financial-distress'],
      durationMin: 30,
      framing: {
        patient: {
          en: '(in bed listening; sometimes nodding.)',
          zh: '(躺在床上听着;偶尔点头。)',
          ms: '(di atas katil mendengar; kadang-kadang mengangguk.)',
          ta: '(படுக்கையில் கேட்டுக்கொண்டு; சில சமயம் தலையசைக்கிறார்.)',
        },
        caregiver: {
          en: 'You are in the family room with the consultant, the nurse manager, and the medical social worker. Nobody is rushing.',
          zh: '你和顾问医生、护士长、医务社工一起在家属室。没有人催促。',
          ms: 'Anda berada di bilik keluarga bersama perunding, pengurus jururawat, dan pekerja sosial perubatan. Tiada siapa tergesa-gesa.',
          ta: 'ஆலோசகர், செவிலியர் மேலாளர், மற்றும் மருத்துவ சமூக சேவகருடன் குடும்ப அறையில் இருக்கிறீர்கள். யாரும் அவசரப்படவில்லை.',
        },
        staff: {
          en: 'Family meeting: prognosis, GDMT, financial counselling, cardiac rehab eligibility, secondary-prevention plan.',
          zh: '家庭会议:预后、指南导向药物治疗、经济咨询、心脏康复资格、二级预防计划。',
          ms: 'Mesyuarat keluarga: prognosis, GDMT, kaunseling kewangan, kelayakan pemulihan jantung, pelan pencegahan sekunder.',
          ta: 'குடும்பக் கூட்டம்: முன்கணிப்பு, GDMT, நிதி ஆலோசனை, இருதய மறுவாழ்வு தகுதி, இரண்டாம்நிலை-தடுப்புத் திட்டம்.',
        },
      },
      decision: {
        id: 'financial-mitigation',
        prompt: {
          en: 'How do you address the financial-distress signal raised earlier?',
          zh: '你如何应对先前出现的经济困难信号?',
          ms: 'Bagaimana anda menangani isyarat tekanan kewangan yang dibangkitkan tadi?',
          ta: 'முன்னர் எழுப்பப்பட்ட நிதி-நெருக்கடி சமிக்ஞையை எவ்வாறு கையாள்வீர்கள்?',
        },
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'msw-medifund',
            label: {
              en: 'MSW activates Medifund, downgrade ward class going forward, structured Healthier-SG GP enrolment.',
              zh: '医务社工启动Medifund,后续降低病房等级,结构化加入Healthier SG家庭医生计划。',
              ms: 'MSW mengaktifkan Medifund, turunkan kelas wad seterusnya, pendaftaran GP Healthier-SG berstruktur.',
              ta: 'MSW Medifund-ஐ செயல்படுத்துகிறது, இனிமேல் வார்டு வகுப்பைக் குறைக்கிறது, கட்டமைக்கப்பட்ட Healthier-SG GP பதிவு.',
            },
            score: 10,
            rationale: {
              en: 'Catches financial toxicity before it derails GDMT adherence.',
              zh: '在经济毒性破坏药物依从性之前加以拦截。',
              ms: 'Menangani ketoksikan kewangan sebelum ia menjejaskan pematuhan GDMT.',
              ta: 'GDMT இணக்கத்தைக் கெடுப்பதற்கு முன் நிதி நச்சுத்தன்மையைக் கண்டறிகிறது.',
            },
            outcome: {
              patient: { en: '', zh: '', ms: '', ta: '' },
              caregiver: {
                en: 'You feel less alone.',
                zh: '你觉得不那么孤立无援了。',
                ms: 'Anda berasa kurang keseorangan.',
                ta: 'நீங்கள் தனிமையாக உணரவில்லை.',
              },
              staff: {
                en: 'Medifund + downgrade plan signed.',
                zh: 'Medifund + 降级方案已签署。',
                ms: 'Pelan Medifund + penurunan kelas ditandatangani.',
                ta: 'Medifund + வகுப்பு குறைப்பு திட்டம் கையெழுத்தானது.',
              },
            },
            effects: {
              wardClass: 'C',
              clearFlags: ['financial-distress'],
              caregiverBurden: { financialWorry: -16 },
            },
          },
          {
            id: 'no-mitigation',
            label: {
              en: 'Note the bill but no MSW intervention.',
              zh: '记录账单但不予医务社工介入。',
              ms: 'Catat bil tetapi tiada campur tangan MSW.',
              ta: 'மருத்துவ பில்லைக் குறிக்கவும் ஆனால் MSW தலையீடு இல்லை.',
            },
            score: -4,
            rationale: {
              en: 'Patient stops eplerenone within a month; predictable HF readmission.',
              zh: '患者一个月内自行停用依普利酮;可预见的心衰再入院。',
              ms: 'Pesakit berhenti eplerenone dalam sebulan; kemasukan semula HF boleh dijangka.',
              ta: 'நோயாளி ஒரு மாதத்திற்குள் eplerenone-ஐ நிறுத்துகிறார்; எதிர்பார்க்கக்கூடிய HF மறுசேர்க்கை.',
            },
            outcome: { patient: { en: '', zh: '', ms: '', ta: '' }, caregiver: { en: '', zh: '', ms: '', ta: '' }, staff: { en: '', zh: '', ms: '', ta: '' } },
          },
        ],
      },
    },
    {
      id: 'icu',
      department: 'icu',
      durationMin: 1440, // ~24 h
      costSGD: 950,
      charge: 'icu',
      caregiverBurden: { timeOffWorkHours: 16, financialWorry: 12, sleepDebt: 18 },
      framing: {
        patient: {
          en: 'Beeps. A long night. A nurse adjusts something on your arm every hour.',
          zh: '滴滴声。漫长的一夜。每隔一小时护士都来调整你手臂上的东西。',
          ms: 'Bunyi bip. Malam yang panjang. Seorang jururawat melaras sesuatu pada lengan anda setiap jam.',
          ta: 'பீப் ஒலிகள். ஒரு நீண்ட இரவு. ஒவ்வொரு மணி நேரமும் ஒரு செவிலியர் உங்கள் கையில் ஏதோ ஒன்றைச் சரிசெய்கிறார்.',
        },
        caregiver: {
          en: 'Visiting hours are restricted. You are told he is stable. You cry in the corridor.',
          zh: '探视时间受限。他们说他情况稳定。你在走廊里哭了。',
          ms: 'Waktu melawat dihadkan. Anda diberitahu dia stabil. Anda menangis di koridor.',
          ta: 'பார்வையிடும் நேரம் கட்டுப்படுத்தப்பட்டுள்ளது. அவர் நிலையாக இருக்கிறார் என்று சொல்கிறார்கள். நடைபாதையில் அழுகிறீர்கள்.',
        },
        staff: {
          en: '12-hour troponin trend down-trending. No arrhythmia. Echo: EF 40%, anterior hypokinesis.',
          zh: '12小时肌钙蛋白趋势下降。无心律失常。超声:射血分数40%,前壁运动减弱。',
          ms: 'Trend troponin 12 jam menurun. Tiada aritmia. Echo: EF 40%, hipokinesis anterior.',
          ta: '12-மணி நேர troponin போக்கு குறைகிறது. அரித்மியா இல்லை. எக்கோ: EF 40%, முன்புற ஹைப்போகைனீசிஸ்.',
        },
      },
      decision: {
        id: 'medical-therapy',
        prompt: {
          en: 'EF 40%, no contraindications. What guideline-directed medical therapy do you start before transfer to the ward?',
          zh: '射血分数40%,无禁忌证。转入普通病房前,你启动哪种指南导向药物治疗?',
          ms: 'EF 40%, tiada kontraindikasi. Terapi perubatan berpandukan garis panduan apa yang anda mulakan sebelum pemindahan ke wad?',
          ta: 'EF 40%, முரண்பாடுகள் இல்லை. வார்டுக்கு மாற்றுவதற்கு முன் எந்த வழிகாட்டுதல்-வழிநடத்தப்பட்ட மருத்துவ சிகிச்சையைத் தொடங்குவீர்கள்?',
        },
        weight: 1.5,
        reference: MOH_ACS,
        options: [
          {
            id: 'full-gdmt',
            label: {
              en: 'DAPT + high-intensity statin + ACE-inhibitor + beta-blocker + MRA (eplerenone given EF ≤ 40%).',
              zh: '双抗 + 高强度他汀 + ACE抑制剂 + β受体阻滞剂 + 醛固酮受体拮抗剂(因EF≤40%给予依普利酮)。',
              ms: 'DAPT + statin intensiti tinggi + perencat ACE + penyekat beta + MRA (eplerenone kerana EF ≤ 40%).',
              ta: 'DAPT + உயர்-தீவிர statin + ACE-தடுப்பான் + பீட்டா-தடுப்பான் + MRA (EF ≤ 40% என்பதால் eplerenone).',
            },
            score: 12,
            rationale: {
              en: 'Full guideline-directed medical therapy after STEMI with reduced EF. EPHESUS supports MRA in post-MI EF ≤ 40% with HF or DM.',
              zh: 'EF降低的STEMI后给予完整的指南导向药物治疗。EPHESUS支持心梗后EF≤40%伴心衰或糖尿病者使用醛固酮受体拮抗剂。',
              ms: 'Terapi perubatan berpandukan garis panduan penuh selepas STEMI dengan EF berkurang. EPHESUS menyokong MRA dalam EF ≤ 40% selepas MI dengan HF atau DM.',
              ta: 'குறைந்த EF உடன் STEMI-க்குப் பிறகு முழு வழிகாட்டுதல்-வழிநடத்தப்பட்ட மருத்துவ சிகிச்சை. HF அல்லது DM உடன் MI-க்குப் பிந்தைய EF ≤ 40%-இல் MRA-ஐ EPHESUS ஆதரிக்கிறது.',
            },
            outcome: {
              patient: {
                en: 'A box with five different tablets. The pharmacist explains them one by one.',
                zh: '一盒五种不同的药。药剂师逐一向你说明。',
                ms: 'Sebuah kotak dengan lima jenis pil. Ahli farmasi menerangkannya satu persatu.',
                ta: 'ஐந்து வெவ்வேறு மாத்திரைகள் கொண்ட ஒரு பெட்டி. மருந்தாளர் ஒவ்வொன்றாக விளக்குகிறார்.',
              },
              caregiver: {
                en: 'You take photos of each pill so you remember.',
                zh: '你给每种药都拍了照,以便记住。',
                ms: 'Anda mengambil gambar setiap pil supaya anda ingat.',
                ta: 'நினைவில் வைக்க ஒவ்வொரு மாத்திரையின் புகைப்படம் எடுக்கிறீர்கள்.',
              },
              staff: {
                en: 'GDMT charted. Nephrology/cards comfortable; biochemistry stable.',
                zh: 'GDMT已开立。肾内科/心内科满意;生化指标稳定。',
                ms: 'GDMT dicatat. Nefrologi/kardiologi selesa; biokimia stabil.',
                ta: 'GDMT பதிவு செய்யப்பட்டது. சிறுநீரகவியல்/இருதயவியல் திருப்தி; உயிர்வேதியியல் நிலையானது.',
              },
            },
          },
          {
            id: 'partial-gdmt',
            label: {
              en: 'DAPT + statin + beta-blocker only — defer ACE-i / MRA to outpatient.',
              zh: '仅双抗 + 他汀 + β受体阻滞剂 — 将ACE抑制剂/醛固酮拮抗剂延至门诊。',
              ms: 'DAPT + statin + penyekat beta sahaja — tangguhkan ACE-i / MRA ke pesakit luar.',
              ta: 'DAPT + statin + பீட்டா-தடுப்பான் மட்டும் — ACE-i / MRA-ஐ வெளிநோயாளிக்குத் தள்ளிப்போடவும்.',
            },
            score: 6,
            rationale: {
              en: 'Acceptable in some patients, but in-hospital initiation of ACE-i and (if EF ≤ 40%) MRA is associated with better adherence and outcomes.',
              zh: '部分患者可接受,但住院期间启动ACE抑制剂及(EF≤40%时)醛固酮拮抗剂与更好的依从性和结局相关。',
              ms: 'Boleh diterima pada sesetengah pesakit, tetapi permulaan ACE-i dalam hospital dan (jika EF ≤ 40%) MRA dikaitkan dengan pematuhan dan hasil yang lebih baik.',
              ta: 'சில நோயாளிகளில் ஏற்கத்தக்கது, ஆனால் மருத்துவமனைக்குள் ACE-i மற்றும் (EF ≤ 40% எனில்) MRA தொடங்குவது சிறந்த இணக்கம் மற்றும் முடிவுகளுடன் தொடர்புடையது.',
            },
            outcome: {
              patient: {
                en: 'Three tablets. Easier to remember.',
                zh: '三片药。比较好记。',
                ms: 'Tiga pil. Lebih mudah diingat.',
                ta: 'மூன்று மாத்திரைகள். நினைவில் வைக்க எளிது.',
              },
              caregiver: { en: '', zh: '', ms: '', ta: '' },
              staff: {
                en: 'SOC team will need to up-titrate later — adherence often slips.',
                zh: '专科门诊团队日后需逐步加量 — 依从性常常下滑。',
                ms: 'Pasukan SOC perlu menambah dos kemudian — pematuhan sering merosot.',
                ta: 'SOC குழு பின்னர் அளவை அதிகரிக்க வேண்டும் — இணக்கம் அடிக்கடி குறைகிறது.',
              },
            },
          },
          {
            id: 'minimal-gdmt',
            label: {
              en: 'DAPT only.',
              zh: '仅双抗。',
              ms: 'DAPT sahaja.',
              ta: 'DAPT மட்டும்.',
            },
            score: -2,
            rationale: {
              en: 'Misses the mortality benefit of statin and neurohormonal blockade post-STEMI.',
              zh: '错失STEMI后他汀及神经体液阻断的降死亡率获益。',
              ms: 'Terlepas manfaat kematian statin dan sekatan neurohormon selepas STEMI.',
              ta: 'STEMI-க்குப் பிறகு statin மற்றும் நரம்பு-ஹார்மோன் தடையின் இறப்பு நன்மையை இழக்கிறது.',
            },
            outcome: {
              patient: { en: '', zh: '', ms: '', ta: '' },
              caregiver: { en: '', zh: '', ms: '', ta: '' },
              staff: {
                en: 'Consultant queries the missing therapies on round.',
                zh: '查房时顾问医生质询缺失的治疗。',
                ms: 'Perunding mempersoalkan terapi yang tertinggal semasa rawatan.',
                ta: 'சுற்றுப்பயணத்தில் ஆலோசகர் விடுபட்ட சிகிச்சைகளை வினவுகிறார்.',
              },
            },
          },
        ],
      },
    },
    {
      id: 'ward',
      department: 'ward',
      durationMin: 4320, // 3 days
      costSGD: 1100,
      charge: 'inpatient-ward',
      caregiverBurden: { timeOffWorkHours: 12, financialWorry: 22, sleepDebt: 10 },
      framing: {
        patient: {
          en: 'Day 2 — the curtain neighbour snores. The food is bland. You start to think about going home, your taxi rental, your bills.',
          zh: '第二天 — 帘子那边的病友打鼾。饭菜寡淡。你开始想回家、想出租车租金、想各种账单。',
          ms: 'Hari ke-2 — jiran sebelah tirai berdengkur. Makanan tawar. Anda mula memikirkan untuk pulang, sewa teksi, bil-bil anda.',
          ta: '2-ஆம் நாள் — திரைக்கு அப்பால் உள்ள அண்டை நோயாளி குறட்டை விடுகிறார். உணவு சுவையற்றது. வீடு திரும்புவது, உங்கள் டாக்ஸி வாடகை, உங்கள் பில்கள் பற்றி நினைக்கத் தொடங்குகிறீர்கள்.',
        },
        caregiver: {
          en: 'You ask the medical social worker about MediSave and MediShield Life. You worry about the next instalment on the flat.',
          zh: '你向医务社工询问MediSave和MediShield Life。你为组屋的下一期供款发愁。',
          ms: 'Anda bertanya kepada pekerja sosial perubatan tentang MediSave dan MediShield Life. Anda bimbang tentang ansuran rumah pangsa seterusnya.',
          ta: 'MediSave மற்றும் MediShield Life பற்றி மருத்துவ சமூக சேவகரிடம் கேட்கிறீர்கள். வீட்டின் அடுத்த தவணை பற்றி கவலைப்படுகிறீர்கள்.',
        },
        staff: {
          en: 'Ambulating, no chest pain, no arrhythmia. MSW engaged for financial counselling. Cardiac rehab referral made.',
          zh: '可下床活动,无胸痛,无心律失常。已请医务社工进行经济咨询。已转介心脏康复。',
          ms: 'Bergerak, tiada sakit dada, tiada aritmia. MSW dilibatkan untuk kaunseling kewangan. Rujukan pemulihan jantung dibuat.',
          ta: 'நடமாடுகிறார், மார்பு வலி இல்லை, அரித்மியா இல்லை. நிதி ஆலோசனைக்கு MSW ஈடுபடுத்தப்பட்டது. இருதய மறுவாழ்வு பரிந்துரை செய்யப்பட்டது.',
        },
      },
      decision: {
        id: 'subsidy-class',
        prompt: {
          en: 'The medical social worker asks about ward class and financing. The patient is a Singaporean taxi driver, household income S$2,400/mo, no Integrated Shield Plan, has CHAS Orange.',
          zh: '医务社工询问病房等级与费用安排。患者是新加坡出租车司机,家庭月收入2,400新元,无综合健保计划,持CHAS橙色卡。',
          ms: 'Pekerja sosial perubatan bertanya tentang kelas wad dan pembiayaan. Pesakit ialah pemandu teksi Singapura, pendapatan isi rumah S$2,400/bulan, tiada Pelan Perisai Bersepadu, ada CHAS Orange.',
          ta: 'மருத்துவ சமூக சேவகர் வார்டு வகுப்பு மற்றும் நிதி பற்றி கேட்கிறார். நோயாளி ஒரு சிங்கப்பூர் டாக்ஸி ஓட்டுநர், குடும்ப வருமானம் S$2,400/மாதம், ஒருங்கிணைந்த ஷீல்ட் திட்டம் இல்லை, CHAS Orange உள்ளது.',
        },
        weight: 0.8,
        reference: {
          label: {
            en: 'MOH ward class subsidy framework',
            zh: '卫生部病房等级补贴框架',
            ms: 'Rangka kerja subsidi kelas wad MOH',
            ta: 'MOH வார்டு வகுப்பு மானியக் கட்டமைப்பு',
          },
          body: {
            en: 'Means-tested subsidies for ward classes B2 and C in restructured hospitals.',
            zh: '重组医院B2和C级病房的家计调查式补贴。',
            ms: 'Subsidi diuji-cara untuk kelas wad B2 dan C di hospital yang distruktur semula.',
            ta: 'மறுசீரமைக்கப்பட்ட மருத்துவமனைகளில் B2 மற்றும் C வார்டு வகுப்புகளுக்கு வருமான-சோதனை மானியங்கள்.',
          },
        },
        options: [
          {
            id: 'class-c',
            label: {
              en: 'Class C ward (highest subsidy, ~80%).',
              zh: 'C级病房(最高补贴,约80%)。',
              ms: 'Wad Kelas C (subsidi tertinggi, ~80%).',
              ta: 'வகுப்பு C வார்டு (அதிக மானியம், ~80%).',
            },
            score: 10,
            rationale: {
              en: 'Means-tested subsidy aligns with household income. Reduces caregiver financial stress and out-of-pocket; MediShield Life covers the bulk of remaining bill.',
              zh: '家计调查式补贴与家庭收入相匹配。减轻照护者经济压力和自付费用;MediShield Life覆盖剩余账单的大部分。',
              ms: 'Subsidi diuji-cara sejajar dengan pendapatan isi rumah. Mengurangkan tekanan kewangan penjaga dan kos sendiri; MediShield Life menanggung sebahagian besar baki bil.',
              ta: 'வருமான-சோதனை மானியம் குடும்ப வருமானத்துடன் ஒத்துப்போகிறது. பராமரிப்பாளரின் நிதி அழுத்தம் மற்றும் சொந்த-செலவைக் குறைக்கிறது; மீதமுள்ள பில்லின் பெரும்பகுதியை MediShield Life ஈடுசெய்கிறது.',
            },
            outcome: {
              patient: {
                en: 'Same care, shared cubicle. Manageable bill.',
                zh: '同样的护理,共用病室。账单可承受。',
                ms: 'Penjagaan sama, kubikel berkongsi. Bil boleh diuruskan.',
                ta: 'அதே பராமரிப்பு, பகிரப்பட்ட அறை. சமாளிக்கக்கூடிய பில்.',
              },
              caregiver: {
                en: 'Relief — you can see the figures and they are workable.',
                zh: '松了口气 — 你看到了数字,觉得能应付。',
                ms: 'Lega — anda dapat melihat angkanya dan ia munasabah.',
                ta: 'நிம்மதி — நீங்கள் எண்களைப் பார்க்க முடிகிறது, அவை சமாளிக்கக்கூடியவை.',
              },
              staff: {
                en: 'MSW happy. Bill estimated S$1,400 patient share.',
                zh: '医务社工满意。估算患者自付约1,400新元。',
                ms: 'MSW gembira. Bil dianggar bahagian pesakit S$1,400.',
                ta: 'MSW மகிழ்ச்சி. நோயாளி பங்கு பில் தோராயமாக S$1,400.',
              },
            },
            effects: { wardClass: 'C' },
          },
          {
            id: 'class-b1',
            label: {
              en: 'Class B1 (modest subsidy ~20%).',
              zh: 'B1级(适度补贴约20%)。',
              ms: 'Kelas B1 (subsidi sederhana ~20%).',
              ta: 'வகுப்பு B1 (மிதமான மானியம் ~20%).',
            },
            score: 3,
            rationale: {
              en: 'Patient still has access to subsidised doctors but room amenity does not change clinical outcomes. Likely large unsubsidised portion.',
              zh: '患者仍可享受补贴医生服务,但病房条件不改变临床结局。很可能有大笔未补贴部分。',
              ms: 'Pesakit masih mendapat doktor bersubsidi tetapi kemudahan bilik tidak mengubah hasil klinikal. Berkemungkinan bahagian tidak bersubsidi yang besar.',
              ta: 'நோயாளிக்கு மானிய மருத்துவர்கள் இன்னும் கிடைக்கிறார்கள் ஆனால் அறை வசதி மருத்துவ முடிவுகளை மாற்றாது. பெரிய மானியமற்ற பகுதி இருக்கலாம்.',
            },
            outcome: {
              patient: {
                en: 'Slightly nicer cubicle. The bill is an unwelcome surprise.',
                zh: '病室稍好些。账单却是个不受欢迎的意外。',
                ms: 'Kubikel sedikit lebih baik. Bil itu kejutan yang tidak diingini.',
                ta: 'சற்று நல்ல அறை. பில் ஒரு விரும்பத்தகாத அதிர்ச்சி.',
              },
              caregiver: {
                en: 'You discover the bill at discharge and panic.',
                zh: '你在出院时才发现账单,惊慌失措。',
                ms: 'Anda mendapati bil semasa discaj dan panik.',
                ta: 'வெளியேற்றத்தின்போது பில்லைக் கண்டு பீதியடைகிறீர்கள்.',
              },
              staff: {
                en: 'MSW flags financial distress. Bill reduction application initiated post-discharge.',
                zh: '医务社工标记经济困难。出院后启动账单减免申请。',
                ms: 'MSW menanda tekanan kewangan. Permohonan pengurangan bil dimulakan selepas discaj.',
                ta: 'MSW நிதி நெருக்கடியைக் குறிக்கிறது. வெளியேற்றத்திற்குப் பிறகு பில் குறைப்பு விண்ணப்பம் தொடங்கப்பட்டது.',
              },
            },
            effects: {
              wardClass: 'B1',
              caregiverBurden: { financialWorry: 12, sleepDebt: 4 },
            },
          },
          {
            id: 'class-a',
            label: {
              en: 'Class A (no subsidy, single room).',
              zh: 'A级(无补贴,单人房)。',
              ms: 'Kelas A (tiada subsidi, bilik tunggal).',
              ta: 'வகுப்பு A (மானியம் இல்லை, தனி அறை).',
            },
            score: -4,
            rationale: {
              en: 'No clinical benefit; substantial financial harm to a low-income patient without an Integrated Shield Plan.',
              zh: '无临床获益;对无综合健保计划的低收入患者造成重大经济伤害。',
              ms: 'Tiada manfaat klinikal; bahaya kewangan ketara kepada pesakit berpendapatan rendah tanpa Pelan Perisai Bersepadu.',
              ta: 'மருத்துவ நன்மை இல்லை; ஒருங்கிணைந்த ஷீல்ட் திட்டம் இல்லாத குறைந்த வருமான நோயாளிக்கு கணிசமான நிதி தீங்கு.',
            },
            outcome: {
              patient: {
                en: 'A nice room, but the bill at discharge is devastating.',
                zh: '房间不错,但出院账单令人崩溃。',
                ms: 'Bilik yang selesa, tetapi bil semasa discaj amat membebankan.',
                ta: 'நல்ல அறை, ஆனால் வெளியேற்றத்தின்போது பில் பேரழிவு.',
              },
              caregiver: {
                en: 'You apply for Medifund after discharge.',
                zh: '你在出院后申请Medifund。',
                ms: 'Anda memohon Medifund selepas discaj.',
                ta: 'வெளியேற்றத்திற்குப் பிறகு Medifund-க்கு விண்ணப்பிக்கிறீர்கள்.',
              },
              staff: {
                en: 'MSW unhappy. Avoidable financial toxicity.',
                zh: '医务社工不满。本可避免的经济毒性。',
                ms: 'MSW tidak gembira. Ketoksikan kewangan yang boleh dielakkan.',
                ta: 'MSW அதிருப்தி. தவிர்க்கக்கூடிய நிதி நச்சுத்தன்மை.',
              },
            },
            effects: {
              wardClass: 'A',
              setFlags: ['financial-distress'],
              caregiverBurden: { financialWorry: 30, sleepDebt: 14 },
            },
          },
        ],
      },
    },
    {
      id: 'pharmacy',
      department: 'pharmacy',
      durationMin: 30,
      costSGD: 80,
      charge: 'pharmacy',
      framing: {
        patient: {
          en: 'The pharmacist asks if you smoke. You lie a little. She gives you a smoking-cessation pamphlet anyway.',
          zh: '药剂师问你是否吸烟。你撒了点小谎。她还是给了你一份戒烟手册。',
          ms: 'Ahli farmasi bertanya jika anda merokok. Anda menipu sedikit. Dia tetap memberi anda risalah berhenti merokok.',
          ta: 'நீங்கள் புகைபிடிக்கிறீர்களா என்று மருந்தாளர் கேட்கிறார். நீங்கள் சிறிது பொய் சொல்கிறீர்கள். எப்படியும் அவர் புகைபிடித்தலை நிறுத்தும் துண்டுப்பிரசுரத்தைக் கொடுக்கிறார்.',
        },
        caregiver: {
          en: 'You ask about side-effects of each tablet and write them down.',
          zh: '你询问每种药的副作用并记录下来。',
          ms: 'Anda bertanya tentang kesan sampingan setiap pil dan mencatatnya.',
          ta: 'ஒவ்வொரு மாத்திரையின் பக்கவிளைவுகள் பற்றி கேட்டு எழுதி வைக்கிறீர்கள்.',
        },
        staff: {
          en: 'Adherence counselling done. NEHR updated; SOC and rehab appointments printed.',
          zh: '已完成依从性辅导。NEHR已更新;专科门诊和康复预约已打印。',
          ms: 'Kaunseling pematuhan selesai. NEHR dikemas kini; temujanji SOC dan pemulihan dicetak.',
          ta: 'இணக்க ஆலோசனை முடிந்தது. NEHR புதுப்பிக்கப்பட்டது; SOC மற்றும் மறுவாழ்வு சந்திப்புகள் அச்சிடப்பட்டன.',
        },
      },
    },
    {
      id: 'discharge',
      department: 'discharge',
      durationMin: 20,
      framing: {
        patient: {
          en: 'Hospital exit smells different. The taxi-stand sign feels strangely emotional.',
          zh: '医院出口的气味不一样了。出租车站的牌子莫名让你动容。',
          ms: 'Pintu keluar hospital berbau berbeza. Papan tanda perhentian teksi terasa pelik mengharukan.',
          ta: 'மருத்துவமனை வெளியேறும் வாசல் வித்தியாசமாக மணக்கிறது. டாக்ஸி நிலைய அடையாளம் விசித்திரமாக உணர்ச்சிபூர்வமாக இருக்கிறது.',
        },
        caregiver: {
          en: 'You take a Grab home together. You both stay quiet.',
          zh: '你们一起叫Grab回家。两人都沉默不语。',
          ms: 'Anda berdua menaiki Grab pulang. Kedua-duanya berdiam diri.',
          ta: 'நீங்கள் இருவரும் சேர்ந்து Grab-இல் வீடு திரும்புகிறீர்கள். இருவரும் அமைதியாக இருக்கிறீர்கள்.',
        },
        staff: {
          en: 'Discharge summary uploaded to NEHR; cardiac rehab and SOC appointments confirmed.',
          zh: '出院小结已上传至NEHR;心脏康复和专科门诊预约已确认。',
          ms: 'Ringkasan discaj dimuat naik ke NEHR; temujanji pemulihan jantung dan SOC disahkan.',
          ta: 'வெளியேற்ற சுருக்கம் NEHR-க்கு பதிவேற்றப்பட்டது; இருதய மறுவாழ்வு மற்றும் SOC சந்திப்புகள் உறுதி.',
        },
      },
      decision: {
        id: 'right-siting',
        prompt: {
          en: 'For ongoing chronic-disease management (HTN, dyslipidaemia, post-MI follow-up beyond the first review), where should this patient be right-sited?',
          zh: '对于长期慢性病管理(高血压、血脂异常、首次复诊之后的心梗随访),该患者应右置于何处?',
          ms: 'Untuk pengurusan penyakit kronik berterusan (HTN, dislipidemia, susulan selepas MI selepas semakan pertama), di mana pesakit ini perlu ditempatkan tepat?',
          ta: 'தொடரும் நாள்பட்ட நோய் மேலாண்மைக்கு (HTN, டிஸ்லிபிடீமியா, முதல் மதிப்பாய்வுக்கு அப்பால் MI-க்குப் பிந்தைய பின்தொடர்தல்), இந்த நோயாளி எங்கே சரியாக வைக்கப்பட வேண்டும்?',
        },
        weight: 1,
        reference: HEALTHIER_SG,
        options: [
          {
            id: 'healthier-sg-gp',
            label: {
              en: 'Enrol with a Healthier SG GP near home; cardiology SOC for review at 2 weeks then 3 months, then annually.',
              zh: '在家附近加入Healthier SG家庭医生;心内科专科门诊于2周后、3个月后复诊,之后每年一次。',
              ms: 'Daftar dengan GP Healthier SG berdekatan rumah; SOC kardiologi untuk semakan pada 2 minggu kemudian 3 bulan, kemudian tahunan.',
              ta: 'வீட்டிற்கு அருகில் Healthier SG GP-உடன் பதிவு செய்யுங்கள்; இருதயவியல் SOC 2 வாரங்களில், பின் 3 மாதங்களில், பின் ஆண்டுதோறும் மதிப்பாய்வுக்கு.',
            },
            score: 10,
            rationale: {
              en: 'Healthier SG enrolment provides continuity, subsidised chronic medications via CDMP, and offloads stable follow-up from tertiary clinics.',
              zh: 'Healthier SG提供连续性照护、通过CDMP获得补贴的慢性病药物,并将稳定随访从三级诊所分流。',
              ms: 'Pendaftaran Healthier SG menyediakan kesinambungan, ubat kronik bersubsidi melalui CDMP, dan mengurangkan susulan stabil daripada klinik tertiari.',
              ta: 'Healthier SG பதிவு தொடர்ச்சியை வழங்குகிறது, CDMP மூலம் மானிய நாள்பட்ட மருந்துகள், மற்றும் மூன்றாம்நிலை கிளினிக்குகளிலிருந்து நிலையான பின்தொடர்தலைக் குறைக்கிறது.',
            },
            outcome: {
              patient: {
                en: 'A GP near your block; appointments are easier to make.',
                zh: '组屋附近的家庭医生;预约更方便。',
                ms: 'GP berdekatan blok anda; temujanji lebih mudah dibuat.',
                ta: 'உங்கள் வீட்டுத் தொகுதிக்கு அருகில் ஒரு GP; சந்திப்புகள் எளிதாக ஏற்படுத்தலாம்.',
              },
              caregiver: {
                en: 'Less travel; less time off work for you.',
                zh: '少奔波;你也少请假。',
                ms: 'Kurang perjalanan; kurang cuti kerja untuk anda.',
                ta: 'குறைந்த பயணம்; உங்களுக்கு வேலையில் குறைந்த விடுப்பு.',
              },
              staff: {
                en: 'SOC schedules 2-week review then plans handover to GP.',
                zh: '专科门诊安排2周复诊,然后计划交接给家庭医生。',
                ms: 'SOC menjadualkan semakan 2 minggu kemudian merancang penyerahan kepada GP.',
                ta: 'SOC 2-வார மதிப்பாய்வை திட்டமிட்டு பின் GP-க்கு ஒப்படைப்பைத் திட்டமிடுகிறது.',
              },
            },
          },
          {
            id: 'soc-only',
            label: {
              en: 'Long-term cardiology SOC only — no GP enrolment.',
              zh: '仅长期心内科专科门诊 — 不加入家庭医生计划。',
              ms: 'SOC kardiologi jangka panjang sahaja — tiada pendaftaran GP.',
              ta: 'நீண்டகால இருதயவியல் SOC மட்டும் — GP பதிவு இல்லை.',
            },
            score: 4,
            rationale: {
              en: 'Specialist-led care is appropriate early but indefinite SOC follow-up for stable patients clogs tertiary clinics and inflates patient cost over time.',
              zh: '早期专科主导照护是合适的,但对稳定患者无限期的专科门诊随访会堵塞三级诊所并随时间推高患者费用。',
              ms: 'Penjagaan dipimpin pakar sesuai pada peringkat awal tetapi susulan SOC tanpa had untuk pesakit stabil menyesakkan klinik tertiari dan meningkatkan kos pesakit dari masa ke masa.',
              ta: 'நிபுணர்-தலைமையிலான பராமரிப்பு ஆரம்பத்தில் பொருத்தமானது ஆனால் நிலையான நோயாளிகளுக்கு வரம்பற்ற SOC பின்தொடர்தல் மூன்றாம்நிலை கிளினிக்குகளை நிரப்பி காலப்போக்கில் நோயாளி செலவை உயர்த்துகிறது.',
            },
            outcome: {
              patient: {
                en: 'Long waits at SOC every 6 months.',
                zh: '每6个月在专科门诊长时间等候。',
                ms: 'Menunggu lama di SOC setiap 6 bulan.',
                ta: 'ஒவ்வொரு 6 மாதங்களுக்கும் SOC-இல் நீண்ட காத்திருப்பு.',
              },
              caregiver: {
                en: 'Repeated half-days off work.',
                zh: '一次次请半天假。',
                ms: 'Berulang kali cuti separuh hari.',
                ta: 'மீண்டும் மீண்டும் அரை-நாள் வேலை விடுப்பு.',
              },
              staff: {
                en: 'SOC slots for new STEMIs squeezed.',
                zh: '新发STEMI的专科门诊号源被挤占。',
                ms: 'Slot SOC untuk STEMI baru terhimpit.',
                ta: 'புதிய STEMI-களுக்கான SOC இடங்கள் நெரிசலாகின்றன.',
              },
            },
          },
          {
            id: 'no-followup',
            label: {
              en: 'Discharge with no structured follow-up beyond 2 weeks.',
              zh: '出院后除2周外无结构化随访。',
              ms: 'Discaj tanpa susulan berstruktur melebihi 2 minggu.',
              ta: '2 வாரங்களுக்கு அப்பால் கட்டமைக்கப்பட்ட பின்தொடர்தல் இல்லாமல் வெளியேற்றம்.',
            },
            score: -5,
            rationale: {
              en: 'Post-MI patients without follow-up have worse adherence to GDMT and higher 1-year recurrence/death.',
              zh: '心梗后无随访的患者GDMT依从性更差,1年复发/死亡率更高。',
              ms: 'Pesakit selepas MI tanpa susulan mempunyai pematuhan GDMT yang lebih teruk dan kekambuhan/kematian 1-tahun yang lebih tinggi.',
              ta: 'பின்தொடர்தல் இல்லாத MI-க்குப் பிந்தைய நோயாளிகளுக்கு GDMT இணக்கம் மோசமாகவும் 1-ஆண்டு மறுநிகழ்வு/இறப்பு அதிகமாகவும் இருக்கும்.',
            },
            outcome: {
              patient: {
                en: 'You stop the eplerenone after a month because it is unfamiliar.',
                zh: '一个月后你因为不熟悉而停用了依普利酮。',
                ms: 'Anda berhenti eplerenone selepas sebulan kerana ia asing.',
                ta: 'அறிமுகமில்லாததால் ஒரு மாதத்திற்குப் பிறகு eplerenone-ஐ நிறுத்துகிறீர்கள்.',
              },
              caregiver: {
                en: 'You worry but don\'t know who to call.',
                zh: '你很担心,却不知道该打给谁。',
                ms: 'Anda bimbang tetapi tidak tahu siapa untuk dihubungi.',
                ta: 'நீங்கள் கவலைப்படுகிறீர்கள் ஆனால் யாரை அழைப்பது என்று தெரியவில்லை.',
              },
              staff: {
                en: 'Recurrent admission within 6 months for decompensated HF.',
                zh: '6个月内因心衰失代偿再次入院。',
                ms: 'Kemasukan berulang dalam 6 bulan kerana HF terdekompensasi.',
                ta: 'மீளாக்க HF-க்காக 6 மாதங்களுக்குள் மீண்டும் சேர்க்கை.',
              },
            },
          },
        ],
      },
    },
    {
      id: 'soc',
      department: 'soc',
      durationMin: 45,
      costSGD: 110,
      charge: 'soc',
      caregiverBurden: { timeOffWorkHours: 4, financialWorry: 4, sleepDebt: 0 },
      framing: {
        patient: {
          en: 'Two weeks later. The waiting room is full. You are nervous about the bill.',
          zh: '两周后。候诊室坐满了人。你为账单忐忑不安。',
          ms: 'Dua minggu kemudian. Bilik menunggu penuh. Anda gementar tentang bil.',
          ta: 'இரண்டு வாரங்களுக்குப் பிறகு. காத்திருப்பு அறை நிறைந்திருக்கிறது. பில் பற்றி நீங்கள் பதற்றமாக இருக்கிறீர்கள்.',
        },
        caregiver: {
          en: 'You took half a day off work to come.',
          zh: '你请了半天假陪同前来。',
          ms: 'Anda mengambil cuti separuh hari untuk datang.',
          ta: 'வர அரை நாள் வேலை விடுப்பு எடுத்தீர்கள்.',
        },
        staff: {
          en: 'Patient ambulating well, minor bruising at radial site, no chest pain. Up-titrated bisoprolol.',
          zh: '患者活动良好,桡动脉穿刺处轻微淤青,无胸痛。比索洛尔加量。',
          ms: 'Pesakit bergerak dengan baik, lebam kecil di tapak radial, tiada sakit dada. Bisoprolol ditambah dos.',
          ta: 'நோயாளி நன்றாக நடமாடுகிறார், ரேடியல் இடத்தில் சிறிய காயம், மார்பு வலி இல்லை. bisoprolol அளவு உயர்த்தப்பட்டது.',
        },
      },
    },
    {
      id: 'rehab',
      department: 'rehab',
      durationMin: 60,
      costSGD: 70,
      charge: 'rehab',
      caregiverBurden: { timeOffWorkHours: 2, financialWorry: -8, sleepDebt: -10 },
      framing: {
        patient: {
          en: 'The treadmill is slower than you thought. The physiotherapist tells you you can return to driving in two more weeks.',
          zh: '跑步机比你想的慢。理疗师告诉你再过两周就能恢复开车。',
          ms: 'Treadmill lebih perlahan daripada yang anda sangka. Ahli fisioterapi memberitahu anda boleh memandu semula dalam dua minggu lagi.',
          ta: 'டிரெட்மில் நீங்கள் நினைத்ததை விட மெதுவாக உள்ளது. இன்னும் இரண்டு வாரங்களில் வாகனம் ஓட்டத் திரும்பலாம் என்று உடற்பயிற்சியாளர் சொல்கிறார்.',
        },
        caregiver: {
          en: 'You sit in the corridor reading. For the first time since the ambulance, you breathe out.',
          zh: '你坐在走廊里看书。自救护车那夜以来,你第一次松了一口气。',
          ms: 'Anda duduk di koridor membaca. Buat pertama kali sejak ambulans, anda menghela nafas lega.',
          ta: 'நடைபாதையில் அமர்ந்து படிக்கிறீர்கள். ஆம்புலன்ஸுக்குப் பிறகு முதல் முறையாக, நிம்மதியாக மூச்சு விடுகிறீர்கள்.',
        },
        staff: {
          en: 'Phase II cardiac rehab session 1/12. Risk-factor counselling: smoking cessation referral made.',
          zh: '第二阶段心脏康复第1/12次。危险因素辅导:已转介戒烟。',
          ms: 'Sesi pemulihan jantung Fasa II 1/12. Kaunseling faktor risiko: rujukan berhenti merokok dibuat.',
          ta: 'கட்டம் II இருதய மறுவாழ்வு அமர்வு 1/12. அபாய-காரணி ஆலோசனை: புகைபிடித்தலை நிறுத்த பரிந்துரை செய்யப்பட்டது.',
        },
      },
    },
  ],
};
