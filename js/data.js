const PREFECTURE_STATIONS = {
  '北海道': ['札幌', '函館', '新函館北斗', '旭川', '帯広', '釧路', '網走', '稚内'],
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
    highlights: ['支笏湖', 'サケのふるさと', '新千歳空港温泉'],
    hotels: [
      { id: 'chitose1', name: 'しこつ湖鶴雅リゾートスパ 水の謌', type: '温泉リゾート', features: ['支笏湖畔', 'ビュッフェ', 'スパ'], taxiFromCityStation: 40, area: '支笏湖温泉', pricePerNight: 40000, dinnerIncluded: true, breakfastIncluded: true, closedPeriod: { start: '2027-01-01', end: '2027-01-05' } }
    ]
  },
  tomakomai: {
    name: '苫小牧', area: '道央', station: '苫小牧駅', transportMode: 'flight', airport: '新千歳空港', direction: 'hokkaido', travelTimeFromTokyo: 130,
    highlights: ['ウトナイ湖', 'ノーザンホースパーク', 'マルトマ食堂'],
    hotels: [
      { id: 'tomakomai1', name: 'グランドホテルニュー王子', type: 'シティホテル', features: ['駅周辺', '展望レストラン'], taxiFromCityStation: 5, area: '苫小牧駅周辺', pricePerNight: 15000, dinnerIncluded: false, breakfastIncluded: true, closedPeriod: { start: '2027-01-01', end: '2027-01-05' } }
    ]
  },
  otaru: {
    name: '小樽', area: '道央', station: '小樽駅', transportMode: 'flight', airport: '新千歳空港', direction: 'hokkaido', travelTimeFromTokyo: 195,
    highlights: ['小樽運河', '堺町通り', '天狗山'],
    hotels: [
      { id: 'otaru1', name: '運河の宿 おたる ふる川', type: '温泉旅館', features: ['運河沿い', 'レトロな雰囲気', '温泉大浴場'], taxiFromCityStation: 5, area: '小樽運河', pricePerNight: 35000, dinnerIncluded: true, breakfastIncluded: true, closedPeriod: { start: '2027-01-01', end: '2027-01-05' } }
    ]
  },
  niseko: {
    name: 'ニセコ', area: '道央', station: 'ニセコ駅', transportMode: 'flight', airport: '新千歳空港', direction: 'hokkaido', travelTimeFromTokyo: 255,
    highlights: ['ニセコアンヌプリ', '羊蹄山', 'ミルク工房'],
    hotels: [
      { id: 'niseko1', name: 'パークハイアット ニセコ', type: 'ラグジュアリー', features: ['マウンテンビュー', '温泉', '高級フレンチ'], taxiFromCityStation: 15, area: '花園', pricePerNight: 80000, dinnerIncluded: true, breakfastIncluded: true, closedPeriod: { start: '2027-01-01', end: '2027-01-05' } }
    ]
  },
  toyako: {
    name: '洞爺湖', area: '道央', station: '洞爺駅', transportMode: 'flight', airport: '新千歳空港', direction: 'hokkaido', travelTimeFromTokyo: 255,
    highlights: ['洞爺湖', '有珠山', '昭和新山'],
    hotels: [
      { id: 'toyako1', name: 'ザ・ウィンザーホテル洞爺', type: 'リゾート', features: ['絶景', 'フレンチ', '温泉'], taxiFromCityStation: 20, area: '洞爺湖畔', pricePerNight: 60000, dinnerIncluded: true, breakfastIncluded: true, closedPeriod: { start: '2027-01-01', end: '2027-01-05' } }
    ]
  },
  noboribetsu: {
    name: '登別', area: '道南', station: '登別駅', transportMode: 'flight', airport: '新千歳空港', direction: 'hokkaido', travelTimeFromTokyo: 165,
    highlights: ['登別地獄谷', 'のぼりべつクマ牧場', '大湯沼'],
    hotels: [
      { id: 'noboribetsu1', name: '登別温泉 滝乃家', type: '温泉旅館', features: ['源泉かけ流し', '割烹', '庭園'], taxiFromCityStation: 15, area: '登別温泉', pricePerNight: 55000, dinnerIncluded: true, breakfastIncluded: true, closedPeriod: { start: '2027-01-01', end: '2027-01-05' } }
    ]
  },
  shakotan: {
    name: '積丹', area: '道央', station: '余市駅', transportMode: 'flight', airport: '新千歳空港', direction: 'hokkaido', travelTimeFromTokyo: 255,
    highlights: ['神威岬', '積丹ブルー', 'ウニ丼'],
    hotels: [
      { id: 'shakotan1', name: '積丹の宿', type: '民宿', features: ['海鮮', 'アットホーム'], taxiFromCityStation: 40, area: '積丹半島', pricePerNight: 20000, dinnerIncluded: true, breakfastIncluded: true, closedPeriod: { start: '2027-01-01', end: '2027-01-05' } }
    ]
  },
  esashi: {
    name: '江差', area: '道南', station: '木古内駅', transportMode: 'flight', airport: '函館空港', direction: 'hokkaido', travelTimeFromTokyo: 195,
    highlights: ['江差追分', 'かもめ島', 'いにしえ街道'],
    hotels: [
      { id: 'esashi1', name: '群来', type: '高級旅館', features: ['全室離れ', '温泉', '江差の食材'], taxiFromCityStation: 60, area: '江差町', pricePerNight: 70000, dinnerIncluded: true, breakfastIncluded: true, closedPeriod: { start: '2027-01-01', end: '2027-01-05' } }
    ]
  },
  furano: {
    name: '富良野', area: '道北', station: '富良野駅', transportMode: 'flight', airport: '旭川空港', direction: 'hokkaido', travelTimeFromTokyo: 165,
    highlights: ['ファーム富田', 'ニングルテラス', '青い池'],
    hotels: [
      { id: 'furano1', name: 'フラノ寶亭留', type: 'リゾート', features: ['ラベンダー畑', 'フレンチ', '温泉'], taxiFromCityStation: 10, area: '富良野', pricePerNight: 45000, dinnerIncluded: true, breakfastIncluded: true, closedPeriod: { start: '2027-01-01', end: '2027-01-05' } }
    ]
  },
  biei: {
    name: '美瑛', area: '道北', station: '美瑛駅', transportMode: 'flight', airport: '旭川空港', direction: 'hokkaido', travelTimeFromTokyo: 135,
    highlights: ['パッチワークの路', '四季彩の丘', '白金青い池'],
    hotels: [
      { id: 'biei1', name: '森の旅亭 びえい', type: '温泉旅館', features: ['離れ', '白金温泉', '和食'], taxiFromCityStation: 25, area: '白金温泉', pricePerNight: 40000, dinnerIncluded: true, breakfastIncluded: true, closedPeriod: { start: '2027-01-01', end: '2027-01-05' } }
    ]
  },
  teshikaga: {
    name: '摩周湖', area: '道東', station: '摩周駅', transportMode: 'flight', airport: '釧路空港', direction: 'hokkaido', travelTimeFromTokyo: 165,
    highlights: ['摩周湖', '屈斜路湖', '硫黄山'],
    hotels: [
      { id: 'teshikaga1', name: 'あかん遊久の里 鶴雅', type: '温泉旅館', features: ['阿寒湖畔', '屋上露天風呂', 'アイヌ文化'], taxiFromCityStation: 60, area: '阿寒湖温泉', pricePerNight: 35000, dinnerIncluded: true, breakfastIncluded: true, closedPeriod: { start: '2027-01-01', end: '2027-01-05' } }
    ]
  },
  shiretoko: {
    name: '知床', area: '道東', station: '知床斜里駅', transportMode: 'flight', airport: '女満別空港', direction: 'hokkaido', travelTimeFromTokyo: 225,
    highlights: ['知床五湖', '知床峠', 'クルーズ'],
    hotels: [
      { id: 'shiretoko1', name: '北こぶし知床 ホテル＆リゾート', type: 'リゾート', features: ['オホーツク海ビュー', 'サウナ', 'ブッフェ'], taxiFromCityStation: 40, area: 'ウトロ', pricePerNight: 30000, dinnerIncluded: true, breakfastIncluded: true, closedPeriod: { start: '2027-01-01', end: '2027-01-05' } }
    ]
  },
  nemuro: {
    name: '根室', area: '道東', station: '根室駅', transportMode: 'flight', airport: '釧路空港', direction: 'hokkaido', travelTimeFromTokyo: 225,
    highlights: ['納沙布岬', '春国岱', 'エスカロップ'],
    hotels: [
      { id: 'nemuro1', name: '根室グランドホテル', type: 'シティホテル', features: ['市内中心', 'レストラン'], taxiFromCityStation: 5, area: '根室', pricePerNight: 12000, dinnerIncluded: false, breakfastIncluded: true, closedPeriod: { start: '2027-01-01', end: '2027-01-05' } }
    ]
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
        image: 'https://img.travel.rakuten.co.jp/share/HOTEL/16654/16654.jpg',
        features: ['創業1922年の老舗', '露天風呂付客室', '部屋食対応'],
        // 楽天トラベル/じゃらん掲載のアクセス「JR函館駅からタクシー約15分」より
        taxiFromCityStation: 15,
        taxiVerified: true,
        area: '湯の川温泉',
        pricePerNight: 50000,
        dinnerIncluded: true,
        breakfastIncluded: true,
      },
      {
        id: 'hk2',
        name: 'ラビスタ函館ベイ',
        type: 'リゾートホテル',
        image: 'https://img.travel.rakuten.co.jp/share/HOTEL/105436/105436.jpg',
        features: ['最上階展望大浴場', '朝食の海鮮丼が名物', 'ベイエリア徒歩圏'],
        // 共立リゾート公式アクセス「JR函館駅から徒歩約15分」＝約1.2km。車なら約5分
        taxiFromCityStation: 5,
        taxiVerified: true,
        area: 'ベイエリア',
        pricePerNight: 28000,
        dinnerIncluded: false,
        breakfastIncluded: true,
      },
      {
        id: 'hk3',
        name: '望楼NOGUCHI函館',
        type: 'デザイナーズ旅館',
        image: 'https://img.travel.rakuten.co.jp/share/HOTEL/105744/105744.jpg',
        features: ['全室展望風呂付', 'モダン和空間', '鉄板焼ダイニング'],
        // じゃらん/ぐうたび北海道掲載のアクセス「JR函館駅から車で約15分」より
        taxiFromCityStation: 15,
        taxiVerified: true,
        area: '湯の川温泉',
        pricePerNight: 45000,
        dinnerIncluded: true,
        breakfastIncluded: true,
        // 改装工事による全館休館（未設定の宿は通常通り候補に含まれる）
        closedPeriod: { start: '2026-08-20', end: '2027-04-19' },
      },
      {
        id: 'hk4',
        name: 'プレミアホテル-CABIN PRESIDENT-函館',
        type: 'シティホテル',
        // 公式サイト(https://cabin.kenhotels.com/hakodate/img/top/main03.jpg、確認済みの実写外観)を
        // 表示サイズに合わせてリサイズ・圧縮して自前ホスト（元画像2000x975/333KB → 1000x488/84KB）
        image: 'img/hotels/hakodate-cabin-president.jpg',
        features: ['JR函館駅・朝市まで徒歩1分', '大浴場あり', '和洋中の朝食ブッフェ'],
        // 公式サイト(https://cabin.kenhotels.com/hakodate/)「JR函館駅から徒歩1分」より。
        // 徒歩圏だがタクシー扱いの最小値として2分を置く
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
      { id: 'sp1', name: 'JRタワーホテル日航札幌', type: 'ラグジュアリーホテル', image: 'https://img.travel.rakuten.co.jp/share/HOTEL/28800/28800.jpg',
        features: ['JR札幌駅直結', '高層階パノラマビュー', 'スパ完備'],
        taxiFromCityStation: 40, area: '札幌駅前', pricePerNight: 35000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'sp2', name: '定山渓温泉 章月グランドホテル', type: '温泉旅館', image: 'https://img.travel.rakuten.co.jp/share/HOTEL/16147/16147.jpg',
        features: ['露天風呂', '渓谷の絶景', '北海道食材の懐石'],
        taxiFromCityStation: 80, area: '定山渓温泉', pricePerNight: 28000, dinnerIncluded: true, breakfastIncluded: true },
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
      { id: 'ak1', name: 'OMO7旭川 by 星野リゾート', type: 'デザイナーズホテル', image: 'https://img.travel.rakuten.co.jp/share/HOTEL/165109/165109.jpg',
        features: ['旭川駅徒歩圏', '地域体験プログラム', '北海道食材ビュッフェ'],
        taxiFromCityStation: 5, area: '旭川駅前', pricePerNight: 22000, dinnerIncluded: false, breakfastIncluded: true },
      { id: 'ak2', name: 'ラビスタ層雲峡', type: 'リゾートホテル', image: 'https://img.travel.rakuten.co.jp/share/HOTEL/137357/137357.jpg',
        features: ['峡谷の絶景露天風呂', '温泉大浴場', '北海道懐石'],
        taxiFromCityStation: 90, area: '層雲峡', pricePerNight: 32000, dinnerIncluded: true, breakfastIncluded: true },
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
      { id: 'ob1', name: 'ふく井ホテル', type: 'シティホテル', image: 'https://img.travel.rakuten.co.jp/share/HOTEL/16668/16668.jpg',
        features: ['帯広駅徒歩1分', '天然温泉大浴場', '十勝食材の朝食'],
        taxiFromCityStation: 30, area: '帯広駅前', pricePerNight: 14000, dinnerIncluded: false, breakfastIncluded: true },
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
      { id: 'ku1', name: 'ANA クラウンプラザホテル釧路', type: 'シティホテル', image: 'https://img.travel.rakuten.co.jp/share/HOTEL/57077/57077.jpg',
        features: ['釧路川沿い', '大浴場あり', '和食・洋食レストラン'],
        taxiFromCityStation: 10, area: '釧路駅前', pricePerNight: 18000, dinnerIncluded: false, breakfastIncluded: true },
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
      { id: 'ab1', name: '天都の丘 網走観光ホテル', type: 'リゾートホテル', image: 'https://img.travel.rakuten.co.jp/share/HOTEL/28406/28406.jpg',
        features: ['オホーツク海パノラマ', '温泉大浴場', '北海道食材の夕食'],
        taxiFromCityStation: 5, area: '網走市街', pricePerNight: 16000, dinnerIncluded: true, breakfastIncluded: true },
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
      { id: 'wk1', name: 'ドーミーイン稚内', type: 'ビジネスホテル', image: 'https://img.travel.rakuten.co.jp/share/HOTEL/140284/140284.jpg',
        features: ['天然温泉大浴場', '稚内駅徒歩2分', '朝食バイキング'],
        taxiFromCityStation: 5, area: '稚内駅前', pricePerNight: 12000, dinnerIncluded: false, breakfastIncluded: true },
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
// 個人版では「矢板→函館」の実ダイヤ（yaita-hakodate / hakodate-yaita）を
// 7パターン往復で保持していたが、個人の出発地（矢板市）が特定されるため
// 公開版では削除した。公開版は概算計算（TABLE_B所要時間）を使用する。
// 将来、主要新幹線駅の実ダイヤを整備する場合はここに追加する。
const SHINKANSEN_SCHEDULES = {
  // 公開版：実ダイヤは未整備。概算計算にフォールバックする。
  // 将来整備する場合：
  // 'sendai-hakodate': [ ... ],
  // 'hakodate-sendai': [ ... ],
};

// 「出発駅名|目的地エリア名」→ SHINKANSEN_SCHEDULES のキー。
// 公開版：矢板固有のルートは削除。実ダイヤ未整備のため全区間概算計算にフォールバック。
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
// （矢板⇔那須塩原の duration_min 16分と同じ扱い。データ二重管理を避けるため）。
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
// 今後、矢板以外の区間を追加する場合も同じ schedule 構造（outboundDepartures/inboundArrivals）を用いること。
const LOCAL_TRAIN_CONNECTIONS = {
  '矢板-那須塩原': {
    line: 'JR宇都宮線',
    type: '普通',
    duration_min: 16, // 矢板発→那須塩原着は一律+16分（公式時刻表確認済み）
    transfers: 0,
    stops: '野崎・西那須野',
    source: 'JR東日本公式時刻表',
    verified_date: '2026-08-05',
    schedule: {
      weekday: {
        // 矢板発（那須塩原方面・下り）
        outboundDepartures: [
          '05:46', '06:21', '06:42', '07:27', '07:51', '08:10', '08:37', '09:05', '09:44', '10:20', '10:52',
          '11:20', '11:55', '12:17', '12:52', '13:21', '13:53', '14:17', '14:48', '15:15', '15:50',
          '16:16', '16:42', '17:13', '17:43', '18:06', '18:25', '18:43', '19:05', '19:22', '19:52',
          '20:16', '20:49', '21:12', '21:31', '22:11', '22:42', '23:22',
        ],
        // 矢板着（那須塩原方面から・上り）。那須塩原発の時刻はこの16分前
        inboundArrivals: [
          '05:48', '06:14', '06:38', '06:52', '07:11', '07:29', '07:53', '08:18', '08:37', '09:08', '09:36',
          '10:09', '10:42', '11:09', '11:44', '12:08', '12:44', '13:09', '13:42', '14:08', '14:44',
          '15:06', '15:35', '16:03', '16:37', '17:08', '17:36', '18:03', '18:36', '18:55', '19:21',
          '19:34', '19:57', '20:21', '20:50', '21:14', '21:43', '22:11',
        ],
      },
      // 土休日ダイヤは未確認。確認できるまでは平日ダイヤを参考値として使用する
      holiday: null,
    },
  },
};

// 出発地テキスト中のキーワード → 最寄り駅名のマッピング
const DEPARTURE_TO_LOCAL_STATION = {
  '矢板': '矢板',
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
  return null;
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

    // ── 非北海道目的地（旧データ・後方互換のため残す） ──
    '東京-金沢': 150,
    '大宮-金沢': 130,
    '長野-金沢': 65,
    '東京-京都': 135,
    '品川-京都': 130,
    '新横浜-京都': 120,
    '名古屋-京都': 35,
    '新大阪-京都': 15,
    '東京-小田原': 35,
    '品川-小田原': 30,
    '新横浜-小田原': 15,
    '名古屋-小田原': 75,
    '東京-熱海': 50,
    '品川-熱海': 45,
    '新横浜-熱海': 30,
    '名古屋-熱海': 90,
    '新大阪-金沢': 165,
    '京都-金沢': 140,
    '敦賀-金沢': 45,
    '新大阪-小田原': 120,
    '新神戸-小田原': 130,
    '新大阪-熱海': 110,
    '新神戸-熱海': 120,
    '新大阪-京都': 15,
    '新神戸-京都': 30,
    '那須塩原-金沢': 195,
    '那須塩原-京都': 220,
    '那須塩原-小田原': 120,
    '那須塩原-熱海': 135,
    '宇都宮-金沢': 170,
    '宇都宮-京都': 195,
    '宇都宮-小田原': 95,
    '宇都宮-熱海': 110,
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
    destAirport = '函館空港';
    localTransfer = 90;
    localTransText = '🚌 バス・タクシー等（約90分）';
  } else if (destName.includes('旭川')) {
    destAirport = '旭川空港';
    localTransfer = 40;
    localTransText = '🚌 連絡バス等（約40分）';
  } else if (destName.includes('富良野')) {
    destAirport = '旭川空港';
    localTransfer = 60;
    localTransText = '🚌 連絡バス等（約60分）';
  } else if (destName.includes('美瑛')) {
    destAirport = '旭川空港';
    localTransfer = 40;
    localTransText = '🚌 連絡バス等（約40分）';
  } else if (destName.includes('網走')) {
    destAirport = '女満別空港';
    localTransfer = 30;
    localTransText = '🚌 連絡バス（約30分）';
  } else if (destName.includes('知床')) {
    destAirport = '女満別空港';
    localTransfer = 100;
    localTransText = '🚌 知床エアポートライナー等（約100分）';
  } else if (destName.includes('釧路')) {
    destAirport = 'たんちょう釧路空港';
    localTransfer = 45;
    localTransText = '🚌 連絡バス（約45分）';
  } else if (destName.includes('摩周湖')) {
    destAirport = 'たんちょう釧路空港';
    localTransfer = 60;
    localTransText = '🚌 連絡バス等（約60分）';
  } else if (destName.includes('根室')) {
    destAirport = 'たんちょう釧路空港';
    localTransfer = 120;
    localTransText = '🚌 連絡バス等（約120分）';
  } else if (destName.includes('帯広')) {
    destAirport = 'とかち帯広空港';
    localTransfer = 40;
    localTransText = '🚌 連絡バス（約40分）';
  } else if (destName.includes('稚内')) {
    destAirport = '稚内空港';
    localTransfer = 30;
    localTransText = '🚌 連絡バス（約30分）';
  } else if (destName.includes('千歳')) {
    localTransfer = 10;
    localTransText = '🚕 タクシー等（約10分）';
  } else if (destName.includes('苫小牧')) {
    localTransfer = 30;
    localTransText = '🚌 連絡バス等（約30分）';
  } else if (destName.includes('小樽')) {
    localTransfer = 90;
    localTransText = '🚃 快速エアポート等（約90分）';
  } else if (destName.includes('ニセコ')) {
    localTransfer = 150;
    localTransText = '🚌 高速バス等（約150分）';
  } else if (destName.includes('洞爺湖')) {
    localTransfer = 150;
    localTransText = '🚌 高速バス等（約150分）';
  } else if (destName.includes('登別')) {
    localTransfer = 60;
    localTransText = '🚃 特急等（約60分）';
  } else if (destName.includes('積丹')) {
    localTransfer = 150;
    localTransText = '🚃 快速エアポート・バス等（約150分）';
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

