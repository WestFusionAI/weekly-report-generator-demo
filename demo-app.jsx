import { useState, useCallback, useEffect, useRef } from "react";

// ── Auto-extract logic ──
function autoExtract(text) {
  const result = { company: "", date: "", agenda: "", clientAttendees: "", ourAttendees: "", body: text };
  if (!text) return result;
  const lines = text.split("\n");
  const bodyLines = [];
  const dateRe = /(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})日?/;
  let foundDate = false;

  for (const line of lines) {
    const t = line.trim();
    // Tagged fields
    if (/^【?議題】?[:：]?\s*/i.test(t)) { result.agenda = t.replace(/^【?議題】?[:：]?\s*/i, ""); continue; }
    if (/^【?先方出席者?】?[:：]?\s*/i.test(t)) { result.clientAttendees = t.replace(/^【?先方出席者?】?[:：]?\s*/i, ""); continue; }
    if (/^【?(自社|当社|弊社)出席者?】?[:：]?\s*/i.test(t)) { result.ourAttendees = t.replace(/^【?(自社|当社|弊社)出席者?】?[:：]?\s*/i, ""); continue; }
    if (/^【?議事(内容|録)?】?[:：]?\s*/i.test(t)) { bodyLines.push(t.replace(/^【?議事(内容|録)?】?[:：]?\s*/i, "")); continue; }
    if (/^【?(顧客|お客様|客先|取引先|会社)(名)?】?[:：]?\s*/i.test(t)) { result.company = t.replace(/^【?(顧客|お客様|客先|取引先|会社)(名)?】?[:：]?\s*/i, ""); continue; }
    if (/^【?日[付時]】?[:：]?\s*/i.test(t)) {
      const dm = t.match(dateRe);
      if (dm) { result.date = `${dm[1]}-${dm[2].padStart(2,"0")}-${dm[3].padStart(2,"0")}`; foundDate = true; }
      continue;
    }
    // Inline date detection
    if (!foundDate) {
      const dm = t.match(dateRe);
      if (dm) { result.date = `${dm[1]}-${dm[2].padStart(2,"0")}-${dm[3].padStart(2,"0")}`; foundDate = true; }
    }
    bodyLines.push(t);
  }
  if (bodyLines.length > 0) result.body = bodyLines.join("\n");
  return result;
}

// ── Dummy data: realistic raw meeting notes in inbox ──
const SEED_INBOX = [
  {
    id: 101,
    filename: "20260320_名古屋部品工業_MTG音声メモ.txt",
    raw: `日付：2026年3月20日
顧客名：名古屋部品工業
議題：自動車部品量産ライン構築の初回ヒアリング
先方出席者：佐々木工場長、中村課長、伊藤（生産技術）
自社出席者：山田、佐藤（技術営業）

議事内容：
新規取引の初回打ち合わせを実施。自動車部品の量産ライン構築を検討中とのこと。年間生産量は50万個規模を見込んでいる。設備投資予算は2億円超の大型案件になる見通し。
佐々木工場長からは「既存の協力会社では対応しきれなくなってきた」との背景説明あり。
月産5万個のタクトタイム要件を確認。既存設備との接続インターフェースはPROFINET希望。安全規格はISO13849 PLdが必須条件。
まずは要件定義フェーズとして来月に工場視察を実施予定。技術営業の同行が必要。次回は概算見積もりを持参する約束をした。`,
    detectedCompany: "名古屋部品工業",
    detectedDate: "2026-03-20",
    type: "対面",
  },
  {
    id: 102,
    filename: "20260319_大同ステンレス_緊急対応メモ.txt",
    raw: `2026/3/19 大同ステンレス 緊急対応

議題：溶接ロボット品質不良の緊急対応
先方出席者：高橋製造部長、品質管理課 木村主任
自社出席者：山田、渡辺（サービスエンジニア）

納品済みの溶接ロボットで品質不良が発生した。ビード幅のばらつきが規格外になっている。
緊急でサービスエンジニア渡辺を派遣し原因調査を実施。ワイヤ送給装置のローラー摩耗が原因の可能性が高い。
顧客の生産ラインが一部停止しており、今週中の復旧が必須。高橋部長は非常に厳しい態度。
クレーム対応として部長判断が必要。再発防止策として3ヶ月ごとのローラー点検をメンテナンス契約に追加提案予定。`,
    detectedCompany: "大同ステンレス",
    detectedDate: "2026-03-19",
    type: "対面",
  },
  {
    id: 103,
    filename: "teams_transcript_0318_三河金属加工.txt",
    raw: `【顧客】三河金属加工
【日付】2026/03/18
【議題】画像検査システム導入 継続協議
【先方出席者】小林工場長、検査課 松田
【自社出席者】山田（オンライン）

検査工程の自動化について継続で協議した。画像検査システムの導入に前向きだが、既存ラインとの連携について懸念が出ている。
小林工場長「うちのラインは15年前の設計なので、新しいシステムがちゃんと繋がるか不安」とのこと。
技術部門と合同で検証環境を構築する方向で合意した。来週中にPoC計画書を提出する予定。
松田さんから「不良率を現状の2.3%から0.5%以下にしたい」との目標値を改めて確認。`,
    detectedCompany: "三河金属加工",
    detectedDate: "2026-03-18",
    type: "オンライン",
  },
];

const SEED_RECORDS = [
  { id: 1, company: "東海精機工業", date: "2026-03-10", type: "オンライン", priority: "medium", content: "【議題】CNC加工機提案フィードバック\n【先方出席者】田中製造部長\n【自社出席者】山田\n【議事内容】前回のCNC加工機提案に対するフィードバック。5軸加工機への関心が高い。加工精度±0.005mmの要求。現場オペレーターの教育支援も要望あり。導入後のサポート体制について詳細説明を求められた。" },
  { id: 2, company: "東海精機工業", date: "2026-03-17", type: "対面", priority: "high", content: "【議題】CNC加工機リプレース案件 詳細打ち合わせ\n【先方出席者】田中製造部長、生産管理課\n【自社出席者】山田、技術部 井上\n【議事内容】CNC加工機の更新案件について打ち合わせ。現行機の老朽化が進み、年内にリプレースを検討中。予算は約8,000万円。競合はファナックとDMG森精機。次回は4月上旬にデモ機見学を提案済み。決裁者は製造部長の田中氏。" },
  { id: 3, company: "静岡プレス製作所", date: "2026-03-19", type: "電話", priority: "medium", content: "【議題】メンテナンス契約更新確認\n【先方出席者】総務課 山本\n【自社出席者】山田\n【議事内容】プレス機の定期メンテナンス契約の更新確認。現契約は5月末で満了。今期から予防保全プランへのアップグレードを提案。年間契約額は約1,200万円から1,500万円への増額見込み。来月中に見積もり提出予定。" },
];

const PRIORITY_CONFIG = {
  urgent: { label: "緊急", color: "#DC2626", bg: "#FEF2F2", sort: 0 },
  high:   { label: "重要", color: "#D97706", bg: "#FFFBEB", sort: 1 },
  medium: { label: "通常", color: "#2563EB", bg: "#EFF6FF", sort: 2 },
  low:    { label: "低",   color: "#6B7280", bg: "#F9FAFB", sort: 3 },
};

function toMarkdown(company, recs) {
  const sorted = [...recs].sort((a, b) => b.date.localeCompare(a.date));
  let md = `# 以下の議事録データを元に、指示に従って出力してください。\n\n`;
  md += `## 指示（プロンプト）\n\n`;
  md += `この「${company}」の商談議事録（${sorted.length}件）を読み、以下の形式で要約・分析してください。\n\n`;
  md += `【1. 案件の現状サマリー】2〜3文で簡潔に。\n`;
  md += `【2. 重要な論点・課題】箇条書きで。\n`;
  md += `【3. 次回アクション】具体的に。期限があれば併記。\n`;
  md += `【4. 案件の温度感】受注確度を高・中・低で評価し、根拠を1文で。\n\n`;
  md += `ルール：事実ベースで書く。推測は「（推定）」と明記。金額・競合名・決裁者名は省略しない。\n\n`;
  md += `---\n\n## 議事録データ：${company}\n\n`;
  md += `> 最終更新: ${sorted[0]?.date || "N/A"}  \n> 累計: ${sorted.length}回\n\n`;
  sorted.forEach((r) => {
    md += `### ${r.date}（${r.type}）[${PRIORITY_CONFIG[r.priority].label}]\n\n${r.content}\n\n---\n\n`;
  });
  return md;
}

function toMarkdownAll(records, allCompanies, startDate, endDate) {
  const filtered = records.filter(r => r.date >= startDate && r.date <= endDate);
  let md = `# 以下の議事録データを元に、部長向けの週次営業報告書を作成してください。\n\n`;
  md += `## 指示（プロンプト）\n\n`;
  md += `対象期間：${startDate} 〜 ${endDate}（${filtered.length}件 / ${allCompanies.filter(c => filtered.some(r => r.company === c)).length}社）\n\n`;
  md += `■ 出力フォーマット：\n\n`;
  md += `【1. 要対応・エスカレーション事項】\n`;
  md += `緊急度の高い案件を優先度順に記載。\n`;
  md += `各項目は「顧客名：状況の要約（1〜2文）＋必要なアクション」の形式。\n\n`;
  md += `【2. 顧客別 進捗サマリー】\n`;
  md += `顧客ごとに今週の動きを2〜3文で要約。\n`;
  md += `案件の温度感（受注確度）があれば併記。\n\n`;
  md += `【3. 来週のアクション一覧】\n`;
  md += `顧客名：具体的なアクション内容と期限。\n\n`;
  md += `■ ルール：\n`;
  md += `・簡潔に。各項目は3文以内。\n`;
  md += `・事実ベースで書く。推測は「（推定）」と明記。\n`;
  md += `・金額・競合名・決裁者名など重要情報は省略しない。\n`;
  md += `・全体でA4 1枚程度に収まる分量。\n\n`;
  md += `---\n\n## 議事録データ\n\n`;
  allCompanies.filter(c => filtered.some(r => r.company === c)).forEach(company => {
    const companyRecs = filtered.filter(r => r.company === company).sort((a, b) => b.date.localeCompare(a.date));
    md += `### ${company}（${companyRecs.length}件）\n\n`;
    companyRecs.forEach(r => {
      md += `#### ${r.date}（${r.type}）[${PRIORITY_CONFIG[r.priority].label}]\n\n${r.content}\n\n---\n\n`;
    });
  });
  return md;
}

// Extract a 1-line summary from structured content
function summarize(content) {
  const lines = content.split("\n").filter(l => l.trim());
  // Find the main body line (skip tagged headers)
  const bodyLines = lines.filter(l => !/^【.+?】/.test(l.trim()));
  const agendaLine = lines.find(l => /^【議題】/.test(l.trim()));
  const agenda = agendaLine ? agendaLine.replace(/^【議題】\s*/, "") : "";
  // First meaningful body sentence
  const firstBody = bodyLines[0] || "";
  if (agenda && firstBody) return `${agenda} — ${firstBody.substring(0, 60)}`;
  if (agenda) return agenda;
  return firstBody.substring(0, 80) || content.substring(0, 80);
}

function generateReport(records, s, e) {
  const f = records.filter((r) => r.date >= s && r.date <= e);
  const sorted = [...f].sort((a, b) => PRIORITY_CONFIG[a.priority].sort - PRIORITY_CONFIG[b.priority].sort || b.date.localeCompare(a.date));
  const companies = {};
  f.forEach((r) => { if (!companies[r.company]) companies[r.company] = []; companies[r.company].push(r); });
  return { filtered: f, sorted, companies, urgent: f.filter((r) => r.priority === "urgent" || r.priority === "high") };
}

const S = {
  font: "'Noto Sans JP', sans-serif", dark: "#1a1a2e", sub: "#64748b",
  muted: "#94a3b8", border: "#e2e8f0", bg: "#f8fafc", card: "#fff", accent: "#2563EB",
};
const inputStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${S.border}`, borderRadius: "6px", fontSize: "13px", fontFamily: S.font, outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: "11px", fontWeight: 700, color: S.sub, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" };

function PriorityBadge({ priority }) {
  const c = PRIORITY_CONFIG[priority];
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 700, color: c.color, background: c.bg, border: `1px solid ${c.color}22` }}>{c.label}</span>;
}

function PrioritySelector({ value, onChange, size }) {
  const sm = size === "sm";
  return (
    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
      {["urgent", "high", "medium", "low"].map((p) => {
        const c = PRIORITY_CONFIG[p];
        const active = value === p;
        return (
          <button key={p} onClick={() => onChange(p)} style={{
            padding: sm ? "2px 8px" : "4px 12px",
            border: `1px solid ${active ? c.color : c.color + "33"}`,
            borderRadius: "5px",
            background: active ? c.color : c.bg,
            color: active ? "#fff" : c.color,
            fontSize: sm ? "10px" : "11px",
            fontWeight: 700, cursor: "pointer", fontFamily: S.font,
            transition: "all 0.15s",
          }}>{c.label}</button>
        );
      })}
    </div>
  );
}

function TabBtn({ active, onClick, children, badge }) {
  return (
    <button onClick={onClick} style={{ padding: "8px 14px", border: "none", borderBottom: active ? `2px solid ${S.dark}` : "2px solid transparent", background: "transparent", color: active ? S.dark : S.muted, fontWeight: active ? 700 : 500, fontSize: "12px", cursor: "pointer", fontFamily: S.font, display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
      {children}
      {badge != null && <span style={{ background: active ? S.dark : "#e2e8f0", color: active ? "#fff" : S.muted, fontSize: "10px", fontWeight: 700, borderRadius: "10px", padding: "1px 7px" }}>{badge}</span>}
    </button>
  );
}

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "18px", overflowX: "auto", paddingBottom: "4px" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "20px", background: i === current ? S.dark : i < current ? "#059669" : "#f1f5f9", color: i <= current ? "#fff" : S.muted, fontSize: "10px", fontWeight: 700, whiteSpace: "nowrap" }}>
            {i < current ? "✓" : (i + 1)}<span>{s}</span>
          </div>
          {i < steps.length - 1 && <div style={{ width: "20px", height: "2px", background: i < current ? "#059669" : "#e2e8f0", margin: "0 1px" }} />}
        </div>
      ))}
    </div>
  );
}

// ── Main ──
export default function App() {
  const [records, setRecords] = useState(SEED_RECORDS);
  const [inbox, setInbox] = useState(SEED_INBOX);
  const [processed, setProcessed] = useState([]);
  const [activeTab, setActiveTab] = useState("inbox");
  const [reportMode, setReportMode] = useState("ranked");

  // Form
  const [fCompany, setFCompany] = useState("");
  const [fDate, setFDate] = useState("2026-03-21");
  const [fType, setFType] = useState("対面");
  const [fAgenda, setFAgenda] = useState("");
  const [fClient, setFClient] = useState("");
  const [fOur, setFOur] = useState("");
  const [fContent, setFContent] = useState("");
  const [fPaste, setFPaste] = useState("");
  const [inputMode, setInputMode] = useState("paste"); // paste | fields

  const [reportStart, setReportStart] = useState("2026-03-10");
  const [reportEnd, setReportEnd] = useState("2026-03-21");
  const [mdCompany, setMdCompany] = useState(null);
  const [filterCompany, setFilterCompany] = useState("all");
  const [expandedRecords, setExpandedRecords] = useState({});

  const allCompanies = [...new Set([...records.map((r) => r.company), ...inbox.map((i) => i.detectedCompany)])].sort();

  const processInbox = useCallback((item) => {
    setRecords((prev) => [...prev, { id: Date.now() + Math.random(), company: item.detectedCompany, date: item.detectedDate, type: item.type, content: item.raw, priority: "medium" }]);
    setInbox((prev) => prev.filter((x) => x.id !== item.id));
    setProcessed((prev) => [{ ...item, processedAt: new Date().toLocaleTimeString("ja-JP") }, ...prev]);
  }, []);

  // Auto-process timer: items auto-move to records after 5 seconds (simulates 3 min in production)
  const [countdowns, setCountdowns] = useState({});
  const timersRef = useRef({});

  useEffect(() => {
    inbox.forEach((item) => {
      if (!timersRef.current[item.id]) {
        const total = 5;
        setCountdowns((prev) => ({ ...prev, [item.id]: total }));
        const interval = setInterval(() => {
          setCountdowns((prev) => {
            const remaining = (prev[item.id] || 0) - 1;
            if (remaining <= 0) {
              clearInterval(interval);
              delete timersRef.current[item.id];
              // auto-process
              setRecords((pr) => [...pr, { id: Date.now() + Math.random(), company: item.detectedCompany, date: item.detectedDate, type: item.type, content: item.raw, priority: "medium" }]);
              setInbox((pr) => pr.filter((x) => x.id !== item.id));
              setProcessed((pr) => [{ ...item, processedAt: new Date().toLocaleTimeString("ja-JP"), auto: true }, ...pr]);
              const { [item.id]: _, ...rest } = prev;
              return rest;
            }
            return { ...prev, [item.id]: remaining };
          });
        }, 1000);
        timersRef.current[item.id] = interval;
      }
    });
    // Cleanup timers for items no longer in inbox
    Object.keys(timersRef.current).forEach((id) => {
      if (!inbox.find((i) => String(i.id) === String(id))) {
        clearInterval(timersRef.current[id]);
        delete timersRef.current[id];
      }
    });
  }, [inbox]);

  // Immediate process (skip timer)
  const processNow = useCallback((item) => {
    if (timersRef.current[item.id]) {
      clearInterval(timersRef.current[item.id]);
      delete timersRef.current[item.id];
    }
    setCountdowns((prev) => { const { [item.id]: _, ...rest } = prev; return rest; });
    processInbox(item);
  }, [processInbox]);

  const processAllNow = useCallback(() => {
    inbox.forEach((item) => {
      if (timersRef.current[item.id]) {
        clearInterval(timersRef.current[item.id]);
        delete timersRef.current[item.id];
      }
    });
    setCountdowns({});
    inbox.forEach((item) => processInbox(item));
  }, [inbox, processInbox]);

  const changePriority = useCallback((id, newPriority) => {
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, priority: newPriority } : r));
  }, []);

  // Auto-extract from pasted text
  const handlePaste = useCallback((text) => {
    setFPaste(text);
    if (!text.trim()) {
      setFCompany(""); setFAgenda(""); setFClient(""); setFOur(""); setFContent("");
      return;
    }
    const ex = autoExtract(text);
    if (ex.company) setFCompany(ex.company);
    if (ex.date) setFDate(ex.date);
    if (ex.agenda) setFAgenda(ex.agenda);
    if (ex.clientAttendees) setFClient(ex.clientAttendees);
    if (ex.ourAttendees) setFOur(ex.ourAttendees);
    // Always set content - use extracted body, or fall back to full text
    setFContent(ex.body || text);
  }, []);

  const handleSubmit = useCallback(() => {
    const company = fCompany.trim();
    const content = fContent.trim() || fPaste.trim();
    if (!company || !content) return;
    const parts = [];
    if (fAgenda.trim()) parts.push(`【議題】${fAgenda.trim()}`);
    if (fClient.trim()) parts.push(`【先方出席者】${fClient.trim()}`);
    if (fOur.trim()) parts.push(`【自社出席者】${fOur.trim()}`);
    parts.push(`【議事内容】${content}`);
    const composed = parts.join("\n");
    setInbox((prev) => [...prev, { id: Date.now(), filename: `${fDate}_${company}_投入.txt`, raw: composed, detectedCompany: company, detectedDate: fDate, type: fType }]);
    setFCompany(""); setFDate("2026-03-21"); setFAgenda(""); setFClient(""); setFOur(""); setFContent(""); setFPaste("");
    setActiveTab("inbox");
  }, [fCompany, fDate, fType, fAgenda, fClient, fOur, fContent, fPaste]);

  const canSubmit = fCompany.trim() && (fContent.trim() || fPaste.trim());

  // Auto-extend report end date to cover all records
  const latestDate = records.reduce((max, r) => r.date > max ? r.date : max, reportEnd);
  const effectiveReportEnd = latestDate > reportEnd ? latestDate : reportEnd;
  const report = generateReport(records, reportStart, effectiveReportEnd);
  // Newest first for records display
  const filteredRecords = (filterCompany === "all" ? [...records] : records.filter((r) => r.company === filterCompany))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  return (
    <div style={{ fontFamily: S.font, minHeight: "100vh", background: `linear-gradient(160deg, ${S.bg} 0%, #eef2f7 100%)`, padding: "16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ maxWidth: "860px", margin: "0 auto 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `linear-gradient(135deg, ${S.dark} 0%, #16213e 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: 900 }}>W</div>
          <div>
            <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 900, color: S.dark }}>Weekly Report Generator</h1>
            <p style={{ margin: 0, fontSize: "11px", color: S.muted }}>SharePoint + Power Automate ｜ AI連携はオプション</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <StepIndicator steps={["外部で作成", "受信箱に投入", "自動振分＆蓄積", "MD+プロンプト", "AIで週報生成"]} current={activeTab === "input" ? 0 : activeTab === "inbox" ? 2 : activeTab === "records" ? 3 : activeTab === "markdown" ? 3 : 4} />
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", gap: "0", borderBottom: `1px solid ${S.border}`, marginBottom: "16px", overflowX: "auto" }}>
        <TabBtn active={activeTab === "input"} onClick={() => setActiveTab("input")}>📝 投入テスト</TabBtn>
        <TabBtn active={activeTab === "inbox"} onClick={() => setActiveTab("inbox")} badge={inbox.length || null}>受信箱</TabBtn>
        <TabBtn active={activeTab === "records"} onClick={() => setActiveTab("records")} badge={records.length}>蓄積データ</TabBtn>
        <TabBtn active={activeTab === "markdown"} onClick={() => setActiveTab("markdown")}>📄 MD + プロンプト</TabBtn>
        <TabBtn active={activeTab === "report"} onClick={() => setActiveTab("report")}>🤖 週報サンプル</TabBtn>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* ═══ INPUT ═══ */}
        {activeTab === "input" && (
          <div style={{ background: S.card, borderRadius: "12px", padding: "24px", border: `1px solid ${S.border}` }}>
            <h2 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: S.dark }}>受信フォルダへの投入シミュレーション</h2>
            <p style={{ margin: "0 0 8px", fontSize: "12px", color: S.muted, lineHeight: 1.6 }}>実運用では、Word・メモ帳・Teams文字起こし等<strong style={{ color: S.sub }}>どんなツールで作った議事録でもOK</strong>。SharePointの受信フォルダに入れるだけ。</p>
            <div style={{ padding: "10px 14px", background: "#EFF6FF", borderRadius: "8px", marginBottom: "8px", fontSize: "11px", color: "#2563EB", lineHeight: 1.6, border: "1px solid #BFDBFE" }}>
              💡 <strong>テキストを貼り付けると自動解析：</strong>議事録の中に顧客名・日付・議題・出席者が含まれていれば、各フィールドに自動反映されます。
            </div>
            <div style={{ padding: "8px 14px", background: "#FEF2F2", borderRadius: "8px", marginBottom: "16px", fontSize: "11px", color: "#DC2626", lineHeight: 1.5, border: "1px solid #FECACA" }}>
              ⚠ <strong>顧客名</strong>と<strong>日付</strong>は必須項目です。議事録テキストに含まれていない場合は、下のフィールドで手動入力してください。
            </div>

            {/* Mode toggle */}
            <div style={{ display: "flex", gap: "0", marginBottom: "16px", background: "#f1f5f9", borderRadius: "8px", padding: "3px", width: "fit-content" }}>
              {[["paste", "📋 テキスト貼り付け（自動解析）"], ["fields", "✏️ フィールド個別入力"]].map(([k, l]) => (
                <button key={k} onClick={() => setInputMode(k)} style={{ padding: "6px 14px", border: "none", borderRadius: "6px", background: inputMode === k ? S.dark : "transparent", color: inputMode === k ? "#fff" : S.sub, fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: S.font, transition: "all 0.2s" }}>{l}</button>
              ))}
            </div>

            {inputMode === "paste" && (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <label style={labelStyle}>議事録テキストを貼り付け（自動解析）</label>
                  <textarea value={fPaste} onChange={(e) => handlePaste(e.target.value)} placeholder={`例:\n日付：2026年3月21日\n顧客名：ABC製作所\n議題：新規設備導入の提案\n先方出席者：田中部長、鈴木課長\n自社出席者：山田、佐藤\n\n議事内容：\n新規設備の導入について打ち合わせを行った。\n予算は5,000万円程度を想定...\n\n※ 形式は自由です。キーワードを検出して自動で各項目に振り分けます。`} rows={8} style={{ ...inputStyle, lineHeight: 1.7, resize: "vertical" }} />
                </div>
                {(fCompany || fDate !== "2026-03-21" || fAgenda || fClient || fOur) && (
                  <div style={{ padding: "12px 16px", background: "#F0FDF4", borderRadius: "8px", marginBottom: "12px", border: "1px solid #BBF7D0" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#059669", marginBottom: "8px" }}>✓ 自動検出結果（修正も可能）</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px" }}>
                      {fCompany && <div><span style={{ color: S.muted }}>顧客名:</span> <strong>{fCompany}</strong></div>}
                      {fDate && fDate !== "2026-03-21" && <div><span style={{ color: S.muted }}>日付:</span> <strong>{fDate}</strong></div>}
                      {fAgenda && <div style={{ gridColumn: "1/-1" }}><span style={{ color: S.muted }}>議題:</span> <strong>{fAgenda}</strong></div>}
                      {fClient && <div><span style={{ color: S.muted }}>先方:</span> {fClient}</div>}
                      {fOur && <div><span style={{ color: S.muted }}>自社:</span> {fOur}</div>}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Always-visible editable fields */}
            <div style={{ borderTop: inputMode === "paste" ? `1px solid ${S.border}` : "none", paddingTop: inputMode === "paste" ? "12px" : "0" }}>
              {inputMode === "paste" && <div style={{ fontSize: "11px", color: S.muted, marginBottom: "8px" }}>↓ 自動検出されなかった項目や修正はこちらで直接編集できます</div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div><label style={labelStyle}>顧客名 <span style={{ color: "#DC2626" }}>*必須</span></label><input value={fCompany} onChange={(e) => setFCompany(e.target.value)} placeholder="例: 東海精機工業" list="cl" style={{ ...inputStyle, borderColor: !fCompany.trim() && fPaste.trim() ? "#FECACA" : S.border }} /><datalist id="cl">{allCompanies.map((c) => <option key={c} value={c} />)}</datalist></div>
                <div><label style={labelStyle}>日付 <span style={{ color: "#DC2626" }}>*必須</span></label><input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} style={inputStyle} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div><label style={labelStyle}>形式</label><select value={fType} onChange={(e) => setFType(e.target.value)} style={{ ...inputStyle, background: "#fff" }}><option value="対面">対面</option><option value="オンライン">オンライン</option><option value="電話">電話</option></select></div>
                <div><label style={labelStyle}>議題</label><input value={fAgenda} onChange={(e) => setFAgenda(e.target.value)} placeholder="例: 新規設備導入の提案" style={inputStyle} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <div><label style={labelStyle}>先方出席者</label><input value={fClient} onChange={(e) => setFClient(e.target.value)} placeholder="例: 田中部長、鈴木課長" style={inputStyle} /></div>
                <div><label style={labelStyle}>自社出席者</label><input value={fOur} onChange={(e) => setFOur(e.target.value)} placeholder="例: 山田、佐藤（技術営業）" style={inputStyle} /></div>
              </div>
              {inputMode === "fields" && (
                <div style={{ marginBottom: "12px" }}><label style={labelStyle}>議事内容</label><textarea value={fContent} onChange={(e) => setFContent(e.target.value)} placeholder="打ち合わせの内容を入力..." rows={6} style={{ ...inputStyle, lineHeight: 1.7, resize: "vertical" }} /></div>
              )}
            </div>

            <button onClick={handleSubmit} disabled={!canSubmit} style={{ width: "100%", padding: "12px", background: canSubmit ? `linear-gradient(135deg, ${S.dark} 0%, #16213e 100%)` : "#e2e8f0", color: canSubmit ? "#fff" : S.muted, border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: canSubmit ? "pointer" : "default", fontFamily: S.font }}>📥 受信フォルダに投入（シミュレーション）</button>
            <p style={{ margin: "10px 0 0", fontSize: "10px", color: S.muted, textAlign: "center" }}>※ 実運用ではSharePointの共有フォルダにファイルをドラッグ＆ドロップするだけです</p>
          </div>
        )}

        {/* ═══ INBOX ═══ */}
        {activeTab === "inbox" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: S.dark }}>受信箱</h2>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: S.muted }}>受信したファイルは自動で「通常」として蓄積データに取り込まれます。重要度は蓄積後にいつでも変更可能。</p>
              </div>
              {inbox.length > 0 && (
                <button onClick={processAllNow} style={{ padding: "8px 16px", background: S.dark, color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: S.font, whiteSpace: "nowrap" }}>
                  すべて今すぐ取り込み →
                </button>
              )}
            </div>
            {inbox.length > 0 && (
              <div style={{ padding: "8px 14px", background: "#FFFBEB", borderRadius: "8px", marginBottom: "14px", fontSize: "11px", color: "#92400E", border: "1px solid #FDE68A", lineHeight: 1.5 }}>
                ⏱ 受信ファイルはカウントダウン後に自動取り込みされます（デモ: 5秒 ｜ 実運用: Power Automateで約3分間隔）。重要度はデフォルト「通常」で蓄積され、後から変更できます。
              </div>
            )}
            {inbox.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", background: S.card, borderRadius: "12px", border: `1px solid ${S.border}` }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>✓</div>
                <p style={{ color: S.muted, fontSize: "13px", margin: 0 }}>受信箱は空です — すべて蓄積データに取り込み済み</p>
                <p style={{ color: S.muted, fontSize: "11px", margin: "4px 0 0" }}>処理済み: {processed.length}件</p>
                {processed.length > 0 && <button onClick={() => setActiveTab("records")} style={{ marginTop: "12px", padding: "6px 16px", background: S.accent, color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: S.font }}>蓄積データを確認 →</button>}
              </div>
            ) : inbox.map((item) => {
              const cd = countdowns[item.id];
              return (
              <div key={item.id} style={{ background: S.card, borderRadius: "10px", border: `1px solid ${S.border}`, padding: "16px 20px", marginBottom: "10px", position: "relative", overflow: "hidden" }}>
                {/* Progress bar */}
                {cd != null && (
                  <div style={{ position: "absolute", top: 0, left: 0, height: "3px", background: cd <= 2 ? "#D97706" : "#2563EB", width: `${(cd / 5) * 100}%`, transition: "width 1s linear", borderRadius: "0 2px 2px 0" }} />
                )}
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ fontSize: "11px", color: S.muted, fontFamily: "monospace" }}>📄 {item.filename}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {cd != null && (
                        <span style={{ fontSize: "10px", fontWeight: 700, color: cd <= 2 ? "#D97706" : "#2563EB", background: cd <= 2 ? "#FFFBEB" : "#EFF6FF", padding: "2px 8px", borderRadius: "4px" }}>
                          自動取り込みまで {cd}秒
                        </span>
                      )}
                      <button onClick={() => processNow(item)} style={{ padding: "4px 12px", background: S.dark, color: "#fff", border: "none", borderRadius: "5px", fontSize: "10px", fontWeight: 700, cursor: "pointer", fontFamily: S.font }}>今すぐ取り込み</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", fontSize: "12px", flexWrap: "wrap" }}>
                    <span style={{ color: S.sub }}>検出: <strong style={{ color: S.dark }}>{item.detectedCompany}</strong></span>
                    <span style={{ color: S.sub }}>{item.detectedDate}</span>
                    <span style={{ padding: "0 6px", background: "#f1f5f9", borderRadius: "4px", fontSize: "11px" }}>{item.type}</span>
                  </div>
                </div>
                <div style={{ margin: "0 0 8px", fontSize: "12px", lineHeight: 1.7, color: "#475569", padding: "10px 12px", background: "#f8fafc", borderRadius: "6px", borderLeft: `3px solid ${S.border}`, whiteSpace: "pre-wrap", maxHeight: "200px", overflowY: "auto" }}>{item.raw}</div>
                <div style={{ fontSize: "10px", color: S.muted }}>→ デフォルト「通常」で蓄積。重要度は蓄積データタブで変更可能。</div>
              </div>
            );})}
            {processed.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h3 style={{ fontSize: "12px", fontWeight: 700, color: S.muted, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>処理済みログ</h3>
                {processed.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", padding: "8px 12px", background: "#f0fdf4", borderRadius: "6px", marginBottom: "4px", fontSize: "11px", color: "#475569", flexWrap: "wrap" }}>
                    <span style={{ color: "#059669", fontWeight: 700 }}>✓</span>
                    <span style={{ fontFamily: "monospace", color: S.muted }}>{p.filename}</span>
                    <span>→</span>
                    <span style={{ fontWeight: 700 }}>{p.detectedCompany}</span>
                    {p.auto && <span style={{ fontSize: "9px", color: S.muted, background: "#f1f5f9", padding: "1px 6px", borderRadius: "3px" }}>自動</span>}
                    <span style={{ marginLeft: "auto", color: S.muted }}>{p.processedAt}</span>
                  </div>
                ))}
              </div>
            )}
            <p style={{ textAlign: "center", fontSize: "11px", color: S.muted, marginTop: "16px" }}>※ 実運用ではPower Automateが受信フォルダを監視し、約3分間隔で自動取り込み。重要度変更は蓄積データ上でいつでも可能。</p>
          </div>
        )}

        {/* ═══ RECORDS (newest first, collapsible, editable priority) ═══ */}
        {activeTab === "records" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
              <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: S.dark }}>顧客別 蓄積データ<span style={{ fontSize: "11px", fontWeight: 500, color: S.muted, marginLeft: "8px" }}>（新しい順）</span></h2>
              <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} style={{ padding: "6px 12px", border: `1px solid ${S.border}`, borderRadius: "6px", fontSize: "12px", fontFamily: S.font, background: "#fff", outline: "none" }}>
                <option value="all">全顧客 ({records.length}件)</option>
                {allCompanies.filter(c => records.some(r => r.company === c)).map((c) => <option key={c} value={c}>{c} ({records.filter((r) => r.company === c).length}件)</option>)}
              </select>
            </div>
            {filteredRecords.map((r) => {
              const isExpanded = expandedRecords[r.id];
              // Create summary: first 3 lines or ~100 chars
              const lines = r.content.split("\n").filter(l => l.trim());
              const summaryLines = lines.slice(0, 3);
              const summary = summaryLines.join("\n");
              const hasMore = lines.length > 3 || r.content.length > 150;

              return (
                <div key={r.id} style={{ padding: "14px 18px", background: S.card, borderRadius: "8px", border: `1px solid ${S.border}`, marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "13px", color: S.dark }}>{r.company}</span>
                      <span style={{ fontSize: "11px", color: S.muted }}>{r.date} / {r.type}</span>
                    </div>
                    <PrioritySelector value={r.priority} onChange={(p) => changePriority(r.id, p)} size="sm" />
                  </div>
                  <div style={{ fontSize: "12px", lineHeight: 1.7, color: "#475569", whiteSpace: "pre-wrap" }}>
                    {isExpanded ? r.content : (hasMore ? summary + "…" : r.content)}
                  </div>
                  {hasMore && (
                    <button
                      onClick={() => setExpandedRecords(prev => ({ ...prev, [r.id]: !prev[r.id] }))}
                      style={{ marginTop: "6px", padding: "2px 10px", background: "#f1f5f9", border: `1px solid ${S.border}`, borderRadius: "4px", fontSize: "10px", fontWeight: 600, color: S.sub, cursor: "pointer", fontFamily: S.font }}
                    >
                      {isExpanded ? "▲ 折りたたむ" : `▼ 全文を表示（${lines.length}行）`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ MARKDOWN + PROMPT ═══ */}
        {activeTab === "markdown" && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: S.dark }}>Markdown出力 + AIプロンプト</h2>
              <p style={{ margin: 0, fontSize: "12px", color: S.muted, lineHeight: 1.6 }}>顧客別の議事録Markdownと、AIに渡す用のプロンプトテンプレートをセットで出力します。ここまでがAI無しのコア機能です。</p>
            </div>

            {/* Step visualization */}
            <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "16px", overflowX: "auto" }}>
              {[
                { label: "① 顧客を選択", color: "#2563EB", active: true },
                { label: "→", isArrow: true },
                { label: "② MD + プロンプトをコピー", color: "#7C3AED", active: true },
                { label: "→", isArrow: true },
                { label: "③ AIに貼り付けて実行", color: "#059669", active: true },
              ].map((s, i) => s.isArrow ? (
                <span key={i} style={{ padding: "0 6px", color: S.muted, fontSize: "14px" }}>→</span>
              ) : (
                <span key={i} style={{ fontSize: "10px", fontWeight: 700, color: s.color, background: `${s.color}10`, padding: "4px 10px", borderRadius: "6px", whiteSpace: "nowrap" }}>{s.label}</span>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px", marginBottom: "16px" }}>
              {allCompanies.filter(c => records.some(r => r.company === c)).map((c) => {
                const count = records.filter((r) => r.company === c).length;
                const isActive = mdCompany === c;
                return (
                  <button key={c} onClick={() => setMdCompany(isActive ? null : c)} style={{ padding: "14px 16px", background: isActive ? S.dark : S.card, borderRadius: "10px", border: `1px solid ${isActive ? S.dark : S.border}`, cursor: "pointer", textAlign: "left", fontFamily: S.font }}>
                    <div style={{ fontSize: "11px", color: isActive ? "#94a3b8" : S.muted, marginBottom: "4px", fontFamily: "monospace" }}>📁 {c}.md</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: isActive ? "#fff" : S.dark }}>{c}</div>
                    <div style={{ fontSize: "11px", color: isActive ? "#cbd5e1" : S.muted, marginTop: "2px" }}>{count}件の議事録</div>
                  </button>
                );
              })}
              {/* All companies button */}
              {records.length > 0 && (
                <button onClick={() => setMdCompany("__all__")} style={{ padding: "14px 16px", background: mdCompany === "__all__" ? S.dark : S.card, borderRadius: "10px", border: `1px solid ${mdCompany === "__all__" ? S.dark : S.border}`, cursor: "pointer", textAlign: "left", fontFamily: S.font }}>
                  <div style={{ fontSize: "11px", color: mdCompany === "__all__" ? "#94a3b8" : S.muted, marginBottom: "4px" }}>📊 週報用</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: mdCompany === "__all__" ? "#fff" : S.dark }}>全社まとめ</div>
                  <div style={{ fontSize: "11px", color: mdCompany === "__all__" ? "#cbd5e1" : S.muted, marginTop: "2px" }}>{records.length}件 + プロンプト</div>
                </button>
              )}
            </div>

            {mdCompany && mdCompany !== "__all__" && records.some(r => r.company === mdCompany) && (
              <div>
                <div style={{ background: "#1e1e2e", borderRadius: "10px", overflow: "hidden", border: "1px solid #2d2d3f", marginBottom: "12px" }}>
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid #2d2d3f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#a0a0b8", fontFamily: "monospace" }}>{mdCompany}.md（プロンプト埋め込み済）</span>
                    <span style={{ fontSize: "10px", color: "#B794F6", background: "#7C3AED20", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>このままAIに渡せます</span>
                  </div>
                  <pre style={{ padding: "16px 20px", margin: 0, fontSize: "12px", lineHeight: 1.8, color: "#d4d4e8", fontFamily: "'Courier New', monospace", overflow: "auto", maxHeight: "350px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {toMarkdown(mdCompany, records.filter((r) => r.company === mdCompany))}
                  </pre>
                </div>
                <div style={{ padding: "12px 16px", background: "#7C3AED08", borderRadius: "10px", border: "1px solid #7C3AED20", marginBottom: "12px" }}>
                  <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700, color: "#7C3AED" }}>📋 使い方</p>
                  <div style={{ fontSize: "11px", color: "#475569", lineHeight: 1.7 }}>
                    <p style={{ margin: "0 0 2px" }}><strong>1.</strong> 上のMarkdownをまるごとコピー（プロンプト＋議事録データが1つになっています）</p>
                    <p style={{ margin: "0 0 2px" }}><strong>2.</strong> AIに貼り付けて実行 → この顧客の分析・提案レビュー・引き継ぎ資料等が出力されます</p>
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: "10px", color: S.muted }}>※ プロンプト部分を分離して別途渡すことも可能です。用途に応じてプロンプトの指示内容を書き換えてもOK。</p>
                </div>
              </div>
            )}

            {/* All companies markdown with embedded prompt */}
            {mdCompany === "__all__" && records.length > 0 && (
              <div>
                <div style={{ background: "#1e1e2e", borderRadius: "10px", overflow: "hidden", border: "1px solid #2d2d3f", marginBottom: "12px" }}>
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid #2d2d3f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#a0a0b8", fontFamily: "monospace" }}>週報用Markdown（プロンプト埋め込み済 / 全{records.length}件）</span>
                    <span style={{ fontSize: "10px", color: "#B794F6", background: "#7C3AED20", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>このままAIに渡せます</span>
                  </div>
                  <pre style={{ padding: "16px 20px", margin: 0, fontSize: "11px", lineHeight: 1.7, color: "#d4d4e8", fontFamily: "'Courier New', monospace", overflow: "auto", maxHeight: "400px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {toMarkdownAll(records, allCompanies, reportStart, effectiveReportEnd)}
                  </pre>
                </div>

                <div style={{ padding: "14px 18px", background: "#7C3AED08", borderRadius: "10px", border: "1px solid #7C3AED20", marginBottom: "12px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: "#7C3AED" }}>📋 使い方</p>
                  <div style={{ fontSize: "11px", color: "#475569", lineHeight: 1.8 }}>
                    <p style={{ margin: "0 0 2px" }}><strong>1.</strong> 上のMarkdownをまるごとコピー（プロンプト＋議事録データが1つになっています）</p>
                    <p style={{ margin: "0 0 2px" }}><strong>2.</strong> お好みのAI（ChatGPT / Claude / Copilot等）に貼り付けて実行</p>
                    <p style={{ margin: 0 }}><strong>3.</strong> 生成された週報を確認・編集して提出</p>
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: "10px", color: S.muted, lineHeight: 1.5 }}>※ プロンプトをMarkdownから分離して、別途AIに渡すことも可能です。社内のAI利用ポリシーに合わせて運用してください。</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ REPORT (AI Output Sample) ═══ */}
        {activeTab === "report" && (
          <div>
            <div style={{ padding: "12px 16px", background: "#7C3AED10", borderRadius: "10px", border: "1px solid #7C3AED25", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#7C3AED" }}>🤖 AI出力サンプル</span>
                <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff", background: "#7C3AED", padding: "2px 8px", borderRadius: "4px" }}>AI連携オプション</span>
              </div>
              <p style={{ margin: 0, fontSize: "11px", color: "#64748b", lineHeight: 1.6 }}>
                これは「MD出力」タブのMarkdown＋プロンプトをAIに渡した場合の出力サンプルです。実際にはChatGPT・Claude・Copilot等、お好みのAIで同様の結果が得られます。
              </p>
            </div>

            {report.filtered.length > 0 ? (
              <div style={{ background: S.card, borderRadius: "12px", border: `1px solid ${S.border}`, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${S.border}`, background: "#fafbfc", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: S.dark }}>週次営業報告書</h3>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: S.muted }}>{reportStart} 〜 {effectiveReportEnd} ｜ {report.filtered.length}件 / {Object.keys(report.companies).length}社</p>
                  </div>
                  <span style={{ fontSize: "9px", fontWeight: 700, color: "#7C3AED", background: "#7C3AED15", padding: "3px 10px", borderRadius: "4px", border: "1px solid #7C3AED25" }}>AI生成</span>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  {/* 1. Urgent */}
                  {report.urgent.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <div style={{ width: "4px", height: "16px", borderRadius: "2px", background: "#DC2626" }} />
                        <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#DC2626" }}>1. 要対応・エスカレーション事項</h4>
                      </div>
                      {report.urgent.map((r) => (
                        <div key={r.id} style={{ padding: "6px 0 6px 12px", borderLeft: `2px solid ${PRIORITY_CONFIG[r.priority].color}`, marginBottom: "6px" }}>
                          <div style={{ fontSize: "12px", color: S.dark }}><strong>{r.company}</strong>：{summarize(r.content)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 2. Company summary */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ width: "4px", height: "16px", borderRadius: "2px", background: "#2563EB" }} />
                      <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: S.dark }}>2. 顧客別 進捗サマリー</h4>
                    </div>
                    {Object.entries(report.companies).map(([company, recs]) => (
                      <div key={company} style={{ padding: "6px 0 6px 12px", borderLeft: `2px solid ${S.border}`, marginBottom: "6px" }}>
                        <div style={{ fontSize: "12px", color: S.dark }}><strong>{company}</strong>（{recs.length}件）：{recs.map(r => summarize(r.content)).join("。")}</div>
                      </div>
                    ))}
                  </div>
                  {/* 3. Next actions */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ width: "4px", height: "16px", borderRadius: "2px", background: "#059669" }} />
                      <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: S.dark }}>3. 来週のアクション一覧</h4>
                    </div>
                    <div style={{ fontSize: "12px", lineHeight: 1.8, color: "#475569", paddingLeft: "12px" }}>
                      {Object.entries(report.companies).map(([company, recs]) => (
                        <div key={company}>・<strong>{company}</strong>：{recs[recs.length - 1] ? summarize(recs[recs.length - 1].content).substring(0, 40) : "フォローアップ"}の対応</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: S.muted, fontSize: "13px" }}>蓄積データがありません。議事録を投入してください。</div>
            )}

            <div style={{ marginTop: "16px", padding: "14px 18px", background: "#f8fafc", borderRadius: "10px", border: `1px dashed ${S.border}` }}>
              <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700, color: S.dark }}>📌 この週報ができるまでの流れ</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0", overflowX: "auto", fontSize: "10px", fontWeight: 700 }}>
                {[
                  { label: "議事録を受信フォルダに投入", color: S.sub, bg: "#f1f5f9" },
                  null,
                  { label: "自動振り分け＆蓄積", color: S.sub, bg: "#f1f5f9" },
                  null,
                  { label: "Markdown出力", color: S.sub, bg: "#f1f5f9" },
                  null,
                  { label: "プロンプト付きでAIに渡す", color: "#7C3AED", bg: "#7C3AED10" },
                  null,
                  { label: "この週報が生成される", color: "#059669", bg: "#f0fdf4" },
                ].map((s, i) => s === null ? (
                  <span key={i} style={{ padding: "0 4px", color: S.muted }}>→</span>
                ) : (
                  <span key={i} style={{ color: s.color, background: s.bg, padding: "4px 8px", borderRadius: "4px", whiteSpace: "nowrap" }}>{s.label}</span>
                ))}
              </div>
              <p style={{ margin: "8px 0 0", fontSize: "10px", color: S.muted }}>前半4ステップはAI不要（Power Automateのみ）。AIが必要なのは最後の週報生成のみ。お好みのAIツールで実行可能です。</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "24px", padding: "16px 20px", background: "rgba(26,26,46,0.03)", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
          <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700, color: S.dark }}>System Architecture</p>
          <div style={{ fontSize: "11px", color: S.sub, lineHeight: 1.7 }}>
            <p style={{ margin: "0 0 4px" }}><strong>コア機能（AI不要）：</strong>議事録投入 → Power Automate自動振り分け → SharePoint蓄積 → Markdown出力 + プロンプトテンプレート生成</p>
            <p style={{ margin: 0 }}><strong>AI活用（任意のAIツール）：</strong>Markdown + プロンプトをAIに渡して週報生成・提案レビュー・温度感分析。特定ベンダーに依存せず、ChatGPT / Claude / Copilot等で利用可能。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
