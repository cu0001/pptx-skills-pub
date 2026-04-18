---
name: pptx-generator
description: デザインプロンプトからPowerPointスライドを生成する。「黒板風でスライドを作って」「ブルーのビジネス資料を作って」などの依頼に応答する。blue テーマは標準的なコーポレートスタイルの資料に使用する。
---

# PowerPoint スライド生成スキル

このスキルは、自然言語の指示から PowerPoint スライドを新規作成する。

> **実行ディレクトリ**: 全コマンドはプロジェクトルートから実行すること。

---

## クイックリファレンス

| タスク | 手順 |
|---|---|
| スクラッチから新規作成する | 下記「新規作成ワークフロー」を実行 |

---

## 新規作成ワークフロー

<Steps>

<Step>
### Step 1: デザインテーマの決定

ユーザーの指示からテーマを特定する。

**利用可能なテーマID（全11種）:**

| テーマID | スタイル | 主な用途 |
|---|---|---|
| `blue` | ブルー・コーポレート | ビジネス資料・技術説明・ビジネス提案 |
| `blue-modern` | クリーン・フラット | IT・スタートアップ・一般ビジネス |
| `blue-professional` | 信頼感のあるクリーン | プロダクト紹介・価値訴求 |
| `dark-neon` | サイバーパンク・ネオン | テクノロジー・未来系発表 |
| `midnight-onyx` | 洗練されたダーク・ブラック | ハイエンド・プロフェッショナル・エグゼクティブ |
| `navy-beige` | 紺＆生成り（和モダン） | 伝統文化・教養・和風デザイン |
| `nature-green` | 自然・グリーン・調和 | 環境・持続可能性・オーガニック |
| `terracotta-earth` | 温もり・アースカラー | 食品・ライフスタイル・健康 |
| `dusty-purple` | くすみ紫・上品 | クリエイティブ・ライフスタイル・洗練 |
| `chalkboard` | 黒板・手書き・温もり | 教育・カジュアルプレゼン |
| `elegant-muted` | 上品なくすみ色・ウォーム | 洗練されたライフスタイル・美容・デザイン |

> **標準的なビジネス資料の依頼には `blue` テーマを優先的に使用すること。**

**自然言語でデザインが指定された場合（テーマIDなし）:**
`prompts/theme-resolver.md` の指示に従い ThemeToken JSON を生成、`themes/` に保存し `themes/index.js` に登録する。

**色コードの鉄則（違反するとファイルが破損する）:**
- `#` を含めない: `"0F62FE"` ✅ / `"#0F62FE"` ❌
- 8文字HEXを使わない（透過は opacity フィールドで）: `"opacity": 0.15` ✅ / `"00000026"` ❌
- `shadow.offset` は必ず0以上

安全フォント（Win/Mac両対応）:
`Arial`, `Calibri`, `Georgia`, `Trebuchet MS`, `Comic Sans MS`,
`Courier New`, `Meiryo`, `Yu Gothic`, `MS Gothic`
</Step>

<Step>
### Step 2: コンテンツの構造化

ユーザーの内容を `prompts/slide-content.md` のスキーマに従いJSONに変換する。

| カテゴリ | タイプ | 説明 |
|---|---|---|
| **基本** | `title` / `title3` | 表紙・タイトル（title3は詳細ビジュアル型） |
| | `agenda` | ハイライト機能付きアジェンダ |
| **内容** | `overview` | キーワード重視の概要 |
| | `content1` | 2カラム構成の詳細説明 |
| | `quote` | 引用・章扉・メッセージ強調 |
| **分析** | `comparison` | 比較表 |
| | `matrix` | 2×2 マトリックス分析 |
| **データ** | `data` / `data2` | KPIカード・チャート・主要数値強調 |
| **プロセス** | `flow` | ステップ形式のプロセス図 |
| | `timeline` | 時系列のロードマップ |
| **紹介** | `featurelist` | アイコン付きの機能一覧 |
| | `team` | メンバー紹介（氏名・役割・略歴） |
| | `imagetext` | 画像とテキストのバランス配置 |

**コンテンツ品質のルール:**
- タイトルは25文字以内（インパクトを優先）
- summaryItems は3〜5項目
- flow.steps は2〜5ステップ
- 全て日本語で出力
</Step>

<Step>
### Step 3: スクリプトを作成してスライドを生成

**実行ディレクトリ**: プロジェクトルート

```javascript
const SlideBuilder      = require('../lib/SlideBuilder');
const renderTitle       = require('../lib/renderers/TitleRenderer');
const renderTitle3      = require('../lib/renderers/TitleAccentRenderer');
const renderOverview    = require('../lib/renderers/OverviewRenderer');
const renderContent1    = require('../lib/renderers/TwoColumnRenderer');
const renderComparison  = require('../lib/renderers/ComparisonRenderer');
const renderData        = require('../lib/renderers/DataChartRenderer');
const renderData2       = require('../lib/renderers/KpiRenderer');
const renderFlow        = require('../lib/renderers/FlowRenderer');
const renderTimeline    = require('../lib/renderers/TimelineRenderer');
const renderFeatureList = require('../lib/renderers/FeatureListRenderer');
const renderTeam        = require('../lib/renderers/TeamRenderer');
const renderQuote       = require('../lib/renderers/QuoteRenderer');
const renderAgenda      = require('../lib/renderers/AgendaRenderer');
const renderMatrix      = require('../lib/renderers/MatrixRenderer');
const renderImageText   = require('../lib/renderers/ImageTextRenderer');

async function main() {
  const builder = new SlideBuilder('blue');  // テーマID

  renderTitle(builder, { /* コンテンツJSON */ });
  // 必要なスライドを追加 ...

  await builder.save('output/result.pptx');
}
main().catch(console.error);
```

**⚠️ PptxGenJS 重要ルール:**
- オプションオブジェクトを再利用しない（PptxGenJSがEMU値に書き換えるため）
  → `makeShadow = () => ({...})` のようにファクトリ関数で毎回新規生成すること
- ROUNDED_RECTANGLE にアクセントバーを重ねない（コーナーが食み出す）
- リッチテキスト配列の最終要素以外に `breakLine: true` を付ける
- 箇条書きは `bullet: true`（Unicode の `•` を直接使うと二重になる）
</Step>

<Step>
### Step 4: 実行

```bash
# 作成したスクリプト名を実行
node scripts/generate-xxxx.js
```

出力先: `output/`（存在しない場合は `mkdir -p output` を先に実行）
</Step>

### Step 5: 結果確認と報告

- 出力ファイルパス
- 使用したテーマ名
- 生成スライドの枚数と各タイプ
- 新テーマを作成した場合はその主要設定値

</Steps>

---

## デザイン品質ガイドライン

**退屈なスライドは作らないこと。** 白背景に箇条書きだけのスライドはプロフェッショナルに見えない。

### 開始前に決めること

- **テーマに合ったカラーパレットを選ぶ** — 別のプレゼンにそのまま使い回せるような汎用的な配色はNG。このコンテンツのために設計されたと感じる色を選ぶ
- **主従関係を作る** — 1色が60〜70%の視覚的ウェイトを持ち、1〜2色のサポートカラーと1色のアクセントカラーで構成する。全色を均等にしない
- **明暗のコントラスト** — タイトル・結びのスライドはダーク、コンテンツスライドはライト（「サンドイッチ」構造）、または全スライドをダークで統一してプレミアム感を出す
- **ビジュアルモチーフを1つ決めて貫く** — 角丸の画像フレーム、カラー丸アイコン、太い片側ボーダーなど。全スライドに一貫して適用する

### カラーパレット参考

テーマに合った色を選ぶこと。汎用的な青に逃げない。

| テーマ | Primary | Secondary | Accent |
|--------|---------|-----------|--------|
| **Midnight Executive** | `1E2761` (navy) | `CADCFC` (ice blue) | `FFFFFF` (white) |
| **Forest & Moss** | `2C5F2D` (forest) | `97BC62` (moss) | `F5F5F5` (cream) |
| **Coral Energy** | `F96167` (coral) | `F9E795` (gold) | `2F3C7E` (navy) |
| **Warm Terracotta** | `B85042` (terracotta) | `E7E8D1` (sand) | `A7BEAE` (sage) |
| **Ocean Gradient** | `065A82` (deep blue) | `1C7293` (teal) | `21295C` (midnight) |
| **Charcoal Minimal** | `36454F` (charcoal) | `F2F2F2` (off-white) | `212121` (black) |
| **Corporate Blue** | `0F62FE` (Blue) | `42BE65` (green) | `8A3FFC` (purple) |

### 各スライドのデザイン

**すべてのスライドにビジュアル要素を入れること** — 画像・チャート・アイコン・図形。テキストだけのスライドは印象に残らない。

**レイアウト選択肢:**
- 2カラム（左テキスト・右イラスト）
- アイコン＋テキスト行（カラー丸の中にアイコン、太字ヘッダー、その下に説明）
- 2×2 または 2×3 グリッド
- 半画面ブリード画像（左右どちらか全面）＋コンテンツオーバーレイ

**データ表示:**
- 大きな数値カード（60〜72pt の数字＋小さいラベル）
- 比較カラム（ビフォー/アフター、メリット/デメリット）
- タイムライン・プロセスフロー（番号付きステップ、矢印）

### タイポグラフィ

Arial に逃げない。個性のあるヘッダーフォントとクリーンな本文フォントをペアリングする。

| ヘッダーフォント | 本文フォント |
|---|---|
| Georgia | Calibri |
| Arial Black | Arial |
| Calibri | Calibri Light |
| Trebuchet MS | Calibri |
| Meiryo | Yu Gothic |

| 要素 | サイズ |
|---|---|
| スライドタイトル | 36〜44pt 太字 |
| セクションヘッダー | 20〜24pt 太字 |
| 本文テキスト | 14〜16pt |
| キャプション | 10〜12pt ミュートカラー |

### スペーシング

- 最小マージン 0.5インチ
- コンテンツブロック間 0.3〜0.5インチ
- 余白を活かす — すべての余白を埋めない

### NG例（よくある失敗）

- **同じレイアウトを繰り返さない** — 連続スライドで構成を変化させる
- **本文・箇条書きは左揃え** — 中央揃えはタイトルのみ
- **サイズコントラストを惜しまない** — タイトルは36pt以上で本文と差をつける
- **汎用的な青に逃げない** — トピックに合った色を選ぶ
- **スペースをランダムに変えない** — 0.3インチまたは0.5インチで統一する
- **1枚だけ凝って残りを手抜きにしない** — 全スライドで統一するか、シンプルに徹するか
- **テキストのみのスライドを作らない** — 画像・アイコン・チャート・図形を必ず含める
- **テキストボックスのパディングを忘れない** — 図形とテキスト端を揃える場合は `margin: 0` を設定するか、パディング分オフセットする
- **コントラスト不足の要素を使わない** — アイコンもテキストも背景に対して十分なコントラストが必要
- **タイトル下にアクセントラインを引かない** — AI生成スライドの典型的な特徴になる

### `blue` テーマのポイント
- アクセントバー（`addAccentBar`）を各カードのアンカーとして使う
- `primary: "0F62FE"`（Blue）をタイトルとアクセントに統一
- チャート色の推奨組み合わせ: Blue `0F62FE` + Green `42BE65` + Purple `8A3FFC`

---

## SlideBuilder API リファレンス

**PptxGenJS を直接使うより SlideBuilder 経由を強く推奨**（色サニタイズ・オブジェクト再利用バグを自動回避）。

```javascript
const builder = new SlideBuilder('blue');  // テーマIDまたはThemeTokenオブジェクト
const slide = builder.addSlide();              // 新規スライドを追加して返す
await builder.save('output/result.pptx');      // ファイルに書き出す
```

| メソッド | 用途 |
|---|---|
| `addTitle(slide, text, pos, size)` | タイトルテキスト。`size`: `'large'`(デフォルト) / `'medium'` |
| `addBody(slide, items, pos, overrides)` | 箇条書きリスト。`items`: `{text, bold?, bullet?, color?}[]` |
| `addCaption(slide, text, pos)` | 小さめのミュートカラー補足テキスト |
| `addSurface(slide, pos, overrides)` | テーマ適用済み装飾ボックス（影・枠線・角丸を自動適用） |
| `addAccentBar(slide, pos, color?)` | 左端アクセントバー（幅は `theme.layout.accentBarWidth`） |
| `addDecorativeFrame(slide, pos)` | テーマスタイルに応じた装飾フレーム |
| `addDivider(slide, x, y, w)` | 水平区切り線 |
| `addBarChart(slide, data, pos, title?)` | テーマカラー適用済みバーチャート |

プロパティ: `builder.theme`（サニタイズ済みThemeToken）、`builder.pres`（PptxGenJSインスタンス）

---

## QA

1. 生成したスクリプト（`node scripts/generate-xxxx.js`）を実行
2. 目視にて確認

---

## 依存関係

```bash
# Node.js
npm install          # プロジェクトルートで実行
```

---

## 参照ファイル

- `prompts/theme-resolver.md` — テーマ解析ルール
- `prompts/slide-content.md` — コンテンツJSON生成ルール
- `themes/blue.json` — Blue テーマ（このプロジェクトのデフォルト）

---

## 注意事項

- `output/` ディレクトリが存在しない場合は事前に `mkdir -p output` を実行する
- グラデーション背景は PptxGenJS 非対応（画像で代替）
- `Yu Gothic` や `Meiryo` は標準的なビジネス環境での使用を前提としている
