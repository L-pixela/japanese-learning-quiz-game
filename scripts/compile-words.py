# Vocabulary selection by increasing familiarity and conceptual complexity.
# The source filename determines JLPT band; legacy tags are not used.
import csv
import json
from pathlib import Path

groups = [
  "食事 米 味 味噌 サラダ サンドイッチ ケーキ ジャム ぶどう 湯 眠い 眠る 起こす 片付ける ごみ 棚 鏡 布団 畳 カーテン 壁 電灯 水道 ガス ガラス おもちゃ 人形 漫画 音 踊る 笑う 泣く 怒る うれしい 悲しい 寂しい 怖い 優しい 親切 美しい 赤ちゃん 親 祖父 祖母 夫 妻 息子 娘 彼 彼女 僕 君 苦い 柔らかい 沸く",
  "生活 近所 店員 客 値段 おつり 払う 売り場 食料品 贈り物 プレゼント お土産 住所 今夜 最近 今度 昔 最初 最後 一度 予定 用事 約束 遅れる 急ぐ 手伝う 運ぶ 送る もらう あげる くれる 忘れ物 探す 見つける 見つかる 選ぶ 決める 始める 続ける 終わり 戻る 直す 直る 開く 空く 残る 足りる 間違える 捨てる 拾う 包む 届ける 返事 お礼 あいさつする",
  "空港 飛行場 港 駐車場 交通 運転 運転手 急行 特急 汽車 乗り物 乗り換える 出発 泊まる 予約 旅館 案内 通り 坂 郊外 田舎 神社 寺 教会 動物園 美術館 受付 会場 事務所 屋上 景色 島 海岸 湖 森 林 草 葉 枝 石 砂 星 雲 季節 天気予報 台風 地震 火事 事故 警察 安全 危険 道具 エスカレーター オートバイ",
  "大学生 高校生 中学校 小学校 入学 卒業 試験 復習 予習 文法 発音 会話 辞典 数学 地理 歴史 科学 文学 文化 小説 日記 説明 紹介 答 翻訳 意見 考える 思う 調べる 比べる 伝える 知らせる 連絡 準備 用意 計画 運動 水泳 テニス 柔道 試合 勝つ 負ける 趣味 興味 楽しみ 夢 頑張る 熱心 真面目 一生懸命 正しい 先輩 講義 消しゴム",
  "経験 研究 技術 医学 教育 経済 産業 工業 生産 貿易 輸入 輸出 国際 社会 世界 人口 法律 政治 市民 公務員 社長 部長 課長 会議 専門 将来 関係 原因 理由 場合 機会 必要 大事 特別 普通 簡単 複雑 厳しい 丁寧 不便 無理 自由 反対 相談 利用 招待 出席 失敗 安心 心配 残念 遠慮 習慣 規則 競争",
  "参加 賛成 幸せ 自然 親しい 実は 姉妹 しゃべる 就職 修理 種類 順番 正午 正直 冗談 少年 少女 商品 職業 食品 植物 食欲 知らせ 信号 信じる 人生 親戚 新鮮 身長 健康 気温 天候 太陽 地球 友人 仲間 観光 乗客 出身 首都 住宅 住民 親友 笑顔 睡眠 頭痛 スープ 衣服 居間 家具 家事 昼食 休暇 帰宅 通勤",
  "重要 情報 状況 条件 常識 実際 実力 集中 収入 支出 支払う 借金 注文 希望 目的 目標 理解 表現 感情 感じる 気付く 関心 感謝 感動 満足 不満 期待 努力 苦労 協力 応援 連続 結果 影響 比較 選択 判断 決定 変更 確認 連想 提案 解決 方法 手段 感想 記憶 決心 合格 交換 付き合い 話し合う 約 役割 話題",
  "資源 資本 需要 消費 食糧 出版 書類 署名 処理 実験 実現 実行 実施 指導 支配 主張 主義 主要 集団 周囲 重視 修正 証明 省略 承認 状態 症状 診察 手術 神経 心臓 身体 慎重 真剣 深刻 障害 失業 失望 宗教 信仰 思想 人工 人種 刺激 質 湿度 酸素 酸性 収穫 奨学金 進学 上達 順調 商売 推薦",
  "責任 権利 義務 制度 政府 議会 議員 選挙 投票 裁判 犯罪 逮捕 事件 平和 軍隊 外交 企業 経営 農業 成功 発展 発達 成長 進歩 改善 解釈 評価 批判 批評 論争 議論 調査 分析 検査 検討 発見 発明 観察 予測 予防 税金 製造 製品 設計 契約 建設 建築 憲法 国民 国家 国会 国境 宣伝 組織 設備",
  "具体 現象 存在 意識 知識 知恵 能力 才能 性格 性質 特徴 共通 個人 独立 平等 公平 事実 現実 理想 想像 創造 価値 尊重 尊敬 信頼 信用 疑問 疑う 誤解 微妙 積極的 偶然 可能 限界 永遠 見解 考慮 傾向 克服 困難 混乱 差別 唯一 有効 要素 要点 余裕 利益 例外 冷静 論文 道徳 伝統 文明 哲学"
]
sources = {n: list(csv.DictReader(open(Path(__file__).parent / 'data' / f'n{n}-source.csv', encoding='utf-8'))) for n in [3,4]}
used = set()
result = []
for level, group in enumerate(groups, 1):
 n = 4 if level <= 5 else 3
 lookup = {r['expression']: r for r in sources[n]}
 selected = []
 missing = []
 for word in group.split():
  r = lookup.get(word)
  if not r or word in used:
   missing.append(word)
   continue
  if not r['reading'].strip() or not r['meaning'].strip(): continue
  selected.append(r)
  used.add(word)
 assert len(selected) == 55, (level, len(selected), missing)
 for r in selected:
  japanese, reading, meaning = r['expression'], r['reading'], r['meaning']
  # These two source rows put the kanji spelling in the reading column.
  if japanese == 'うれしい':
   japanese, reading = '嬉しい', 'うれしい'
  elif japanese == 'あいさつする':
   japanese, reading, meaning = '挨拶する', 'あいさつする', 'to greet'
  result.append(dict(japanese=japanese,reading=reading,meaning=meaning,level=level,jlpt=f'N{n}'))
Path('scripts/data/words.json').write_text(json.dumps(result,ensure_ascii=False,indent='\t')+'\n',encoding='utf-8',newline='\n')
