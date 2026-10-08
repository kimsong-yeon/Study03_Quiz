const CATEGORIES = ["한국사", "세계지리", "과학", "예술과 문화"];

const QUESTIONS = [
  // 한국사
  {
    id: "kh-01",
    category: "한국사",
    question: "1443년 훈민정음을 창제한 조선의 왕은?",
    choices: ["세종", "태종", "세조", "성종"],
    answer: 0,
    explanation: "세종이 1443년(세종 25) 겨울에 훈민정음을 창제했고, 1446년 9월에 반포했어요.",
    source: "한국민족문화대백과사전 「훈민정음」, https://encykorea.aks.ac.kr/Article/E0065805"
  },
  {
    id: "kh-02",
    category: "한국사",
    question: "918년 궁예를 몰아내고 고려를 세운 인물은?",
    choices: ["견훤", "왕건", "경순왕", "최영"],
    answer: 1,
    explanation: "왕건은 918년 6월 궁예를 내쫓고 새 왕조 고려의 태조가 되었어요.",
    source: "한국민족문화대백과사전 「태조(고려)」, https://encykorea.aks.ac.kr/Article/E0059032"
  },
  {
    id: "kh-03",
    category: "한국사",
    question: "1592년 한산도 앞바다에서 일본 수군 주력을 무찌른 한산도 대첩 당시의 전라좌수사는?",
    choices: ["권율", "김시민", "이순신", "곽재우"],
    answer: 2,
    explanation: "한산도 대첩은 1592년 7월 전라좌수사 이순신 등이 이끈 조선 수군이 일본 수군 주력을 무찌른 해전이에요.",
    source: "한국민족문화대백과사전 「한산도대첩」, https://encykorea.aks.ac.kr/Article/E0061676"
  },
  {
    id: "kh-04",
    category: "한국사",
    question: "거족적인 독립 만세 운동인 3·1 운동이 일어난 해는?",
    choices: ["1910년", "1926년", "1945년", "1919년"],
    answer: 3,
    explanation: "3·1 운동은 1919년 3월 1일을 기해 일어난 거족적인 독립 만세 운동이에요.",
    source: "한국민족문화대백과사전 「3·1운동」, https://encykorea.aks.ac.kr/Article/E0026772"
  },
  {
    id: "kh-05",
    category: "한국사",
    question: "주몽(동명성왕)이 기원전 37년에 세운 나라는?",
    choices: ["고구려", "백제", "신라", "부여"],
    answer: 0,
    explanation: "동명성왕(주몽)은 기원전 37년 나라를 세워 고구려라 하였고, 고구려의 제1대 왕이에요.",
    source: "한국민족문화대백과사전 「동명성왕」, https://encykorea.aks.ac.kr/Article/E0016431"
  },
  {
    id: "kh-06",
    category: "한국사",
    question: "698년 발해(처음 국호는 진)를 세운 인물은?",
    choices: ["연개소문", "대조영", "을지문덕", "장보고"],
    answer: 1,
    explanation: "고왕 대조영은 698년 국호를 진(震)으로 하여 나라를 세웠고, 713년부터 발해라는 국호를 썼어요.",
    source: "한국민족문화대백과사전 「고왕」, https://encykorea.aks.ac.kr/Article/E0003841"
  },
  {
    id: "kh-07",
    category: "한국사",
    question: "고려 고종 때 새긴 팔만대장경(고려대장경판)이 현재 보관된 사찰은?",
    choices: ["불국사", "송광사", "해인사", "통도사"],
    answer: 2,
    explanation: "고려 고종 때 새긴 고려대장경판은 현재 경남 합천의 해인사에 소장되어 있어요.",
    source: "한국민족문화대백과사전 「합천 해인사 대장경판」, https://encykorea.aks.ac.kr/Article/E0062711"
  },
  {
    id: "kh-08",
    category: "한국사",
    question: "이성계가 공양왕을 몰아내고 새 왕조(조선)의 태조로 왕위에 오른 해는?",
    choices: ["1388년", "1394년", "1400년", "1392년"],
    answer: 3,
    explanation: "이성계는 1392년 7월 공양왕을 원주로 내쫓고 새 왕조의 태조로 왕위에 올랐어요.",
    source: "한국민족문화대백과사전 「태조(조선)」, https://encykorea.aks.ac.kr/Article/E0059033"
  },
  {
    id: "kh-09",
    category: "한국사",
    question: "1919년 4월 11일 대한민국 임시 정부가 수립된 도시는?",
    choices: ["상하이", "충칭", "베이징", "블라디보스토크"],
    answer: 0,
    explanation: "대한민국 임시 정부는 1919년 4월 11일 중국 상하이에서 수립되었어요.",
    source: "한국민족문화대백과사전 「대한민국 임시정부 수립 기념일」, https://encykorea.aks.ac.kr/Article/E0080590"
  },
  {
    id: "kh-10",
    category: "한국사",
    question: "1434년 세종의 명으로 만든, 하늘을 우러르는 가마솥 모양의 해시계는?",
    choices: ["자격루", "앙부일구", "측우기", "혼천의"],
    answer: 1,
    explanation: "앙부일구는 1434년에 만든 조선의 해시계로, 모양이 하늘을 우러르는 가마솥 같다 해서 붙은 이름이에요.",
    source: "한국민족문화대백과사전 「앙부일구」, https://encykorea.aks.ac.kr/Article/E0035191"
  },

  // 세계지리
  {
    id: "wg-01",
    category: "세계지리",
    question: "오스트레일리아(호주)의 수도는?",
    choices: ["시드니", "멜버른", "캔버라", "퍼스"],
    answer: 2,
    explanation: "오스트레일리아의 수도는 캔버라예요. 시드니와 멜버른은 큰 도시이지만 수도는 아니에요.",
    source: "한국민족문화대백과사전 「오스트레일리아」, https://encykorea.aks.ac.kr/Article/E0038381"
  },
  {
    id: "wg-02",
    category: "세계지리",
    question: "캐나다의 수도는?",
    choices: ["토론토", "밴쿠버", "몬트리올", "오타와"],
    answer: 3,
    explanation: "1857년 빅토리아 여왕이 오타와를 수도로 골랐고, 1867년 캐나다 연방 수립 때 다시 확정되었어요.",
    source: "Parks Canada, Canada's Capital National Historic Event, https://parks.canada.ca/culture/designation/lieu-site/capitale-capital"
  },
  {
    id: "wg-03",
    category: "세계지리",
    question: "튀르키예의 수도는?",
    choices: ["앙카라", "이스탄불", "이즈미르", "안탈리아"],
    answer: 0,
    explanation: "튀르키예의 수도는 앙카라예요. 이스탄불은 큰 도시이지만 수도는 아니에요.",
    source: "한국민족문화대백과사전 「튀르키예」, https://encykorea.aks.ac.kr/Article/E0059145"
  },
  {
    id: "wg-04",
    category: "세계지리",
    question: "아프리카 북동부를 남에서 북으로 흐르는 나일강이 흘러드는 바다는?",
    choices: ["홍해", "지중해", "아라비아해", "카스피해"],
    answer: 1,
    explanation: "나일강은 남에서 북으로 흘러 이집트 해안에서 지중해로 흘러들어요.",
    source: "National Geographic Education, Nile River, https://education.nationalgeographic.org/resource/nile-river/"
  },
  {
    id: "wg-05",
    category: "세계지리",
    question: "페루의 안데스에서 시작한 아마존강이 대서양으로 흘러드는 하구가 있는 나라는?",
    choices: ["아르헨티나", "콜롬비아", "브라질", "베네수엘라"],
    answer: 2,
    explanation: "아마존강은 페루 안데스에서 시작해 브라질을 가로질러 동쪽으로 흐른 뒤 대서양으로 흘러들어요.",
    source: "NASA Earth Observatory, Mouth of the Amazon, https://science.nasa.gov/earth/earth-observatory/mouth-of-the-amazon-1161/"
  },
  {
    id: "wg-06",
    category: "세계지리",
    question: "1884년 국제 자오선 회의에서 본초 자오선(경도 0°)의 기준으로 정한 영국 왕립 천문대가 있는 곳은?",
    choices: ["옥스퍼드", "케임브리지", "에든버러", "그리니치"],
    answer: 3,
    explanation: "1884년 워싱턴 국제 자오선 회의에서 그리니치 왕립 천문대를 지나는 자오선을 본초 자오선으로 정했어요.",
    source: "Royal Museums Greenwich, What is the Prime Meridian and why is it in Greenwich?, https://www.rmg.co.uk/stories/time/what-prime-meridian-why-it-greenwich"
  },
  {
    id: "wg-07",
    category: "세계지리",
    question: "브라질의 공용어는?",
    choices: ["포르투갈어", "스페인어", "영어", "프랑스어"],
    answer: 0,
    explanation: "브라질의 공용어는 포르투갈어예요. 남아메리카의 다른 여러 나라와 달리 스페인어가 아니에요.",
    source: "한국민족문화대백과사전 「브라질」, https://encykorea.aks.ac.kr/Article/E0025067"
  },
  {
    id: "wg-08",
    category: "세계지리",
    question: "남아메리카 대륙의 서쪽 끝을 따라 남북으로 길게 뻗은 산맥은?",
    choices: ["로키산맥", "안데스산맥", "알프스산맥", "우랄산맥"],
    answer: 1,
    explanation: "안데스산맥은 남아메리카 서쪽 끝을 따라 대륙 남단에서 북쪽 해안까지 뻗어 있어요.",
    source: "National Geographic Education, South America: Physical Geography, https://education.nationalgeographic.org/resource/south-america-physical-geography/"
  },
  {
    id: "wg-09",
    category: "세계지리",
    question: "아프리카 대륙 북부에 넓게 펼쳐진 사막은?",
    choices: ["고비사막", "아타카마사막", "사하라사막", "타클라마칸사막"],
    answer: 2,
    explanation: "사하라사막은 아프리카 북부에 있는, 세계에서 가장 큰 더운 사막이에요.",
    source: "National Geographic Education, Africa: Physical Geography, https://education.nationalgeographic.org/resource/africa-physical-geography/"
  },
  {
    id: "wg-10",
    category: "세계지리",
    question: "교황청이 있는 독립국 바티칸 시국이 자리한 도시는?",
    choices: ["밀라노", "나폴리", "피렌체", "로마"],
    answer: 3,
    explanation: "바티칸 시국은 이탈리아 로마시의 바티칸 언덕에 있는 독립국이에요.",
    source: "한국민족문화대백과사전 「교황청」, https://encykorea.aks.ac.kr/Article/E0020497"
  },

  // 과학
  {
    id: "sc-01",
    category: "과학",
    question: "물의 화학식은?",
    choices: ["H₂O", "CO₂", "H₂O₂", "O₂"],
    answer: 0,
    explanation: "물의 화학식은 H₂O예요. H₂O₂는 과산화수소예요.",
    source: "NIST Chemistry WebBook, Water, https://webbook.nist.gov/cgi/cbook.cgi?Name=water&Units=SI"
  },
  {
    id: "sc-02",
    category: "과학",
    question: "태양계 행성을 태양에서 가까운 순서로 늘어놓을 때 첫 번째 행성은?",
    choices: ["금성", "수성", "지구", "화성"],
    answer: 1,
    explanation: "수성은 평균 약 5,800만 km(0.4 AU) 떨어져 있어 태양에 제일 가까운 행성이에요.",
    source: "NASA Science, Mercury Facts, https://science.nasa.gov/mercury/facts/"
  },
  {
    id: "sc-03",
    category: "과학",
    question: "식물 세포에서 광합성이 일어나는 세포 소기관은?",
    choices: ["미토콘드리아", "리보솜", "엽록체", "골지체"],
    answer: 2,
    explanation: "식물은 엽록체로 광합성을 하여 독립 영양 생활을 해요.",
    source: "한국민족문화대백과사전 「식물」, https://encykorea.aks.ac.kr/Article/E0032557"
  },
  {
    id: "sc-04",
    category: "과학",
    question: "원자 번호가 1인 원소는?",
    choices: ["헬륨", "리튬", "탄소", "수소"],
    answer: 3,
    explanation: "원자 번호 1번 원소는 수소(H)예요.",
    source: "PubChem (미국 국립보건원), Hydrogen, https://pubchem.ncbi.nlm.nih.gov/element/1"
  },
  {
    id: "sc-05",
    category: "과학",
    question: "진공에서 빛의 속력은 1초에 약 몇 km인가?",
    choices: ["약 30만 km", "약 3만 km", "약 3천 km", "약 300만 km"],
    answer: 0,
    explanation: "진공에서 빛의 속력은 정확히 299,792,458 m/s, 즉 1초에 약 30만 km예요.",
    source: "NIST CODATA, speed of light in vacuum, https://physics.nist.gov/cgi-bin/cuu/Value?c"
  },
  {
    id: "sc-06",
    category: "과학",
    question: "적혈구 속에서 산소를 운반하는 단백질은?",
    choices: ["인슐린", "헤모글로빈", "케라틴", "아밀레이스"],
    answer: 1,
    explanation: "헤모글로빈은 적혈구 속에서 산소를 운반하는 단백질이에요.",
    source: "MedlinePlus (미국 국립의학도서관), Hemoglobin, https://medlineplus.gov/ency/article/003645.htm"
  },
  {
    id: "sc-07",
    category: "과학",
    question: "뉴턴의 운동 제2법칙 F = m × (  )에서 빈칸에 들어갈 물리량은?",
    choices: ["속도", "변위", "가속도", "시간"],
    answer: 2,
    explanation: "운동 제2법칙은 F = m·a로, 물체의 가속도는 질량과 가해진 힘에 따라 정해져요.",
    source: "NASA Glenn Research Center, Newton's Laws of Motion, https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/newtons-laws-of-motion/"
  },
  {
    id: "sc-08",
    category: "과학",
    question: "1953년 DNA의 이중 나선 구조를 밝혀 발표한 두 과학자는?",
    choices: ["그레고어 멘델과 토머스 모건", "찰스 다윈과 앨프리드 월리스", "루이 파스퇴르와 로베르트 코흐", "제임스 왓슨과 프랜시스 크릭"],
    answer: 3,
    explanation: "1953년 프랜시스 크릭과 제임스 왓슨이 DNA의 이중 나선 구조를 발표했어요.",
    source: "미국 국립인간게놈연구소(NHGRI), 1953: DNA Double Helix, https://www.genome.gov/25520255/online-education-kit-1953-dna-double-helix"
  },
  {
    id: "sc-09",
    category: "과학",
    question: "원소 기호가 Fe인 원소는?",
    choices: ["철", "불소", "금", "납"],
    answer: 0,
    explanation: "Fe는 철이에요. 불소는 F, 금은 Au, 납은 Pb예요.",
    source: "PubChem (미국 국립보건원), Iron, https://pubchem.ncbi.nlm.nih.gov/element/26"
  },
  {
    id: "sc-10",
    category: "과학",
    question: "혈당을 낮추는 호르몬인 인슐린을 만드는 기관은?",
    choices: ["간", "췌장", "담낭", "신장"],
    answer: 1,
    explanation: "인슐린은 췌장(이자)에서 만드는 호르몬이에요.",
    source: "MedlinePlus (미국 국립의학도서관), Insulin in Blood, https://medlineplus.gov/lab-tests/insulin-in-blood-test/"
  },

  // 예술과 문화
  {
    id: "ac-01",
    category: "예술과 문화",
    question: "루브르 박물관에 있는 〈모나리자〉를 그린 화가는?",
    choices: ["미켈란젤로 부오나로티", "라파엘로 산치오", "레오나르도 다빈치", "렘브란트 판 레인"],
    answer: 2,
    explanation: "〈모나리자〉(라 조콘드)는 레오나르도 다빈치가 피렌체 상인 프란체스코 델 조콘도의 아내 리자 게라르디니를 그린 초상화예요.",
    source: "루브르 박물관 소장품 정보, La Joconde, https://collections.louvre.fr/en/ark:/53355/cl010062370"
  },
  {
    id: "ac-02",
    category: "예술과 문화",
    question: "1889년 생레미에서 그린 〈별이 빛나는 밤〉의 화가는?",
    choices: ["폴 고갱", "클로드 모네", "폴 세잔", "빈센트 반 고흐"],
    answer: 3,
    explanation: "〈별이 빛나는 밤〉은 빈센트 반 고흐가 1889년 6월 생레미에서 그린 그림이에요.",
    source: "뉴욕 현대미술관(MoMA), The Starry Night, https://www.moma.org/collection/works/79802"
  },
  {
    id: "ac-03",
    category: "예술과 문화",
    question: "마지막 악장에 실러의 시 「환희의 송가」를 합창으로 넣은 교향곡 9번 라단조(작품 125)의 작곡가는?",
    choices: ["베토벤", "모차르트", "하이든", "브람스"],
    answer: 0,
    explanation: "베토벤 교향곡 9번(작품 125)은 1824년 2월 완성됐고, 마지막 악장에 실러의 「환희의 송가」 합창이 들어 있어요.",
    source: "베토벤하우스 본, Symphony no. 9 (D minor) op. 125, https://www.beethoven.de/en/work/view/ag9iZWV0aG92ZW4tdml1cjNyEQsSBHdvcmsYgICA7NW57wkM"
  },
  {
    id: "ac-04",
    category: "예술과 문화",
    question: "몬터규가와 캐퓰릿가의 두 젊은이가 사랑에 빠지는 희곡 『로미오와 줄리엣』의 작가는?",
    choices: ["괴테", "셰익스피어", "몰리에르", "세르반테스"],
    answer: 1,
    explanation: "『로미오와 줄리엣』은 셰익스피어의 희곡으로, 원수 집안인 몬터규가와 캐퓰릿가의 두 젊은이가 사랑에 빠져요.",
    source: "폴저 셰익스피어 도서관, Romeo and Juliet, https://www.folger.edu/explore/shakespeares-works/romeo-and-juliet/"
  },
  {
    id: "ac-05",
    category: "예술과 문화",
    question: "창자 한 명이 고수의 북장단에 맞춰 노래와 말(아니리)로 긴 이야기를 엮고 몸짓(발림)을 곁들이는 전통 공연 예술은?",
    choices: ["산조", "민요", "판소리", "가곡"],
    answer: 2,
    explanation: "판소리는 창자 한 명이 고수의 북장단에 맞춰 소리(노래)와 아니리(말)로 이야기를 엮고 발림(몸짓)을 곁들이는 공연 예술이에요.",
    source: "한국민족문화대백과사전 「판소리」, https://encykorea.aks.ac.kr/Article/E0059663"
  },
  {
    id: "ac-06",
    category: "예술과 문화",
    question: "1937년 에스파냐 내전 중 게르니카 폭격을 그린 〈게르니카〉의 화가는?",
    choices: ["살바도르 달리", "앙리 마티스", "호안 미로", "파블로 피카소"],
    answer: 3,
    explanation: "〈게르니카〉는 파블로 피카소가 1937년 5~6월 파리에서 그렸고, 지금은 마드리드 레이나 소피아 미술관에 있어요.",
    source: "레이나 소피아 국립미술관, Guernica, https://www.museoreinasofia.es/en/collections/artwork/guernica-0/"
  },
  {
    id: "ac-07",
    category: "예술과 문화",
    question: "1896년 근대 올림픽 첫 대회가 열린 도시는?",
    choices: ["아테네", "파리", "런던", "로마"],
    answer: 0,
    explanation: "근대 올림픽 첫 대회는 1896년 4월 그리스 아테네에서 열렸어요.",
    source: "국제올림픽위원회(IOC), Athens 1896: The revival of the Olympic Games, https://www.olympics.com/ioc/news/athens-1896-the-revival-of-the-olympic-games"
  },
  {
    id: "ac-08",
    category: "예술과 문화",
    question: "봄·여름·가을·겨울을 그린 바이올린 협주곡 〈사계〉의 작곡가는?",
    choices: ["요한 제바스티안 바흐", "안토니오 비발디", "게오르크 프리드리히 헨델", "프레데리크 쇼팽"],
    answer: 1,
    explanation: "〈사계〉는 안토니오 비발디의 바이올린 협주곡으로, 1725년 작품 8에 실려 출판되었어요.",
    source: "LA 필하모닉, The Four Seasons (Antonio Vivaldi), https://www.laphil.com/musicdb/pieces/735/the-four-seasons"
  },
  {
    id: "ac-09",
    category: "예술과 문화",
    question: "구경꾼들이 둘러앉아 두 씨름꾼을 지켜보는 〈씨름〉이 실린 조선 후기 풍속도 화첩을 그린 화가는?",
    choices: ["정선", "안견", "김홍도", "장승업"],
    answer: 2,
    explanation: "〈씨름〉은 김홍도의 풍속도 화첩에 실린 그림으로, 둥글게 둘러앉은 구경꾼 가운데서 두 씨름꾼이 힘을 겨뤄요.",
    source: "한국민족문화대백과사전 「김홍도 필 풍속도 화첩」, https://encykorea.aks.ac.kr/Article/E0013639"
  },
  {
    id: "ac-10",
    category: "예술과 문화",
    question: "1751년 비 갠 뒤의 인왕산을 그린 〈인왕제색도〉의 화가는?",
    choices: ["김홍도", "신윤복", "안견", "정선"],
    answer: 3,
    explanation: "〈인왕제색도〉는 조선 후기 화가 정선이 76세이던 1751년에 비 갠 뒤의 인왕산을 그린 산수화예요.",
    source: "한국민족문화대백과사전 「정선 필 인왕제색도」, https://encykorea.aks.ac.kr/Article/E0046984"
  }
];

// Node 자체 점검에서 불러올 수 있게 함. 브라우저에서는 module이 없어 무시됨.
if (typeof module !== "undefined") module.exports = { CATEGORIES, QUESTIONS };
