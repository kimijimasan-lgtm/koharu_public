const PREFECTURE_STATIONS = {
  '青森県': ['新青森', '八戸'],
  '岩手県': ['盛岡', '一ノ関'],
  '宮城県': ['仙台', '古川'],
  '秋田県': ['秋田'],
  '山形県': ['山形', '米沢'],
  '福島県': ['福島', '郡山', '新白河'],
  '茨城県': ['水戸', 'つくば'],
  '栃木県': ['宇都宮', '那須塩原', '小山'],
  '群馬県': ['高崎', '前橋'],
  '埼玉県': ['大宮', '熊谷'],
  '千葉県': ['千葉', '船橋'],
  '東京都': ['東京', '品川', '上野'],
  '神奈川県': ['横浜', '新横浜', '小田原']
};

const DESTINATIONS = {

  chitose: {
    name: '千歳', area: '道央', station: '千歳駅', transportMode: 'flight', airport: '新千歳空港', direction: 'hokkaido', travelTimeFromTokyo: 105,
    highlights: ['支笏湖', 'サケのふるさと千歳水族館', '新千歳空港温泉'],
    hotels: [
      { id: 'ct1', name: 'しこつ湖鶴雅リゾートスパ 水の謌', type: '温泉リゾート',
        features: ['支笏湖畔の絶景', '全室レイクビュー', 'ビュッフェ＆スパ'],
        taxiFromCityStation: 40, area: '支笏湖温泉', pricePerNight: 40000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ct2', name: 'レイクサイドヴィラ翠明閣', type: 'オーベルジュ',
        features: ['全8室の隠れ宿', '全室展望ジャグジー', 'イタリアンコースディナー'],
        taxiFromCityStation: 40, area: '支笏湖温泉', pricePerNight: 35000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ct3', name: '丸駒温泉旅館', type: '温泉旅館',
        features: ['大正4年創業の秘湯', '湖と一体化する天然露天風呂', '山菜・湖魚の和食膳'],
        taxiFromCityStation: 50, area: '支笏湖', pricePerNight: 20000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ct4', name: '休暇村支笏湖', type: '公共の宿',
        features: ['支笏湖畔の自然環境', '天然温泉大浴場', 'ビュッフェ'],
        taxiFromCityStation: 40, area: '支笏湖温泉', pricePerNight: 15000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ct5', name: 'ANAクラウンプラザホテル千歳', type: 'シティホテル',
        features: ['JR千歳駅徒歩1分', '空港アクセス良好', '朝食ビュッフェ'],
        taxiFromCityStation: 1, area: '千歳駅前', pricePerNight: 12000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ct6', name: 'ホテルルートイン千歳駅前', type: 'ビジネスホテル',
        features: ['JR千歳駅徒歩2分', '大浴場完備', '無料バイキング朝食'],
        taxiFromCityStation: 1, area: '千歳駅前', pricePerNight: 9000, dinnerIncluded: false, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: 'ドレモルタオ', genre: 'スイーツカフェ', area: '千歳市内', reservationNeeded: false, budget: 1500 },
        { name: '道の駅サーモンパーク千歳', genre: '地元グルメ', area: '千歳', reservationNeeded: false, budget: 1200 },
      ],
      dinner: [
        { name: '支笏湖温泉 水の謌 アマム', genre: 'ビュッフェ', area: '支笏湖温泉', reservationNeeded: true, budget: 6000 },
      ],
      snack: [
        { name: 'ロイズチョコレートワールド', genre: 'チョコレート', area: '新千歳空港', budget: 500 },
      ],
    },
    spots: [
      { name: '支笏湖（遊覧船・散策）', area: '支笏湖', duration: 90, indoor: false, taxiFromCityStation: 40 },
      { name: 'サケのふるさと千歳水族館', area: '千歳', duration: 60, indoor: true, taxiFromCityStation: 5 },
      { name: '新千歳空港温泉（万葉の湯）', area: '新千歳空港', duration: 90, indoor: true, taxiFromCityStation: 10 },
      { name: '支笏湖ビジターセンター', area: '支笏湖', duration: 30, indoor: true, taxiFromCityStation: 40 },
    ],
  },
  tomakomai: {
    name: '苫小牧', area: '道央', station: '苫小牧駅', transportMode: 'flight', airport: '新千歳空港', direction: 'hokkaido', travelTimeFromTokyo: 130,
    highlights: ['ウトナイ湖', 'ノーザンホースパーク', 'マルトマ食堂'],
    hotels: [
      { id: 'tm1', name: 'グランドホテルニュー王子', type: 'シティホテル',
        features: ['苫小牧駅周辺', '展望レストラン', '宴会場・会議室完備'],
        taxiFromCityStation: 5, area: '苫小牧駅周辺', pricePerNight: 15000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'tm2', name: 'ホテルルートイン苫小牧駅前', type: 'ビジネスホテル',
        features: ['JR苫小牧駅徒歩2分', '大浴場完備', '無料バイキング朝食'],
        taxiFromCityStation: 2, area: '苫小牧駅前', pricePerNight: 10000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'tm3', name: 'コンフォートホテル苫小牧', type: 'ビジネスホテル',
        features: ['苫小牧駅徒歩3分', '無料朝食サービス', '全室禁煙'],
        taxiFromCityStation: 2, area: '苫小牧駅前', pricePerNight: 8500, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'tm4', name: '東横INN苫小牧駅前', type: 'ビジネスホテル',
        features: ['JR苫小牧駅前', '安心の全国チェーン', '無料朝食'],
        taxiFromCityStation: 1, area: '苫小牧駅前', pricePerNight: 7500, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'tm5', name: 'スーパーホテル苫小牧駅前', type: 'ビジネスホテル',
        features: ['駅前の好立地', '天然温泉大浴場', '健康朝食無料'],
        taxiFromCityStation: 2, area: '苫小牧駅前', pricePerNight: 6500, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'tm6', name: 'ホテルウイングインターナショナル苫小牧', type: 'ビジネスホテル',
        features: ['苫小牧中心街', 'リーズナブルな料金', '朝食バイキング'],
        taxiFromCityStation: 3, area: '苫小牧駅周辺', pricePerNight: 6000, dinnerIncluded: false, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: 'マルトマ食堂', genre: '海鮮丼・ホッキ貝', area: '苫小牧港', reservationNeeded: false, budget: 2000 },
        { name: '味の大王 総本店', genre: 'カレーラーメン', area: '苫小牧', reservationNeeded: false, budget: 1000 },
      ],
      dinner: [
        { name: '海の駅 ぷらっとみなと市場', genre: '海鮮', area: '苫小牧港', reservationNeeded: false, budget: 3500 },
      ],
      snack: [
        { name: '三星 本店', genre: 'よいとまけ', area: '苫小牧', budget: 500 },
      ],
    },
    spots: [
      { name: 'ウトナイ湖（野鳥観察）', area: 'ウトナイ', duration: 60, indoor: false, taxiFromCityStation: 15 },
      { name: 'ノーザンホースパーク', area: '苫小牧郊外', duration: 120, indoor: false, taxiFromCityStation: 30 },
      { name: '樽前山 七合目ヒュッテ', area: '樽前', duration: 120, indoor: false, taxiFromCityStation: 40 },
      { name: '苫小牧市科学センター', area: '苫小牧', duration: 60, indoor: true, taxiFromCityStation: 5 },
    ],
  },
  otaru: {
    name: '小樽', area: '道央', station: '小樽駅', transportMode: 'flight', airport: '新千歳空港', direction: 'hokkaido', travelTimeFromTokyo: 195,
    highlights: ['小樽運河', '堺町通り', '天狗山'],
    hotels: [
      { id: 'ot1', name: '小樽旅亭 銀鱗荘', type: '温泉旅館',
        features: ['明治期の鰊御殿を移築', '高台から海を一望', '源泉かけ流し露天風呂'],
        taxiFromCityStation: 10, area: '小樽築港', pricePerNight: 35000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ot2', name: '運河の宿 おたる ふる川', type: '温泉旅館',
        features: ['運河沿いの立地', 'レトロな雰囲気', '温泉大浴場'],
        taxiFromCityStation: 5, area: '小樽運河', pricePerNight: 30000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ot3', name: 'ホテルノルド小樽', type: 'シティホテル',
        features: ['小樽運河すぐ', 'ヨーロッパ調の外観', '朝食バイキング人気'],
        taxiFromCityStation: 5, area: '小樽運河', pricePerNight: 18000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ot4', name: 'グランドパーク小樽', type: 'シティホテル',
        features: ['小樽築港・ウイングベイ直結', '海を望む全室オーシャンビュー', 'リゾート感'],
        taxiFromCityStation: 10, area: '小樽築港', pricePerNight: 15000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ot5', name: 'ホテルソニア小樽', type: 'シティホテル',
        features: ['小樽運河至近', '堺町通り徒歩圏', '天然温泉大浴場'],
        taxiFromCityStation: 5, area: '小樽運河', pricePerNight: 14000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ot6', name: 'ドーミーインPREMIUM小樽', type: 'ビジネスホテル',
        features: ['小樽駅徒歩3分', '天然温泉大浴場・サウナ', '夜鳴きそば無料サービス'],
        taxiFromCityStation: 3, area: '小樽駅前', pricePerNight: 12000, dinnerIncluded: false, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: 'おたる政寿司 本店', genre: '寿司', area: '寿司屋通り', reservationNeeded: false, budget: 4000 },
        { name: '小樽なると 本店', genre: '若鶏半身揚げ', area: '稲穂', reservationNeeded: false, budget: 1200 },
      ],
      dinner: [
        { name: '伊勢鮨', genre: '寿司', area: '稲穂', reservationNeeded: true, budget: 12000 },
        { name: '小樽バイン', genre: 'ワイン・洋食', area: '色内', reservationNeeded: false, budget: 3000 },
      ],
      snack: [
        { name: 'ルタオ 本店', genre: 'ドゥーブルフロマージュ', area: '堺町通り', budget: 1000 },
        { name: '北一硝子三号館 北一ホール', genre: 'カフェ', area: '堺町通り', budget: 800 },
      ],
    },
    spots: [
      { name: '小樽運河（散策・クルーズ）', area: '運河', duration: 60, indoor: false, taxiFromCityStation: 5 },
      { name: '天狗山ロープウェイ', area: '天狗山', duration: 90, indoor: false, taxiFromCityStation: 15 },
      { name: '小樽オルゴール堂 本館', area: '堺町', duration: 40, indoor: true, taxiFromCityStation: 7 },
      { name: '堺町通り商店街', area: '堺町', duration: 60, indoor: false, taxiFromCityStation: 7 },
    ],
  },
  niseko: {
    name: 'ニセコ', area: '道央', station: 'ニセコ駅', transportMode: 'flight', airport: '新千歳空港', direction: 'hokkaido', travelTimeFromTokyo: 255,
    highlights: ['ニセコアンヌプリ', '羊蹄山', 'ミルク工房'],
    hotels: [
      { id: 'ns1', name: 'パークハイアット ニセコ HANAZONO', type: 'ラグジュアリー',
        features: ['世界水準のラグジュアリーリゾート', 'マウンテンビュー', '温泉・スパ・フレンチ'],
        taxiFromCityStation: 15, area: '花園', pricePerNight: 80000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ns2', name: 'ニセコ昆布温泉 鶴雅別荘 杢の抄', type: '温泉旅館',
        features: ['全室露天風呂付', '木のぬくもりの和空間', '創作懐石'],
        taxiFromCityStation: 10, area: '昆布温泉', pricePerNight: 55000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ns3', name: 'ヒルトンニセコビレッジ', type: 'リゾートホテル',
        features: ['羊蹄山を正面に望む', 'ゴルフ・アクティビティ充実', '温泉大浴場'],
        taxiFromCityStation: 10, area: 'ニセコビレッジ', pricePerNight: 40000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ns4', name: 'ワンニセコリゾートタワーズ', type: 'コンドミニアム',
        features: ['キッチン付の広い客室', 'モイワスキー場直結', '温泉大浴場'],
        taxiFromCityStation: 8, area: 'モイワ', pricePerNight: 25000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ns5', name: 'ニセコノーザンリゾート・アンヌプリ', type: 'リゾートホテル',
        features: ['アンヌプリスキー場前', '露天風呂・サウナ', '北海道食材ビュッフェ'],
        taxiFromCityStation: 10, area: 'アンヌプリ', pricePerNight: 18000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ns6', name: 'ニセコグランドホテル', type: '温泉ホテル',
        features: ['昆布温泉の老舗', '庭園露天風呂（混浴あり）', 'リーズナブルな温泉宿'],
        taxiFromCityStation: 10, area: '昆布温泉', pricePerNight: 12000, dinnerIncluded: true, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: '高橋牧場 ミルク工房 レストラン プラティーヴォ', genre: '地元野菜ビュッフェ', area: 'ニセコ', reservationNeeded: false, budget: 2000 },
        { name: 'グラウビュンデン', genre: 'カフェ・サンドイッチ', area: 'ニセコ', reservationNeeded: false, budget: 2000 },
      ],
      dinner: [
        { name: '名水うどん 野々傘', genre: '手打ちうどん', area: '京極', reservationNeeded: false, budget: 1500 },
      ],
      snack: [
        { name: '高橋牧場 ミルク工房', genre: 'ソフトクリーム・シュークリーム', area: 'ニセコ', budget: 500 },
      ],
    },
    spots: [
      { name: 'ニセコアンヌプリ ゴンドラ', area: 'アンヌプリ', duration: 90, indoor: false, taxiFromCityStation: 10 },
      { name: '羊蹄山 半月湖自然公園', area: '倶知安', duration: 60, indoor: false, taxiFromCityStation: 15 },
      { name: '神仙沼', area: 'ニセコパノラマライン', duration: 60, indoor: false, taxiFromCityStation: 25 },
      { name: '高橋牧場 ミルク工房', area: 'ニセコ', duration: 45, indoor: false, taxiFromCityStation: 10 },
    ],
  },
  toyako: {
    name: '洞爺湖', area: '道央', station: '洞爺駅', transportMode: 'flight', airport: '新千歳空港', direction: 'hokkaido', travelTimeFromTokyo: 255,
    highlights: ['洞爺湖', '有珠山', '昭和新山'],
    hotels: [
      { id: 'tk1', name: 'ザ・ウィンザーホテル洞爺 リゾート＆スパ', type: 'リゾート',
        features: ['G8サミット開催地', '山頂から洞爺湖一望', 'ミシュラン星付レストラン'],
        taxiFromCityStation: 20, area: '洞爺湖畔', pricePerNight: 60000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'tk2', name: 'ザ・レイクスイート 湖の栖', type: '温泉旅館',
        features: ['全室レイクビュー展望風呂', '2019年開業の新館', '和モダン空間'],
        taxiFromCityStation: 10, area: '洞爺湖温泉', pricePerNight: 40000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'tk3', name: '乃の風リゾート', type: 'リゾートホテル',
        features: ['洞爺湖一望のインフィニティ露天', 'スタイリッシュな和モダン', 'ブッフェダイニング'],
        taxiFromCityStation: 10, area: '洞爺湖温泉', pricePerNight: 35000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'tk4', name: '洞爺湖万世閣 ホテルレイクサイドテラス', type: 'シティホテル',
        features: ['洞爺湖温泉の大型ホテル', '空中露天風呂', '和洋中ビュッフェ'],
        taxiFromCityStation: 10, area: '洞爺湖温泉', pricePerNight: 22000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'tk5', name: '洞爺サンパレス リゾート＆スパ', type: 'リゾートホテル',
        features: ['大型ウォーターランド', '洞爺湖畔のリゾート', '家族向け充実'],
        taxiFromCityStation: 15, area: '壮瞥', pricePerNight: 18000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'tk6', name: 'ゆとりろ洞爺湖', type: 'カジュアルホテル',
        features: ['洞爺湖温泉街', 'リーズナブルな温泉宿', '湖畔散策に便利'],
        taxiFromCityStation: 10, area: '洞爺湖温泉', pricePerNight: 12000, dinnerIncluded: true, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: 'レストラン望羊蹄', genre: '洋食', area: '洞爺湖温泉', reservationNeeded: false, budget: 2000 },
        { name: 'わかさいも本舗 洞爺湖本店', genre: '和菓子・軽食', area: '洞爺湖温泉', reservationNeeded: false, budget: 1000 },
      ],
      dinner: [
        { name: '洞爺湖温泉 ホテル内ダイニング', genre: '会席・ビュッフェ', area: '洞爺湖温泉', reservationNeeded: true, budget: 8000 },
      ],
      snack: [
        { name: 'わかさいも', genre: '銘菓', area: '洞爺湖温泉', budget: 500 },
      ],
    },
    spots: [
      { name: '洞爺湖（遊覧船・中島）', area: '洞爺湖畔', duration: 90, indoor: false, taxiFromCityStation: 10 },
      { name: '有珠山ロープウェイ', area: '有珠山', duration: 60, indoor: false, taxiFromCityStation: 15 },
      { name: '昭和新山 熊牧場', area: '昭和新山', duration: 60, indoor: false, taxiFromCityStation: 15 },
      { name: '洞爺湖ビジターセンター・火山科学館', area: '洞爺湖温泉', duration: 45, indoor: true, taxiFromCityStation: 10 },
    ],
  },
  noboribetsu: {
    name: '登別', area: '道南', station: '登別駅', transportMode: 'flight', airport: '新千歳空港', direction: 'hokkaido', travelTimeFromTokyo: 165,
    highlights: ['登別地獄谷', 'のぼりべつクマ牧場', '大湯沼'],
    hotels: [
      { id: 'nb1', name: '登別温泉 滝乃家', type: '温泉旅館',
        features: ['源泉かけ流し', '割烹料理', '静寂の庭園'],
        taxiFromCityStation: 15, area: '登別温泉', pricePerNight: 55000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'nb2', name: '望楼NOGUCHI登別', type: 'デザイナーズ旅館',
        features: ['全室展望風呂付スイート', 'モダン和空間', '鉄板焼ダイニング'],
        taxiFromCityStation: 15, area: '登別温泉', pricePerNight: 45000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'nb3', name: '登別温泉 第一滝本館', type: '温泉ホテル',
        features: ['1858年創業・登別温泉の元祖', '7種の泉質・35の浴槽', '1,500坪の大浴場'],
        taxiFromCityStation: 15, area: '登別温泉', pricePerNight: 25000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'nb4', name: '御やど清水屋', type: '温泉旅館',
        features: ['落ち着いた和の佇まい', '源泉かけ流し', '旬の和食膳'],
        taxiFromCityStation: 15, area: '登別温泉', pricePerNight: 20000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'nb5', name: '登別万世閣', type: '温泉ホテル',
        features: ['温泉街中心の大型ホテル', '多彩な浴場', 'ビュッフェダイニング'],
        taxiFromCityStation: 15, area: '登別温泉', pricePerNight: 16000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'nb6', name: '登別温泉 まほろば', type: '温泉ホテル',
        features: ['日本最大級の露天風呂', '31種の多彩な浴槽', 'バイキングレストラン'],
        taxiFromCityStation: 15, area: '登別温泉', pricePerNight: 14000, dinnerIncluded: true, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: '温泉市場', genre: '海鮮', area: '登別温泉', reservationNeeded: false, budget: 2000 },
        { name: '味の大王 登別温泉店', genre: '地獄ラーメン', area: '登別温泉', reservationNeeded: false, budget: 1000 },
      ],
      dinner: [
        { name: '花鐘亭はなや', genre: '和食会席', area: '登別温泉', reservationNeeded: true, budget: 8000 },
      ],
      snack: [
        { name: '地獄谷周辺売店', genre: '温泉たまご', area: '登別温泉', budget: 300 },
      ],
    },
    spots: [
      { name: '登別地獄谷', area: '登別温泉', duration: 60, indoor: false, taxiFromCityStation: 15 },
      { name: 'のぼりべつクマ牧場', area: '登別温泉', duration: 90, indoor: false, taxiFromCityStation: 18 },
      { name: '大湯沼・奥の湯', area: '登別温泉', duration: 45, indoor: false, taxiFromCityStation: 18 },
      { name: '登別マリンパークニクス', area: '登別', duration: 90, indoor: true, taxiFromCityStation: 5 },
    ],
  },
  shakotan: {
    name: '積丹', area: '道央', station: '余市駅', transportMode: 'flight', airport: '新千歳空港', direction: 'hokkaido', travelTimeFromTokyo: 255,
    highlights: ['神威岬', '積丹ブルー', 'ウニ丼'],
    hotels: [
      { id: 'sk1', name: 'ホテルノイシュロス小樽', type: 'リゾートホテル',
        features: ['断崖絶壁の絶景ホテル', '全室オーシャンビュー展望風呂', '積丹方面の拠点に最適'],
        taxiFromCityStation: 25, area: '祝津（小樽西部）', pricePerNight: 35000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'sk2', name: '小樽朝里クラッセホテル', type: '温泉ホテル',
        features: ['朝里川温泉', 'テニス・プール等の施設', '積丹へのアクセス良好'],
        taxiFromCityStation: 20, area: '朝里川温泉', pricePerNight: 18000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'sk3', name: 'お宿 かさい', type: '民宿',
        features: ['美国漁港至近', '新鮮な海鮮料理', 'アットホームな宿'],
        taxiFromCityStation: 35, area: '積丹美国', pricePerNight: 12000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'sk4', name: '民宿 海のや', type: '民宿',
        features: ['積丹半島の漁師宿', '採れたてウニの食事', '積丹ブルーを満喫'],
        taxiFromCityStation: 45, area: '積丹', pricePerNight: 10000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'sk5', name: '旅館 北海', type: '旅館',
        features: ['積丹の海鮮が自慢', '家族経営のおもてなし', '夏季ウニ漁体験'],
        taxiFromCityStation: 45, area: '積丹', pricePerNight: 8000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'sk6', name: '余市温泉 ホテル水明閣', type: 'ビジネスホテル',
        features: ['余市駅徒歩圏', '天然温泉', 'ニッカウヰスキー蒸溜所至近'],
        taxiFromCityStation: 5, area: '余市', pricePerNight: 7000, dinnerIncluded: false, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: 'みさき', genre: 'ウニ丼', area: '積丹美国', reservationNeeded: false, budget: 5000 },
        { name: 'ふじ鮨 積丹本店', genre: '寿司', area: '美国', reservationNeeded: false, budget: 3500 },
      ],
      dinner: [
        { name: '積丹料理 ふじ鮨', genre: '寿司・海鮮', area: '美国', reservationNeeded: true, budget: 5000 },
      ],
      snack: [
        { name: '岬の湯しゃこたん', genre: '温泉・ソフトクリーム', area: '積丹', budget: 500 },
      ],
    },
    spots: [
      { name: '神威岬', area: '積丹', duration: 90, indoor: false, taxiFromCityStation: 60 },
      { name: '島武意海岸', area: '積丹', duration: 60, indoor: false, taxiFromCityStation: 50 },
      { name: '積丹水中展望船 ニューしゃこたん号', area: '美国', duration: 40, indoor: false, taxiFromCityStation: 35 },
      { name: '余市蒸溜所（ニッカウヰスキー）', area: '余市', duration: 60, indoor: true, taxiFromCityStation: 5 },
    ],
  },
  esashi: {
    name: '江差', area: '道南', station: '木古内駅', transportMode: 'flight', airport: '函館空港', direction: 'hokkaido', travelTimeFromTokyo: 195,
    highlights: ['江差追分', 'かもめ島', 'いにしえ街道'],
    hotels: [
      { id: 'es1', name: '江差旅庭 群来', type: '高級旅館',
        features: ['全室離れ・源泉かけ流し', '江差の海山の幸', '静寂の和空間'],
        taxiFromCityStation: 60, area: '江差町', pricePerNight: 70000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'es2', name: 'ワークマンハウス江差', type: 'ビジネスホテル',
        features: ['2024年開業', '全30室の個室', 'リーズナブルな宿泊'],
        taxiFromCityStation: 58, area: '江差町', pricePerNight: 6000, dinnerIncluded: false, breakfastIncluded: false },
      { id: 'es3', name: 'ホテルニューえさし', type: 'シティホテル',
        features: ['江差町中心部', 'いにしえ街道至近', 'ビジネス・観光の拠点'],
        taxiFromCityStation: 60, area: '江差町', pricePerNight: 10000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'es4', name: '辻旅館', type: '旅館',
        features: ['いにしえ街道の中心に位置', '郷土料理・三平汁', 'アットホームな宿'],
        taxiFromCityStation: 60, area: '江差町中歌町', pricePerNight: 7000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'es5', name: '港旅館', type: '旅館',
        features: ['かもめ島すぐそば', '全11室の和室', '女将の手作り料理'],
        taxiFromCityStation: 60, area: '江差町姥神町', pricePerNight: 6500, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'es6', name: 'ふじや旅館', type: '旅館',
        features: ['江差の老舗旅館', '新鮮な魚介料理', 'リーズナブル'],
        taxiFromCityStation: 60, area: '江差町愛宕町', pricePerNight: 6000, dinnerIncluded: true, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: '江差追分会館 食堂', genre: '海鮮丼', area: '江差', reservationNeeded: false, budget: 1500 },
        { name: '五勝手屋本舗', genre: '羊羹・和菓子', area: '江差', reservationNeeded: false, budget: 500 },
      ],
      dinner: [
        { name: '居酒屋 漁火', genre: '海鮮・郷土料理', area: '江差', reservationNeeded: false, budget: 3500 },
      ],
      snack: [
        { name: '五勝手屋本舗 丸缶羊羹', genre: '銘菓', area: '江差', budget: 500 },
      ],
    },
    spots: [
      { name: 'かもめ島', area: '江差', duration: 60, indoor: false, taxiFromCityStation: 60 },
      { name: '江差追分会館', area: '江差', duration: 45, indoor: true, taxiFromCityStation: 60 },
      { name: 'いにしえ街道', area: '江差', duration: 60, indoor: false, taxiFromCityStation: 60 },
      { name: '開陽丸記念館', area: '江差', duration: 45, indoor: true, taxiFromCityStation: 60 },
    ],
  },
  furano: {
    name: '富良野', area: '道北', station: '富良野駅', transportMode: 'flight', airport: '旭川空港', direction: 'hokkaido', travelTimeFromTokyo: 165,
    highlights: ['ファーム富田', 'ニングルテラス', '富良野チーズ工房'],
    hotels: [
      { id: 'fr1', name: 'フラノ寶亭留', type: 'リゾート',
        features: ['35,000坪のプライベートガーデン', 'フレンチコースディナー', '天然温泉'],
        taxiFromCityStation: 10, area: '富良野', pricePerNight: 45000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'fr2', name: '新富良野プリンスホテル', type: 'リゾートホテル',
        features: ['ニングルテラス併設', '富良野スキー場直結', '北海道食材のビュッフェ'],
        taxiFromCityStation: 10, area: '新富良野', pricePerNight: 35000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'fr3', name: '富良野ナチュラクスホテル', type: 'デザイナーズホテル',
        features: ['市街地のスタイリッシュホテル', '北欧デザインの客室', '地元食材ビュッフェ朝食'],
        taxiFromCityStation: 5, area: '富良野市街', pricePerNight: 20000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'fr4', name: 'ホテルナトゥールヴァルト富良野', type: 'リゾートホテル',
        features: ['富良野の森に囲まれた宿', '家族向けサービス充実', '天然温泉大浴場'],
        taxiFromCityStation: 8, area: '富良野', pricePerNight: 15000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'fr5', name: 'ホテルベルヒルズ', type: 'リゾートホテル',
        features: ['丘の上から十勝岳連峰を一望', 'ウエディング対応', '展望レストラン'],
        taxiFromCityStation: 10, area: '富良野', pricePerNight: 12000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'fr6', name: 'スパ＆ホテルリゾート ふらのラテール', type: '温泉ホテル',
        features: ['和洋15種の温泉風呂', '十勝岳連峰を望む全25室', '地産食材の創作料理'],
        taxiFromCityStation: 15, area: '中富良野', pricePerNight: 12000, dinnerIncluded: true, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: 'くまげら', genre: '和牛・オムカレー', area: '富良野', reservationNeeded: false, budget: 2000 },
        { name: 'ファーム富田 カフェ', genre: 'ラベンダーソフト・軽食', area: '中富良野', reservationNeeded: false, budget: 800 },
      ],
      dinner: [
        { name: '唯我独尊', genre: 'カレー', area: '富良野', reservationNeeded: false, budget: 1500 },
      ],
      snack: [
        { name: 'フラノデリス', genre: 'プリン・ドゥーブル', area: '富良野', budget: 800 },
        { name: 'カンパーナ六花亭', genre: 'スイーツ', area: '富良野', budget: 500 },
      ],
    },
    spots: [
      { name: 'ファーム富田', area: '中富良野', duration: 90, indoor: false, taxiFromCityStation: 15 },
      { name: 'ニングルテラス', area: '新富良野', duration: 60, indoor: false, taxiFromCityStation: 10 },
      { name: '富良野チーズ工房', area: '富良野', duration: 45, indoor: true, taxiFromCityStation: 10 },
      { name: 'カンパーナ六花亭', area: '富良野', duration: 30, indoor: true, taxiFromCityStation: 10 },
    ],
  },
  biei: {
    name: '美瑛', area: '道北', station: '美瑛駅', transportMode: 'flight', airport: '旭川空港', direction: 'hokkaido', travelTimeFromTokyo: 135,
    highlights: ['パッチワークの路', '四季彩の丘', '白金青い池'],
    hotels: [
      { id: 'bi1', name: '森の旅亭 びえい', type: '温泉旅館',
        features: ['全室離れの隠れ宿', '白金温泉・源泉かけ流し', '旬の和食膳'],
        taxiFromCityStation: 25, area: '白金温泉', pricePerNight: 40000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'bi2', name: '湯元 白金温泉ホテル', type: '温泉ホテル',
        features: ['白金温泉の老舗', '大浴場・露天風呂', '十勝岳を望む'],
        taxiFromCityStation: 25, area: '白金温泉', pricePerNight: 18000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'bi3', name: 'ホテルラヴニール', type: 'ホテル',
        features: ['美瑛駅徒歩圏', '観光拠点に最適', '朝食バイキング'],
        taxiFromCityStation: 3, area: '美瑛市街', pricePerNight: 15000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'bi4', name: '白金四季の森 ホテルパークヒルズ', type: 'リゾートホテル',
        features: ['白金温泉エリア', '十勝岳連峰の展望', '天然温泉'],
        taxiFromCityStation: 25, area: '白金温泉', pricePerNight: 12000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'bi5', name: 'ペンション 歩人（ほびっと）', type: 'ペンション',
        features: ['丘の上のペンション', '自家製パンの朝食', '美瑛の丘を一望'],
        taxiFromCityStation: 5, area: '美瑛', pricePerNight: 9000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'bi6', name: '丘上の一軒宿 星ヶ丘', type: 'ペンション',
        features: ['丘の上から絶景の夕日', '小さな天文台で星空観測', '自家製パンの朝食'],
        taxiFromCityStation: 8, area: '美瑛', pricePerNight: 9500, dinnerIncluded: true, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: '美瑛選果 レストラン', genre: '地元野菜料理', area: '美瑛駅前', reservationNeeded: true, budget: 3000 },
        { name: 'レストラン ASPERGES', genre: 'フレンチ', area: '美瑛', reservationNeeded: true, budget: 5000 },
      ],
      dinner: [
        { name: 'bi.ble（ビブレ）', genre: 'フレンチ', area: '美瑛', reservationNeeded: true, budget: 8000 },
      ],
      snack: [
        { name: '美瑛選果', genre: 'ソフトクリーム・農産物', area: '美瑛駅前', budget: 400 },
      ],
    },
    spots: [
      { name: '白金青い池', area: '白金', duration: 45, indoor: false, taxiFromCityStation: 20 },
      { name: '四季彩の丘', area: '美瑛', duration: 60, indoor: false, taxiFromCityStation: 10 },
      { name: 'パッチワークの路', area: '美瑛', duration: 90, indoor: false, taxiFromCityStation: 8 },
      { name: '望岳台', area: '十勝岳', duration: 60, indoor: false, taxiFromCityStation: 30 },
    ],
  },
  teshikaga: {
    name: '摩周湖', area: '道東', station: '摩周駅', transportMode: 'flight', airport: '釧路空港', direction: 'hokkaido', travelTimeFromTokyo: 165,
    highlights: ['摩周湖', '屈斜路湖', '硫黄山'],
    hotels: [
      { id: 'ts1', name: 'あかん鶴雅別荘 鄙の座', type: '高級旅館',
        features: ['全室温泉露天風呂付', '阿寒湖畔のプレミアム', '会席コース'],
        taxiFromCityStation: 60, area: '阿寒湖温泉', pricePerNight: 50000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ts2', name: 'あかん遊久の里 鶴雅', type: '温泉旅館',
        features: ['阿寒湖畔の大型リゾート', '屋上庭園露天風呂', 'アイヌ文化体験'],
        taxiFromCityStation: 60, area: '阿寒湖温泉', pricePerNight: 35000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ts3', name: 'ニュー阿寒ホテル', type: 'リゾートホテル',
        features: ['阿寒湖畔の大型ホテル', '屋上スパ・ガーデンスパ', 'ビュッフェダイニング'],
        taxiFromCityStation: 60, area: '阿寒湖温泉', pricePerNight: 20000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ts4', name: 'お宿欣喜湯 別邸 忍冬', type: '温泉旅館',
        features: ['強酸性硫黄泉100%かけ流し', '創作懐石ダイニング', '東館・西館の2棟構成'],
        taxiFromCityStation: 15, area: '川湯温泉', pricePerNight: 15000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ts5', name: 'お宿 欣喜湯', type: '温泉旅館',
        features: ['川湯温泉', '源泉かけ流しの強酸性泉', 'リーズナブルな温泉宿'],
        taxiFromCityStation: 15, area: '川湯温泉', pricePerNight: 12000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ts6', name: 'ホテル摩周', type: 'ビジネスホテル',
        features: ['JR摩周駅徒歩圏', '弟子屈町の中心部', '観光の拠点に便利'],
        taxiFromCityStation: 3, area: '弟子屈', pricePerNight: 8000, dinnerIncluded: false, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: '奈辺久', genre: '郷土料理・手打ちそば', area: '阿寒湖', reservationNeeded: false, budget: 1200 },
        { name: '弟子屈ラーメン 総本店', genre: 'ラーメン', area: '弟子屈', reservationNeeded: false, budget: 900 },
      ],
      dinner: [
        { name: '民芸喫茶 ポロンノ', genre: 'アイヌ料理', area: '阿寒湖', reservationNeeded: false, budget: 2500 },
      ],
      snack: [
        { name: '阿寒湖アイヌコタン 売店', genre: '民芸品・軽食', area: '阿寒湖', budget: 500 },
      ],
    },
    spots: [
      { name: '摩周湖 第一展望台', area: '摩周', duration: 45, indoor: false, taxiFromCityStation: 25 },
      { name: '屈斜路湖・コタン温泉', area: '屈斜路', duration: 60, indoor: false, taxiFromCityStation: 20 },
      { name: '硫黄山（アトサヌプリ）', area: '川湯', duration: 30, indoor: false, taxiFromCityStation: 12 },
      { name: '阿寒湖アイヌコタン', area: '阿寒湖', duration: 60, indoor: true, taxiFromCityStation: 60 },
    ],
  },
  shiretoko: {
    name: '知床', area: '道東', station: '知床斜里駅', transportMode: 'flight', airport: '女満別空港', direction: 'hokkaido', travelTimeFromTokyo: 225,
    highlights: ['知床五湖', '知床峠', 'クルーズ'],
    hotels: [
      { id: 'sr1', name: '北こぶし知床 ホテル＆リゾート', type: 'リゾート',
        features: ['オホーツク海一望', '流氷テラス・サウナ', 'オールインクルーシブ'],
        taxiFromCityStation: 40, area: 'ウトロ', pricePerNight: 35000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'sr2', name: 'KIKI知床 ナチュラルリゾート', type: 'リゾートホテル',
        features: ['知床の自然に溶け込むリゾート', '温泉棟・大浴場', 'ビュッフェダイニング'],
        taxiFromCityStation: 40, area: 'ウトロ', pricePerNight: 28000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'sr3', name: '知床第一ホテル', type: '温泉ホテル',
        features: ['ウトロ温泉の大型ホテル', '展望大浴場', 'マルスコイのビュッフェ'],
        taxiFromCityStation: 40, area: 'ウトロ', pricePerNight: 22000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'sr4', name: '知床プリンスホテル風なみ季', type: 'リゾートホテル',
        features: ['ウトロ漁港至近', '天然温泉・露天風呂', '海鮮を中心としたビュッフェ'],
        taxiFromCityStation: 40, area: 'ウトロ', pricePerNight: 18000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'sr5', name: 'ホテル知床', type: '温泉ホテル',
        features: ['ウトロ温泉街の高台', 'オホーツク海を見渡す展望浴場', '知床の味覚'],
        taxiFromCityStation: 40, area: 'ウトロ', pricePerNight: 15000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'sr6', name: 'ホテルルートイン知床斜里駅前', type: 'ビジネスホテル',
        features: ['JR知床斜里駅前', '大浴場完備', '無料バイキング朝食'],
        taxiFromCityStation: 2, area: '知床斜里駅前', pricePerNight: 9000, dinnerIncluded: false, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: '道の駅 うとろ・シリエトク', genre: '海鮮', area: 'ウトロ', reservationNeeded: false, budget: 2000 },
        { name: '波飛沫', genre: 'ラーメン', area: 'ウトロ', reservationNeeded: false, budget: 1000 },
      ],
      dinner: [
        { name: '番屋', genre: '海鮮・炉端焼き', area: 'ウトロ', reservationNeeded: false, budget: 4000 },
      ],
      snack: [
        { name: '知床自然センター 売店', genre: 'ソフトクリーム', area: '知床', budget: 400 },
      ],
    },
    spots: [
      { name: '知床五湖', area: '知床', duration: 120, indoor: false, taxiFromCityStation: 50 },
      { name: '知床峠展望台', area: '知床', duration: 30, indoor: false, taxiFromCityStation: 55 },
      { name: 'オシンコシンの滝', area: 'ウトロ', duration: 20, indoor: false, taxiFromCityStation: 30 },
      { name: '知床観光船（ウトロ港発）', area: 'ウトロ港', duration: 120, indoor: false, taxiFromCityStation: 40 },
    ],
  },
  nemuro: {
    name: '根室', area: '道東', station: '根室駅', transportMode: 'flight', airport: '釧路空港', direction: 'hokkaido', travelTimeFromTokyo: 225,
    highlights: ['納沙布岬', '春国岱', 'エスカロップ'],
    hotels: [
      { id: 'nm1', name: 'ホテルねむろ海陽亭', type: '温泉旅館',
        features: ['根室港を望む', '天然温泉', '花咲ガニ・海鮮料理'],
        taxiFromCityStation: 5, area: '根室', pricePerNight: 18000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'nm2', name: '根室グランドホテル', type: 'シティホテル',
        features: ['根室市内中心部', 'レストラン併設', 'ビジネス・観光拠点'],
        taxiFromCityStation: 5, area: '根室', pricePerNight: 12000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'nm3', name: 'イーストハーバーホテル', type: 'シティホテル',
        features: ['根室港至近', '海を望む客室', '地元食材の朝食'],
        taxiFromCityStation: 3, area: '根室港', pricePerNight: 10000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'nm4', name: 'ホテルルートイン根室駅前', type: 'ビジネスホテル',
        features: ['根室駅前', '大浴場完備', '無料バイキング朝食'],
        taxiFromCityStation: 2, area: '根室駅前', pricePerNight: 9000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'nm5', name: '照月旅館', type: '料理旅館',
        features: ['明治創業の老舗', 'うにの茶碗蒸し・花咲ガニ', '手作り会席料理'],
        taxiFromCityStation: 5, area: '根室', pricePerNight: 14000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'nm6', name: 'ビジネスホテル ルピナス', type: 'ビジネスホテル',
        features: ['根室市内', 'リーズナブル', '長期滞在にも対応'],
        taxiFromCityStation: 5, area: '根室', pricePerNight: 6000, dinnerIncluded: false, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: 'ニューモンブラン', genre: 'エスカロップ', area: '根室', reservationNeeded: false, budget: 1200 },
        { name: '回転寿司 根室花まる 根室本店', genre: '回転寿司', area: '根室', reservationNeeded: false, budget: 2500 },
      ],
      dinner: [
        { name: '大ちゃん', genre: '花咲ガニ・海鮮', area: '根室', reservationNeeded: false, budget: 4000 },
      ],
      snack: [
        { name: 'どりあん', genre: 'エスカロップ・洋食', area: '根室', budget: 1200 },
      ],
    },
    spots: [
      { name: '納沙布岬（日本最東端）', area: '納沙布', duration: 45, indoor: false, taxiFromCityStation: 30 },
      { name: '春国岱（原生花園）', area: '根室', duration: 90, indoor: false, taxiFromCityStation: 20 },
      { name: '北方原生花園', area: '根室', duration: 60, indoor: false, taxiFromCityStation: 25 },
      { name: '根室市歴史と自然の資料館', area: '根室', duration: 30, indoor: true, taxiFromCityStation: 5 },
    ],
  },
  hakodate: {
    name: '函館',
    area: '北海道',
    station: '新函館北斗駅',
    // 新幹線駅（新函館北斗）と市内観光の拠点駅（函館）が17.9km離れている特殊な都市。
    // cityStation を持つ都市では taxiFromCityStation の起点が station ではなく cityStation になり、
    // 両駅間は connectionToCityStation（はこだてライナー）で結ぶ。
    // 他都市（金沢・京都・箱根・熱海）は cityStation を持たず、従来どおり station が起点。
    cityStation: '函館駅',
    connectionToCityStation: 'hakodate_liner',
    shinkansen: '北海道新幹線',
    direction: 'north',
    travelTimeFromTokyo: 255,
    highlights: ['函館山夜景', '五稜郭', '元町の教会群', '金森赤レンガ倉庫'],
    hotels: [
      {
        id: 'hk1',
        name: '割烹旅館 若松',
        type: '温泉旅館',
        features: ['創業1922年の老舗', '露天風呂付客室', '部屋食対応'],
        taxiFromCityStation: 15,
        taxiVerified: true,
        area: '湯の川温泉',
        pricePerNight: 50000,
        dinnerIncluded: true,
        breakfastIncluded: true,
      },
      {
        id: 'hk2',
        name: '望楼NOGUCHI函館',
        type: 'デザイナーズ旅館',
        features: ['全室展望風呂付', 'モダン和空間', '鉄板焼ダイニング'],
        taxiFromCityStation: 15,
        taxiVerified: true,
        area: '湯の川温泉',
        pricePerNight: 45000,
        dinnerIncluded: true,
        breakfastIncluded: true,
        closedPeriod: { start: '2026-08-20', end: '2027-04-19' },
      },
      {
        id: 'hk3',
        name: 'センチュリーマリーナ函館',
        type: 'シティホテル',
        features: ['最上階インフィニティ温泉', '朝食クチコミ高評価', 'ベイエリア徒歩圏'],
        taxiFromCityStation: 4,
        taxiVerified: true,
        area: 'ベイエリア・函館駅前',
        pricePerNight: 32000,
        dinnerIncluded: false,
        breakfastIncluded: true,
      },
      {
        id: 'hk4',
        name: 'ラビスタ函館ベイ',
        type: 'リゾートホテル',
        features: ['最上階展望大浴場', '朝食の海鮮丼が名物', 'ベイエリア徒歩圏'],
        taxiFromCityStation: 5,
        taxiVerified: true,
        area: 'ベイエリア',
        pricePerNight: 28000,
        dinnerIncluded: false,
        breakfastIncluded: true,
      },
      {
        id: 'hk5',
        name: '函館国際ホテル',
        type: 'シティホテル',
        features: ['本館最上階展望天然温泉', '函館港一望のロケーション', '朝食ビュッフェ人気'],
        taxiFromCityStation: 4,
        taxiVerified: true,
        area: 'ベイエリア・大手町',
        pricePerNight: 20000,
        dinnerIncluded: false,
        breakfastIncluded: true,
      },
      {
        id: 'hk6',
        name: 'プレミアホテル-CABIN PRESIDENT-函館',
        type: 'シティホテル',
        features: ['JR函館駅・朝市まで徒歩1分', '大浴場あり', '和洋中の朝食ブッフェ'],
        taxiFromCityStation: 2,
        taxiVerified: true,
        area: '函館駅前',
        pricePerNight: 16000,
        dinnerIncluded: false,
        breakfastIncluded: true,
      },
    ],
    restaurants: {
      lunch: [
        { name: '函館朝市 きくよ食堂', genre: '海鮮丼', area: '函館朝市', reservationNeeded: false, budget: 3000 },
        { name: '麺厨房あじさい 本店', genre: '函館塩ラーメン', area: '五稜郭', reservationNeeded: false, budget: 1200 },
        { name: 'ラッキーピエロ ベイエリア本店', genre: 'ご当地バーガー', area: 'ベイエリア', reservationNeeded: false, budget: 1000 },
      ],
      dinner: [
        { name: 'レストラン五島軒 本店', genre: '洋食・フレンチ', area: '末広町', reservationNeeded: true, budget: 8000 },
        { name: '鮨処 木はら', genre: '鮨', area: '函館', reservationNeeded: true, budget: 15000 },
        { name: '冨茂登', genre: 'フレンチ', area: '元町', reservationNeeded: true, budget: 12000 },
      ],
      snack: [
        { name: 'ハセガワストア ベイエリア店', genre: 'やきとり弁当', area: 'ベイエリア', budget: 600 },
        { name: 'アンジェリック ヴォヤージュ', genre: '生クレープ', area: '元町', budget: 500 },
        { name: 'プティ・メルヴィーユ 金森店', genre: 'メルチーズ', area: 'ベイエリア', budget: 800 },
      ],
    },
    // taxiFromCityStation は「函館駅」起点（新函館北斗駅ではない）。
    // 旧データは新函館北斗起点の値（朝市22分・五稜郭23分など）が入っていたため全面的に置き換えた。
    // 観光地側は個別の公式アクセス表記を確認できなかったため、市内の道路距離からの概算
    // （taxiVerified: false）。宿と違い行程の骨格を決めないので、概算のまま運用する。
    spots: [
      { name: '五稜郭タワー', area: '五稜郭', duration: 60, indoor: true, taxiFromCityStation: 13, taxiVerified: false },
      { name: '函館山ロープウェイ展望台', area: '函館山', duration: 75, indoor: false, taxiFromCityStation: 10, taxiVerified: false },
      { name: '元町教会群・坂道散策', area: '元町', duration: 60, indoor: false, taxiFromCityStation: 8, taxiVerified: false },
      { name: '金森赤レンガ倉庫', area: 'ベイエリア', duration: 45, indoor: true, taxiFromCityStation: 6, taxiVerified: false },
      // 函館駅に隣接（徒歩1分）。実質ゼロ距離だがタクシー扱いの最小値として2分
      { name: '函館朝市', area: '函館駅前', duration: 40, indoor: true, taxiFromCityStation: 2, taxiVerified: true },
      { name: 'トラピスチヌ修道院', area: '湯の川', duration: 30, indoor: false, taxiFromCityStation: 25, taxiVerified: false },
      { name: '旧函館区公会堂', area: '元町', duration: 30, indoor: true, taxiFromCityStation: 9, taxiVerified: false },
    ],
  },

  // ============================================================
  // 以下：飛行機ルートの目的地（公開版で新規追加）
  // transportMode: 'flight' = 飛行機推奨、station = 空港から最も近い市街地の駅/バス停
  // taxiFromCityStation = 空港 or 主要駅からホテルまでのタクシー時間（分）
  // ============================================================

  sapporo: {
    name: '札幌',
    area: '北海道（道央）',
    station: '新千歳空港',
    transportMode: 'flight',
    airport: '新千歳空港',
    airportToDestMin: 40,
    shinkansen: null,
    direction: 'north',
    travelTimeFromTokyo: 210,
    highlights: ['大通公園', 'すすきの', '札幌時計台', '円山動物園'],
    hotels: [
      { id: 'sp1', name: 'JRタワーホテル日航札幌', type: 'ラグジュアリーホテル',
        features: ['JR札幌駅直結', '高層階パノラマビュー', 'スパ・天然温泉完備'],
        taxiFromCityStation: 40, area: '札幌駅前', pricePerNight: 38000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'sp2', name: '札幌グランドホテル', type: 'シティホテル',
        features: ['1934年創業の老舗', '地下歩行空間直結', '伝統の朝食バイキング'],
        taxiFromCityStation: 42, area: '大通・駅前通', pricePerNight: 30000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'sp3', name: '定山渓温泉 章月グランドホテル', type: '温泉旅館',
        features: ['全室渓谷ビュー', '源泉かけ流し露天風呂', '北海道食材の懐石'],
        taxiFromCityStation: 80, area: '定山渓温泉', pricePerNight: 28000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'sp4', name: '京王プラザホテル札幌', type: 'シティホテル',
        features: ['札幌駅徒歩5分', 'クラブラウンジ充実', '北海道産食材ビュッフェ'],
        taxiFromCityStation: 40, area: '札幌駅前', pricePerNight: 24000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'sp5', name: 'クロスホテル札幌', type: 'デザイナーズホテル',
        features: ['時計台・大通徒歩圏', '最上階展望大浴場', 'スタイリッシュ空間'],
        taxiFromCityStation: 42, area: '時計台前・大通', pricePerNight: 20000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'sp6', name: 'ソラリア西鉄ホテル札幌', type: 'シティホテル',
        features: ['道庁赤れんが庁舎前', '大浴場完備', 'フレンチスタイルの朝食'],
        taxiFromCityStation: 40, area: '道庁前・札幌駅前', pricePerNight: 18000, dinnerIncluded: false, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: '二条市場 海味 はちきょう', genre: '海鮮丼', area: '二条市場', reservationNeeded: false, budget: 3000 },
        { name: 'スープカレー GARAKU', genre: 'スープカレー', area: '狸小路', reservationNeeded: false, budget: 1500 },
      ],
      dinner: [
        { name: 'かに将軍 本店', genre: 'カニ料理', area: 'すすきの', reservationNeeded: true, budget: 15000 },
        { name: '北海道 ジンギスカン 羊々亭', genre: 'ジンギスカン', area: 'すすきの', reservationNeeded: false, budget: 3000 },
      ],
      snack: [
        { name: '六花亭 本店', genre: 'マルセイバターサンド', area: '大通公園', budget: 500 },
        { name: 'にっかい', genre: '串揚げ', area: 'すすきの', budget: 2000 },
      ],
    },
    spots: [
      { name: '大通公園', area: '大通', duration: 45, indoor: false, taxiFromCityStation: 45 },
      { name: '札幌時計台', area: '大通', duration: 30, indoor: true, taxiFromCityStation: 45 },
      { name: '北海道庁旧本庁舎（赤れんが庁舎）', area: '大通', duration: 30, indoor: false, taxiFromCityStation: 43 },
      { name: '円山動物園', area: '円山', duration: 120, indoor: false, taxiFromCityStation: 55 },
    ],
  },

  asahikawa: {
    name: '旭川',
    area: '北海道（道北）',
    station: '旭川空港',
    transportMode: 'flight',
    airport: '旭川空港',
    airportToDestMin: 30,
    shinkansen: null,
    direction: 'north',
    travelTimeFromTokyo: 220,
    highlights: ['旭山動物園', '美瑛の丘', '富良野ラベンダー', '層雲峡'],
    hotels: [
      { id: 'ak1', name: 'ラビスタ大雪山', type: 'リゾートホテル',
        features: ['大雪山の山岳リゾート', '源泉かけ流し天然温泉', '創作フレンチコース'],
        taxiFromCityStation: 90, area: '旭岳温泉', pricePerNight: 32000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ak2', name: 'OMO7旭川 by 星野リゾート', type: 'デザイナーズホテル',
        features: ['旭川中心街・繁華街至近', '地域体験プログラム', '北海道食材ビュッフェ'],
        taxiFromCityStation: 5, area: '旭川中心街', pricePerNight: 22000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ak3', name: 'ホテルWBFグランデ旭川', type: 'シティホテル',
        features: ['旭川駅東口徒歩2分', '天然温泉みなぴりかの湯', '岩盤浴・サウナ完備'],
        taxiFromCityStation: 3, area: '旭川駅前', pricePerNight: 18000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ak4', name: 'JRイン旭川', type: 'シティホテル',
        features: ['JR旭川駅直結', 'イオンモール直結', '宿泊者専用大浴場'],
        taxiFromCityStation: 2, area: '旭川駅直結', pricePerNight: 16000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ak5', name: 'ホテルルートインGrand旭川駅前', type: 'ビジネスホテル',
        features: ['旭川駅徒歩2分', '天然温泉天人乃湯', '最上階サウナ・大浴場'],
        taxiFromCityStation: 2, area: '旭川駅前', pricePerNight: 15000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ak6', name: 'プレミアホテル-CABIN-旭川', type: 'シティホテル',
        features: ['旭川駅徒歩3分', '天然温泉大浴場・露天風呂', '展望レストラン朝食'],
        taxiFromCityStation: 3, area: '旭川駅前・中心街', pricePerNight: 12000, dinnerIncluded: false, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: '旭川ラーメン 蜂屋 五条創業店', genre: '旭川醤油ラーメン', area: '五条', reservationNeeded: false, budget: 900 },
        { name: '農家レストラン 風のガーデン', genre: '地元野菜の洋食', area: '富良野', reservationNeeded: true, budget: 2500 },
      ],
      dinner: [
        { name: '北海道 海鮮処 とっかりや', genre: '海鮮居酒屋', area: '旭川駅前', reservationNeeded: false, budget: 4000 },
      ],
      snack: [
        { name: '旭山動物園 売店', genre: 'ソフトクリーム', area: '旭山', budget: 400 },
      ],
    },
    spots: [
      { name: '旭山動物園', area: '旭山', duration: 150, indoor: false, taxiFromCityStation: 20 },
      { name: '美瑛の丘（パッチワークの路）', area: '美瑛', duration: 120, indoor: false, taxiFromCityStation: 45 },
      { name: '富良野ラベンダー畑（ファーム富田）', area: '富良野', duration: 90, indoor: false, taxiFromCityStation: 80 },
      { name: '層雲峡・黒岳ロープウェイ', area: '層雲峡', duration: 120, indoor: false, taxiFromCityStation: 90 },
    ],
  },

  obihiro: {
    name: '帯広',
    area: '北海道（道東）',
    station: 'とかち帯広空港',
    transportMode: 'flight',
    airport: 'とかち帯広空港',
    airportToDestMin: 30,
    shinkansen: null,
    direction: 'north',
    travelTimeFromTokyo: 200,
    highlights: ['十勝牧場', '幸福駅', '六花亭本店', '帯広競馬場（ばんえい競馬）'],
    hotels: [
      { id: 'ob1', name: '森のスパリゾート 北海道ホテル', type: 'リゾートホテル',
        features: ['市街地の閑静な森', '源泉モール温泉・本格サウナ', '十勝食材の洋食・和食'],
        taxiFromCityStation: 5, area: '帯広市街', pricePerNight: 26000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ob2', name: 'ホテル日航ノースランド帯広', type: 'シティホテル',
        features: ['JR帯広駅南口直結', '格式高い上質空間', '十勝産食材の朝食ブッフェ'],
        taxiFromCityStation: 1, area: '帯広駅直結', pricePerNight: 20000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ob3', name: '帯広天然温泉 ふく井ホテル', type: 'シティホテル',
        features: ['帯広駅前徒歩1分', '完全源泉かけ流しモール温泉', '地元食材の和洋朝食'],
        taxiFromCityStation: 1, area: '帯広駅前', pricePerNight: 16000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ob4', name: 'リッチモンドホテル帯広駅前', type: 'ビジネスホテル',
        features: ['帯広駅前徒歩1分', '広々とした客室・デスク', '豚丼が選べる朝食'],
        taxiFromCityStation: 1, area: '帯広駅前', pricePerNight: 14000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ob5', name: '天然温泉 白樺の湯 ドーミーイン帯広', type: 'ビジネスホテル',
        features: ['繁華街至近', '天然モール温泉大浴場・サウナ', '夜鳴きそば無料サービス'],
        taxiFromCityStation: 3, area: '帯広中心街', pricePerNight: 13000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ob6', name: 'コンフォートホテル帯広', type: 'ビジネスホテル',
        features: ['帯広駅徒歩1分', '無料朝食ビュッフェ', '全館禁煙・快眠ベッド'],
        taxiFromCityStation: 1, area: '帯広駅前', pricePerNight: 11000, dinnerIncluded: false, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: '元祖豚丼のぱんちょう', genre: '豚丼', area: '帯広駅前', reservationNeeded: false, budget: 1200 },
        { name: '北の屋台', genre: '各種屋台料理', area: '帯広中心部', reservationNeeded: false, budget: 2000 },
      ],
      dinner: [
        { name: '炭火焼肉 とかち村', genre: '十勝牛焼肉', area: '帯広', reservationNeeded: true, budget: 5000 },
      ],
      snack: [
        { name: '六花亭 帯広本店', genre: 'マルセイバターサンド・カフェ', area: '帯広駅前', budget: 800 },
      ],
    },
    spots: [
      { name: 'ばんえい競馬（帯広競馬場）', area: '帯広', duration: 120, indoor: false, taxiFromCityStation: 10 },
      { name: '六花の森', area: '中札内', duration: 90, indoor: false, taxiFromCityStation: 50 },
      { name: '幸福駅', area: '帯広市南部', duration: 30, indoor: false, taxiFromCityStation: 30 },
    ],
  },

  kushiro: {
    name: '釧路',
    area: '北海道（道東）',
    station: 'たんちょう釧路空港',
    transportMode: 'flight',
    airport: 'たんちょう釧路空港',
    airportToDestMin: 30,
    shinkansen: null,
    direction: 'north',
    travelTimeFromTokyo: 210,
    highlights: ['釧路湿原', 'タンチョウ', '和商市場', '釧路フィッシャーマンズワーフ'],
    hotels: [
      { id: 'ku1', name: 'ANA クラウンプラザホテル釧路', type: 'シティホテル',
        features: ['釧路川・MOO前リバーサイド', '高層階パノラマビュー', '和食・洋食レストラン'],
        taxiFromCityStation: 5, area: '釧路ウォーターフロント', pricePerNight: 22000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ku2', name: '釧路プリンスホテル', type: 'シティホテル',
        features: ['市役所前・海沿い', '最上階展望レストラン', '夕陽の名所至近'],
        taxiFromCityStation: 5, area: '釧路市役所前', pricePerNight: 18000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ku3', name: '天然温泉 幣舞の湯 ラビスタ釧路川', type: 'リゾートホテル',
        features: ['幣舞橋たもと', '最上階天然温泉・露天風呂', '海鮮朝食バイキング・夜鳴きそば'],
        taxiFromCityStation: 4, area: '幣舞橋前', pricePerNight: 16000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ku4', name: '釧路ロイヤルイン', type: 'ビジネスホテル',
        features: ['JR釧路駅前徒歩1分', '毎朝焼き立てのパン朝食', '和商市場徒歩3分'],
        taxiFromCityStation: 1, area: '釧路駅前', pricePerNight: 14000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ku5', name: 'ホテルルートイン釧路駅前', type: 'ビジネスホテル',
        features: ['JR釧路駅前徒歩2分', 'ラジウム人工温泉大浴場', '無料バイキング朝食'],
        taxiFromCityStation: 1, area: '釧路駅前', pricePerNight: 13000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ku6', name: 'コンフォートホテル釧路', type: 'ビジネスホテル',
        features: ['JR釧路駅前徒歩2分', '無料朝食サービス', '全室禁煙・快適デスク'],
        taxiFromCityStation: 1, area: '釧路駅前', pricePerNight: 11000, dinnerIncluded: false, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: '和商市場 勝手丼', genre: '海鮮丼', area: '釧路駅前', reservationNeeded: false, budget: 2500 },
        { name: '炉端 釧路 炉ばた 煉瓦', genre: '炉端焼き', area: '錦町', reservationNeeded: true, budget: 4000 },
      ],
      dinner: [
        { name: '炉端の大将', genre: '炉端焼き', area: '錦町', reservationNeeded: false, budget: 3500 },
      ],
      snack: [
        { name: 'スパカツ（泉屋 本店）', genre: 'スパゲッティカツ', area: '末広', budget: 1000 },
      ],
    },
    spots: [
      { name: '釧路湿原国立公園', area: '釧路湿原', duration: 120, indoor: false, taxiFromCityStation: 20 },
      { name: '釧路市動物園', area: '釧路', duration: 90, indoor: false, taxiFromCityStation: 15 },
      { name: '細岡展望台', area: '釧路湿原', duration: 60, indoor: false, taxiFromCityStation: 25 },
    ],
  },

  abashiri: {
    name: '網走',
    area: '北海道（オホーツク）',
    station: '女満別空港',
    transportMode: 'flight',
    airport: '女満別空港',
    airportToDestMin: 20,
    shinkansen: null,
    direction: 'north',
    travelTimeFromTokyo: 225,
    highlights: ['流氷（冬）', '網走監獄', 'オホーツク流氷館', '知床（世界遺産）'],
    hotels: [
      { id: 'ab1', name: '北天の丘 あばしり湖鶴雅リゾート', type: 'リゾートホテル',
        features: ['オホーツク文化の意匠', '自家源泉の露天風呂・岩盤浴', 'オホーツクビュッフェ・会席'],
        taxiFromCityStation: 10, area: '網走湖畔', pricePerNight: 36000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ab2', name: '網走湖畔温泉 ホテル網走湖荘', type: '温泉旅館',
        features: ['網走湖畔の絶景', '天然温泉大浴場・露天風呂', 'オホーツクの海鮮会席'],
        taxiFromCityStation: 10, area: '網走湖畔', pricePerNight: 18000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ab3', name: 'ホテルルートイン網走駅前', type: 'ビジネスホテル',
        features: ['JR網走駅前徒歩1分', '天然温泉大浴場', '無料バイキング朝食'],
        taxiFromCityStation: 1, area: '網走駅前', pricePerNight: 14000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ab4', name: '天然温泉 モヨロの湯 ドーミーイン網走', type: 'ビジネスホテル',
        features: ['網走バスターミナル前', '天然温泉大浴場・露天風呂', '夜鳴きそば無料サービス'],
        taxiFromCityStation: 3, area: '網走中心街', pricePerNight: 13000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ab5', name: '天都の宿 網走観光ホテル', type: '温泉ホテル',
        features: ['天都山の高台に立地', '網走湖一望の展望露天風呂', 'オホーツクバイキング'],
        taxiFromCityStation: 8, area: '天都山・湖畔', pricePerNight: 12000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'ab6', name: '東横INNオホーツク・網走駅前', type: 'ビジネスホテル',
        features: ['JR網走駅前徒歩1分', '安心・清潔な客室', '無料朝食サービス'],
        taxiFromCityStation: 1, area: '網走駅前', pricePerNight: 9000, dinnerIncluded: false, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: '網走港に水揚げされた魚介料理 ととや', genre: '海鮮料理', area: '網走港', reservationNeeded: false, budget: 2000 },
      ],
      dinner: [
        { name: '流氷ドラフト（地ビール・居酒屋）', genre: '地ビール・郷土料理', area: '網走市街', reservationNeeded: false, budget: 3000 },
      ],
      snack: [
        { name: 'ハーゲンダッツ 網走監獄ソフト', genre: 'ソフトクリーム', area: '博物館網走監獄', budget: 400 },
      ],
    },
    spots: [
      { name: '博物館 網走監獄', area: '網走市', duration: 90, indoor: true, taxiFromCityStation: 5 },
      { name: 'オホーツク流氷館', area: '天都山', duration: 60, indoor: true, taxiFromCityStation: 10 },
      { name: '知床五湖', area: '知床', duration: 150, indoor: false, taxiFromCityStation: 90 },
      { name: '知床峠展望台', area: '知床', duration: 60, indoor: false, taxiFromCityStation: 100 },
    ],
  },

  wakkanai: {
    name: '稚内',
    area: '北海道（最北端）',
    station: '稚内空港',
    transportMode: 'flight',
    airport: '稚内空港',
    airportToDestMin: 25,
    shinkansen: null,
    direction: 'north',
    travelTimeFromTokyo: 270,
    highlights: ['宗谷岬（日本最北端）', 'ノシャップ岬', '利尻島・礼文島', 'サロベツ原野'],
    hotels: [
      { id: 'wk1', name: 'サフィールホテル稚内', type: 'シティホテル',
        features: ['JR稚内駅徒歩3分・港前', '最北のシティホテル', '宗谷の味覚レストラン'],
        taxiFromCityStation: 1, area: '稚内港・駅前', pricePerNight: 22000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'wk2', name: '天然温泉 天北の湯 ドーミーイン稚内', type: 'ビジネスホテル',
        features: ['JR稚内駅徒歩2分', '最北の天然温泉大浴場', '夜鳴きそば無料サービス'],
        taxiFromCityStation: 1, area: '稚内駅前', pricePerNight: 14000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'wk3', name: 'ホテルルートイン稚内駅前', type: 'ビジネスホテル',
        features: ['JR稚内駅前徒歩1分', '天然温泉活性石大浴場', '無料バイキング朝食'],
        taxiFromCityStation: 1, area: '稚内駅前', pricePerNight: 13000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'wk4', name: 'ホテル美雪', type: 'ビジネスホテル',
        features: ['JR稚内駅徒歩6分', '中心街の静かな立地', 'アットホームなおもてなし'],
        taxiFromCityStation: 2, area: '稚内中心街', pricePerNight: 10000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'wk5', name: '稚内グランドホテル', type: 'シティホテル',
        features: ['南稚内駅徒歩3分', '天然温泉大浴場・露天風呂', '宗谷牛・海鮮の夕食'],
        taxiFromCityStation: 8, area: '南稚内駅前', pricePerNight: 9000, dinnerIncluded: true, breakfastIncluded: true },
      { id: 'wk6', name: 'ホテルクラウンヒルズ稚内', type: 'ビジネスホテル',
        features: ['JR稚内駅徒歩5分', '大浴場・サウナ完備', '朝食バイキング無料'],
        taxiFromCityStation: 1, area: '稚内駅前', pricePerNight: 8000, dinnerIncluded: false, breakfastIncluded: true },
    ],
    restaurants: {
      lunch: [
        { name: '港のなると食堂', genre: '海鮮料理・ホッケ', area: '稚内港', reservationNeeded: false, budget: 1500 },
      ],
      dinner: [
        { name: '居酒屋 最北端', genre: '北海道郷土料理', area: '稚内市街', reservationNeeded: false, budget: 3000 },
      ],
      snack: [
        { name: '宗谷岬 売店', genre: 'ソフトクリーム・みやげ', area: '宗谷岬', budget: 500 },
      ],
    },
    spots: [
      { name: '宗谷岬（日本最北端の地）', area: '宗谷岬', duration: 45, indoor: false, taxiFromCityStation: 30 },
      { name: 'ノシャップ岬', area: 'ノシャップ', duration: 30, indoor: false, taxiFromCityStation: 10 },
      { name: 'サロベツ原野', area: 'サロベツ', duration: 90, indoor: false, taxiFromCityStation: 50 },
    ],
  },
};

const SHINKANSEN_STATIONS = {
  north: ['東京', '上野', '大宮', '高崎', '長野', '新潟', '仙台', '盛岡', '新青森'],
  south: ['東京', '品川', '新横浜', '小田原', '熱海', '名古屋', '京都', '新大阪', '広島', '博多'],
};

const BUSY_PERIODS = [
  { name: '年末年始', start: '12-28', end: '01-05' },
  { name: 'ゴールデンウィーク', start: '04-27', end: '05-06' },
  { name: 'お盆', start: '08-10', end: '08-16' },
  { name: 'シルバーウィーク', start: '09-14', end: '09-23' },
  { name: '春休み', start: '03-25', end: '04-05' },
];

// 公式運賃を複数サイトでクロスチェック済みの区間のみ登録する。
// キーは getTravelTimes() と同じ「出発駅-目的地名」形式。
// fare_yen は大人1名・片道(乗車券+指定席特急料金)。
const SHINKANSEN_FARES = {
  '宇都宮-函館': {
    duration_min: 238,
    fare_yen: 22470,
    fare_breakdown: { kijousha: 11990, tokkyu: 10480 },
    transfers: 1,
    transfer_station: '仙台',
    train_name: 'やまびこ→はやぶさ',
    source: 'Yahoo!路線情報・駅探(2サイト一致)',
    verified_date: '2026-08-04',
  },
  '那須塩原-函館': {
    duration_min: 219,
    fare_yen: 21770,
    fare_breakdown: { kijousha: 11660, tokkyu: 10110 },
    transfers: 1,
    transfer_station: '仙台',
    train_name: 'やまびこ→はやぶさ',
    source: 'Yahoo!路線情報・駅探(2サイト一致)',
    verified_date: '2026-08-04',
  },
};

// ============================================================
// 実ダイヤ（乗り継ぎパターン）
// ============================================================
// 公開版注記：
// 個人版では出発地起点の実ダイヤを往復パターンで保持していたが、
// 個人の出発地が特定されるため公開版では削除した。
// 公開版は概算計算（TABLE_B所要時間）を使用する。
// 将来、主要新幹線駅の実ダイヤを整備する場合はここに追加する。
const SHINKANSEN_SCHEDULES = {
  // 公開版：実ダイヤは未整備。概算計算にフォールバックする。
  // 将来整備する場合：
  // 'sendai-hakodate': [ ... ],
  // 'hakodate-sendai': [ ... ],
};

// 「出発駅名|目的地エリア名」→ SHINKANSEN_SCHEDULES のキー。
// 公開版：出発地固有のルートは削除。実ダイヤ未整備のため全区間概算計算にフォールバック。
const SCHEDULE_ROUTES = {
  // 公開版：実ダイヤ未整備のため空。概算計算（TABLE_B）を使用する。
  // '仙台|函館': { outbound: 'sendai-hakodate', inbound: 'hakodate-sendai' }, // 将来整備予定
};

// 希望時刻と実際の便の差がこの分数以上なら「大幅に」ずれる旨を警告する
const SCHEDULE_LARGE_GAP_MIN = 300;

// 選択中の駅名と目的地名から、往路・復路の実ダイヤパターン群を引く。
// 公開版：実ダイヤ未整備のため常に null を返し、概算計算にフォールバックする。
function lookupTripSchedule(stationName, destName) {
  if (!stationName || !destName) return null;
  for (const [key, route] of Object.entries(SCHEDULE_ROUTES)) {
    const [depKeyword, destKeyword] = key.split('|');
    if (stationName.includes(depKeyword) && destName.includes(destKeyword)) {
      return {
        outbound: SHINKANSEN_SCHEDULES[route.outbound],
        inbound: SHINKANSEN_SCHEDULES[route.inbound],
        outboundKey: route.outbound,
        inboundKey: route.inbound,
      };
    }
  }
  return null;
}

// パターンの「基準時刻」を返す。往路は始発駅の出発時刻、復路は終着駅の到着時刻で比較する
// （ユーザーが気にするのは往路＝何時に家を出るか、復路＝何時に帰り着くか、であるため）。
function scheduleAnchorTime(pattern, mode) {
  return mode === 'arrival' ? pattern.steps[pattern.steps.length - 1].arr : pattern.steps[0].dep;
}

// 希望時刻(targetTimeStr)に対して実ダイヤから候補を求める。
//   exact  : 希望時刻ちょうどの便（あればこれで確定、選択UIは出さない）
//   earlier: 希望より早い便のうち最も遅いもの（選択肢A）
//   nearest: 希望に最も近い便（前後問わず。選択肢B。earlierと同じになることもある）
// diffMin は「実際の時刻 − 希望時刻」。負なら希望より早い、正なら希望より遅い。
// needsChoice が false のときは auto の便で確定してよい（A/Bが同一 or 片方しか存在しないケース）。
function findScheduleOptions(patterns, targetTimeStr, mode) {
  if (!patterns || !patterns.length || !targetTimeStr) return null;
  const target = localTrainTimeToMinutes(targetTimeStr);
  const entries = patterns.map((pattern) => {
    const timeStr = scheduleAnchorTime(pattern, mode);
    const min = localTrainTimeToMinutes(timeStr);
    return { pattern, timeStr, min, diffMin: min - target };
  });

  const exact = entries.find((e) => e.diffMin === 0) || null;
  if (exact) return { exact, earlier: null, nearest: null, needsChoice: false, auto: exact };

  const earlierCands = entries.filter((e) => e.diffMin < 0);
  const earlier = earlierCands.length
    ? earlierCands.reduce((a, b) => (b.diffMin > a.diffMin ? b : a))
    : null;
  const nearest = entries.reduce((a, b) => (Math.abs(b.diffMin) < Math.abs(a.diffMin) ? b : a));

  // A と B が同じ便、または希望より早い便が存在しない場合は選ばせる意味がないので自動確定する
  const needsChoice = !!(earlier && earlier.pattern !== nearest.pattern);
  return { exact: null, earlier, nearest, needsChoice, auto: needsChoice ? null : (earlier || nearest) };
}

// 時間差を「1時間24分早い」のような日本語にする（diffMin は findScheduleOptions と同じ符号規則）
function formatScheduleDiff(diffMin) {
  const abs = Math.abs(diffMin);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const span = h ? (m ? `${h}時間${m}分` : `${h}時間`) : `${m}分`;
  return diffMin < 0 ? `${span}早い` : `${span}遅い`;
}

// 差が大きすぎる選択肢に添える注意書き。許容範囲内なら null
function scheduleGapWarning(diffMin) {
  if (Math.abs(diffMin) < SCHEDULE_LARGE_GAP_MIN) return null;
  return diffMin < 0 ? '大幅に早まります' : '大幅に遅くなります';
}

// 函館の現地交通(新幹線以外)。SHINKANSEN_FARES と同じく
// 出典(source)・確認日(verified_date)付きの確定データのみ登録する。
const LOCAL_TRANSIT_FARES = {
  // 新函館北斗駅 → 函館駅 のアクセス手段（営業キロ 17.9km）
  //
  // 【2026-08-06 再検証メモ】
  // 旧データは出典を「はこぶら公式・不動産会社ブログ」としていたが、はこぶらの該当ページ
  // (https://www.hakobura.jp/news/448) は2016年公開・2019年時点の内容で運賃を「440円」と
  // 記載しており、470円の裏付けになっていなかった。出典を貼り直したうえで各項目を再確認した。
  shinhakodatehokuto_hakodate: {
    // ✅ 確定：2025/4/1のJR北海道運賃改定で440円→470円。きっぷ・IC同額、こども230円。
    //   駅探      https://ekitan.com/transit/fare/sf-85/st-392 （470円・17.9km）
    //   JR北海道公式 https://www.jrhokkaido.co.jp/fare/ （2025年4月1日運賃改定の告知）
    train: {
      name: 'はこだてライナー',
      duration_min: [15, 22], // 快速15分／普通22分
      fare_yen: 470,
      note: '2025年4月改定後の運賃(旧440円)。快速は五稜郭のみ停車',
      verified: true,
    },
    // ⚠ 要再調査：旧データは「自由席特急料金320円」としていたが、JR北海道は2026年3月14日の
    //   ダイヤ改正で道内全特急を全車指定席化し、自由席そのものが廃止された。
    //   → https://www.jrhokkaido.co.jp/zensha/ （公式・全車指定席化の告知）
    //   現行の指定席特急料金は公式・駅探いずれでも金額を確認できなかったため、
    //   憶測で数値を置かず null にしている（CLAUDE.md「無言で仮の値を使わない」に従う）。
    limited_express: {
      name: '特急北斗',
      duration_min: 15,
      fare_yen: null,
      note: '2026年3月14日より全車指定席（自由席廃止）。指定席特急料金は未確認',
      verified: false,
    },
    // ⚠ 要再調査：旧データは900円・50〜86分だったが、函館バス33系統について
    //   660円・74〜79分とする情報があり食い違う。1ソースのみで確定できないため保留。
    //   確認先候補：函館バス公式 http://www.hakobus.co.jp/shin-hakodate-hokuto/
    bus: {
      name: '函館バス33系統',
      duration_min: [50, 86],
      fare_yen: 900,
      note: '660円・74〜79分とする情報と食い違い。未確定',
      verified: false,
    },
    source: '駅探・JR北海道公式（はこだてライナーのみ2ソース一致で確定）',
    verified_date: '2026-08-06',
  },
  // 函館市電 運賃表(函館市公式・2025年12月改定)
  hakodate_tram_fare: {
    system: '対キロ区間制',
    adult: { '2km': 250, '4km': 270, '7km': 290, over_7km: 300 },
    child: { '2km': 130, '4km': 140, '7km': 150, over_7km: 150 },
    major_routes: {
      hakodate_eki_mae_to_juji_gai: 250,
      hakodate_eki_mae_to_goryokaku_koen_mae: 270,
      hakodate_eki_mae_to_yunokawa_onsen: 290,
      juji_gai_to_yunokawa: 300,
    },
    one_day_pass_yen: 800,
    source: '函館市公式サイト',
    verified_date: '2026-08-04（2026年4月17日更新確認済み）',
  },
  // 函館市内タクシー運賃(函館市公式・2025年12月改定)
  //
  // 【既知の誤差 2026-08-06】estimateTaxiFare() は所要分×0.5km/分(時速30km)で距離を逆算するが、
  // 市街地の短距離ほど信号待ちで実速度が落ちるため距離＝料金を過大評価する。
  // 函館駅起点で実距離と突き合わせた結果：
  //   15分以上の区間（湯の川温泉7.5km・トラピスチヌ10.5km）はほぼ一致（誤差1.0〜1.2倍）
  //   10分以下の区間（金森1.5km・ラビスタ1.2km・函館山2.8km）は1.6〜1.75倍の過大評価
  // 桁は合っており実害は1回あたり¥300〜600程度のため今回は据え置き。
  // 恒久対応するなら各地点に実距離(km)を持たせ、分からの逆算をやめるのが正しい。
  hakodate_taxi_fare: {
    initial_fare: { distance_km: 1.35, yen: 700 },
    additional_fare: { distance_m: 267, yen: 100 },
    time_based_fare: { seconds: 100, yen: 100, condition: '時速10km以下の場合' },
    source: '函館市公式サイト',
    verified_date: '2026-08-04',
  },
};

// 函館以外の全19エリア（元からある札幌・旭川・帯広・釧路・網走・稚内、および
// Phase2で追加した千歳・苫小牧・小樽・ニセコ・洞爺湖・登別・積丹・江差・富良野・
// 美瑛・摩周湖・知床・根室）は、以前は getTaxiFareData() に個別データが存在せず、
// app.js の estimateTaxiFare() が「所要分×500円」という距離を一切考慮しない
// フォールバック計算に頼っていた（函館のような初乗り運賃・加算運賃の仕組みが
// 存在しなかった）。
//
// タクシー運賃は国土交通省地方運輸局が「運賃適用地域」ごとに公示する認可運賃制で、
// 個々のタクシー会社が独自に決めるものではないため、地区(ゾーン)さえ特定できれば
// 会社ごとに調べ直さなくても公式の運賃が確定する。函館の初乗り700円/267mごとに100円
// という既存データも、実は下記と同じ北海道運輸局公示の「函館Ａ地区・普通車・上限運賃」
// と完全に一致する値だった（函館市公式サイトの表記も同じ公示に基づく）。
//
// 【出典】北海道運輸局公示第６１号（令和８年６月２日最終改正、令和８年７月１０日適用）
//   本文・別紙（自動認可運賃・料金表）:
//   https://wwwtb.mlit.go.jp/hokkaido/20260526_00003.html
//   PDF: https://hokuhakyo.or.jp/wphhk2507/wp-content/uploads/2025/07/fare_auto-authorization.pdf
//   運賃適用地域（市町村→ゾーンの対応）は別添の営業区域表による。
// 各ゾーンとも「普通車・距離制運賃・上限運賃」の値を採用（函館の既存データと同じ考え方）。
// verified_date は本公示を確認した日。
const HOKKAIDO_TAXI_FARE_ZONES = {
  // 札幌・小樽地区 → 小樽（+ 札幌）
  sapporo_otaru: {
    initial_fare: { distance_km: 1.05, yen: 600 },
    additional_fare: { distance_m: 272, yen: 100 },
    source: '北海道運輸局公示第61号（札幌・小樽地区）',
    verified_date: '2026-09-13',
  },
  // 千歳・空知・後志地区 → 千歳・ニセコ（倶知安圏）・積丹（岩内余市圏）
  chitose_sorachi_shiribeshi: {
    initial_fare: { distance_km: 1.4, yen: 740 },
    additional_fare: { distance_m: 293, yen: 100 },
    source: '北海道運輸局公示第61号（千歳・空知・後志地区）',
    verified_date: '2026-09-13',
  },
  // 旭川地区 → 富良野・美瑛（富良野圏）+ 旭川・稚内
  asahikawa: {
    initial_fare: { distance_km: 1.31, yen: 750 },
    additional_fare: { distance_m: 281, yen: 100 },
    source: '北海道運輸局公示第61号（旭川地区）',
    verified_date: '2026-09-13',
  },
  // 函館Ｂ地区 → 江差（檜山圏）※函館市自体はhakodate_taxi_fare（函館Ａ地区）を別途使用
  hakodate_b: {
    initial_fare: { distance_km: 1.4, yen: 700 },
    additional_fare: { distance_m: 276, yen: 100 },
    source: '北海道運輸局公示第61号（函館Ｂ地区）',
    verified_date: '2026-09-13',
  },
  // 室蘭地区 → 苫小牧（苫小牧交通圏）・登別（登別市）・洞爺湖（洞爺湖圏）
  muroran: {
    initial_fare: { distance_km: 1.3, yen: 700 },
    additional_fare: { distance_m: 275, yen: 100 },
    source: '北海道運輸局公示第61号（室蘭地区）',
    verified_date: '2026-09-13',
  },
  // 釧路地区 → 摩周湖/弟子屈（厚岸川上圏）・根室（根室市）+ 釧路
  kushiro: {
    initial_fare: { distance_km: 1.4, yen: 800 },
    additional_fare: { distance_m: 259, yen: 100 },
    source: '北海道運輸局公示第61号（釧路地区）',
    verified_date: '2026-09-13',
  },
  // 帯広地区 → 帯広
  obihiro: {
    initial_fare: { distance_km: 1.4, yen: 750 },
    additional_fare: { distance_m: 293, yen: 100 },
    source: '北海道運輸局公示第61号（帯広地区）',
    verified_date: '2026-09-13',
  },
  // 北見地区 → 知床/斜里（斜里圏）+ 網走
  kitami: {
    initial_fare: { distance_km: 1.4, yen: 750 },
    additional_fare: { distance_m: 293, yen: 100 },
    source: '北海道運輸局公示第61号（北見地区）',
    verified_date: '2026-09-13',
  },
};

// DESTINATIONS の name → 上記ゾーンキーの対応表（運賃適用地域の営業区域表に基づく）
const TAXI_FARE_ZONE_BY_DEST = {
  '札幌': 'sapporo_otaru',
  '小樽': 'sapporo_otaru',
  '千歳': 'chitose_sorachi_shiribeshi',
  'ニセコ': 'chitose_sorachi_shiribeshi',
  '積丹': 'chitose_sorachi_shiribeshi',
  '旭川': 'asahikawa',
  '稚内': 'asahikawa',
  '富良野': 'asahikawa',
  '美瑛': 'asahikawa',
  '江差': 'hakodate_b',
  '苫小牧': 'muroran',
  '登別': 'muroran',
  '洞爺湖': 'muroran',
  '釧路': 'kushiro',
  '摩周湖': 'kushiro',
  '根室': 'kushiro',
  '帯広': 'obihiro',
  '網走': 'kitami',
  '知床': 'kitami',
};

// 新幹線駅と市内拠点駅が離れている都市の連絡列車。
// DESTINATIONS 側の connectionToCityStation がこのキーを指す。
//
// 【確認済みソース】2026-08-06 確認（駅探の掲載基準日 2026年7月21日）
//   新函館北斗発（函館方面）https://ekitan.com/timetable/railway/line-station/28-5/d1
//   函館発（新函館北斗方面）https://ekitan.com/timetable/railway/line-station/28-0/d1
//   所要時間 https://www.town.nanae.hokkaido.jp/hotnews/detail/00003947.html （七飯町公式）
//   運賃470円 https://ekitan.com/transit/fare/sf-85/st-392 ＋ JR北海道公式運賃改定告知
//
// 【整合性チェック】SHINKANSEN_SCHEDULES で採用した新幹線の新函館北斗
// 到着7便すべてに対し9〜20分後の連絡便が、出発6便すべてに対し10〜21分前の到着便が
// 存在することを確認済み（はこだてライナーは新幹線接続列車として設定されているため）。
//
// 発車時刻は実時刻。到着時刻は「快速/普通ごとの一律所要時間」を足して算出する
// （LOCAL_TRAIN_CONNECTIONS の duration_min と同じ扱い。データ二重管理を避けるため）。
const CITY_STATION_CONNECTIONS = {
  hakodate_liner: {
    name: 'はこだてライナー',
    line: 'JR函館本線',
    fare_yen: 470,
    verified: true,
    // 新函館北斗 → 函館（上り）。快速は五稜郭のみ停車
    toCityStation: {
      duration_min: { rapid: 15, local: 19 },
      departures: [
        { dep: '07:11', rapid: false }, { dep: '07:47', rapid: false }, { dep: '08:14', rapid: false },
        { dep: '09:20', rapid: true }, { dep: '10:11', rapid: false }, { dep: '11:07', rapid: true },
        { dep: '12:35', rapid: true }, { dep: '13:49', rapid: true }, { dep: '15:11', rapid: true },
        { dep: '16:40', rapid: false }, { dep: '17:30', rapid: false }, { dep: '17:57', rapid: false },
        { dep: '18:39', rapid: true }, { dep: '19:55', rapid: true }, { dep: '21:53', rapid: false },
        { dep: '23:38', rapid: false },
      ],
    },
    // 函館 → 新函館北斗（下り）
    fromCityStation: {
      duration_min: { rapid: 19, local: 22 },
      departures: [
        { dep: '06:07', rapid: false }, { dep: '07:02', rapid: true }, { dep: '07:47', rapid: false },
        { dep: '08:50', rapid: true }, { dep: '09:41', rapid: false }, { dep: '10:21', rapid: false },
        { dep: '12:05', rapid: false }, { dep: '13:07', rapid: false }, { dep: '14:17', rapid: true },
        { dep: '15:44', rapid: false }, { dep: '16:55', rapid: true }, { dep: '17:28', rapid: false },
        { dep: '18:06', rapid: false }, { dep: '19:12', rapid: true }, { dep: '20:11', rapid: false },
        { dep: '21:16', rapid: false }, { dep: '23:11', rapid: false },
      ],
    },
    source: '駅探（時刻）・七飯町公式（所要時間）・JR北海道公式（運賃）',
    verified_date: '2026-08-06',
  },
};

// afterMin 以降（bufferMin の余裕を見て）に出る最初の連絡便を返す。無ければ null
function pickCityConnectionAfter(leg, afterMin, bufferMin = 0) {
  for (const t of leg.departures) {
    const dep = localTrainTimeToMinutes(t.dep);
    if (dep >= afterMin + bufferMin) {
      const dur = t.rapid ? leg.duration_min.rapid : leg.duration_min.local;
      return { dep: t.dep, depMin: dep, arrMin: dep + dur, durationMin: dur, rapid: t.rapid };
    }
  }
  return null;
}

// beforeMin までに到着する最後の連絡便を返す（乗り継ぎに bufferMin の余裕を確保）。無ければ null
function pickCityConnectionBefore(leg, beforeMin, bufferMin = 0) {
  let best = null;
  for (const t of leg.departures) {
    const dep = localTrainTimeToMinutes(t.dep);
    const dur = t.rapid ? leg.duration_min.rapid : leg.duration_min.local;
    const arr = dep + dur;
    if (arr <= beforeMin - bufferMin) best = { dep: t.dep, depMin: dep, arrMin: arr, durationMin: dur, rapid: t.rapid };
  }
  return best;
}

// 出発地の最寄り駅→新幹線駅の在来線接続。
// JR東日本公式時刻表等で確認済みの実在時刻のみを登録する。憶測での時刻生成は禁止。
// schedule.weekday の outboundDepartures/inboundArrivals は「実在する列車の時刻」そのもの。
// schedule.holiday が未確認(null)の区間は、平日ダイヤを参考値として代用する(isApproximateSchedule で判別)。
// 公開版：実データは個人の出発地が特定されるため未登録。区間を追加する場合も同じ schedule 構造（outboundDepartures/inboundArrivals）を用いること。
const LOCAL_TRAIN_CONNECTIONS = {
  // 公開版：実データは未登録（上記コメント参照）
};

// 出発地テキスト中のキーワード → 最寄り駅名のマッピング
const DEPARTURE_TO_LOCAL_STATION = {
  // 公開版：実データは未登録
};

function localTrainTimeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// "YYYY-MM-DD" が土曜・日曜か判定する（祝日カレンダーは未対応。日付未指定時は平日扱い）
function isWeekendDate(dateStr) {
  if (!dateStr) return false;
  const dow = new Date(`${dateStr}T00:00:00`).getDay();
  return dow === 0 || dow === 6;
}

// 実在する時刻リストの中から、目標時刻(targetMin)に間に合う最終便(バッファ込み)を選ぶ。
// offsetMin は times が「到着」基準ではなく「出発」基準などズレがある場合の補正(例: 所要時間分)。
// 間に合う便が1本もない場合は始発を返す（呼び出し側で余裕不足を警告すること）。
function pickLocalTrainDeparture(times, targetMin, bufferMin = 0, offsetMin = 0) {
  for (let i = times.length - 1; i >= 0; i--) {
    if (localTrainTimeToMinutes(times[i]) + offsetMin <= targetMin - bufferMin) return times[i];
  }
  return times[0];
}

// 実在する時刻リストの中から、目標時刻(targetMin)に最も近い時刻を選ぶ(前後問わず)
function pickLocalTrainArrival(times, targetMin) {
  let best = times[0];
  let bestDiff = Math.abs(localTrainTimeToMinutes(times[0]) - targetMin);
  for (const t of times) {
    const diff = Math.abs(localTrainTimeToMinutes(t) - targetMin);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = t;
    }
  }
  return best;
}

function lookupLocalTrain(departureText, shinkansenStation, dateStr) {
  const normalizedStation = shinkansenStation.replace(/駅$/, '');
  for (const [keyword, localStation] of Object.entries(DEPARTURE_TO_LOCAL_STATION)) {
    if (departureText.includes(keyword) && localStation !== normalizedStation) {
      const key = `${localStation}-${normalizedStation}`;
      const conn = LOCAL_TRAIN_CONNECTIONS[key];
      if (conn) {
        const weekend = isWeekendDate(dateStr);
        const useHoliday = weekend && conn.schedule.holiday;
        return {
          ...conn,
          schedule: useHoliday ? conn.schedule.holiday : conn.schedule.weekday,
          isApproximateSchedule: weekend && !conn.schedule.holiday,
          fromStation: `${localStation}駅`,
          toStation: `${normalizedStation}駅`,
        };
      }
    }
  }
  return null;
}

// 目的地名からタクシー実運賃データを引く(未登録の目的地は null)
function getTaxiFareData(destName) {
  if (destName === '函館') return LOCAL_TRANSIT_FARES.hakodate_taxi_fare;
  const zoneKey = TAXI_FARE_ZONE_BY_DEST[destName];
  return zoneKey ? HOKKAIDO_TAXI_FARE_ZONES[zoneKey] : null;
}

function getGoogleMapsUrl(name, lat, lng) {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
}

function getTabelogSearchUrl(name, area) {
  const query = area ? `${name} ${area}` : name;
  return `https://tabelog.com/rst/rstsearch/?sw=${encodeURIComponent(query)}`;
}

// ============================================================
// テーブルB：出発新幹線駅 → 函館 所要時間（分）
// 新函館北斗まで（はやぶさ最速便）＋ 函館ライナー・函館市内移動（約16分）
// ※ 公式確認済みの区間は SHINKANSEN_FARES の duration_min を優先
// ============================================================
function getTravelTimes() {
  return {
    // ── 東北新幹線 → 函館（全停車駅） ──
    '東京-函館': 255,       // 公式確認済み
    '上野-函館': 250,
    '大宮-函館': 244,
    '小山-函館': 231,       // 概算: 215+16
    '宇都宮-函館': 238,     // 公式確認済み（238分）
    '那須塩原-函館': 219,   // 公式確認済み（219分）
    '新白河-函館': 191,     // 概算: 175+16
    '郡山-函館': 174,       // 概算: 158+16
    '福島-函館': 159,       // 概算: 143+16
    '白石蔵王-函館': 149,   // 概算: 133+16
    '仙台-函館': 150,       // 公式確認済み
    '古川-函館': 124,       // 概算: 108+16
    'くりこま高原-函館': 114, // 概算: 98+16
    '一ノ関-函館': 104,     // 概算: 88+16
    '水沢江刺-函館': 95,    // 概算: 79+16
    '北上-函館': 89,        // 概算: 73+16
    '新花巻-函館': 84,      // 概算: 68+16
    '盛岡-函館': 105,       // 公式確認済み（概算74+16と近似）
    'いわて沼宮内-函館': 64, // 概算: 48+16
    '二戸-函館': 56,        // 概算: 40+16
    '八戸-函館': 48,        // 概算: 32+16
    '七戸十和田-函館': 38,  // 概算: 22+16
    '新青森-函館': 60,      // 公式確認済み（概算29と差あり→乗り継ぎ含む）
    '奥津軽いまべつ-函館': 24, // 概算: 8+16
    '木古内-函館': 20,      // 概算: 4+16

    // ── 上越・北陸新幹線（大宮乗り換え）→ 函館 ──
    '高崎-函館': 272,       // 概算: 256+16
    '越後湯沢-函館': 286,   // 概算: 270+16
    '長岡-函館': 299,       // 概算: 283+16
    '新潟-函館': 319,       // 概算: 303+16
    '軽井沢-函館': 302,     // 概算: 286+16
    '長野-函館': 339,       // 概算: 323+16
    '富山-函館': 352,       // 概算: 336+16
    '金沢-函館': 379,       // 概算: 363+16

    // ── 東海道新幹線（東京乗り換え）→ 函館 ──
    '品川-函館': 262,       // 概算: 東京255+7
    '新横浜-函館': 272,     // 概算: 東京255+17
    '小田原-函館': 295,     // 概算: 東京255+40
    '熱海-函館': 305,       // 概算: 東京255+50
    '名古屋-函館': 361,     // 概算: 東京255+106
    '京都-函館': 391,       // 概算: 東京255+136
    '新大阪-函館': 406,     // 概算: 東京255+151
    '新神戸-函館': 421,     // 概算: 東京255+166


  };
}

// ============================================================
// 5時間ルール判定と交通手段の詳細比較（公開版）
// ============================================================
const FIVE_HOUR_LIMIT = 300; // 分

function addMins(timeStr, mins) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  let total = h * 60 + m + mins;
  if (total < 0) total += 24 * 60; // 日付またぎ対応
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

// 時刻の差分（分）を計算（24時間未満の待ち時間計算用）
function diffMins(startStr, endStr) {
  const [sh, sm] = startStr.split(':').map(Number);
  const [eh, em] = endStr.split(':').map(Number);
  let total = (eh * 60 + em) - (sh * 60 + sm);
  if (total < 0) total += 24 * 60;
  return total;
}

// 現在時刻以降の直近の出発時刻を探す（モックダイヤ）
function findNextDeparture(currentTimeStr, schedules) {
  const currentTotal = currentTimeStr.split(':').map(Number).reduce((h, m) => h * 60 + m);
  
  for (let s of schedules) {
    const sTotal = s.split(':').map(Number).reduce((h, m) => h * 60 + m);
    if (sTotal >= currentTotal) return s;
  }
  return schedules[0]; // その日に無い場合は翌日の始発
}

// 毎時決まった分に出発するパターンの生成
function generateHourlySchedule(minuteList, startH = 6, endH = 22) {
  let list = [];
  for (let h = startH; h <= endH; h++) {
    for (let m of minuteList) {
      list.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return list;
}

function generateShinkansenTimeline(stationName, destName, departTimeStr) {
  const times = getTravelTimes();
  const normStation = stationName.replace(/駅$/, '');
  const toOmiya = { '那須塩原': 45, '宇都宮': 30, '郡山': 60, '福島': 80 };
  const toSendai = { '那須塩原': 60, '宇都宮': 80, '郡山': 40, '福島': 25, '白石蔵王': 15, '新白河': 50, '白河': 55 };

  let t = departTimeStr;
  let timeline = [];
  let totalMins = 0;

  const pushNode = (time, text) => timeline.push({ type: 'node', time, text });
  const pushEdge = (text) => timeline.push({ type: 'edge', text });

  // 仮想ダイヤ
  const yamabikoSchedule = generateHourlySchedule([12]); // 毎時12分
  const hayabusaSchedule = generateHourlySchedule([53]); // 毎時53分

  if (['札幌', '函館', '新函館北斗', '旭川', '帯広', '釧路', '網走', '稚内'].includes(normStation)) {
    let dur = 120;
    if (normStation === '函館' && destName.includes('札幌')) dur = 220;
    if (normStation === '札幌' && destName.includes('函館')) dur = 220;
    if (normStation === '札幌' && destName.includes('旭川')) dur = 85;
    if (normStation === '旭川' && destName.includes('札幌')) dur = 85;
    
    const genericSchedule = generateHourlySchedule([10, 40]);
    const firstTrain = findNextDeparture(t, genericSchedule);
    const stationWait = diffMins(t, firstTrain);
    
    pushNode(t, `${normStation}駅 発`);
    if (stationWait > 0) {
      pushEdge(`☕ 駅での待ち（${stationWait}分）`);
      t = addMins(t, stationWait);
      totalMins += stationWait;
    }
    pushEdge(`🚃 特急等（約${dur}分）`);
    t = addMins(t, dur);
    totalMins += dur;
    pushNode(t, `${destName.replace('北海道', '')} 着`);
    
    return { time: totalMins, timeline, totalMins };
  }

  if (destName.includes('函館')) {
    if (toSendai[normStation]) {
      const dur1 = toSendai[normStation];
      const dur2 = times['仙台-函館'] || 159;
      
      const firstTrain = findNextDeparture(t, yamabikoSchedule);
      const stationWait = diffMins(t, firstTrain);
      
      pushNode(t, `${normStation}駅 発`);
      if (stationWait > 0) {
        pushEdge(`☕ 駅での待ち（${stationWait}分）`);
        t = addMins(t, stationWait);
        totalMins += stationWait;
      }
      
      pushEdge(`🚄 やまびこ・なすの等（約${dur1}分）`);
      t = addMins(t, dur1);
      totalMins += dur1;
      pushNode(t, `仙台駅 着`);
      
      const nextHayabusa = findNextDeparture(t, hayabusaSchedule);
      const wait = diffMins(t, nextHayabusa);
      
      pushEdge(`☕ 乗換・待ち（${wait}分）`);
      t = addMins(t, wait);
      totalMins += wait;
      pushNode(t, `仙台駅 発`);
      
      pushEdge(`🚄 はやぶさ（約${dur2}分）`);
      t = addMins(t, dur2);
      totalMins += dur2;
      pushNode(t, `新函館北斗駅 着`);
      
    } else if (toOmiya[normStation]) {
      const dur1 = toOmiya[normStation];
      const dur2 = times['大宮-函館'] || 231;
      
      const firstTrain = findNextDeparture(t, yamabikoSchedule);
      const stationWait = diffMins(t, firstTrain);
      
      pushNode(t, `${normStation}駅 発`);
      if (stationWait > 0) {
        pushEdge(`☕ 駅での待ち（${stationWait}分）`);
        t = addMins(t, stationWait);
        totalMins += stationWait;
      }
      
      pushEdge(`🚄 なすの等（約${dur1}分）`);
      t = addMins(t, dur1);
      totalMins += dur1;
      pushNode(t, `大宮駅 着`);
      
      const nextHayabusa = findNextDeparture(t, hayabusaSchedule);
      const wait = diffMins(t, nextHayabusa);
      
      pushEdge(`☕ 乗換・待ち（${wait}分）`);
      t = addMins(t, wait);
      totalMins += wait;
      pushNode(t, `大宮駅 発`);
      
      pushEdge(`🚄 はやぶさ（約${dur2}分）`);
      t = addMins(t, dur2);
      totalMins += dur2;
      pushNode(t, `新函館北斗駅 着`);
      
    } else {
      const dur = times[`${normStation}-函館`] || 255;
      const firstTrain = findNextDeparture(t, hayabusaSchedule);
      const stationWait = diffMins(t, firstTrain);
      
      pushNode(t, `${normStation}駅 発`);
      if (stationWait > 0) {
        pushEdge(`☕ 駅での待ち（${stationWait}分）`);
        t = addMins(t, stationWait);
        totalMins += stationWait;
      }
      pushEdge(`🚄 はやぶさ等（約${dur}分）`);
      t = addMins(t, dur);
      totalMins += dur;
      pushNode(t, `新函館北斗駅 着`);
    }
  } else if (['札幌', '小樽', '旭川', '網走', '釧路', '帯広', '稚内', '千歳', '苫小牧', 'ニセコ', '洞爺湖', '登別', '積丹', '江差', '富良野', '美瑛', '摩周湖', '知床', '根室'].some(d => destName.includes(d))) {
    const hako = generateShinkansenTimeline(normStation, '函館', departTimeStr);
    let plus = 220; // 札幌まで
    if (destName.includes('旭川')) plus = 220 + 85;
    if (destName.includes('網走')) plus = 220 + 330;
    if (destName.includes('釧路')) plus = 220 + 260;
    if (destName.includes('帯広')) plus = 220 + 160;
    if (destName.includes('稚内')) plus = 220 + 310;
    if (destName.includes('小樽')) plus = 220 + 40;
    if (destName.includes('千歳')) plus = 200;
    if (destName.includes('苫小牧')) plus = 180;
    if (destName.includes('ニセコ')) plus = 150;
    if (destName.includes('洞爺湖')) plus = 100;
    if (destName.includes('登別')) plus = 130;
    if (destName.includes('積丹')) plus = 250;
    if (destName.includes('江差')) plus = 80;
    if (destName.includes('富良野')) plus = 320;
    if (destName.includes('美瑛')) plus = 340;
    if (destName.includes('摩周湖')) plus = 500;
    if (destName.includes('知床')) plus = 600;
    if (destName.includes('根室')) plus = 600; 
    
    const hokutoSchedule = generateHourlySchedule([5]);
    
    timeline = hako.timeline;
    totalMins = hako.totalMins;
    t = hako.timeline[hako.timeline.length-1].time;
    
    const nextHokuto = findNextDeparture(t, hokutoSchedule);
    const wait = diffMins(t, nextHokuto);
    
    pushEdge(`☕ 乗換・待ち（${wait}分）`);
    t = addMins(t, wait);
    totalMins += wait;
    
    pushNode(t, `新函館北斗駅 発`);
    pushEdge(`🚃 特急北斗等（約${plus}分）`);
    t = addMins(t, plus);
    totalMins += plus;
    pushNode(t, `${destName.replace('北海道', '')} 着`);
    
  } else {
    const dur = times[`${normStation}-${destName}`] || 255;
    const genericSchedule = generateHourlySchedule([10, 40]);
    const firstTrain = findNextDeparture(t, genericSchedule);
    const stationWait = diffMins(t, firstTrain);
    
    pushNode(t, `${normStation}駅 発`);
    if (stationWait > 0) {
      pushEdge(`☕ 駅での待ち（${stationWait}分）`);
      t = addMins(t, stationWait);
      totalMins += stationWait;
    }
    pushEdge(`🚄 新幹線（約${dur}分）`);
    t = addMins(t, dur);
    totalMins += dur;
    pushNode(t, `${destName.replace('北海道', '')} 着`);
  }

  return { time: totalMins, timeline, totalMins };
}

function generateFlightTimeline(stationName, destName, departTimeStr) {
  const normStation = stationName.replace(/駅$/, '');
  let airportTransferTime = 90;
  let airportTransText = '🚃 在来線等（約90分）';
  let airport = '羽田空港(または主要空港)';
  let flightSchedule = ['08:00', '10:30', '13:00', '16:00', '18:30'];
  let overrideFlightTime = null;
  
  if (['新青森', '青森', '八戸'].includes(normStation)) {
    airport = '青森空港(または三沢空港)';
    airportTransferTime = 40;
    airportTransText = '🚌 リムジンバス等（約40分）';
    flightSchedule = ['09:50', '11:45', '14:25', '19:40'];
    overrideFlightTime = 45;
  } else if (['秋田'].includes(normStation)) {
    airport = '秋田空港';
    airportTransferTime = 40;
    airportTransText = '🚌 リムジンバス等（約40分）';
    flightSchedule = ['09:40', '19:00'];
    overrideFlightTime = 55;
  } else if (['盛岡', '一ノ関'].includes(normStation)) {
    airport = 'いわて花巻空港';
    airportTransferTime = 45;
    airportTransText = '🚌 特急バス等（約45分）';
    flightSchedule = ['11:55', '15:20', '18:50'];
    overrideFlightTime = 55;
  } else if (['仙台', '古川'].includes(normStation)) {
    airport = '仙台空港';
    airportTransferTime = 30;
    airportTransText = '🚃 仙台空港アクセス線（約30分）';
    flightSchedule = ['08:30', '10:15', '12:00', '14:45', '17:30', '19:00'];
    overrideFlightTime = 70;
  } else if (['山形', '米沢'].includes(normStation)) {
    airport = '山形空港';
    airportTransferTime = 30;
    airportTransText = '🚌 シャトルバス（約30分）';
    flightSchedule = ['08:45', '16:30'];
    overrideFlightTime = 75;
  } else if (['那須塩原', '宇都宮', '郡山', '福島', '白石蔵王', '新白河', '白河'].includes(normStation)) {
    if (destName.includes('函館')) {
      airportTransferTime = normStation === '宇都宮' ? 120 : 90;
      airportTransText = `🚗 自家用車・高速バス等（約${airportTransferTime}分）`;
      airport = '仙台空港';
      flightSchedule = ['10:45', '14:00']; 
    } else {
      airportTransferTime = ['那須塩原', '宇都宮'].includes(normStation) ? 90 : 60;
      airportTransText = `🚗 自家用車等（約${airportTransferTime}分）`;
      airport = '福島空港';
      flightSchedule = ['10:30']; 
    }
  } else if (['札幌', '函館', '新函館北斗', '旭川', '帯広', '釧路', '網走', '稚内'].includes(normStation)) {
    airport = '丘珠空港(または最寄り空港)';
    airportTransferTime = 30;
    airportTransText = '🚌 連絡バス（約30分）';
    overrideFlightTime = 40;
  }

  const flightTime = overrideFlightTime ? overrideFlightTime : (destName.includes('函館') ? 70 : 80);
  let localTransfer = 50;
  let localTransText = '🚃 快速エアポート等（約50分）';
  let destAirport = '新千歳空港';
  
  if (destName.includes('函館')) {
    destAirport = '函館空港';
    localTransfer = 20;
    localTransText = '🚖 連絡バス・タクシー等（約20分）';
  } else if (destName.includes('江差')) {
    // 函館空港→江差：函館空港連絡バス（函館帝産バス）で函館駅前まで約20分、
    // 函館バス610系統「函館・江差線」で函館駅前→江差ターミナルまで約148分。
    // 乗り継ぎ待ちを含めた実際の所要は約2時間30分〜3時間程度（函館バス公式時刻表・函館タクシー公式で確認、要検証日2026-09-13）。
    // 旧データの90分は実態の約半分で、大幅な過小評価だったため修正。
    destAirport = '函館空港';
    localTransfer = 180;
    localTransText = '🚌 バス等（約180分）';
  } else if (destName.includes('旭川')) {
    destAirport = '旭川空港';
    localTransfer = 40;
    localTransText = '🚌 連絡バス等（約40分）';
  } else if (destName.includes('富良野')) {
    // 旭川空港→富良野駅前：ふらのバス「快速ラベンダー号」約61分（2ソース一致）。要検証日2026-09-13
    destAirport = '旭川空港';
    localTransfer = 60;
    localTransText = '🚌 連絡バス等（約60分）';
  } else if (destName.includes('美瑛')) {
    // 旭川空港→美瑛駅：ふらのバス「快速ラベンダー号」約16分（美瑛町観光協会公式・NAVITIME/ジョルダン各社時刻表で一致、要検証日2026-09-13）。
    // 旧データは40分としていたが実際の2.5倍近い誤りだったため修正。
    destAirport = '旭川空港';
    localTransfer = 16;
    localTransText = '🚌 連絡バス等（約16分）';
  } else if (destName.includes('網走')) {
    destAirport = '女満別空港';
    localTransfer = 30;
    localTransText = '🚌 連絡バス（約30分）';
  } else if (destName.includes('知床')) {
    // 女満別空港→ウトロ温泉バスターミナル：知床エアポートライナーで約136分（2時間16分）・3,300円
    // （斜里バス系列の運行情報で確認、要検証日2026-09-13）。旧データの100分は実態より短かったため修正。
    // ⚠ この直行バスは冬季（流氷期）・夏季の季節限定運行で、通年運行ではない点は未反映。
    destAirport = '女満別空港';
    localTransfer = 136;
    localTransText = '🚌 知床エアポートライナー等（約136分）';
  } else if (destName.includes('釧路')) {
    destAirport = 'たんちょう釧路空港';
    localTransfer = 45;
    localTransText = '🚌 連絡バス（約45分）';
  } else if (destName.includes('摩周湖')) {
    // 釧路空港→摩周駅（弟子屈町）：公共交通では連絡バスで釧路駅まで約45分＋JR釧網線で摩周駅まで約75分＝
    // 乗車時間だけで約120分、乗り継ぎ待ちを含め130〜150分程度（たびらい・弟子屈なび等で確認、要検証日2026-09-13）。
    // ※車・タクシー直行なら弟子屈なび公式で「1時間強」との記載もあるが、本アプリは乗換案内前提のため
    // 公共交通ベースの数値を採用。旧データの60分は車移動の値に近く、公共交通としては過小評価。
    destAirport = 'たんちょう釧路空港';
    localTransfer = 130;
    localTransText = '🚌＋🚃 連絡バス・JR等（約130分）';
  } else if (destName.includes('根室')) {
    // 釧路空港→根室駅：連絡バスで釧路駅まで約45分＋JR根室本線で根室駅まで約131〜162分＝
    // 乗車時間だけで176〜207分、乗り継ぎ待ちを含めるとさらに長くなる。
    // 別ルート（バス乗り継ぎのみ）では所要4時間29分（269分）との情報もあり（駅探・バス比較なび等で確認、要検証日2026-09-13）。
    // 旧データの120分は実態の半分程度で大幅な過小評価だったため修正。
    destAirport = 'たんちょう釧路空港';
    localTransfer = 200;
    localTransText = '🚌＋🚃 連絡バス・JR等（約200分）';
  } else if (destName.includes('帯広')) {
    destAirport = 'とかち帯広空港';
    localTransfer = 40;
    localTransText = '🚌 連絡バス（約40分）';
  } else if (destName.includes('稚内')) {
    destAirport = '稚内空港';
    localTransfer = 30;
    localTransText = '🚌 連絡バス（約30分）';
  } else if (destName.includes('千歳')) {
    // 新千歳空港駅→千歳駅：JR千歳線 直通7分・290円（駅探・trip.comの2ソース一致、要検証日2026-09-13）。
    // 旧データは「タクシー等（約10分）」としていたが、実際は徒歩圏内の隣駅でJR直通の方が速く安い。
    localTransfer = 7;
    localTransText = '🚃 JR千歳線 等（約7分）';
  } else if (destName.includes('苫小牧')) {
    // 新千歳空港駅→苫小牧駅：JR（快速エアポート→南千歳乗換→千歳線/室蘭本線）約31〜38分・700円（駅探で確認、要検証日2026-09-13）。
    // 道南バス直行便は実際には約71〜76分かかり「バス約30分」は誤り（乗り物種別を誤認していた）。
    localTransfer = 35;
    localTransText = '🚃 JR快速エアポート等（約35分）';
  } else if (destName.includes('小樽')) {
    // 新千歳空港駅→小樽駅：JR快速エアポート直通、最速の特別快速で約73分・通常の快速で約80〜90分
    // （JR北海道公式・複数まとめサイトで一致、要検証日2026-09-13）。旧データの90分は上限に近いやや長めの値だったため80分に修正。
    localTransfer = 80;
    localTransText = '🚃 快速エアポート等（約80分）';
  } else if (destName.includes('ニセコ')) {
    // 新千歳空港⇔ニセコ直行バス（ニセコバス等）は冬季（12〜3月頃）中心の運行で約150〜180分・3,000〜4,000円
    // （トラベリスト等の複数サイトで一致、要検証日2026-09-13）。
    // ⚠ 夏季は直行バスがなく、JR（小樽・倶知安経由）で乗り継ぎ約3時間30分〜4時間かかる点は未反映。
    localTransfer = 150;
    localTransText = '🚌 高速バス等（約150分）';
  } else if (destName.includes('洞爺湖')) {
    // 新千歳空港→洞爺湖温泉：JR特急（南千歳乗換）で洞爺駅まで約90分＋道南バス洞爺湖温泉まで約20分＝計約2時間
    // （洞爺湖温泉観光協会公式で確認、要検証日2026-09-13）。
    // 旧データは「高速バス等（約150分）」としていたが、実際は空港からの直行高速バスは無く
    // 札幌乗り継ぎだと約4時間10分かかる。乗り物種別・所要時間とも誤りだったためJR経由に修正。
    localTransfer = 120;
    localTransText = '🚃 JR特急＋バス等（約120分）';
  } else if (destName.includes('登別')) {
    // 新千歳空港駅→登別駅：JR（快速エアポート→南千歳乗換→特急北斗/すずらん）で乗車時間のみ約45分、
    // 接続待ちを含めた実際の所要は約54〜85分と乗り継ぎにより幅がある（駅探で確認、要検証日2026-09-13）。
    // 60分は実測レンジの下寄りに位置する妥当な代表値のため据え置き。
    localTransfer = 60;
    localTransText = '🚃 特急等（約60分）';
  } else if (destName.includes('積丹')) {
    // 新千歳空港→積丹（美国）：積丹に鉄道はなく、快速エアポートで札幌駅(約37分)→
    // 函館本線で小樽駅(約40分)→路線バス積丹線で美国(約80分)の順に乗り継ぐ経路が実質唯一のルート。
    // 乗車時間の合計だけで約157分、乗り換え待ちを含めると180〜200分程度（hondarent等の複数サイトで一致、要検証日2026-09-13）。
    // 旧データの150分は乗り換え待ちを含まない値に近く、実態はやや長め。
    localTransfer = 180;
    localTransText = '🚃 快速エアポート・バス等（約180分）';
  }

  const REQUIRED_SECURE_TIME = 60; 
  let totalMins = 0;
  
  let t = departTimeStr;
  let timeline = [];
  const pushNode = (time, text) => timeline.push({ type: 'node', time, text });
  const pushEdge = (text) => timeline.push({ type: 'edge', text });

  pushNode(t, `${normStation}（ご自宅周辺） 発`);
  pushEdge(airportTransText);
  t = addMins(t, airportTransferTime);
  totalMins += airportTransferTime;
  pushNode(t, `${airport} 着`);
  
  const readyToFly = addMins(t, REQUIRED_SECURE_TIME);
  let flightDepart = findNextDeparture(readyToFly, flightSchedule);
  
  let flightNote = '';
  if (airport === '福島空港') flightNote = ' ※ANA 1日1便';
  else if (airport === '仙台空港' || airport === '青森空港' || airport === '秋田空港' || airport === 'いわて花巻空港') flightNote = ' ※JAL/ANA/ADO等';
  else flightNote = ' ※複数便あり';
  
  let waitTime = diffMins(t, flightDepart);
  if (waitTime > 0) {
    if (waitTime >= 180) {
      pushEdge(`⚠️ ご注意：ご希望時刻に近い便がないため、大幅な待ち時間が発生しています`);
    }
    pushEdge(`🛂 搭乗手続き・待ち（約${waitTime}分）`);
    t = addMins(t, waitTime);
    totalMins += waitTime;
  }
  pushNode(t, `${airport} 発${flightNote}`);
  
  pushEdge(`✈️ フライト（約${flightTime}分）`);
  t = addMins(t, flightTime);
  totalMins += flightTime;
  pushNode(t, `${destAirport} 着`);
  
  pushEdge(localTransText);
  t = addMins(t, localTransfer);
  totalMins += localTransfer;
  pushNode(t, `${destName.replace('北海道', '')} 着`);

  return { time: totalMins, timeline, totalMins };
}

function compareTransportRoutes(stationName, destName, departTimeStr = '10:00') {
  const shinkansen = generateShinkansenTimeline(stationName, destName, departTimeStr);
  const flight = generateFlightTimeline(stationName, destName, departTimeStr);

  let recommended = 'flight';
  if (shinkansen && flight) {
    // 新幹線は乗り換えや待ち時間が圧倒的に少ないため、
    // 所要時間が同じくらい（飛行機＋45分以内）であれば新幹線を推奨とする
    if (shinkansen.time <= flight.time + 45) {
      recommended = 'shinkansen';
    }
  } else if (shinkansen) {
    recommended = 'shinkansen';
  }

  return { recommended, shinkansen, flight };
}


// --- Auto-fill missing spots and restaurants for mock destinations ---
Object.keys(DESTINATIONS).forEach(key => {
  const dest = DESTINATIONS[key];
  if (!dest.spots) {
    dest.spots = [
      { name: dest.name + '周辺の観光スポット1', duration: 90, taxiFromCityStation: 10, category: 'view' },
      { name: dest.name + '周辺の観光スポット2', duration: 60, taxiFromCityStation: 15, category: 'culture' },
      { name: dest.name + '周辺の観光スポット3', duration: 120, taxiFromCityStation: 5, category: 'shopping' }
    ];
  }
  if (!dest.restaurants) {
    dest.restaurants = {
      lunch: [
        { name: dest.name + '名物ランチ', type: '和食', price: '2,000円〜', waitTime: 15 },
        { name: '地元レストラン', type: '洋食', price: '1,500円〜', waitTime: 10 }
      ],
      dinner: [
        { name: dest.name + 'の郷土料理', type: '居酒屋・和食', price: '5,000円〜', waitTime: 20 },
        { name: 'ホテル内レストラン', type: 'フレンチ', price: '12,000円〜', waitTime: 0 }
      ],
      snack: [
        { name: 'カフェ＆スイーツ', type: 'カフェ', price: '1,000円〜', waitTime: 5 }
      ]
    };
  }
});

