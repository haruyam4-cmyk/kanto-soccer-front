"use client";
import { useState } from "react";

const API = "http://localhost:8000/api/v1";

const TEAMS = [
  "明治大学","筑波大学","早稲田大学","法政大学","慶應義塾大学","順天堂大学",
  "流通経済大学","専修大学","東洋大学","駒澤大学","国士舘大学","桐蔭横浜大学",
];

const POSITIONS = ["GK","DF","MF","FW"];

type Player = {
  number: string;
  name: string;
  position: string;
  is_captain: boolean;
  is_starter: boolean;
};

const emptyPlayer = (): Player => ({
  number: "", name: "", position: "MF", is_captain: false, is_starter: true,
});

export default function AdminPage() {
  const [matchId,   setMatchId]   = useState("");
  const [side,      setSide]      = useState<"home"|"away">("home");
  const [teamName,  setTeamName]  = useState(TEAMS[0]);
  const [formation, setFormation] = useState("4-3-3");
  const [players,   setPlayers]   = useState<Player[]>(
    Array.from({ length: 11 }, emptyPlayer)
  );
  const [status,  setStatus]  = useState<"idle"|"saving"|"ok"|"error">("idle");
  const [message, setMessage] = useState("");

  const updatePlayer = (i: number, field: keyof Player, value: string | boolean) => {
    setPlayers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  const addPlayer = () => setPlayers(prev => [...prev, emptyPlayer()]);
  const removePlayer = (i: number) => setPlayers(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!matchId.trim()) { setMessage("試合IDを入力してください"); return; }
    setStatus("saving");
    try {
      const res = await fetch(`${API}/lineups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id:  matchId.trim(),
          team_name: teamName,
          side,
          formation,
          players: players
            .filter(p => p.name.trim())
            .map((p, i) => ({
              number:     parseInt(p.number) || 0,
              name:       p.name.trim(),
              position:   p.position,
              is_captain: p.is_captain,
              is_starter: p.is_starter,
              sort_order: i,
            })),
        }),
      });
      if (res.ok) {
        setStatus("ok");
        setMessage("保存しました！");
      } else {
        throw new Error(await res.text());
      }
    } catch (e) {
      setStatus("error");
      setMessage(`エラー: ${e}`);
    }
  };

  const starters = players.filter(p => p.is_starter);
  const subs     = players.filter(p => !p.is_starter);

  return (
    <main style={{ maxWidth:700, margin:"0 auto", padding:"24px 16px", fontFamily:"sans-serif" }}>

      {/* ヘッダー */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24, borderBottom:"1px solid #eee", paddingBottom:16 }}>
        <div style={{ width:36, height:36, background:"#1A5C2A", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:18 }}>⚙</div>
        <div>
          <div style={{ fontWeight:600, fontSize:16 }}>スタメン管理画面</div>
          <div style={{ fontSize:12, color:"#888" }}>試合ごとにスタメンを入力する</div>
        </div>
        <a href="/" style={{ marginLeft:"auto", fontSize:12, color:"#1A5C2A", textDecoration:"none" }}>← サイトに戻る</a>
      </div>

      {/* 基本情報 */}
      <div style={{ background:"#f9f9f9", borderRadius:12, padding:16, marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:12, color:"#444" }}>基本情報</div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <div>
            <div style={{ fontSize:12, color:"#888", marginBottom:4 }}>試合ID（SupabaseのUUID）</div>
            <input
              value={matchId}
              onChange={e => setMatchId(e.target.value)}
              placeholder="例: abc123-..."
              style={{ width:"100%", padding:"8px 10px", fontSize:13, border:"0.5px solid #ddd", borderRadius:8, background:"white" }}
            />
          </div>
          <div>
            <div style={{ fontSize:12, color:"#888", marginBottom:4 }}>ホーム / アウェイ</div>
            <select value={side} onChange={e => setSide(e.target.value as "home"|"away")}
              style={{ width:"100%", padding:"8px 10px", fontSize:13, border:"0.5px solid #ddd", borderRadius:8, background:"white" }}>
              <option value="home">ホーム</option>
              <option value="away">アウェイ</option>
            </select>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <div style={{ fontSize:12, color:"#888", marginBottom:4 }}>チーム名</div>
            <select value={teamName} onChange={e => setTeamName(e.target.value)}
              style={{ width:"100%", padding:"8px 10px", fontSize:13, border:"0.5px solid #ddd", borderRadius:8, background:"white" }}>
              {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:12, color:"#888", marginBottom:4 }}>フォーメーション</div>
            <select value={formation} onChange={e => setFormation(e.target.value)}
              style={{ width:"100%", padding:"8px 10px", fontSize:13, border:"0.5px solid #ddd", borderRadius:8, background:"white" }}>
              {["4-3-3","4-2-3-1","4-4-2","3-4-3","3-5-2","5-3-2"].map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* スタメン入力 */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:10, color:"#444" }}>
          スタメン（{starters.length}人）
        </div>
        {players.map((p, i) => (
          <div key={i} style={{
            display:"grid", gridTemplateColumns:"40px 1fr 60px 70px 32px 32px 32px",
            gap:6, marginBottom:6, alignItems:"center",
            opacity: p.is_starter ? 1 : 0.5,
          }}>
            <input
              value={p.number} onChange={e => updatePlayer(i, "number", e.target.value)}
              placeholder="#" type="number"
              style={{ padding:"7px 6px", fontSize:13, border:"0.5px solid #ddd", borderRadius:6, textAlign:"center", background:"white" }}
            />
            <input
              value={p.name} onChange={e => updatePlayer(i, "name", e.target.value)}
              placeholder="選手名"
              style={{ padding:"7px 10px", fontSize:13, border:"0.5px solid #ddd", borderRadius:6, background:"white" }}
            />
            <select value={p.position} onChange={e => updatePlayer(i, "position", e.target.value)}
              style={{ padding:"7px 6px", fontSize:12, border:"0.5px solid #ddd", borderRadius:6, background:"white" }}>
              {POSITIONS.map(pos => <option key={pos}>{pos}</option>)}
            </select>
            <button
              onClick={() => updatePlayer(i, "is_starter", !p.is_starter)}
              style={{ padding:"6px 8px", fontSize:11, border:"0.5px solid #ddd", borderRadius:6, background: p.is_starter ? "rgba(26,92,42,0.1)" : "white", color: p.is_starter ? "#1A5C2A" : "#888", cursor:"pointer" }}
            >
              {p.is_starter ? "スタメン" : "控え"}
            </button>
            <button
              onClick={() => updatePlayer(i, "is_captain", !p.is_captain)}
              title="キャプテン"
              style={{ padding:"6px", fontSize:14, border:"0.5px solid #ddd", borderRadius:6, background: p.is_captain ? "rgba(255,215,0,0.2)" : "white", cursor:"pointer" }}
            >
              {p.is_captain ? "★" : "☆"}
            </button>
            <button
              onClick={() => removePlayer(i)}
              style={{ padding:"6px", fontSize:14, border:"0.5px solid #eee", borderRadius:6, background:"white", color:"#ccc", cursor:"pointer" }}
            >
              ✕
            </button>
          </div>
        ))}

        <button onClick={addPlayer} style={{
          marginTop:6, padding:"8px 16px", fontSize:13,
          border:"0.5px dashed #ddd", borderRadius:8,
          background:"white", color:"#888", cursor:"pointer", width:"100%",
        }}>
          ＋ 選手を追加
        </button>
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        disabled={status === "saving"}
        style={{
          width:"100%", padding:"12px", fontSize:15, fontWeight:600,
          background: status === "saving" ? "#ccc" : "#1A5C2A",
          color:"white", border:"none", borderRadius:10, cursor:"pointer",
        }}
      >
        {status === "saving" ? "保存中..." : "保存する"}
      </button>

      {/* メッセージ */}
      {message && (
        <div style={{
          marginTop:12, padding:"10px 14px", borderRadius:8, fontSize:13,
          background: status === "ok" ? "rgba(26,92,42,0.08)" : "rgba(216,90,48,0.08)",
          color: status === "ok" ? "#1A5C2A" : "#D85A30",
        }}>
          {message}
        </div>
      )}

      {/* 使い方メモ */}
      <div style={{ marginTop:24, padding:14, background:"#f9f9f9", borderRadius:10, fontSize:12, color:"#888", lineHeight:1.8 }}>
        <div style={{ fontWeight:600, marginBottom:6, color:"#666" }}>使い方</div>
        <div>① Supabaseの matches テーブルから該当試合のIDをコピー</div>
        <div>② チーム・フォーメーションを選択</div>
        <div>③ 選手の番号・名前・ポジションを入力</div>
        <div>④ キャプテンは ☆ を押して ★ にする</div>
        <div>⑤「保存する」を押すとAPIに送信される</div>
      </div>

    </main>
  );
}
