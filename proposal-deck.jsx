import { useState } from "react";

const C = { dark:"#1a1a2e", blue:"#2563EB", purple:"#7C3AED", green:"#059669", red:"#DC2626", amber:"#D97706", cyan:"#0891B2", muted:"#94a3b8", sub:"#64748b" };

const SLIDES = [
  // 0: Title
  {
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
    render: () => (
      <div style={{ height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"40px", textAlign:"center", color:"#fff" }}>
        <div style={{ fontSize:"11px", fontWeight:700, letterSpacing:"0.2em", color:"#64B5F6", marginBottom:"24px", textTransform:"uppercase" }}>業務改善提案書</div>
        <h1 style={{ margin:"0 0 16px", fontSize:"30px", fontWeight:900, lineHeight:1.3 }}>
          営業議事録の自動蓄積と<br/>AI活用による週報生成システム
        </h1>
        <div style={{ width:"60px", height:"3px", background:"linear-gradient(90deg, #64B5F6, #42A5F5)", borderRadius:"2px", margin:"0 0 20px" }} />
        <p style={{ margin:0, fontSize:"13px", color:"#94a3b8", lineHeight:1.7, maxWidth:"500px" }}>
          SharePoint + Power Automate でデータを蓄積<br/>
          お好みのAIで週報を生成 — 特定ベンダーに依存しない設計
        </p>
        <div style={{ marginTop:"36px", display:"flex", gap:"16px", fontSize:"10px" }}>
          <span style={{ padding:"4px 12px", borderRadius:"20px", background:"rgba(37,99,235,0.15)", color:"#64B5F6", border:"1px solid rgba(37,99,235,0.3)" }}>コア機能はAI不要</span>
          <span style={{ padding:"4px 12px", borderRadius:"20px", background:"rgba(124,58,237,0.15)", color:"#B794F6", border:"1px solid rgba(124,58,237,0.3)" }}>AI連携は任意のツールでOK</span>
        </div>
      </div>
    ),
  },
  // 1: Problem
  {
    bg: "#f8fafc",
    render: () => (
      <div style={{ height:"100%", padding:"32px 40px", display:"flex", flexDirection:"column" }}>
        <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.15em", color:C.red, marginBottom:"6px", textTransform:"uppercase" }}>課題</div>
        <h2 style={{ margin:"0 0 20px", fontSize:"22px", fontWeight:900, color:C.dark }}>こんな状況になっていませんか？</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", flex:1 }}>
          {[
            { icon:"📝", title:"議事録が散在", desc:"Word、メモ帳、メール本文…形式も保存先もバラバラ。探すたびに時間を浪費。" },
            { icon:"⏰", title:"週報作成に毎週1〜2時間", desc:"5社分の議事録を読み返して手動で要約。金曜の夕方が毎週潰れる。" },
            { icon:"🔍", title:"過去の経緯が追えない", desc:"担当変更時に引き継ぎ不十分。顧客との約束が抜け落ちるリスク。" },
            { icon:"📊", title:"案件の温度感が見えない", desc:"部長が状況を把握するのは週報提出後。緊急対応が後手に回ることも。" },
          ].map((item, i) => (
            <div key={i} style={{ background:"#fff", borderRadius:"10px", padding:"16px", border:"1px solid #e2e8f0", display:"flex", gap:"12px", alignItems:"flex-start" }}>
              <div style={{ fontSize:"22px", flexShrink:0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize:"13px", fontWeight:700, color:C.dark, marginBottom:"4px" }}>{item.title}</div>
                <div style={{ fontSize:"11px", color:C.sub, lineHeight:1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // 2: Before/After
  {
    bg: "#f8fafc",
    render: () => (
      <div style={{ height:"100%", padding:"32px 40px", display:"flex", flexDirection:"column" }}>
        <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.15em", color:C.blue, marginBottom:"6px", textTransform:"uppercase" }}>Before → After</div>
        <h2 style={{ margin:"0 0 16px", fontSize:"22px", fontWeight:900, color:C.dark }}>導入で何が変わるか</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:"0", flex:1, alignItems:"stretch" }}>
          <div style={{ background:"#FEF2F2", borderRadius:"12px", padding:"16px", border:"1px solid #FECACA" }}>
            <div style={{ fontSize:"12px", fontWeight:900, color:C.red, marginBottom:"12px", textAlign:"center" }}>BEFORE（現状）</div>
            {["議事録の形式・保存先がバラバラ","顧客別の検索に毎回10〜15分","週報作成に1〜2時間/週","過去の議事録を振り返れない","引き継ぎ時に情報が欠落","重要案件の共有が遅れがち"].map((t,i)=>(
              <div key={i} style={{ display:"flex", gap:"6px", marginBottom:"8px" }}>
                <span style={{ color:C.red, fontWeight:700, fontSize:"13px", flexShrink:0 }}>✗</span>
                <span style={{ fontSize:"11px", color:"#7F1D1D", lineHeight:1.5 }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", padding:"0 10px" }}>
            <div style={{ fontSize:"24px", color:C.blue, fontWeight:300 }}>→</div>
          </div>
          <div style={{ background:"#F0FDF4", borderRadius:"12px", padding:"16px", border:"1px solid #BBF7D0" }}>
            <div style={{ fontSize:"12px", fontWeight:900, color:C.green, marginBottom:"12px", textAlign:"center" }}>AFTER（導入後）</div>
            {["議事録は共有フォルダに入れるだけ","顧客別に自動分類・時系列で蓄積","Markdown＋プロンプトでAIが週報生成","好きなAIツールで分析・レビュー可能","引き継ぎ資料もAIで即生成","重要度タグで緊急案件を即把握"].map((t,i)=>(
              <div key={i} style={{ display:"flex", gap:"6px", marginBottom:"8px" }}>
                <span style={{ color:C.green, fontWeight:700, fontSize:"13px", flexShrink:0 }}>✓</span>
                <span style={{ fontSize:"11px", color:"#14532D", lineHeight:1.5 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  // 3: System flow — UPDATED with core/AI boundary
  {
    bg: "#f8fafc",
    render: () => (
      <div style={{ height:"100%", padding:"32px 40px", display:"flex", flexDirection:"column" }}>
        <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.15em", color:C.purple, marginBottom:"6px", textTransform:"uppercase" }}>システム構成</div>
        <h2 style={{ margin:"0 0 16px", fontSize:"22px", fontWeight:900, color:C.dark }}>コア機能（AI不要）＋ AI活用の2層構造</h2>
        {/* Core flow */}
        <div style={{ background:"#fff", borderRadius:"10px", padding:"14px 16px", border:"1px solid #e2e8f0", marginBottom:"10px" }}>
          <div style={{ fontSize:"10px", fontWeight:700, color:C.blue, marginBottom:"10px" }}>▼ コア機能（SharePoint + Power Automate のみ）</div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0" }}>
            {[
              { icon:"📝", label:"議事録作成", sub:"任意ツール", color:C.sub },
              null,
              { icon:"📥", label:"受信フォルダ", sub:"SharePoint", color:C.amber },
              null,
              { icon:"⚡", label:"自動振り分け", sub:"Power Automate", color:C.blue },
              null,
              { icon:"📁", label:"顧客別蓄積", sub:"SharePoint List", color:C.cyan },
              null,
              { icon:"📄", label:"MD＋プロンプト", sub:"1ファイル出力", color:C.purple },
            ].map((s,i) => s===null ? (
              <span key={i} style={{ padding:"0 4px", color:"#cbd5e1", fontSize:"14px" }}>→</span>
            ) : (
              <div key={i} style={{ textAlign:"center", minWidth:"72px" }}>
                <div style={{ fontSize:"18px" }}>{s.icon}</div>
                <div style={{ fontSize:"9px", fontWeight:700, color:s.color, marginTop:"2px" }}>{s.label}</div>
                <div style={{ fontSize:"8px", color:C.muted }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Arrow down */}
        <div style={{ textAlign:"center", fontSize:"14px", color:C.purple, margin:"2px 0" }}>↓ Markdownファイルをお好みのAIに渡す</div>
        {/* AI layer */}
        <div style={{ background:`${C.purple}08`, borderRadius:"10px", padding:"14px 16px", border:`1px solid ${C.purple}20`, marginBottom:"10px" }}>
          <div style={{ fontSize:"10px", fontWeight:700, color:C.purple, marginBottom:"10px" }}>▼ AI活用（お好みのAIツールで実行）</div>
          <div style={{ display:"flex", justifyContent:"center", gap:"12px", flexWrap:"wrap" }}>
            {[
              { icon:"📊", label:"週報自動生成", desc:"プロンプト付きMDから\n部長向け報告書を生成" },
              { icon:"🔍", label:"提案資料レビュー", desc:"過去の経緯を踏まえた\n提案書のAIチェック" },
              { icon:"📈", label:"温度感分析", desc:"発言の変化から\n受注確度を評価" },
              { icon:"📋", label:"引き継ぎ資料", desc:"全議事録から\nサマリーを自動生成" },
            ].map((item,i) => (
              <div key={i} style={{ width:"120px", padding:"10px", borderRadius:"8px", background:"#fff", border:`1px solid ${C.purple}15`, textAlign:"center" }}>
                <div style={{ fontSize:"16px", marginBottom:"3px" }}>{item.icon}</div>
                <div style={{ fontSize:"9px", fontWeight:700, color:C.purple, marginBottom:"2px" }}>{item.label}</div>
                <div style={{ fontSize:"8px", color:C.sub, whiteSpace:"pre-line", lineHeight:1.3 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:"8px", fontSize:"9px" }}>
          <span style={{ padding:"3px 10px", borderRadius:"4px", background:"#EFF6FF", color:C.blue, fontWeight:700 }}>ChatGPT</span>
          <span style={{ padding:"3px 10px", borderRadius:"4px", background:"#EFF6FF", color:C.blue, fontWeight:700 }}>Claude</span>
          <span style={{ padding:"3px 10px", borderRadius:"4px", background:"#EFF6FF", color:C.blue, fontWeight:700 }}>Copilot</span>
          <span style={{ padding:"3px 10px", borderRadius:"4px", background:"#f1f5f9", color:C.sub, fontWeight:700 }}>その他のAI</span>
        </div>
      </div>
    ),
  },
  // 4: Key features — UPDATED
  {
    bg: "#f8fafc",
    render: () => (
      <div style={{ height:"100%", padding:"32px 40px", display:"flex", flexDirection:"column" }}>
        <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.15em", color:C.green, marginBottom:"6px", textTransform:"uppercase" }}>主要機能</div>
        <h2 style={{ margin:"0 0 18px", fontSize:"22px", fontWeight:900, color:C.dark }}>コア機能3つ ＋ AI活用</h2>
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
          {[
            { num:"01", title:"自動振り分け＆蓄積", desc:"受信フォルダに議事録を入れるだけ。Power Automateが顧客名・日付を検出し自動分類。SharePointに時系列で蓄積。", color:C.blue, tag:"コア", tagBg:"#EFF6FF" },
            { num:"02", title:"Markdown＋プロンプト出力", desc:"顧客別・全社まとめのMarkdownを出力。ファイル内にAI向けプロンプトが埋め込み済み。1ファイルをAIに渡すだけ。", color:C.purple, tag:"コア", tagBg:"#F5F3FF" },
            { num:"03", title:"重要度タグ管理", desc:"蓄積データにいつでも重要度（緊急・重要・通常・低）を付与・変更可能。週報や分析に即反映。", color:C.cyan, tag:"コア", tagBg:"#ECFEFF" },
            { num:"＋", title:"AI活用（任意のAIで）", desc:"出力したMarkdownをChatGPT・Claude・Copilot等に渡すだけ。週報生成・提案レビュー・温度感分析・引き継ぎ資料。特定ベンダーに依存しない。", color:C.purple, tag:"AI活用", tagBg:`${C.purple}10` },
          ].map((item, i) => (
            <div key={i} style={{ background:"#fff", borderRadius:"10px", padding:"16px", border:"1px solid #e2e8f0", display:"flex", flexDirection:"column" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                <span style={{ fontSize:"24px", fontWeight:900, color:`${item.color}25` }}>{item.num}</span>
                <span style={{ fontSize:"9px", fontWeight:700, color:item.color, background:item.tagBg, padding:"2px 8px", borderRadius:"4px" }}>{item.tag}</span>
              </div>
              <div style={{ fontSize:"14px", fontWeight:700, color:C.dark, marginBottom:"6px" }}>{item.title}</div>
              <div style={{ fontSize:"11px", color:C.sub, lineHeight:1.6, flex:1 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // 5: Prompt embedded — NEW SLIDE
  {
    bg: "#f8fafc",
    render: () => (
      <div style={{ height:"100%", padding:"32px 40px", display:"flex", flexDirection:"column" }}>
        <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.15em", color:C.purple, marginBottom:"6px", textTransform:"uppercase" }}>仕組み</div>
        <h2 style={{ margin:"0 0 14px", fontSize:"22px", fontWeight:900, color:C.dark }}>Markdownにプロンプト埋め込み — 1ファイル完結</h2>
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:"0", alignItems:"center" }}>
          {/* File structure */}
          <div style={{ background:"#1e1e2e", borderRadius:"10px", padding:"16px", border:"1px solid #2d2d3f" }}>
            <div style={{ fontSize:"10px", color:"#B794F6", fontWeight:700, marginBottom:"8px", fontFamily:"monospace" }}>📄 東海精機工業.md</div>
            <div style={{ fontSize:"9px", fontFamily:"monospace", lineHeight:1.8, color:"#d4d4e8" }}>
              <div style={{ color:"#B794F6" }}># 指示（プロンプト）</div>
              <div style={{ color:"#94a3b8" }}>この議事録を読み、以下の</div>
              <div style={{ color:"#94a3b8" }}>形式で要約してください…</div>
              <div style={{ color:"#94a3b8", margin:"4px 0" }}>---</div>
              <div style={{ color:"#64B5F6" }}>## 議事録データ</div>
              <div style={{ color:"#94a3b8" }}>### 2026-03-17（対面）</div>
              <div style={{ color:"#94a3b8" }}>CNC加工機の更新案件…</div>
              <div style={{ color:"#94a3b8" }}>### 2026-03-10（オンライン）</div>
              <div style={{ color:"#94a3b8" }}>5軸加工機への関心…</div>
            </div>
          </div>
          {/* Arrow */}
          <div style={{ padding:"0 16px", textAlign:"center" }}>
            <div style={{ fontSize:"24px", color:C.purple }}>→</div>
            <div style={{ fontSize:"8px", color:C.muted, marginTop:"4px" }}>AIに渡す</div>
          </div>
          {/* AI output */}
          <div style={{ background:"#fff", borderRadius:"10px", padding:"16px", border:`1px solid ${C.purple}25` }}>
            <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"8px" }}>
              <span style={{ fontSize:"10px", fontWeight:700, color:C.purple }}>🤖 AI出力結果</span>
              <span style={{ fontSize:"8px", color:"#fff", background:C.purple, padding:"1px 6px", borderRadius:"3px" }}>自動</span>
            </div>
            <div style={{ fontSize:"9px", lineHeight:1.8, color:C.sub }}>
              <div style={{ fontWeight:700, color:C.red }}>【要対応事項】</div>
              <div>大同ステンレス：溶接ロボット</div>
              <div>品質不良、今週中に復旧必須</div>
              <div style={{ fontWeight:700, color:C.blue, marginTop:"4px" }}>【進捗サマリー】</div>
              <div>東海精機：8,000万CNC案件…</div>
              <div style={{ fontWeight:700, color:C.green, marginTop:"4px" }}>【来週のアクション】</div>
              <div>デモ機見学スケジュール確定</div>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:"16px", justifyContent:"center", marginTop:"12px" }}>
          <div style={{ fontSize:"10px", color:C.sub, textAlign:"center", lineHeight:1.5 }}>
            <strong style={{ color:C.blue }}>ポイント：</strong>プロンプトがファイル内に埋め込み済みなので、コピー＆ペースト1回でAIが週報を生成。プロンプトの外出しや書き換えも自由。
          </div>
        </div>
      </div>
    ),
  },
  // 6: Effect / ROI
  {
    bg: "#f8fafc",
    render: () => (
      <div style={{ height:"100%", padding:"32px 40px", display:"flex", flexDirection:"column" }}>
        <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.15em", color:C.amber, marginBottom:"6px", textTransform:"uppercase" }}>導入効果</div>
        <h2 style={{ margin:"0 0 18px", fontSize:"22px", fontWeight:900, color:C.dark }}>想定される効果</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"12px", marginBottom:"16px" }}>
          {[
            { value:"80%", unit:"削減", label:"週報作成時間", sub:"1〜2時間 → 15分以内", color:C.blue },
            { value:"0", unit:"分", label:"議事録の検索時間", sub:"顧客名で即アクセス", color:C.green },
            { value:"100%", unit:"蓄積", label:"議事録のカバー率", sub:"抜け漏れゼロ", color:C.purple },
          ].map((item, i) => (
            <div key={i} style={{ background:"#fff", borderRadius:"10px", padding:"18px 14px", border:"1px solid #e2e8f0", textAlign:"center" }}>
              <div style={{ fontSize:"32px", fontWeight:900, color:item.color }}>{item.value}<span style={{ fontSize:"14px" }}>{item.unit}</span></div>
              <div style={{ fontSize:"12px", fontWeight:700, color:C.dark, marginTop:"4px" }}>{item.label}</div>
              <div style={{ fontSize:"10px", color:C.muted, marginTop:"2px" }}>{item.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"#fff", borderRadius:"10px", padding:"16px", border:"1px solid #e2e8f0", flex:1 }}>
          <div style={{ fontSize:"12px", fontWeight:700, color:C.dark, marginBottom:"10px" }}>定性的な効果</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
            {["担当引き継ぎ時の情報欠落を防止","部長が重要案件をリアルタイム把握","蓄積データをAIで多角的に活用","営業チーム全体のナレッジ共有促進","特定AIに依存せず社内ポリシーに対応","プロンプト調整で出力品質を自社最適化"].map((t,i) => (
              <div key={i} style={{ display:"flex", gap:"6px" }}>
                <span style={{ color:C.green, fontWeight:700, fontSize:"12px" }}>✓</span>
                <span style={{ fontSize:"11px", color:"#475569", lineHeight:1.4 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  // 7: Cost — UPDATED
  {
    bg: "#f8fafc",
    render: () => (
      <div style={{ height:"100%", padding:"32px 40px", display:"flex", flexDirection:"column" }}>
        <div style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.15em", color:C.cyan, marginBottom:"6px", textTransform:"uppercase" }}>導入要件</div>
        <h2 style={{ margin:"0 0 18px", fontSize:"22px", fontWeight:900, color:C.dark }}>必要なもの・コスト</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", flex:1 }}>
          <div style={{ background:"#fff", borderRadius:"10px", padding:"18px", border:"1px solid #e2e8f0" }}>
            <div style={{ fontSize:"13px", fontWeight:700, color:C.blue, marginBottom:"12px" }}>コア機能（追加コスト：なし）</div>
            {[
              { label:"Microsoft 365", desc:"Business Basic以上" },
              { label:"SharePoint Online", desc:"ドキュメントライブラリ＆リスト" },
              { label:"Power Automate", desc:"M365付属の標準ライセンス" },
            ].map((item, i) => (
              <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"10px" }}>
                <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:C.blue, marginTop:"6px", flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:"12px", fontWeight:700, color:C.dark }}>{item.label}</div>
                  <div style={{ fontSize:"10px", color:C.muted }}>{item.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ padding:"10px", background:"#EFF6FF", borderRadius:"6px", marginTop:"8px" }}>
              <div style={{ fontSize:"10px", fontWeight:700, color:C.blue }}>既存M365環境のみで構築可能</div>
            </div>
          </div>
          <div style={{ background:"#fff", borderRadius:"10px", padding:"18px", border:"1px solid #e2e8f0" }}>
            <div style={{ fontSize:"13px", fontWeight:700, color:C.purple, marginBottom:"12px" }}>AI活用（お好みのツール）</div>
            {[
              { label:"ChatGPT / Claude / Copilot", desc:"Markdown貼り付けで即利用可能" },
              { label:"無料プランでも利用可", desc:"週報生成程度なら無料枠で十分" },
              { label:"社内AI基盤", desc:"Azure OpenAI等があればそちらも可" },
            ].map((item, i) => (
              <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"10px" }}>
                <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:C.purple, marginTop:"6px", flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:"12px", fontWeight:700, color:C.dark }}>{item.label}</div>
                  <div style={{ fontSize:"10px", color:C.muted }}>{item.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ padding:"10px", background:`${C.purple}08`, borderRadius:"6px", marginTop:"8px" }}>
              <div style={{ fontSize:"10px", fontWeight:700, color:C.purple }}>ベンダーロックインなし・いつでも乗り換え可</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  // 8: CTA
  {
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
    render: () => (
      <div style={{ height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"40px", textAlign:"center", color:"#fff" }}>
        <h2 style={{ margin:"0 0 16px", fontSize:"26px", fontWeight:900, lineHeight:1.4 }}>
          まずは無料デモで<br/>効果をお確かめください
        </h2>
        <div style={{ width:"60px", height:"3px", background:"linear-gradient(90deg, #64B5F6, #42A5F5)", borderRadius:"2px", margin:"0 0 20px" }} />
        <p style={{ margin:"0 0 28px", fontSize:"13px", color:"#94a3b8", lineHeight:1.7, maxWidth:"460px" }}>
          貴社のMicrosoft 365環境で動作するデモを構築し、<br/>
          実際の業務データで効果を体感いただけます。
        </p>
        <div style={{ display:"flex", gap:"14px", marginBottom:"28px" }}>
          {[
            { step:"1", text:"ヒアリング\n（30分）" },
            { step:"2", text:"デモ環境\n構築" },
            { step:"3", text:"トライアル\n運用" },
            { step:"4", text:"本格\n導入" },
          ].map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ width:"34px", height:"34px", borderRadius:"50%", background:"rgba(100,181,246,0.15)", border:"1px solid rgba(100,181,246,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:900, color:"#64B5F6" }}>{s.step}</div>
                <div style={{ fontSize:"9px", color:"#94a3b8", marginTop:"5px", whiteSpace:"pre-line", lineHeight:1.3 }}>{s.text}</div>
              </div>
              {i < 3 && <div style={{ color:"#334155", fontSize:"12px", marginTop:"-14px" }}>→</div>}
            </div>
          ))}
        </div>
        <div style={{ marginTop:"12px", paddingTop:"16px", borderTop:"1px solid rgba(100,181,246,0.15)", display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
          <div style={{ fontSize:"13px", fontWeight:900, letterSpacing:"0.08em", color:"#fff" }}>WEST FUSION AI</div>
          <div style={{ fontSize:"10px", color:"#94a3b8" }}>Hideki West / 製造業 計23年 × AI実装家</div>
          <div style={{ fontSize:"10px", color:"#64B5F6", marginTop:"4px" }}>west.fusion.ai@gmail.com</div>
          <div style={{ fontSize:"9px", color:"#64748b", marginTop:"2px" }}>動くデモ: westfusionai.github.io ｜ LinkedIn・Notion 各プラットフォームから DM 可</div>
        </div>
      </div>
    ),
  },
];

export default function App() {
  const [current, setCurrent] = useState(0);

  return (
    <div style={{ fontFamily:"'Noto Sans JP', sans-serif", minHeight:"100vh", background:"#1a1a2e", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      <div style={{ color:"#64748b", fontSize:"11px", marginBottom:"10px", fontWeight:600 }}>{current + 1} / {SLIDES.length}</div>
      <div style={{ width:"100%", maxWidth:"800px", aspectRatio:"16/9", background: SLIDES[current].bg, borderRadius:"12px", overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
        {SLIDES[current].render()}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"16px", marginTop:"16px" }}>
        <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} style={{ padding:"8px 20px", background: current === 0 ? "#334155" : "#2563EB", color: current === 0 ? "#64748b" : "#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:700, cursor: current === 0 ? "default" : "pointer", fontFamily:"'Noto Sans JP', sans-serif" }}>← 前へ</button>
        <div style={{ display:"flex", gap:"6px" }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: current === i ? "24px" : "8px", height:"8px", borderRadius:"4px", border:"none", background: current === i ? "#64B5F6" : "#334155", cursor:"pointer", transition:"all 0.2s", padding:0 }} />
          ))}
        </div>
        <button onClick={() => setCurrent(Math.min(SLIDES.length - 1, current + 1))} disabled={current === SLIDES.length - 1} style={{ padding:"8px 20px", background: current === SLIDES.length - 1 ? "#334155" : "#2563EB", color: current === SLIDES.length - 1 ? "#64748b" : "#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:700, cursor: current === SLIDES.length - 1 ? "default" : "pointer", fontFamily:"'Noto Sans JP', sans-serif" }}>次へ →</button>
      </div>
      <div style={{ color:"#475569", fontSize:"10px", marginTop:"12px" }}>← → キーまたはボタンで操作 ｜ スクリーンショットで画像保存可能</div>
    </div>
  );
}
