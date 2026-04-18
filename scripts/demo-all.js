/**
 * demo-all.js
 * 全てのテーマと全てのレンダラーを一括で確認するためのデモスクリプト。
 * 各テーマごとに個別の PPTX ファイルを出力します。
 *
 * 実行: node demo-all.js
 */

const fs = require('fs');
const path = require('path');
const SlideBuilder = require('../lib/SlideBuilder');
const themes = require('../themes');

// レンダラーのインポート（スライド生成順）
const renderers = {
  Title: require('../lib/renderers/TitleRenderer'),
  Agenda: require('../lib/renderers/AgendaRenderer'),
  SectionDivider: require('../lib/renderers/SectionDividerRenderer'),
  Overview: require('../lib/renderers/OverviewRenderer'),
  TitleAccent: require('../lib/renderers/TitleAccentRenderer'),
  ProblemSolution: require('../lib/renderers/ProblemSolutionRenderer'),
  Comparison: require('../lib/renderers/ComparisonRenderer'),
  TwoColumn: require('../lib/renderers/TwoColumnRenderer'),
  DataChart: require('../lib/renderers/DataChartRenderer'),
  Kpi: require('../lib/renderers/KpiRenderer'),
  Flow: require('../lib/renderers/FlowRenderer'),
  Timeline: require('../lib/renderers/TimelineRenderer'),
  FeatureList: require('../lib/renderers/FeatureListRenderer'),
  IconGrid: require('../lib/renderers/IconGridRenderer'),
  ImageText: require('../lib/renderers/ImageTextRenderer'),
  Matrix: require('../lib/renderers/MatrixRenderer'),
  VerticalSteps: require('../lib/renderers/VerticalStepsRenderer'),
  Team: require('../lib/renderers/TeamRenderer'),
  Testimonials: require('../lib/renderers/TestimonialsRenderer'),
  Quote: require('../lib/renderers/QuoteRenderer'),
  Closing: require('../lib/renderers/ClosingRenderer'),
};

// サンプルデータ定義
const sampleData = {
  Title: {
    title: '全レンダラー・テーマ確認デモ',
    subtitle: 'デザインシステムの一貫性と多様性の検証',
    presenter: 'IBM Bob AI Assistant',
    date: '2026年4月',
  },
  TitleAccent: {
    title: '次世代プラットフォームの構築',
    subtitle: 'テクノロジーとデザインの融合による新しい体験',
  },
  Overview: {
    title: 'プロジェクトの概要',
    mainKeyword: '革新的な\nユーザー体験',
    keywordSub: '最先端の技術スタックを活用し、\nビジネスの成長を加速させます',
    summaryItems: [
      { text: 'スケーラブルなアーキテクチャの採用', bold: true },
      { text: 'AIを活用した自動最適化機能', bold: false },
      { text: 'グローバル展開に対応した多言語サポート', bold: false },
    ],
    caption: '※ 2026年度 Q1 ロードマップより抜粋',
  },
  Agenda: {
    title: '本日のアジェンダ',
    items: [
      { label: 'プロジェクトの背景と目的', duration: '10 min' },
      { label: '核となる技術スタックとアーキテクチャ', duration: '15 min' },
      { label: '市場分析と競合優位性', duration: '20 min' },
      { label: '開発ロードマップとマイルストーン', duration: '15 min' },
      { label: '質疑応答・ディスカッション', duration: '15 min' },
    ],
    activeIndex: 1, // 2番目をハイライト
  },
  TwoColumn: {
    title: 'モダンな開発手法の導入',
    leftSection: {
      heading: 'アジャイル開発の徹底',
      text: '週次のスプリントとデモによる進捗の可視化を行い、高品質なプロダクトを迅速に市場へ投入します。継続的なフィードバックループを回し、ユーザーニーズに即応できる体制を整えています。',
    },
    rightSection: {
      heading: 'CI/CDパイプライン',
      text: '自動テストカバー率 90% 以上の維持と、コンテナ技術による環境の標準化を図ります。これにより、人為的ミスを排除し、安全かつ高速なデプロイを実現します。',
    },
  },
  Comparison: {
    title: '従来手法と新手法の比較',
    labelA: '従来の手法 (Legacy)',
    labelB: '本プロジェクト (Proposed)',
    rows: [
      { rowLabel: '開発速度', a: '数ヶ月単位のリリース', b: '週次または日次のデプロイ' },
      { rowLabel: 'コスト効率', a: '初期投資が大', b: '従量課金と最適化で30%削減' },
      { rowLabel: 'スケーラビリティ', a: '物理的な制限あり', b: 'クラウドネイティブで無限に拡張' },
      { rowLabel: '保守性', a: '属人化が進みやすい', b: 'コードによる自動管理とドキュメント化' },
    ],
    insight: '新手法の導入により、スピードと効率の両立が可能になります。',
  },
  DataChart: {
    title: 'パフォーマンス検証結果',
    kpis: [
      { label: '処理速度向上', value: '45', unit: '%↑', trend: 'vs 前バージョン' },
      { label: 'コスト削減', value: '3.2', unit: 'M￥', trend: '月間平均' },
      { label: 'サーバー負荷', value: '12', unit: '%↓', trend: '最適化後' },
      { label: 'ユーザー満足度', value: '4.8', unit: '/ 5.0', trend: '↑ +0.6pt' },
    ],
    chart: {
      chartTitle: '月間トランザクションの推移',
      data: [{
        name: '取引数',
        labels: ['1月', '2月', '3月', '4月'],
        values: [520, 680, 810, 950],
      }],
    },
    points: ['継続的な最適化により、負荷を抑えつつ処理能力を向上', '4月の伸びは新機能リリースによる相乗効果'],
  },
  Kpi: {
    title: 'リソース活用の最適化',
    kpis: [
      { label: '平均稼働率', value: '85', unit: '%' },
      { label: 'ピーク時負荷', value: '92', unit: '%' },
      { label: '待機時間', value: '0.4', unit: 's' },
      { label: '同時接続数', value: '5,000', unit: '+' },
    ],
    footnote: '分散処理技術の導入により、リソースの無駄を徹底的に排除しました。',
  },
  Flow: {
    title: 'サービス開始までのステップ',
    steps: [
      { label: '要件定義', description: 'お客様のビジネスニーズをヒアリングし、要件を明確化します。' },
      { label: '設計・開発', description: '最新技術を用いて、堅牢で柔軟なシステムを構築します。' },
      { label: '品質保証', description: '厳格なテストプロセスを経て、最高品質を保証します。' },
      { label: 'ローンチ', description: 'スムーズな移行と、初期運用のアシストを行います。' },
    ],
  },
  Timeline: {
    title: 'プロジェクトロードマップ',
    timeline: [
      { period: '2026 Q1', title: 'コンセプト設計', description: 'プロトタイプ作成と要件確定' },
      { period: '2026 Q2', title: 'ベータ版リリース', description: 'ユーザー評価とフィードバック収集' },
      { period: '2026 Q3', title: '正式リリース', description: '市場展開と初期サポート体制' },
      { period: '2026 Q4', title: '機能拡張', description: 'エコシステム構築と次世代機能追加' },
    ],
  },
  FeatureList: {
    title: '主要な機能ハイライト',
    features: [
      { title: 'リアルタイム同期', description: '複数のデバイス間で瞬時にデータを共有' },
      { title: 'AIインサイト', description: '蓄積されたデータから自動的に価値ある洞察を抽出' },
      { title: '高度なセキュリティ', description: 'エンドツーエンドの暗号化と認証基盤' },
      { title: '柔軟なカスタマイズ', description: '各ユーザーのワークフローに合わせた調整が可能' },
    ],
  },
  ImageText: {
    title: '直感的なユーザーインターフェース',
    text: 'デザインと使い心地を最優先に考え、誰もが迷わず操作できるUIを提供します。',
    points: ['レスポンシブデザイン採用', 'ダークモード完全対応', 'アクセシビリティへの配慮'],
    imagePath: 'https://images.unsplash.com/photo-1551288049-bbda48632ad0?auto=format&fit=crop&q=80&w=800', // ダミーURL
  },
  Matrix: {
    title: '戦略的ポジショニング分析',
    axisX: { low: '低価格', high: '高付加価値' },
    axisY: { low: '保守的', high: '革新的' },
    quadrants: [
      { label: '次世代市場のリーダー', items: ['新システム(提案)', 'AI特化プラットフォーム'] },
      { label: '特定領域のスペシャリスト', items: ['専門業務ツール', '垂直統合アプリ'] },
      { label: 'コストリーダー', items: ['汎用SaaS', 'オープンソース基盤'] },
      { label: 'レガシー・安定', items: ['既存の基幹システム', 'オンプレ環境'] },
    ],
  },
  Team: {
    title: 'エキスパートチーム',
    members: [
      { name: 'MemberA', role: 'プロジェクトリーダー', bio: '大規模システム開発の経験が豊富。' },
      { name: 'MemberB', role: 'リードデザイナー', bio: 'UXデザインを専門とし、数々の賞を受賞。' },
      { name: 'MemberC', role: '技術統括', bio: 'クラウドインフラとAI開発のエキスパート。' },
    ],
  },
  Quote: {
    quote: '「テクノロジーの進化は、人々の創造性を解き放つためのものであるべきだ。」',
    attribution: 'IBM Bob Visionaries',
    context: 'Annual Report 2026',
  },
  SectionDivider: {
    number: '01',
    title: '課題の整理と\n現状分析',
    subtitle: '市場環境・競合・自社ポジションの把握',
    label: 'SECTION',
  },
  IconGrid: {
    title: '提供価値の一覧',
    items: [
      { icon: '⚡', label: '高速処理', description: 'ミリ秒単位のレスポンスで快適な操作性を実現' },
      { icon: '🔒', label: 'セキュリティ', description: 'エンドツーエンドの暗号化と多要素認証' },
      { icon: '🌐', label: 'グローバル対応', description: '30言語・多通貨に対応したプラットフォーム' },
      { icon: '🤖', label: 'AI統合', description: '業務データから自動で洞察を抽出' },
      { icon: '📊', label: 'リアルタイム分析', description: 'ダッシュボードで状況を即座に把握' },
      { icon: '🔗', label: '外部連携', description: '主要SaaSとAPIで即日接続可能' },
    ],
    caption: '全機能は標準プランに含まれます',
  },
  ProblemSolution: {
    title: '課題と解決策',
    problemLabel: '現状の課題',
    problems: [
      'システムが老朽化し、変更コストが肥大化している',
      'データがサイロ化されており、部署間の連携が困難',
      '手作業が多く、ヒューマンエラーが発生しやすい',
      'スケールアップに物理的・時間的制約がある',
    ],
    solutionLabel: '本提案の解決策',
    solutions: [
      'クラウドネイティブ化により変更コストを 60% 削減',
      '統合データ基盤の構築で部署横断の分析を実現',
      'RPA と AI による自動化でエラーをほぼゼロに',
      'オートスケーリングで需要変動に即時対応',
    ],
    insight: '段階的な移行計画により、既存業務を止めることなく刷新が可能です。',
  },
  Closing: {
    message: 'ご清聴ありがとうございました',
    submessage: 'ご質問・ご相談はお気軽にどうぞ',
    name: '匿名希望',
    organization: '株式会社テクノロジー推進部',
    email: 'contact@example.com',
    url: 'https://example.com',
  },
  Testimonials: {
    title: 'お客様の声',
    testimonials: [
      {
        quote: '導入後わずか3ヶ月で業務効率が40%改善されました。チーム全員が使いやすいと絶賛しています。',
        name: '匿名希望',
        role: 'ITディレクター',
        organization: 'A社',
      },
      {
        quote: '他社ツールと比べて圧倒的に連携が容易でした。データが一元管理できるようになり、判断スピードが上がりました。',
        name: '匿名希望',
        role: 'CTO',
        organization: 'B社',
      },
      {
        quote: 'サポートチームの対応が迅速で、導入時のトラブルもすぐに解決してもらえました。安心して任せられます。',
        name: '匿名希望',
        role: '業務推進マネージャー',
        organization: 'C社',
      },
    ],
    caption: '※ 掲載は許可をいただいたお客様のみ',
  },
  VerticalSteps: {
    title: '導入から運用開始までのフロー',
    steps: [
      { label: 'ヒアリング・要件定義', description: '現状の業務フローと課題をヒアリングし、スコープと優先順位を確定します。' },
      { label: '環境構築・初期設定', description: 'クラウド環境のプロビジョニングと既存データの移行設計を行います。' },
      { label: 'パイロット導入', description: '特定部署・ユーザーに限定してパイロット運用を開始し、フィードバックを収集します。' },
      { label: '全社展開', description: '段階的なロールアウト計画に従い、全社ユーザーへの展開を実施します。' },
      { label: '定着支援・継続改善', description: '月次レビューと活用促進のトレーニングにより、ROIを最大化します。' },
    ],
    caption: '標準的な導入期間: 約 8〜12 週間',
  },
};

async function generateAll() {
  const outputDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const themeList = themes.listThemes();
  console.log(`🚀 デモ生成を開始します。対象テーマ: ${themeList.length} 件`);

  for (const themeId of themeList) {
    console.log(`\n🎨 処理中テーマ: [${themeId}]`);
    const builder = new SlideBuilder(themeId);

    // 1. 各テーマの冒頭にタイトルスライド
    renderers.Title(builder, {
      title: `${themeId.toUpperCase()} Theme Showcase`,
      subtitle: 'All Renderers Gallery',
      presenter: 'Design System Team',
      date: new Date().toLocaleDateString('ja-JP'),
    });

    // 2. 各レンダラーのデモ
    const rendererNames = Object.keys(renderers);
    for (const rendererName of rendererNames) {
      if (rendererName === 'Title') continue; // Title は既に作成済み
      process.stdout.write(`  - ${rendererName} ... `);
      try {
        renderers[rendererName](builder, sampleData[rendererName]);
        console.log('OK');
      } catch (err) {
        console.log('FAILED');
        console.error(`    ❌ ${rendererName} でエラーが発生しました:`, err.message);
      }
    }

    // 3. 保存
    const fileName = `demo-${themeId}.pptx`;
    const outputPath = path.join(outputDir, fileName);
    await builder.save(outputPath);
    console.log(`✅ 生成完了: ${outputPath}`);
  }

  console.log('\n✨ 全てのデモ生成が完了しました！');
  console.log('📁 output/ ディレクトリを確認してください。');
}

generateAll().catch(err => {
  console.error('\n❌ 予期せぬエラーが発生しました:', err);
  process.exit(1);
});
