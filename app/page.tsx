"use client";
import { useEffect, useState } from "react";

const API = "http://localhost:8000/api/v1";
const SEASON = 2026;
const JUFA_YT = "https://www.youtube.com/c/JUFA_Kanto";
const SEASON_START = new Date("2026-04-04");

// 2025年最終順位表（開幕前に表示）
const LAST_YEAR_STANDINGS = [
  { rank:1,  team_name:"筑波大学",      played:22, wins:0, draws:0, losses:0, goals_for:0, goals_against:0, pts:0 },
  { rank:2,  team_name:"国士舘大学",    played:22, wins:0, draws:0, losses:0, goals_for:0, goals_against:0, pts:0 },
  { rank:3,  team_name:"明治大学",      played:22, wins:0, draws:0, losses:0, goals_for:0, goals_against:0, pts:0 },
  { rank:4,  team_name:"東海大学",      played:22, wins:0, draws:0, losses:0, goals_for:0, goals_against:0, pts:0 },
  { rank:5,  team_name:"日本大学",      played:22, wins:0, draws:0, losses:0, goals_for:0, goals_against:0, pts:0 },
  { rank:6,  team_name:"日本体育大学",  played:22, wins:0, draws:0, losses:0, goals_for:0, goals_against:0, pts:0 },
  { rank:7,  team_name:"桐蔭横浜大学",  played:22, wins:0, draws:0, losses:0, goals_for:0, goals_against:0, pts:0 },
  { rank:8,  team_name:"東洋大学",      played:22, wins:0, draws:0, losses:0, goals_for:0, goals_against:0, pts:0 },
  { rank:9,  team_name:"中央大学",      played:22, wins:0, draws:0, losses:0, goals_for:0, goals_against:0, pts:0 },
  { rank:10, team_name:"慶應義塾大学",  played:22, wins:0, draws:0, losses:0, goals_for:0, goals_against:0, pts:0 },
  { rank:11, team_name:"流通経済大学",  played:22, wins:0, draws:0, losses:0, goals_for:0, goals_against:0, pts:0 },
  { rank:12, team_name:"東京国際大学",  played:22, wins:0, draws:0, losses:0, goals_for:0, goals_against:0, pts:0 },
];

const DUMMY_LINEUPS = [
  {
    label: "スタメンはまだ登録されていません",
    home: {
      name: "ホームチーム", formation: "4-3-3", color: "#0EA5E9",
      rows: [
        [{ num:1,  name:"GK", cap:false }],
        [{ num:2,  name:"DF", cap:false },{ num:5, name:"DF", cap:false },{ num:4, name:"DF", cap:false },{ num:3, name:"DF", cap:false }],
        [{ num:8,  name:"MF", cap:false },{ num:6, name:"MF", cap:false },{ num:10,name:"MF", cap:false }],
        [{ num:11, name:"FW", cap:false },{ num:9, name:"FW", cap:false },{ num:7, name:"FW", cap:false }],
      ],
      subs: [],
    },
    away: {
      name: "アウェイチーム", formation: "4-4-2", color: "#F43F5E",
      rows: [
        [{ num:1,  name:"GK", cap:false }],
        [{ num:2,  name:"DF", cap:false },{ num:5, name:"DF", cap:false },{ num:4, name:"DF", cap:false },{ num:3, name:"DF", cap:false }],
        [{ num:8,  name:"MF", cap:false },{ num:6, name:"MF", cap:false },{ num:10,name:"MF", cap:false },{ num:7, name:"MF", cap:false }],
        [{ num:11, name:"FW", cap:false },{ num:9, name:"FW", cap:false }],
      ],
      subs: [],
    },
  },
];

const C = {
  sky:"#0EA5E9", skyLight:"#E0F2FE", skyMid:"#BAE6FD", skyDark:"#0284C7",
  green:"#10B981", red:"#F43F5E", orange:"#F97316",
  bg:"#F8FAFC", white:"#FFFFFF", border:"#E2E8F0",
  text:"#0F172A", muted:"#94A3B8", sub:"#64748B",
};

type Tab = "standings" | "matches" | "lineup";
type Match = {
  id: string; section: number; match_date: string; kickoff: string;
  home_team: string; away_team: string; score_home: number | null;
  score_away: number | null; status: string; venue: string; stream_url: string | null;
};
type Standing = {
  rank: number; team_name: string; played: number; wins: number;
  draws: number; losses: number; goals_for: number; goals_against: number; pts?: number;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const w = ["日","月","火","水","木","金","土"];
  return `${d.getMonth()+1}月${d.getDate()}日（${w[d.getDay()]}）`;
}

function formatTime(kickoff: string) {
  if (!kickoff) return "";
  const d = new Date(kickoff);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function Pitch({ team }: { team: typeof DUMMY_LINEUPS[0]["home"] }) {
  const rows = [...team.rows].reverse();
  return (
    <div style={{ background:"#16a34a", borderRadius:14, padding:10, position:"relative", aspectRatio:"7/10", display:"flex", flexDirection:"column" }}>
      <svg style={{ position:"absolute", inset:10, pointerEvents:"none" }} viewBox="0 0 100 140" preserveAspectRatio="none">
        <rect x="15" y="1" width="70" height="138" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
        <line x1="15" y1="70" x2="85" y2="70" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
        <circle cx="50" cy="70" r="12" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
        <rect x="30" y="1" width="40" height="20" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
        <rect x="30" y="119" width="40" height="20" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
      </svg>
      <div style={{ display:"flex", flexDirection:"column", height:"100%", position:"relative", zIndex:2 }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display:"flex", justifyContent:"space-around", alignItems:"center", flex:1 }}>
            {row.map((p, pi) => (
              <div key={pi} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:team.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"white", border: p.cap ? "2px solid #FCD34D" : "2px solid rgba(255,255,255,0.4)" }}>{p.num}</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.9)", textAlign:"center", maxWidth:44, lineHeight:1.2 }}>{p.name}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StandingsTable({ standings, isLastYear }: { standings: (Standing & { pts?: number })[], isLastYear: boolean }) {
  return (
    <div>
      {isLastYear && (
        <div style={{ background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#C2410C" }}>
          📅 2025年最終順位表（2026シーズンは4月4日開幕）
        </div>
      )}
      <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:C.skyLight, borderBottom:`1px solid ${C.skyMid}` }}>
              {["#","チーム","試","勝","分","敗","得","失","差","勝点"].map(h => (
                <th key={h} style={{ padding:"11px 8px", textAlign: h==="チーム" ? "left" : "center", color: h==="勝点" ? C.skyDark : C.sub, fontWeight:600, fontSize:12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((t, i) => {
              const pts = t.pts !== undefined ? t.pts : t.wins * 3 + t.draws;
              const gd  = t.goals_for - t.goals_against;
              return (
                <tr key={t.team_name} style={{ borderBottom:`1px solid ${C.border}`, background: i<2 ? "#F0FDF4" : i>=10 ? "#FFF1F2" : C.white }}>
                  <td style={{ padding:"12px 8px", textAlign:"center" }}>
                    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:22, height:22, borderRadius:"50%", fontSize:11, fontWeight:700, background: i===0 ? "#FCD34D" : i===1 ? "#CBD5E1" : i===2 ? "#FCA97A" : "transparent", color: i<3 ? "#fff" : C.muted }}>{t.rank}</span>
                  </td>
                  <td style={{ padding:"12px 8px", fontWeight:600 }}>
                    {t.team_name}
                    {i<2   && <span style={{ fontSize:10, background:"#DCFCE7", color:C.green, padding:"1px 6px", borderRadius:4, marginLeft:6, fontWeight:700 }}>↑</span>}
                    {i>=10 && <span style={{ fontSize:10, background:"#FFE4E6", color:C.red,   padding:"1px 6px", borderRadius:4, marginLeft:6, fontWeight:700 }}>↓</span>}
                  </td>
                  <td style={{ padding:"12px 8px", textAlign:"center", color:C.muted }}>{t.played || "-"}</td>
                  <td style={{ padding:"12px 8px", textAlign:"center", color:C.green, fontWeight:700 }}>{t.wins || "-"}</td>
                  <td style={{ padding:"12px 8px", textAlign:"center", color:C.muted }}>{t.draws || "-"}</td>
                  <td style={{ padding:"12px 8px", textAlign:"center", color:C.red }}>{t.losses || "-"}</td>
                  <td style={{ padding:"12px 8px", textAlign:"center" }}>{t.goals_for || "-"}</td>
                  <td style={{ padding:"12px 8px", textAlign:"center" }}>{t.goals_against || "-"}</td>
                  <td style={{ padding:"12px 8px", textAlign:"center", color:C.muted }}>-</td>
                  <td style={{ padding:"12px 8px", textAlign:"center" }}>
                    <span style={{ fontWeight:800, fontSize:15, color: i===0 ? C.skyDark : C.text }}>{pts || "-"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ display:"flex", gap:16, marginTop:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:C.muted }}><div style={{ width:8, height:8, background:"#DCFCE7", border:`1px solid ${C.green}`, borderRadius:2 }}></div>昇格圏</div>
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:C.muted }}><div style={{ width:8, height:8, background:"#FFE4E6", border:`1px solid ${C.red}`, borderRadius:2 }}></div>降格圏</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [matches,   setMatches]   = useState<Match[]>([]);
  const [section,   setSection]   = useState(1);
  const [tab,       setTab]       = useState<Tab>("standings");
  const [lineupIdx, setLineupIdx] = useState(0);
  const [loading,   setLoading]   = useState(true);
  const lineup = DUMMY_LINEUPS[lineupIdx];

  const isPreSeason = new Date() < SEASON_START;

  useEffect(() => {
    fetch(`${API}/standings?season=${SEASON}&division=1`)
      .then(r => r.json())
      .then(d => { if (d.standings?.length > 0) setStandings(d.standings); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${API}/matches?season=${SEASON}&division=1&section=${section}`)
      .then(r => r.json())
      .then(d => { if (d.matches) setMatches(d.matches); })
      .catch(() => {});
  }, [section]);

  const groupedMatches = matches.reduce((acc, m) => {
    const key = m.match_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, Match[]>);

  const liveCount = matches.filter(m => m.status === "live").length;

  const tabs: { key: Tab; label: string }[] = [
    { key:"standings", label:"順位表" },
    { key:"matches",   label:"試合・配信" },
    { key:"lineup",    label:"スタメン" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Helvetica Neue', Arial, 'Hiragino Sans', sans-serif" }}>
      <div style={{ background:`linear-gradient(135deg, ${C.skyDark} 0%, ${C.sky} 100%)`, padding:"0 16px" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, paddingTop:20, paddingBottom:4 }}>
            <div style={{ width:42, height:42, background:"rgba(255,255,255,0.2)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>⚽</div>
            <div>
              <div style={{ fontWeight:800, fontSize:18, color:"white" }}>関東大学サッカーリーグ</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)" }}>JR東日本カップ2026 · 第100回 · 1部リーグ</div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
              {liveCount > 0 && (
                <div style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.2)", borderRadius:20, padding:"5px 12px" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"#FCD34D" }}></div>
                  <span style={{ fontSize:11, color:"white", fontWeight:700 }}>LIVE {liveCount}試合</span>
                </div>
              )}
              <a href={JUFA_YT} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.2)", borderRadius:20, padding:"5px 12px", textDecoration:"none" }}>
                <span style={{ fontSize:16 }}>▶</span>
                <span style={{ fontSize:11, color:"white", fontWeight:700 }}>公式配信</span>
              </a>
            </div>
          </div>
          <div style={{ display:"flex", gap:0, marginTop:8 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ padding:"10px 20px", border:"none", background:"none", cursor:"pointer", color: tab===t.key ? "white" : "rgba(255,255,255,0.65)", fontWeight: tab===t.key ? 700 : 400, fontSize:14, borderBottom: tab===t.key ? "3px solid white" : "3px solid transparent", marginBottom:-1 }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"24px 16px" }}>

        {/* 順位表 */}
        {tab === "standings" && (
          <div>
            {loading && <div style={{ color:C.muted, fontSize:13, marginBottom:16 }}>読み込み中...</div>}
            {/* 開幕前 → 去年の順位表を表示 */}
            {(isPreSeason || standings.length === 0) && !loading && (
              <StandingsTable standings={LAST_YEAR_STANDINGS} isLastYear={true} />
            )}
            {/* 開幕後 → 実データを表示 */}
            {!isPreSeason && standings.length > 0 && (
              <StandingsTable standings={standings} isLastYear={false} />
            )}
          </div>
        )}

        {/* 試合・配信 */}
        {tab === "matches" && (
          <div>
            <div style={{ display:"flex", gap:6, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
              {Array.from({length:22}, (_, i) => i+1).map(s => (
                <button key={s} onClick={() => setSection(s)} style={{ padding:"6px 14px", borderRadius:20, cursor:"pointer", fontSize:13, fontWeight: section===s ? 700 : 400, background: section===s ? C.sky : C.white, color: section===s ? "white" : C.sub, border: `1px solid ${section===s ? C.sky : C.border}`, whiteSpace:"nowrap", flexShrink:0 }}>
                  第{s}節
                </button>
              ))}
            </div>

            {Object.entries(groupedMatches).map(([date, dayMatches]) => (
              <div key={date} style={{ marginBottom:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <span style={{ background:C.sky, color:"white", fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:20 }}>第{section}節</span>
                  <span style={{ fontSize:12, color:C.muted }}>{formatDate(date)}</span>
                </div>
                {dayMatches.map((m, i) => {
                  const isLive     = m.status === "live";
                  const isUpcoming = m.status === "upcoming";
                  const score = m.score_home !== null ? `${m.score_home}  -  ${m.score_away}` : "対";
                  const time  = formatTime(m.kickoff);
                  return (
                    <div key={i} style={{ background:C.white, border: isLive ? `1.5px solid ${C.sky}` : `1px solid ${C.border}`, borderRadius:14, padding:"12px 16px", marginBottom:8, boxShadow: isLive ? `0 0 0 3px ${C.skyLight}` : "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ minWidth:80 }}>
                          {isLive     && <span style={{ fontSize:11, background:C.sky, color:"white", padding:"4px 10px", borderRadius:20, fontWeight:700 }}>● LIVE</span>}
                          {isUpcoming && <span style={{ fontSize:11, background:C.skyLight, color:C.sky, padding:"4px 10px", borderRadius:20, fontWeight:600 }}>{time}</span>}
                          {!isLive && !isUpcoming && <span style={{ fontSize:11, background:"#F1F5F9", color:C.muted, padding:"4px 10px", borderRadius:20 }}>終了</span>}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, justifyContent:"center" }}>
                          <div style={{ fontWeight:700, fontSize:13, textAlign:"right", minWidth:90 }}>{m.home_team}</div>
                          <div style={{ fontWeight:800, fontSize: isUpcoming ? 14 : 22, minWidth:70, textAlign:"center", color: isLive ? C.sky : isUpcoming ? C.muted : C.text, letterSpacing: isUpcoming ? 0 : 1 }}>{score}</div>
                          <div style={{ fontWeight:700, fontSize:13, textAlign:"left", minWidth:90 }}>{m.away_team}</div>
                        </div>
                        <div style={{ minWidth:90, textAlign:"right", display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end" }}>
                          {m.stream_url && (
                            <a href={m.stream_url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, padding:"4px 10px", borderRadius:20, background:"#FF0000", color:"white", textDecoration:"none", fontWeight:700 }}>▶ 配信</a>
                          )}
                          <a href={JUFA_YT} target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, padding:"4px 10px", borderRadius:20, background:"#FF0000", color:"white", textDecoration:"none", fontWeight:700, opacity:0.75 }}>▶ JUFA公式</a>
                        </div>
                      </div>
                      {m.venue && (
                        <div style={{ fontSize:11, color:C.muted, marginTop:6, paddingLeft:98 }}>📍 {m.venue}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* スタメン */}
        {tab === "lineup" && (
          <div>
            <select value={lineupIdx} onChange={e => setLineupIdx(Number(e.target.value))} style={{ width:"100%", padding:"10px 14px", fontSize:14, border:`1px solid ${C.border}`, borderRadius:10, marginBottom:16, background:C.white, color:C.text }}>
              {DUMMY_LINEUPS.map((l, i) => <option key={i} value={i}>{l.label}</option>)}
            </select>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, marginBottom:16, borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}` }}>
              <div style={{ background:`${lineup.home.color}15`, padding:"10px 14px", borderRight:`1px solid ${C.border}` }}>
                <div style={{ fontWeight:800, fontSize:14, color:lineup.home.color }}>{lineup.home.name}</div>
                <div style={{ fontSize:12, color:C.muted }}>{lineup.home.formation}</div>
              </div>
              <div style={{ background:`${lineup.away.color}15`, padding:"10px 14px", textAlign:"right" }}>
                <div style={{ fontWeight:800, fontSize:14, color:lineup.away.color }}>{lineup.away.name}</div>
                <div style={{ fontSize:12, color:C.muted }}>{lineup.away.formation}</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[lineup.home, lineup.away].map((team, ti) => (
                <div key={ti}>
                  <Pitch team={team} />
                </div>
              ))}
            </div>
            <div style={{ marginTop:16, background:C.white, borderRadius:12, padding:"14px 16px", border:`1px solid ${C.border}`, fontSize:13, color:C.muted, textAlign:"center" }}>
              スタメンは試合当日に管理画面から入力されます
            </div>
          </div>
        )}
      </div>
      <style>{`* { box-sizing: border-box; } body { margin: 0; } tr:hover td { background: #F8FAFC !important; }`}</style>
    </div>
  );
}
