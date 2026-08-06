export type Category = "tourism" | "gourmet" | "hidden" | "trend";
export type SourceType = "drama" | "anime" | "celebrity" | "review";

export interface Comment {
  id: string;
  name: string;
  time: string;
  text: string;
}

export interface CelebrityInfo {
  handle: string;
  followers: string;
  postDate: string;
  quote: string;
}

export interface ReviewInfo {
  mentionCount: string;
  firstMentioned: string;
  platforms: string;
}

export interface Spot {
  id: number;
  name: string;
  area: string;
  lat: number;
  lng: number;
  category: Category;
  description: string;
  dateLabel: string;
  recency: number;
  isNew: boolean;
  likes: number;
  sourceType?: SourceType;
  sourceLabel?: string;
  workId?: string;
  workTitle?: string;
  broadcastInfo?: string;
  statLine?: string;
  celebrity?: CelebrityInfo;
  review?: ReviewInfo;
  comments: Comment[];
}

export const CATEGORY_META: Record<
  Category,
  { label: string; markerColor: string; badgeClass: string }
> = {
  tourism: { label: "観光", markerColor: "#185FA5", badgeClass: "bg-blue-50 text-blue-800" },
  gourmet: { label: "グルメ", markerColor: "#854F0B", badgeClass: "bg-amber-50 text-amber-800" },
  hidden: { label: "穴場", markerColor: "#3B6D11", badgeClass: "bg-green-50 text-green-800" },
  trend: { label: "話題", markerColor: "#A32D2D", badgeClass: "bg-red-50 text-red-800" },
};

export const SOURCE_LABELS: Record<SourceType, string> = {
  drama: "ドラマ",
  anime: "アニメ",
  celebrity: "インフルエンサー",
  review: "口コミ",
};

export const SEED_SPOTS: Spot[] = [
  {
    id: 1,
    name: "白川郷ライトアップ",
    area: "岐阜県白川村",
    lat: 36.2578,
    lng: 136.9066,
    category: "tourism",
    description:
      "冬季限定でライトアップされる合掌造り集落。一面の雪景色と灯りのコントラストが幻想的で、SNSでも毎年話題になる定番の絶景スポット。",
    dateLabel: "2日前",
    recency: 8,
    isNew: true,
    likes: 42,
    sourceType: "review",
    sourceLabel: "旅行メディアで特集多数",
    review: { mentionCount: "128", firstMentioned: "2026年1月", platforms: "X・Instagram・旅行ブログ" },
    comments: [
      { id: "c1", name: "さくら", time: "5時間前", text: "雪の中の集落、写真で見るより実物の方が感動しました" },
      { id: "c2", name: "たかし", time: "2日前", text: "ライトアップは17時からなので早めの到着がおすすめです" },
    ],
  },
  {
    id: 2,
    name: "三代目綿飴店",
    area: "東京都台東区",
    lat: 35.7148,
    lng: 139.7967,
    category: "gourmet",
    description:
      "行列必至のわたあめ専門店。フォロワー80万人のグルメインフルエンサーが動画で紹介したことで一気に話題になった。",
    dateLabel: "3日前",
    recency: 7,
    isNew: false,
    likes: 18,
    sourceType: "celebrity",
    sourceLabel: "@sweettooth_jp（グルメ系インフルエンサー）が紹介",
    celebrity: {
      handle: "@sweettooth_jp",
      followers: "80.2万人",
      postDate: "2026年7月20日",
      quote: "ここのわたあめ、ふわふわすぎて感動...絶対食べて欲しい",
    },
    comments: [
      { id: "c1", name: "あい", time: "4時間前", text: "平日でも1時間待ちだった、でも美味しかった" },
      { id: "c2", name: "けん", time: "1日前", text: "開店直後が狙い目らしいです" },
    ],
  },
  {
    id: 3,
    name: "隠れ家カフェ 森の時間",
    area: "長野県軽井沢町",
    lat: 36.3487,
    lng: 138.6069,
    category: "hidden",
    description: "地元の人しか知らない、森の中にひっそり佇む隠れ家カフェ。手作りのケーキと静かな時間が評判。",
    dateLabel: "4日前",
    recency: 6,
    isNew: false,
    likes: 9,
    sourceType: "review",
    sourceLabel: "口コミサイトで密かに話題",
    review: { mentionCount: "34", firstMentioned: "2026年5月", platforms: "口コミサイト・X" },
    comments: [{ id: "c1", name: "ゆうた", time: "3日前", text: "看板がないので迷いました(笑) でも辿り着く価値あり" }],
  },
  {
    id: 4,
    name: "あのドラマのベンチ",
    area: "神奈川県鎌倉市",
    lat: 35.3082,
    lng: 139.5011,
    category: "trend",
    description:
      "ドラマ『真夏のカルテ』最終話で主人公二人が座っていたベンチ。鎌倉高校前駅近くで、江ノ電と海を一望できる。",
    dateLabel: "今日",
    recency: 10,
    isNew: true,
    likes: 76,
    sourceType: "drama",
    sourceLabel: "ドラマ『真夏のカルテ』最終話 ロケ地",
    workId: "drama_manatsu",
    workTitle: "ドラマ『真夏のカルテ』",
    broadcastInfo: "TBS系 / 全10話 / 2026年7月放送",
    statLine: "この場所を保存した人の78%が、放送後1週間以内に登録しています。",
    comments: [
      { id: "c1", name: "ゆか", time: "3時間前", text: "このシーン見て泣いた...絶対行く" },
      { id: "c2", name: "たくみ", time: "1日前", text: "江ノ電と海が同時に見えるので写真映えします" },
      { id: "c3", name: "みさき", time: "2日前", text: "平日の午前中が空いてておすすめ" },
    ],
  },
  {
    id: 5,
    name: "夜景の見える展望台",
    area: "兵庫県神戸市",
    lat: 34.7298,
    lng: 135.2337,
    category: "tourism",
    description: "神戸の夜景を一望できる、ガイドブックにはあまり載っていない展望スポット。地元カップルの間で密かな人気。",
    dateLabel: "6日前",
    recency: 4,
    isNew: false,
    likes: 31,
    sourceType: "review",
    sourceLabel: "地元民の口コミで話題",
    review: { mentionCount: "56", firstMentioned: "2026年3月", platforms: "X・地元情報サイト" },
    comments: [{ id: "c1", name: "なお", time: "2日前", text: "デートで行ったら喜ばれました" }],
  },
  {
    id: 6,
    name: "昔ながらの定食屋",
    area: "大阪府大阪市",
    lat: 34.6937,
    lng: 135.5023,
    category: "gourmet",
    description: "創業50年、地元で愛される定食屋。撮影の合間に俳優が通っていたことでも知られる。",
    dateLabel: "5日前",
    recency: 5,
    isNew: false,
    likes: 22,
    sourceType: "celebrity",
    sourceLabel: "俳優 高橋◯◯さんの行きつけとして紹介",
    celebrity: {
      handle: "高橋◯◯（俳優）Instagram",
      followers: "45万人",
      postDate: "2026年6月2日",
      quote: "撮影の合間によく通ってた定食屋さん、味噌汁が最高です",
    },
    comments: [{ id: "c1", name: "まさと", time: "6日前", text: "味噌汁が絶品でした" }],
  },
  {
    id: 7,
    name: "誰も知らない滝",
    area: "高知県",
    lat: 33.5597,
    lng: 133.5311,
    category: "hidden",
    description: "地図にも載っていない秘境の滝。登山好きの間で密かに話題になっている。",
    dateLabel: "11日前",
    recency: 1,
    isNew: false,
    likes: 5,
    sourceType: "review",
    sourceLabel: "登山コミュニティで話題",
    review: { mentionCount: "19", firstMentioned: "2026年4月", platforms: "登山アプリのコミュニティ" },
    comments: [{ id: "c1", name: "こうじ", time: "10日前", text: "道が険しいので装備は必須です" }],
  },
  {
    id: 8,
    name: "アニメ聖地の踏切",
    area: "埼玉県所沢市",
    lat: 35.7996,
    lng: 139.4691,
    category: "trend",
    description: "アニメ『放課後クロニクル』のOPに登場する踏切。オープニングそのままの構図が撮れると聖地巡礼の定番になっている。",
    dateLabel: "今日",
    recency: 10,
    isNew: true,
    likes: 58,
    sourceType: "anime",
    sourceLabel: "アニメ『放課後クロニクル』OP登場シーン",
    workId: "anime_houkago",
    workTitle: "アニメ『放課後クロニクル』",
    broadcastInfo: "2026年冬アニメ / 全12話",
    statLine: "聖地巡礼タグでの保存数がシリーズ中最多のスポットです。",
    comments: [
      { id: "c1", name: "りく", time: "5時間前", text: "聖地巡礼で行ってきました、OPそのままで感動" },
      { id: "c2", name: "はると", time: "2日前", text: "電車の時刻表チェックしてから行くと安全です" },
    ],
  },
  {
    id: 9,
    name: "江ノ電の踏切",
    area: "神奈川県鎌倉市",
    lat: 35.309,
    lng: 139.502,
    category: "trend",
    description: "ドラマ『真夏のカルテ』第2話で二人が待ち合わせした踏切。江ノ電の音と光景が印象的なシーン。",
    dateLabel: "4日前",
    recency: 5,
    isNew: false,
    likes: 34,
    sourceType: "drama",
    sourceLabel: "ドラマ『真夏のカルテ』第2話 ロケ地",
    workId: "drama_manatsu",
    workTitle: "ドラマ『真夏のカルテ』",
    broadcastInfo: "TBS系 / 全10話 / 2026年7月放送",
    statLine: "第2話放送直後から保存数が急増したスポットです。",
    comments: [{ id: "c1", name: "りな", time: "1日前", text: "踏切が閉まるタイミングで写真撮ると雰囲気出ます" }],
  },
  {
    id: 10,
    name: "放課後クロニクル聖地の神社",
    area: "埼玉県所沢市",
    lat: 35.802,
    lng: 139.475,
    category: "trend",
    description: "アニメ『放課後クロニクル』第8話で主人公が祈願するシーンに登場する神社。",
    dateLabel: "6日前",
    recency: 3,
    isNew: false,
    likes: 21,
    sourceType: "anime",
    sourceLabel: "アニメ『放課後クロニクル』第8話 登場シーン",
    workId: "anime_houkago",
    workTitle: "アニメ『放課後クロニクル』",
    broadcastInfo: "2026年冬アニメ / 全12話",
    statLine: "第8話放送後、じわじわ保存数が伸びています。",
    comments: [{ id: "c1", name: "みお", time: "4日前", text: "お守りも作中と同じデザインで売ってました" }],
  },
];
