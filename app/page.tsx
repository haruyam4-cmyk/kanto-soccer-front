"use client";
import { useEffect, useState } from "react";

const API = "http://localhost:8000/api/v1";

const DUMMY_STANDINGS = [
  { rank:1,  team_name:"明治大学",    played:13, wins:10, draws:2, losses:1,  goals_for:29, goals_against:9  },
  { rank:2,  team_name:"筑波大学",    played:13, wins:9,  draws:2, losses:2,  goals_for:26, goals_against:13 },
  { rank:3,  team_name:"早稲田大学",  played:13, wins:8,  draws:3, losses:2,  goals_for:22, goals_against:12 },
  { rank:4,  team_name:"法政大学",    played:13, wins:8,  draws:2, losses:3,  goals_for:20, goals_against:14 },
  { rank:5,  team_name:"慶應義塾大学",played:13, wins:7,  draws:3, losses:3,  goals_for:19, goals_against:15 },
  { rank:6,  team_name:"順天堂大学",  played:13, wins:6,  draws:3, losses:4,  goals_for:18, goals_against:16 },
  { rank:7,  team_name:"流通経済大学",played:13, wins:6,  draws:2, losses:5,  goals_for:17, goals_against:18 },
  { rank:8,  team_name:"専修大学",    played:13, wins:5,  draws:3, losses:5,  goals_for:14, goals_against:17 },
  { rank:9,  team_name:"東洋大学",    played:13, wins:4,  draws:3, losses:6,  goals_for:12, goals_against:19 },
  { rank:10, team_name:"駒澤大学",    played:13, wins:4,  draws:2, losses:7,  goals_for:13, goals_against:20 },
  { rank:11, team_name:"国士舘大学",  played:13, wins:2,  draws:3, losses:8,  goals_for:10, goals_against:24 },
  { rank:12, team_name:"桐蔭横浜大学",played:13, wins:1,  draws:2, losses:10, goals_for:7,  goals_against:31 },
];

const DUMMY_MATCHES = [
  {
    section: 14, date: "10月19日（日）",
    matches: [
      { home:"明治大学",    away:"早稲田大学",   score_home:2,    score_away:1,    status:"live",     time:"74'",  stream_url:"https://youtube.com" },
      { home:"筑波大学",    away:"慶應義塾大学", score_home:1,    score_away:0,    status:"live",     time:"61'",  stream_url:"https://youtube.com" },
      { home:"法政大学",    away:"順天堂大学",   score_home:null, score_away:null, status:"upcoming", time:"14:00",stream_url:null },
      { home:"流通経済大学",away:"専修大学",     score_home:null, score_away:null, status:"upcoming", time:"14:00",stream_url:null },
    ]
  },
  {
    section: 13, date: "10月12日（日）",
    matches: [
      { home:"明治大学",  away:"筑波大学",    score_home:3, score_away:1, status:"done", time:"終了", stream_url:"https://youtube.com" },
      { home:"早稲田大学",away:"慶應義塾大学",score_home:1, score_away:1, status:"done", time:"終了", stream_url:"https://youtube.com" },
    ]
  },
];

const DUMMY_LINEUPS = [
  {
    label: "明治大学 vs 早稲田大学（第14節）",
    home: {
      name: "明治大学", formation: "4-3-3", color: "#0EA5E9",
      rows: [
        [{ num:1,  name:"佐藤 健", cap:true }],
        [{ num:2,  name:"田中 翔", cap:false },{ num:5, name:"山田 拓", cap:false },{ num:4, name:"鈴木 陸", cap:false },{ num:3, name:"中村 颯", cap:false }],
        [{ num:8,  name:"伊藤 悠", cap:false },{ num:6, name:"渡辺 蒼", cap:false },{ num:10,name:"高橋 光", cap:false }],
        [{ num:11, name:"小林 海", cap:false },{ num:9, name:"加藤 一", cap:false },{ num:7, name:"松本 玲", cap:false }],
      ],
      subs: ["#12 橋本","#13 井上","#14 木村","#15 清水"],
    },
    away: {
      name: "早稲田大学", formation: "4-2-3-1", color: "#F43F5E",
      rows: [
        [{ num:1,  name:"吉田 廉", cap:true }],
        [{ num:2,  name:"中島 礼", cap:false },{ num:4, name:"藤田 周", cap:false },{ num:5, name:"石田 稜", cap:false },{ num:3, name:"坂本 蓮", cap:false }],
        [{ num:6,  name:"原田 渉", cap:false },{ num:8, name:"野田 浩", cap:false }],
        [{ num:7,  name:"三浦 勇", cap:false },{ num:10,name:"西村 蒼", cap:false },{ num:11,name:"岡田 翠", cap:false }],
        [{ num:9,  name:"林 匠",   cap:false }],
      ],
      subs: ["#12 前田","#13 後藤","#14 小川","#15 森"],
    },
  },
];

const C = {
  sky:     "#0EA5E9",
  skyLight:"#E0F2FE",
  skyMid:  "#BAE6FD",
  skyDark: "#0284C7",
  green:   "#10B981",
  red:     "#F43F5E",
  orange:  "#F97316",
  bg:      "#F8FAFC",
  white:   "#FFFFFF",
  border:  "#E2E8F0",
  text:    "#0F172A",
  muted:   "#94A3B8",
  sub:     "#64748B",
};

type Tab = "standings" | "matches" | "lineup";

function Pitch({ team }: { team: typeof DUMMY_LINEUPS[0]["home"] }) {
  const rows = [...team.rows].reverse();
  return (
    <div style={{ background:"#16a34a", borderRadius:14, padding:10, position:"relative", aspectRatio:"7/10", display:"flex", flexDirection:"column", boxShadow:"inset 0 0 40px rgba(0,0,0,0.2)" }}>
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
                <div style={{
                  width:30, height:30, borderRadius:"50%",
                  background: team.color,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:700, color:"white",
                  border: p.cap ? "2px solid #FCD34D" : "2px solid rgba(255,255,255,0.4)",
                  boxShadow: p.cap ? "0 0 8px #FCD34D88" : "0 2px 4px rgba(0,0,0,0.3)",
                }}>
                  {p.num}
                </div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.9)", textAlign:"center", maxWidth:44, lineHeight:1.2, textShadow:"0 1px 2px rgba(0,0,0,0.5)" }}>
                  {p.name}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [standings, setStandings] = useState(DUMMY_STANDINGS);
  const [tab, setTab]             = useState<Tab>("standings");
  const [lineupIdx, setLineupIdx] = useState(0);
  const lineup = DUMMY_LINEUPS[lineupIdx];

  useEffect(() => {
    fetch(`${API}/standings`)
      .then(r => r.json())
      .then(d => { if (d.standings?.length > 0) setStandings(d.standings); })
      .catch(() => {});
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key:"standings", label:"順位表" },
    { key:"matches",   label:"試合・配信" },
    { key:"lineup",    label:"スタメン" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Helvetica Neue', Arial, 'Hiragino Sans', sans-serif" }}>

      {/* ヘッダー */}
      <div style={{ background:`linear-gradient(135deg, ${C.skyDark} 0%, ${C.sky} 100%)`, padding:"0 16px" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, paddingTop:20, paddingBottom:4 }}>
            <div style={{ width:42, height:42, background:"rgba(255,255,255,0.2)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, backdropFilter:"blur(8px)" }}>⚽</div>
            <div>
              <div style={{ fontWeight:800, fontSize:18, color:"white", letterSpacing:"-0.3px" }}>関東大学サッカーリーグ</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)" }}>JR東日本カップ2026 · 第100回 · 1部リーグ</div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.2)", borderRadius:20, padding:"5px 12px", backdropFilter:"blur(8px)" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#FCD34D" }}></div>
              <span style={{ fontSize:11, color:"white", fontWeight:700 }}>LIVE 2試合</span>
            </div>
          </div>

          {/* タブ */}
          <div style={{ display:"flex", gap:0, marginTop:8 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding:"10px 20px", border:"none", background:"none", cursor:"pointer",
                color: tab===t.key ? "white" : "rgba(255,255,255,0.65)",
                fontWeight: tab===t.key ? 700 : 400,
                fontSize:14,
                borderBottom: tab===t.key ? "3px solid white" : "3px solid transparent",
                marginBottom:-1,
              }}>
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
            {/* サマリーカード */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
              {[
                { label:"第14節 進行中", value:"14/22",  color:C.sky },
                { label:"総ゴール数",    value:"187",    color:C.orange },
                { label:"首位",          value:"明治大", color:C.green },
              ].map(c => (
                <div key={c.label} style={{ background:C.white, borderRadius:14, padding:"14px 16px", border:`1px solid ${C.border}`, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{c.label}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:c.color }}>{c.value}</div>
                </div>
              ))}
            </div>

            {/* テーブル */}
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
                    const pts = t.wins * 3 + t.draws;
                    const gd  = t.goals_for - t.goals_against;
                    const isPromo = i < 2;
                    const isRel   = i >= 10;
                    return (
                      <tr key={t.team_name} style={{
                        borderBottom:`1px solid ${C.border}`,
                        background: isPromo ? "#F0FDF4" : isRel ? "#FFF1F2" : C.white,
                      }}>
                        <td style={{ padding:"12px 8px", textAlign:"center" }}>
                          <span style={{
                            display:"inline-flex", alignItems:"center", justifyContent:"center",
                            width:22, height:22, borderRadius:"50%", fontSize:11, fontWeight:700,
                            background: i===0 ? "#FCD34D" : i===1 ? "#CBD5E1" : i===2 ? "#FCA97A" : "transparent",
                            color: i<3 ? "#fff" : C.muted,
                          }}>{t.rank}</span>
                        </td>
                        <td style={{ padding:"12px 8px", fontWeight:600, color:C.text }}>
                          {t.team_name}
                          {isPromo && <span style={{ fontSize:10, background:"#DCFCE7", color:C.green, padding:"1px 6px", borderRadius:4, marginLeft:6, fontWeight:700 }}>↑</span>}
                          {isRel   && <span style={{ fontSize:10, background:"#FFE4E6", color:C.red,   padding:"1px 6px", borderRadius:4, marginLeft:6, fontWeight:700 }}>↓</span>}
                        </td>
                        <td style={{ padding:"12px 8px", textAlign:"center", color:C.muted }}>{t.played}</td>
                        <td style={{ padding:"12px 8px", textAlign:"center", color:C.green, fontWeight:700 }}>{t.wins}</td>
                        <td style={{ padding:"12px 8px", textAlign:"center", color:C.muted }}>{t.draws}</td>
                        <td style={{ padding:"12px 8px", textAlign:"center", color:C.red }}>{t.losses}</td>
                        <td style={{ padding:"12px 8px", textAlign:"center", color:C.text }}>{t.goals_for}</td>
                        <td style={{ padding:"12px 8px", textAlign:"center", color:C.text }}>{t.goals_against}</td>
                        <td style={{ padding:"12px 8px", textAlign:"center", color: gd>0 ? C.green : gd<0 ? C.red : C.muted, fontWeight:600 }}>{gd>0?`+${gd}`:gd}</td>
                        <td style={{ padding:"12px 8px", textAlign:"center" }}>
                          <span style={{ fontWeight:800, fontSize:15, color: i===0 ? C.skyDark : C.text }}>{pts}</span>
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
        )}

        {/* 試合・配信 */}
        {tab === "matches" && (
          <div>
            {DUMMY_MATCHES.map(group => (
              <div key={group.section} style={{ marginBottom:28 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <span style={{ background:C.sky, color:"white", fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:20 }}>第{group.section}節</span>
                  <span style={{ fontSize:12, color:C.muted }}>{group.date}</span>
                </div>
                {group.matches.map((m, i) => {
                  const isLive     = m.status === "live";
                  const isUpcoming = m.status === "upcoming";
                  const score = m.score_home !== null ? `${m.score_home}  -  ${m.score_away}` : "vs";
                  return (
                    <div key={i} style={{
                      background: C.white,
                      border: isLive ? `1.5px solid ${C.sky}` : `1px solid ${C.border}`,
                      borderRadius:14, padding:"14px 16px", marginBottom:8,
                      boxShadow: isLive ? `0 0 0 3px ${C.skyLight}` : "0 1px 3px rgba(0,0,0,0.05)",
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ minWidth:90 }}>
                          {isLive && <span style={{ fontSize:11, background:C.sky, color:"white", padding:"4px 10px", borderRadius:20, fontWeight:700 }}>● LIVE {m.time}</span>}
                          {isUpcoming && <span style={{ fontSize:11, background:C.skyLight, color:C.sky, padding:"4px 10px", borderRadius:20, fontWeight:600 }}>{m.time}</span>}
                          {!isLive && !isUpcoming && <span style={{ fontSize:11, background:"#F1F5F9", color:C.muted, padding:"4px 10px", borderRadius:20 }}>終了</span>}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, justifyContent:"center" }}>
                          <div style={{ fontWeight:700, fontSize:13, textAlign:"right", minWidth:90 }}>{m.home}</div>
                          <div style={{
                            fontWeight:800, fontSize: isUpcoming ? 14 : 22, minWidth:70, textAlign:"center",
                            color: isLive ? C.sky : isUpcoming ? C.muted : C.text,
                            letterSpacing: isUpcoming ? 0 : 1,
                          }}>{score}</div>
                          <div style={{ fontWeight:700, fontSize:13, textAlign:"left", minWidth:90 }}>{m.away}</div>
                        </div>
                        <div style={{ minWidth:80, textAlign:"right" }}>
                          {m.stream_url ? (
                            <a href={m.stream_url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, padding:"5px 12px", borderRadius:20, background:"#FF0000", color:"white", textDecoration:"none", fontWeight:700 }}>
                              ▶ 配信
                            </a>
                          ) : (
                            <span style={{ fontSize:11, color:C.muted }}>配信なし</span>
                          )}
                        </div>
                      </div>
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
            <select value={lineupIdx} onChange={e => setLineupIdx(Number(e.target.value))}
              style={{ width:"100%", padding:"10px 14px", fontSize:14, border:`1px solid ${C.border}`, borderRadius:10, marginBottom:16, background:C.white, color:C.text }}>
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
                  <div style={{ fontSize:11, color:C.muted, margin:"8px 0 4px" }}>控え</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {team.subs.map(s => (
                      <span key={s} style={{ fontSize:11, padding:"3px 8px", border:`1px solid ${C.border}`, borderRadius:20, color:C.sub, background:C.white }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.muted, marginTop:14 }}>
              <div style={{ width:14, height:14, borderRadius:"50%", border:"2px solid #FCD34D", background:"white" }}></div>
              キャプテン
            </div>
          </div>
        )}
      </div>

      <style>{`* { box-sizing: border-box; } body { margin: 0; } tr:hover td { background: #F8FAFC !important; }`}</style>
    </div>
  );
}
