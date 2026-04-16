// pages/index.js — SPARTAN INTELLIGENCE v3.0
import { useState, useEffect } from "react";
import Head from "next/head";

// ─── COULEURS ────────────────────────────────────────
const C = {
  bg: "#0A0A0C", card: "#141418", accent: "#E63626",
  accentGlow: "rgba(230,54,38,0.3)", accentSoft: "#FF6B5A",
  green: "#2DD4A0", greenSoft: "rgba(45,212,160,0.15)",
  yellow: "#F5A623", yellowSoft: "rgba(245,166,35,0.15)",
  blue: "#4A9EFF", blueSoft: "rgba(74,158,255,0.15)",
  white: "#F5F5F7", g1: "#B8B8BF", g2: "#6E6E78",
  g3: "#3A3A42", border: "rgba(255,255,255,0.06)",
};

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function todayLocal() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
}

// ─── COMPOSANTS UTILITAIRES ─────────────────────────
function MacroBar({ label, value, max, color }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: C.g2, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
        <span style={{ fontSize: 10, color: C.g1, fontWeight: 600 }}>{value}g</span>
      </div>
      <div style={{ height: 4, background: C.g3, borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${Math.min(100, (value/max)*100)}%`, background: color, borderRadius: 2, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

function CircularProgress({ value, max, size, stroke, color }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.g3} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
}

function Icon({ name, active }) {
  const s = active ? C.accent : C.g2;
  const icons = {
    home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    calendar: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    food: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
    chart: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    trophy: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round"><path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2"/><path d="M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2"/><path d="M4 22h16"/><path d="M10 22V12a2 2 0 01-2-2V3h8v7a2 2 0 01-2 2v10"/></svg>,
    user: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  };
  return icons[name] || null;
}

// ─── ÉCRAN ACCUEIL ──────────────────────────────────
function AccueilScreen({ sessions, planSessions, nutrition, semaine, onNavigate, onSaveEtat }) {
  const [ressentiOpen, setRessentiOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [fatigue, setFatigue] = useState(semaine?.fatigue || 5);
  const [motivation, setMotivation] = useState(semaine?.motivation || 5);
  const [douleurs, setDouleurs] = useState(semaine?.douleurs || 2);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const now = new Date();
  const jours = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  const mois = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const dateStr = `${jours[now.getDay()]} ${now.getDate()} ${mois[now.getMonth()]}`;
  const td = todayLocal();

  // Trouver la séance du jour (d'abord dans séances, puis dans plan)
  let todaySes = sessions.find(s => s.date === td);
  let todaySource = "seance";
  if (!todaySes && planSessions.length > 0) {
    todaySes = planSessions.find(s => s.date === td);
    todaySource = "plan";
  }

  const totalKm = Math.round(sessions.reduce((a,s) => a + (s.distanceReelle || s.distancePrevue || 0), 0) * 10) / 10;
  const totalD = Math.round(sessions.reduce((a,s) => a + (s.dplusReel || s.dplusPrevue || 0), 0));
  const totalMin = Math.round(sessions.reduce((a,s) => a + (s.dureeReelle || s.dureePrevue || 0), 0));
  const totalDuree = totalMin >= 60 ? `${Math.floor(totalMin/60)}h${String(totalMin%60).padStart(2,"0")}` : `${totalMin}min`;

  function RessentiBar({ label, value, onChange, colorFn, leftLabel, rightLabel }) {
    const color = colorFn(value);
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: C.g1, fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "'Bebas Neue',sans-serif" }}>{value}<span style={{ fontSize: 11, color: C.g2 }}>/10</span></span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[1,2,3,4,5,6,7,8,9,10].map(v => (
            <div key={v} onClick={() => onChange(v)} style={{ flex: 1, height: 28, borderRadius: 6, cursor: "pointer", background: v <= value ? color : C.g3, opacity: v <= value ? 1 : 0.3, transition: "all 0.15s" }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 9, color: C.g2 }}>{leftLabel}</span>
          <span style={{ fontSize: 9, color: C.g2 }}>{rightLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 20px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: C.g2, marginBottom: 2 }}>{dateStr}</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.white, margin: 0, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5, lineHeight: 1.2 }}>
          {todaySes ? <>PRÊT POUR<br/><span style={{ color: C.accent }}>{(todaySes.nom || todaySes.typeSeance || "").toUpperCase()}</span> ?</> : <>BIENVENUE<br/><span style={{ color: C.accent }}>SPARTAN</span></>}
        </h1>
      </div>

      {/* Détail séance du jour */}
      {showDetail && todaySes && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(10,10,12,0.98)", zIndex:1000, overflow:"auto", padding:"20px" }}>
          <div style={{ maxWidth:390, margin:"0 auto" }}>
            <button onClick={() => setShowDetail(false)} style={{ background:"none", border:"none", color:C.g2, fontSize:13, padding:0, marginBottom:16, cursor:"pointer" }}>← Retour</button>
            <div style={{ background:`linear-gradient(135deg,${C.card} 0%,#1E1215 100%)`, borderRadius:16, padding:20, border:`1px solid ${C.accent}33`, marginBottom:16 }}>
              <span style={{ fontSize:10, color:C.accent, fontWeight:700, textTransform:"uppercase", letterSpacing:2 }}>{todaySes.jour}</span>
              <h2 style={{ fontSize:22, fontWeight:800, color:C.white, margin:"6px 0 4px", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5 }}>{(todaySes.nom || todaySes.typeSeance || "").toUpperCase()}</h2>
              <p style={{ fontSize:12, color:C.g1, margin:0 }}>{todaySes.objectif ? `Objectif : ${todaySes.objectif}` : ""}</p>
              {todaySes.statut === "Fait" && <div style={{ display:"inline-block", background:C.green+"22", color:C.green, padding:"4px 10px", borderRadius:8, fontSize:11, fontWeight:700, marginTop:10 }}>✓ SÉANCE RÉALISÉE</div>}
              {todaySes.statut === "Planifié" && <div style={{ display:"inline-block", background:C.yellow+"22", color:C.yellow, padding:"4px 10px", borderRadius:8, fontSize:11, fontWeight:700, marginTop:10 }}>⏱ À FAIRE</div>}
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
              {(todaySes.dureeReelle || todaySes.dureePrevue) && <div style={{ background:C.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}><span style={{ fontSize:9, color:C.g2, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>Durée</span><p style={{ fontSize:16, fontWeight:700, color:C.white, margin:"2px 0 0" }}>{Math.round(todaySes.dureeReelle || todaySes.dureePrevue)} min</p></div>}
              {(todaySes.distanceReelle || todaySes.distancePrevue) && <div style={{ background:C.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}><span style={{ fontSize:9, color:C.g2, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>Distance</span><p style={{ fontSize:16, fontWeight:700, color:C.white, margin:"2px 0 0" }}>{Math.round((todaySes.distanceReelle || todaySes.distancePrevue)*10)/10} km</p></div>}
              {(todaySes.dplusReel || todaySes.dplusPrevue) && <div style={{ background:C.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}><span style={{ fontSize:9, color:C.g2, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>D+</span><p style={{ fontSize:16, fontWeight:700, color:C.white, margin:"2px 0 0" }}>{Math.round(todaySes.dplusReel || todaySes.dplusPrevue)}m</p></div>}
              {todaySes.fcMoyenne && <div style={{ background:C.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}><span style={{ fontSize:9, color:C.g2, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>FC moy</span><p style={{ fontSize:16, fontWeight:700, color:C.white, margin:"2px 0 0" }}>{Math.round(todaySes.fcMoyenne)} bpm</p></div>}
              {todaySes.fcMax && <div style={{ background:C.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}><span style={{ fontSize:9, color:C.g2, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>FC max</span><p style={{ fontSize:16, fontWeight:700, color:C.white, margin:"2px 0 0" }}>{Math.round(todaySes.fcMax)} bpm</p></div>}
              {todaySes.zoneFc && <div style={{ background:C.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}><span style={{ fontSize:9, color:C.g2, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>Zone</span><p style={{ fontSize:16, fontWeight:700, color:C.white, margin:"2px 0 0" }}>{todaySes.zoneFc}</p></div>}
              {todaySes.caloriesActives && <div style={{ background:C.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}><span style={{ fontSize:9, color:C.g2, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>Calories</span><p style={{ fontSize:16, fontWeight:700, color:C.white, margin:"2px 0 0" }}>{Math.round(todaySes.caloriesActives)} kcal</p></div>}
              {todaySes.allureMoyenne && <div style={{ background:C.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}><span style={{ fontSize:9, color:C.g2, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>Allure</span><p style={{ fontSize:16, fontWeight:700, color:C.white, margin:"2px 0 0" }}>{todaySes.allureMoyenne}</p></div>}
            </div>
            {todaySes.explication && todaySes.explication.split("---").map((block, i) => {
              const trimmed = block.trim();
              if (!trimmed) return null;
              return <div key={i} style={{ background:C.card, borderRadius:12, padding:16, marginBottom:8, border:`1px solid ${C.border}` }}><p style={{ fontSize:13, color:C.white, margin:0, lineHeight:1.6, whiteSpace:"pre-line" }}>{trimmed}</p></div>;
            })}
            {(todaySes.ressenti || todaySes.fatigueSeance) && (
              <div style={{ background:C.card, borderRadius:12, padding:16, marginTop:8, border:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between" }}>
                {todaySes.ressenti && <div><span style={{ fontSize:11, fontWeight:700, color:C.g2, textTransform:"uppercase", letterSpacing:1 }}>Ressenti</span><p style={{ fontSize:14, color:C.white, fontWeight:600, margin:"2px 0 0" }}>{todaySes.ressenti}</p></div>}
                {todaySes.fatigueSeance && <div style={{ textAlign:"right" }}><span style={{ fontSize:11, fontWeight:700, color:C.g2, textTransform:"uppercase", letterSpacing:1 }}>Fatigue</span><p style={{ fontSize:14, color:todaySes.fatigueSeance<=3?C.green:todaySes.fatigueSeance<=6?C.yellow:C.accent, fontWeight:700, margin:"2px 0 0" }}>{todaySes.fatigueSeance}/10</p></div>}
              </div>
            )}
            {todaySes.commentaire && <div style={{ background:C.card, borderRadius:12, padding:16, marginTop:8, border:`1px solid ${C.border}` }}><span style={{ fontSize:11, fontWeight:700, color:C.g2, textTransform:"uppercase", letterSpacing:1 }}>Commentaire</span><p style={{ fontSize:13, color:C.white, margin:"4px 0 0", lineHeight:1.6 }}>{todaySes.commentaire}</p></div>}
          </div>
        </div>
      )}

      {/* Séance du jour */}
      {todaySes ? (
        <div onClick={() => setShowDetail(true)} style={{ background: `linear-gradient(135deg,${C.card} 0%,#1E1215 100%)`, borderRadius: 16, padding: 20, marginBottom: 16, border: `1px solid ${C.accent}33`, position: "relative", overflow: "hidden", cursor: "pointer" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: C.accentGlow, borderRadius: "50%", filter: "blur(40px)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, position: "relative" }}>
            <div>
              <span style={{ fontSize: 10, color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Séance du jour</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: C.white, margin: "4px 0 0", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>{(todaySes.nom || todaySes.typeSeance || "SÉANCE").toUpperCase()}</h2>
            </div>
            {(todaySes.distancePrevue || todaySes.distanceReelle) ? <div style={{ background: C.accent, borderRadius: 10, padding: "6px 12px", fontSize: 11, fontWeight: 700, color: "#fff" }}>{Math.round((todaySes.distanceReelle || todaySes.distancePrevue) * 10) / 10} km</div> : null}
          </div>
          <div style={{ display: "flex", gap: 20, position: "relative" }}>
            {[
              (todaySes.dureePrevue || todaySes.dureeReelle) ? { l: "Durée", v: `${Math.round(todaySes.dureeReelle || todaySes.dureePrevue)} min` } : null,
              (todaySes.dplusPrevue || todaySes.dplusReel) ? { l: "D+", v: `${Math.round(todaySes.dplusReel || todaySes.dplusPrevue)}m` } : null,
              todaySes.zoneFc ? { l: "Zone FC", v: todaySes.zoneFc } : null,
            ].filter(Boolean).map((d,i) => (
              <div key={i}>
                <p style={{ fontSize: 10, color: C.g2, textTransform: "uppercase", letterSpacing: 1, margin: 0, fontWeight: 600 }}>{d.l}</p>
                <p style={{ fontSize: 18, color: C.white, fontWeight: 700, margin: "2px 0 0" }}>{d.v}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: C.card, borderRadius: 16, padding: 20, marginBottom: 16, border: `1px solid ${C.border}`, textAlign: "center" }}>
          <span style={{ fontSize: 10, color: C.g2, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Séance du jour</span>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.green, margin: "8px 0 0", fontFamily: "'Bebas Neue',sans-serif" }}>REPOS</h2>
          <p style={{ fontSize: 13, color: C.g1, margin: "4px 0 0" }}>Pas de séance programmée</p>
        </div>
      )}

      {/* Récap semaine */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.white, margin: 0, textTransform: "uppercase", letterSpacing: 1.5 }}>Semaine {getWeekNumber(new Date())}</h3>
          <span style={{ fontSize: 11, color: C.g2 }}>{sessions.filter(s => s.statut === "Fait" && s.date <= td).length}/{sessions.length} séances</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((j, i) => {
            const ses = sessions.find(s => s.jour === j || (s.jour || "").startsWith(j));
            const isFait = ses && ses.statut === "Fait" && ses.date <= td;
            const isToday = ses && ses.date === td;
            const typeColor = ses?.typeEffort === "Trail" || ses?.typeEffort === "Route" ? "rgba(230,54,38,0.15)" : ses?.typeEffort === "Renforcement" ? C.blueSoft : C.greenSoft;
            return (
              <div key={i} onClick={() => onNavigate("plan")} style={{ flex: 1, background: isFait ? typeColor : C.card, borderRadius: 10, padding: "10px 0", textAlign: "center", border: isToday ? `1.5px solid ${C.accent}` : `1px solid ${C.border}`, cursor: "pointer" }}>
                <p style={{ fontSize: 10, color: isToday ? C.accent : C.g2, fontWeight: 700, margin: 0 }}>{j}</p>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: isFait ? C.green : C.g3, margin: "6px auto 0" }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: C.g2, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 1.5 }}>Bilan en cours</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[ { v: totalKm || "—", l: "km" }, { v: totalD || "—", l: "D+ (m)" }, { v: totalDuree, l: "Durée" } ].map((s,i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: 0 }}>{s.v}</p>
              <p style={{ fontSize: 10, color: C.g2, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition preview */}
      <div onClick={() => onNavigate("nutrition")} style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, marginBottom: 16, cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: C.g2, margin: 0, textTransform: "uppercase", letterSpacing: 1.5 }}>Nutrition du jour</h3>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.white }}>{nutrition?.calories || "—"} <span style={{ fontSize: 11, color: C.g2, fontWeight: 600 }}>kcal</span></span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <MacroBar label="Prot" value={nutrition?.proteines || 0} max={200} color={C.accent} />
          <MacroBar label="Gluc" value={nutrition?.glucides || 0} max={300} color={C.yellow} />
          <MacroBar label="Lip" value={nutrition?.lipides || 0} max={100} color={C.blue} />
        </div>
      </div>

      {/* Mon ressenti */}
      <div style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}` }}>
        <div onClick={() => setRessentiOpen(!ressentiOpen)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: C.g2, margin: 0, textTransform: "uppercase", letterSpacing: 1.5 }}>Mon ressenti</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!ressentiOpen && <div style={{ display: "flex", gap: 10 }}>
              <span style={{ fontSize: 11, color: fatigue<=4?C.green:fatigue<=6?C.yellow:C.accent, fontWeight: 700 }}>F:{fatigue}</span>
              <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>M:{motivation}</span>
              <span style={{ fontSize: 11, color: douleurs<=3?C.green:douleurs<=6?C.yellow:C.accent, fontWeight: 700 }}>D:{douleurs}</span>
            </div>}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.g2} strokeWidth="2" style={{ transform: ressentiOpen?"rotate(90deg)":"none", transition:"transform 0.2s" }}><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
        {ressentiOpen && (
          <div style={{ marginTop: 16 }}>
            {saved && <div style={{ background:`${C.green}22`, border:`1px solid ${C.green}44`, borderRadius:10, padding:"8px 12px", marginBottom:14, textAlign:"center" }}><span style={{ color:C.green, fontSize:12, fontWeight:600 }}>✓ Ressenti sauvegardé</span></div>}
            <RessentiBar label="Fatigue" value={fatigue} onChange={setFatigue} colorFn={v=>v<=4?C.green:v<=6?C.yellow:C.accent} leftLabel="Frais" rightLabel="Épuisé" />
            <RessentiBar label="Motivation" value={motivation} onChange={setMotivation} colorFn={()=>C.green} leftLabel="Basse" rightLabel="À bloc" />
            <RessentiBar label="Douleurs" value={douleurs} onChange={setDouleurs} colorFn={v=>v<=3?C.green:v<=6?C.yellow:C.accent} leftLabel="Aucune" rightLabel="Intense" />
            <button onClick={async () => {
              setSaving(true); setSaved(false);
              try { await onSaveEtat({ fatigue, motivation, douleurs }); setSaved(true); setTimeout(() => { setSaved(false); setRessentiOpen(false); }, 2000); } catch(e) {}
              setSaving(false);
            }} disabled={saving} style={{ width:"100%", padding:"12px 0", background:saving?C.g3:C.accent, border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, cursor:saving?"wait":"pointer", textTransform:"uppercase", letterSpacing:1 }}>
              {saving ? "Sauvegarde..." : "Enregistrer mon ressenti"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ÉCRAN PLAN ─────────────────────────────────────
function PlanScreen({ sessions }) {
  const [selected, setSelected] = useState(null);
  if (selected !== null) {
    const s = sessions[selected];
    if (!s) { setSelected(null); return null; }
    return (
      <div style={{ padding: "0 20px 24px" }}>
        <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:C.g2, fontSize:13, padding:0, marginBottom:16, cursor:"pointer" }}>← Retour</button>
        <div style={{ background:`linear-gradient(135deg,${C.card} 0%,#1E1215 100%)`, borderRadius:16, padding:20, border:`1px solid ${C.accent}33`, marginBottom:16 }}>
          <span style={{ fontSize:10, color:C.accent, fontWeight:700, textTransform:"uppercase", letterSpacing:2 }}>{s.jour}</span>
          <h2 style={{ fontSize:22, fontWeight:800, color:C.white, margin:"6px 0 4px", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5 }}>{(s.nom || s.typeSeance || "").toUpperCase()}</h2>
          <p style={{ fontSize:12, color:C.g1, margin:0 }}>{s.objectif ? `Objectif : ${s.objectif}` : ""}</p>
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          {(s.dureePrevue || s.dureeReelle) && <div style={{ background:C.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}><span style={{ fontSize:9, color:C.g2, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>Durée</span><p style={{ fontSize:16, fontWeight:700, color:C.white, margin:"2px 0 0" }}>{Math.round(s.dureeReelle || s.dureePrevue)} min</p></div>}
          {(s.distancePrevue || s.distanceReelle) && <div style={{ background:C.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}><span style={{ fontSize:9, color:C.g2, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>Distance</span><p style={{ fontSize:16, fontWeight:700, color:C.white, margin:"2px 0 0" }}>{Math.round((s.distanceReelle || s.distancePrevue)*10)/10} km</p></div>}
          {(s.dplusPrevue || s.dplusReel) && <div style={{ background:C.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}><span style={{ fontSize:9, color:C.g2, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>D+</span><p style={{ fontSize:16, fontWeight:700, color:C.white, margin:"2px 0 0" }}>{Math.round(s.dplusReel || s.dplusPrevue)}m</p></div>}
          {s.fcMoyenne && <div style={{ background:C.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}><span style={{ fontSize:9, color:C.g2, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>FC moy</span><p style={{ fontSize:16, fontWeight:700, color:C.white, margin:"2px 0 0" }}>{Math.round(s.fcMoyenne)} bpm</p></div>}
          {s.zoneFc && <div style={{ background:C.card, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.border}` }}><span style={{ fontSize:9, color:C.g2, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>Zone</span><p style={{ fontSize:16, fontWeight:700, color:C.white, margin:"2px 0 0" }}>{s.zoneFc}</p></div>}
        </div>
        {s.explication && s.explication.split("---").map((block, i) => {
          const trimmed = block.trim();
          if (!trimmed) return null;
          return <div key={i} style={{ background:C.card, borderRadius:12, padding:16, marginBottom:8, border:`1px solid ${C.border}` }}><p style={{ fontSize:13, color:C.white, margin:0, lineHeight:1.6, whiteSpace:"pre-line" }}>{trimmed}</p></div>;
        })}
        {(s.ressenti || s.fatigueSeance) && (
          <div style={{ background:C.card, borderRadius:12, padding:16, marginTop:8, border:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between" }}>
            {s.ressenti && <div><span style={{ fontSize:11, fontWeight:700, color:C.g2, textTransform:"uppercase", letterSpacing:1 }}>Ressenti</span><p style={{ fontSize:14, color:C.white, fontWeight:600, margin:"2px 0 0" }}>{s.ressenti}</p></div>}
            {s.fatigueSeance && <div style={{ textAlign:"right" }}><span style={{ fontSize:11, fontWeight:700, color:C.g2, textTransform:"uppercase", letterSpacing:1 }}>Fatigue</span><p style={{ fontSize:14, color:s.fatigueSeance<=3?C.green:s.fatigueSeance<=6?C.yellow:C.accent, fontWeight:700, margin:"2px 0 0" }}>{s.fatigueSeance}/10</p></div>}
          </div>
        )}
        {s.commentaire && <div style={{ background:C.card, borderRadius:12, padding:16, marginTop:8, border:`1px solid ${C.border}` }}><span style={{ fontSize:11, fontWeight:700, color:C.g2, textTransform:"uppercase", letterSpacing:1 }}>Commentaire</span><p style={{ fontSize:13, color:C.white, margin:"4px 0 0", lineHeight:1.6 }}>{s.commentaire}</p></div>}
      </div>
    );
  }

  const weekNum = sessions[0]?.semaine || `Semaine ${getWeekNumber(new Date()) + 1}`;
  return (
    <div style={{ padding: "0 20px 24px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.white, margin: 0, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>PLAN {weekNum.toUpperCase()}</h1>
        <p style={{ fontSize: 13, color: C.g2, margin: "4px 0 0" }}>Programme à venir</p>
      </div>
      {sessions.length === 0 && <p style={{ color: C.g2, fontSize: 13, textAlign: "center", padding: 40 }}>Aucune séance planifiée</p>}
      {sessions.map((s, i) => {
        const typeColor = s.typeEffort === "Trail" || s.typeEffort === "Route" ? C.accent : s.typeEffort === "Renforcement" ? C.blue : C.green;
        return (
          <div key={i} onClick={() => setSelected(i)} style={{ background: C.card, borderRadius: 14, padding: "16px 18px", marginBottom: 8, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${typeColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {s.typeEffort === "Trail" || s.typeEffort === "Route" ? "🏔️" : s.typeEffort === "Renforcement" ? "💪" : "🌿"}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 11, color: C.g2, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{s.jour}</span>
              <p style={{ fontSize: 15, color: C.white, fontWeight: 700, margin: "3px 0 0" }}>{s.nom || s.typeSeance || "Séance"}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {s.statut === "Fait" && <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── BASE DE CONNAISSANCES COMPLÉMENTS ──────────────
const SUPP_DB = {
  "whey protein": { icon:"🥤", color:C.accent, benefits:"Récupération musculaire rapide, synthèse protéique post-effort", dosage:"30g dans un shaker avec eau ou lait", timing:"Dans les 30 min après la séance" },
  "whey": { icon:"🥤", color:C.accent, benefits:"Récupération musculaire rapide, synthèse protéique post-effort", dosage:"30g dans un shaker avec eau ou lait", timing:"Dans les 30 min après la séance" },
  "créatine": { icon:"⚡", color:C.yellow, benefits:"Augmente force, puissance et endurance musculaire. Améliore la récupération", dosage:"5g par jour, tous les jours", timing:"Le matin avec le petit-déjeuner" },
  "oméga": { icon:"🐟", color:C.blue, benefits:"Anti-inflammatoire naturel, santé cardiovasculaire, récupération articulaire", dosage:"2-3g d'EPA/DHA par jour", timing:"Le matin avec un repas gras" },
  "magnésium": { icon:"💊", color:C.green, benefits:"Réduit crampes et fatigue, améliore le sommeil et la récupération", dosage:"400mg de magnésium bisglycinate", timing:"Le soir avant le coucher" },
  "collagène": { icon:"🦴", color:C.accentSoft, benefits:"Renforce tendons, ligaments et cartilages. Prévention blessures", dosage:"15g collagène hydrolysé + 500mg vitamine C", timing:"30 min avant la séance" },
  "vitamine d": { icon:"☀️", color:C.yellow, benefits:"Santé osseuse, immunité, force musculaire", dosage:"4000 UI par jour", timing:"Le matin avec un repas gras" },
  "bcaa": { icon:"💪", color:C.accent, benefits:"Prévient le catabolisme pendant l'effort long", dosage:"10g pendant l'effort", timing:"Pendant les séances > 90 min" },
  "caféine": { icon:"☕", color:C.yellow, benefits:"Améliore vigilance et performance. Réduit la perception de l'effort", dosage:"200mg (≈ 2 expressos)", timing:"30 min avant la séance, pas après 14h" },
  "zinc": { icon:"🛡️", color:C.green, benefits:"Renforce l'immunité, synthèse de testostérone", dosage:"15mg par jour", timing:"Le soir avec le magnésium" },
  "ashwagandha": { icon:"🌿", color:C.green, benefits:"Adaptogène anti-stress, réduit le cortisol, améliore le sommeil", dosage:"600mg par jour", timing:"Le soir (périodes de fatigue)" },
  "multivitamine": { icon:"💊", color:C.blue, benefits:"Couvre les carences micronutritionnelles", dosage:"1 comprimé par jour", timing:"Après le déjeuner" },
  "électrolyte": { icon:"💧", color:C.blue, benefits:"Hydratation, prévention crampes, équilibre minéral", dosage:"1 dose dans 500ml d'eau", timing:"Pendant l'effort > 60min" },
  "fer": { icon:"🩸", color:C.accent, benefits:"Transport d'oxygène, prévention anémie du sportif", dosage:"14-18mg par jour", timing:"Le matin à jeun avec vitamine C" },
};
function findSuppInfo(name) {
  const l = name.toLowerCase();
  for (const [k, v] of Object.entries(SUPP_DB)) { if (l.includes(k)) return v; }
  return { icon:"💊", color:C.g2, benefits:"Complément alimentaire", dosage:"Voir notice", timing:"Selon recommandation" };
}

// ─── ÉCRAN NUTRITION ────────────────────────────────
function NutritionScreen({ nutrition }) {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedSupp, setSelectedSupp] = useState(null);
  const meals = nutrition?.meals || [];
  const supplements = nutrition?.supplements || [];

  // Vue détail complément
  if (selectedSupp !== null) {
    const s = supplements[selectedSupp]; if (!s) { setSelectedSupp(null); return null; }
    const sName = s.split("(")[0].replace(/^[-•*\d.]\s*/, "").trim();
    const info = findSuppInfo(sName);
    const tm = s.match(/\(([^)]+)\)/); const timing = tm ? tm[1] : info.timing;
    return (
      <div style={{ padding:"0 20px 24px" }}>
        <button onClick={() => setSelectedSupp(null)} style={{ background:"none", border:"none", color:C.g2, fontSize:13, padding:0, marginBottom:16, cursor:"pointer" }}>← Retour</button>
        <div style={{ textAlign:"center", padding:"24px 0 20px", background:`linear-gradient(135deg,${C.card} 0%,${info.color}11 100%)`, borderRadius:16, marginBottom:16, border:`1px solid ${info.color}33` }}>
          <span style={{ fontSize:36 }}>{info.icon}</span>
          <h2 style={{ fontSize:22, fontWeight:800, color:C.white, margin:"8px 0 4px", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5 }}>{sName.toUpperCase()}</h2>
          <div style={{ display:"inline-block", background:`${info.color}22`, borderRadius:8, padding:"4px 10px" }}><span style={{ fontSize:11, color:info.color, fontWeight:700 }}>⏱ {timing}</span></div>
        </div>
        {[{i:"💪",t:"Bienfaits",v:info.benefits,c:C.g1},{i:"💊",t:"Dosage recommandé",v:info.dosage,c:C.g1},{i:"⏰",t:"Quand le prendre",v:timing,c:C.g1}].map((b,j) => (
          <div key={j} style={{ background:C.card, borderRadius:14, padding:18, marginBottom:8, border:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}><span style={{ fontSize:16 }}>{b.i}</span><span style={{ fontSize:11, fontWeight:700, color:C.g1, textTransform:"uppercase", letterSpacing:1.5 }}>{b.t}</span></div>
            <p style={{ fontSize:13, color:C.white, margin:0, lineHeight:1.7 }}>{b.v}</p>
          </div>
        ))}
      </div>
    );
  }

  // Vue détail repas
  if (selectedMeal !== null) {
    const m = meals[selectedMeal]; if (!m) { setSelectedMeal(null); return null; }
    return (
      <div style={{ padding:"0 20px 24px" }}>
        <button onClick={() => setSelectedMeal(null)} style={{ background:"none", border:"none", color:C.g2, fontSize:13, padding:0, marginBottom:16, cursor:"pointer" }}>← Retour</button>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <span style={{ fontSize:36 }}>{m.icon}</span>
          <h2 style={{ fontSize:22, fontWeight:800, color:C.white, margin:"8px 0", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5 }}>{(m.titre||"").toUpperCase()}</h2>
          {m.nom && <p style={{ fontSize:14, color:C.g1, margin:0 }}>{m.nom}</p>}
        </div>
        {m.ingredients && <div style={{ background:C.card, borderRadius:14, padding:18, marginBottom:8, border:`1px solid ${C.border}` }}><div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}><span style={{ fontSize:16 }}>🥗</span><span style={{ fontSize:11, fontWeight:700, color:C.g2, textTransform:"uppercase", letterSpacing:1.5 }}>Ingrédients</span></div><p style={{ fontSize:13, color:C.white, margin:0, lineHeight:1.7 }}>{m.ingredients}</p></div>}
        {m.recette && <div style={{ background:C.card, borderRadius:14, padding:18, marginBottom:8, border:`1px solid ${C.border}` }}><div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}><span style={{ fontSize:16 }}>👨‍🍳</span><span style={{ fontSize:11, fontWeight:700, color:C.accent, textTransform:"uppercase", letterSpacing:1.5 }}>Recette</span></div><p style={{ fontSize:13, color:C.white, margin:0, lineHeight:1.7, whiteSpace:"pre-line" }}>{m.recette}</p></div>}
        {m.contenuBrut && <div style={{ background:C.card, borderRadius:14, padding:18, border:`1px solid ${C.border}` }}><p style={{ fontSize:13, color:C.white, margin:0, lineHeight:1.7, whiteSpace:"pre-line" }}>{m.contenuBrut}</p></div>}
      </div>
    );
  }

  // Vue liste
  return (
    <div style={{ padding:"0 20px 24px" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:C.white, margin:0, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5 }}>NUTRITION</h1>
        <p style={{ fontSize:13, color:C.g2, margin:"4px 0 0" }}>{nutrition?.titre || "Menu du jour"}</p>
      </div>
      <div style={{ background:C.card, borderRadius:16, padding:20, border:`1px solid ${C.border}`, marginBottom:16 }}>
        <div style={{ textAlign:"center", marginBottom:16 }}><p style={{ fontSize:32, fontWeight:800, color:C.white, margin:0 }}>{nutrition?.calories || "—"} <span style={{ fontSize:14, color:C.g2 }}>kcal</span></p></div>
        <div style={{ display:"flex", gap:12 }}>
          <MacroBar label="Protéines" value={nutrition?.proteines || 0} max={200} color={C.accent} />
          <MacroBar label="Glucides" value={nutrition?.glucides || 0} max={300} color={C.yellow} />
          <MacroBar label="Lipides" value={nutrition?.lipides || 0} max={100} color={C.blue} />
        </div>
      </div>
      {meals.map((m, i) => (
        <div key={i} onClick={() => setSelectedMeal(i)} style={{ background:C.card, borderRadius:14, padding:18, marginBottom:8, border:`1px solid ${C.border}`, cursor:"pointer" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
            <span style={{ fontSize:28 }}>{m.icon}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:11, color:C.g2, fontWeight:700, margin:0, textTransform:"uppercase", letterSpacing:1 }}>{m.titre}</p>
              <p style={{ fontSize:16, color:C.white, fontWeight:700, margin:"3px 0 0" }}>{m.nom || "Voir le détail"}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          {m.ingredients && <p style={{ fontSize:12, color:C.g1, margin:0, lineHeight:1.5 }}>{m.ingredients.substring(0, 120)}{m.ingredients.length > 120 ? "..." : ""}</p>}
        </div>
      ))}
      {supplements.length > 0 && (
        <div style={{ background:C.card, borderRadius:14, padding:18, marginTop:8, border:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}><span style={{ fontSize:16 }}>💊</span><h3 style={{ fontSize:11, fontWeight:700, color:C.g2, margin:0, textTransform:"uppercase", letterSpacing:1.5 }}>Supplémentation</h3></div>
          {supplements.map((s, i) => {
            const sName = s.split("(")[0].replace(/^[-•*\d.]\s*/, "").trim();
            const info = findSuppInfo(sName);
            const tm = s.match(/\(([^)]+)\)/); const timing = tm ? tm[1].split("-")[0].trim() : "";
            return (
              <div key={i} onClick={() => setSelectedSupp(i)} style={{ display:"flex", alignItems:"center", padding:"12px 0", borderBottom:i<supplements.length-1?`1px solid ${C.border}`:"none", cursor:"pointer" }}>
                <div style={{ width:32, height:32, borderRadius:8, background:`${info.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, marginRight:12 }}>{info.icon}</div>
                <div style={{ flex:1 }}><p style={{ fontSize:14, color:C.white, fontWeight:600, margin:0 }}>{sName}</p></div>
                <span style={{ fontSize:11, color:C.g2, marginRight:8 }}>{timing}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ÉCRAN BILAN ────────────────────────────────────
function BilanScreen({ sessions, semaine }) {
  const totalKm = Math.round(sessions.reduce((a,s) => a + (s.distanceReelle || 0), 0) * 10) / 10;
  const totalD = Math.round(sessions.reduce((a,s) => a + (s.dplusReel || 0), 0));
  const totalMin = Math.round(sessions.reduce((a,s) => a + (s.dureeReelle || 0), 0));
  const totalDuree = totalMin >= 60 ? `${Math.floor(totalMin/60)}h${String(totalMin%60).padStart(2,"0")}` : `${totalMin}min`;
  const avgFC = sessions.filter(s=>s.fcMoyenne).length > 0 ? Math.round(sessions.filter(s=>s.fcMoyenne).reduce((a,s) => a + s.fcMoyenne, 0) / sessions.filter(s=>s.fcMoyenne).length) : 0;
  const bilanText = semaine?.bilanIA || "";
  const bilanLines = bilanText.split("\n").filter(l => l.trim().length > 0);

  return (
    <div style={{ padding: "0 20px 24px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.white, margin: 0, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>BILAN HEBDO</h1>
        <p style={{ fontSize: 13, color: C.g2, margin: "4px 0 0" }}>Bilan de la semaine écoulée</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
        {[ {l:"Volume",v:`${totalKm} km`,c:C.accent,i:"🏔️"}, {l:"Dénivelé",v:`${totalD} m D+`,c:C.yellow,i:"📈"}, {l:"Durée",v:totalDuree,c:C.blue,i:"⏱️"}, {l:"FC moy",v:avgFC?`${avgFC} bpm`:"—",c:C.accentSoft,i:"❤️"} ].map((s,i) => (
          <div key={i} style={{ background:C.card, borderRadius:12, padding:"14px 16px", border:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
              <span style={{ fontSize:14 }}>{s.i}</span>
              <span style={{ fontSize:10, color:C.g2, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>{s.l}</span>
            </div>
            <p style={{ fontSize:18, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
          </div>
        ))}
      </div>
      <div style={{ background:C.card, borderRadius:14, padding:18, border:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"rgba(230,54,38,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤖</div>
          <span style={{ fontSize:11, fontWeight:700, color:C.accent, textTransform:"uppercase", letterSpacing:1.5 }}>Analyse du coach IA</span>
        </div>
        <div style={{ fontSize:13, color:C.g1, lineHeight:1.7 }}>
          {bilanLines.length > 0 ? bilanLines.map((line, i) => {
            const isTitle = line.startsWith("**") || line.startsWith("###") || line.startsWith("#");
            const cleaned = line.replace(/\*\*/g, "").replace(/###?\s*/g, "").trim();
            if (isTitle) return <p key={i} style={{ margin:"12px 0 4px", color:C.white, fontWeight:700, fontSize:14 }}>{cleaned}</p>;
            return <p key={i} style={{ margin:"0 0 8px" }}>{cleaned}</p>;
          }) : (
            <p style={{ margin:0 }}>Le bilan sera disponible après l'analyse du coach IA (dimanche soir).</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ÉCRAN COURSES ──────────────────────────────────
function CoursesScreen({ courses, onAddCourse }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ nom:"", date:"", type:"Trail", distance:"", dplusEstime:"", priorite:"B", lieu:"", nbObstacles:"", lien:"" });
  const [saving, setSaving] = useState(false);
  const td = todayLocal();
  const aVenir = courses.filter(c => c.date >= td || c.statut === "À venir");
  const passees = courses.filter(c => c.date < td && c.statut !== "À venir");

  function daysUntil(date) {
    const d = new Date(date);
    const now = new Date();
    return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  }

  if (adding) {
    const inputStyle = { width:"100%", padding:"10px 14px", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.white, fontSize:14, outline:"none", fontFamily:"'DM Sans',sans-serif" };
    const labelStyle = { fontSize:11, color:C.g2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6, display:"block" };
    return (
      <div style={{ padding:"0 20px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h1 style={{ fontSize:24, fontWeight:800, color:C.white, margin:0, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5 }}>NOUVELLE COURSE</h1>
          <button onClick={() => setAdding(false)} style={{ background:"none", border:"none", color:C.g2, fontSize:13, cursor:"pointer" }}>Annuler</button>
        </div>
        <div style={{ background:C.card, borderRadius:14, padding:18, marginBottom:12, border:`1px solid ${C.border}` }}>
          <div style={{ marginBottom:14 }}><label style={labelStyle}>Nom de la course</label><input style={inputStyle} value={form.nom} onChange={e => setForm({...form, nom:e.target.value})} placeholder="Spartan Beast Morzine" /></div>
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            <div style={{ flex:1 }}><label style={labelStyle}>Date</label><input style={inputStyle} type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})} /></div>
            <div style={{ flex:1 }}><label style={labelStyle}>Lieu</label><input style={inputStyle} value={form.lieu} onChange={e => setForm({...form, lieu:e.target.value})} placeholder="Morzine" /></div>
          </div>
          <div style={{ marginBottom:14 }}><label style={labelStyle}>Type</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {["Spartan Sprint","Spartan Super","Spartan Beast","Spartan Ultra","Trail","Ultra-Trail","OCR Autre"].map(t => (
                <button key={t} onClick={() => setForm({...form, type:t})} style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${form.type===t?C.accent:C.border}`, background:form.type===t?`${C.accent}22`:C.card, color:form.type===t?C.accent:C.g1, fontSize:11, fontWeight:600, cursor:"pointer" }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            <div style={{ flex:1 }}><label style={labelStyle}>Distance (km)</label><input style={inputStyle} type="number" value={form.distance} onChange={e => setForm({...form, distance:e.target.value})} placeholder="21" /></div>
            <div style={{ flex:1 }}><label style={labelStyle}>D+ estimé (m)</label><input style={inputStyle} type="number" value={form.dplusEstime} onChange={e => setForm({...form, dplusEstime:e.target.value})} placeholder="1500" /></div>
          </div>
          {form.type.includes("Spartan") && <div style={{ marginBottom:14 }}><label style={labelStyle}>Nombre d'obstacles</label><input style={inputStyle} type="number" value={form.nbObstacles} onChange={e => setForm({...form, nbObstacles:e.target.value})} placeholder="30" /></div>}
          <div style={{ marginBottom:14 }}><label style={labelStyle}>Lien de l'événement (optionnel)</label><input style={inputStyle} type="url" value={form.lien} onChange={e => setForm({...form, lien:e.target.value})} placeholder="https://..." /></div>
          <div style={{ marginBottom:14 }}><label style={labelStyle}>Priorité</label>
            <div style={{ display:"flex", gap:8 }}>
              {[{v:"A",l:"Objectif",c:C.accent},{v:"B",l:"Important",c:C.yellow},{v:"C",l:"Entraînement",c:C.green}].map(p => (
                <button key={p.v} onClick={() => setForm({...form, priorite:p.v})} style={{ flex:1, padding:"12px 0", borderRadius:10, border:`1px solid ${form.priorite===p.v?p.c:C.border}`, background:form.priorite===p.v?`${p.c}22`:C.card, color:form.priorite===p.v?p.c:C.g1, fontSize:13, fontWeight:700, cursor:"pointer", textAlign:"center" }}>{p.v}<br/><span style={{ fontSize:9, fontWeight:500 }}>{p.l}</span></button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={async () => {
          if (!form.nom || !form.date) return;
          setSaving(true);
          await onAddCourse(form);
          setSaving(false); setAdding(false);
        }} disabled={saving} style={{ width:"100%", padding:"14px 0", background:saving?C.g3:C.accent, border:"none", borderRadius:14, color:"#fff", fontSize:14, fontWeight:800, cursor:saving?"wait":"pointer", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, textTransform:"uppercase" }}>
          {saving ? "Ajout en cours..." : "Ajouter la course"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 20px 24px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:C.white, margin:0, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5 }}>MES COURSES</h1>
          <p style={{ fontSize:13, color:C.g2, margin:"4px 0 0" }}>Calendrier compétitions</p>
        </div>
        <button onClick={() => setAdding(true)} style={{ background:C.accent, border:"none", borderRadius:10, padding:"8px 16px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Ajouter</button>
      </div>
      {aVenir.length === 0 && <p style={{ color:C.g2, fontSize:13, textAlign:"center", padding:40 }}>Aucune course à venir</p>}
      {aVenir.map((c, i) => {
        const days = daysUntil(c.date);
        const prioColor = c.priorite === "A" ? C.accent : c.priorite === "B" ? C.yellow : C.green;
        return (
          <div key={i} style={{ background:C.card, borderRadius:14, padding:18, marginBottom:8, border:`1px solid ${prioColor}33` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:9, background:`${prioColor}22`, color:prioColor, padding:"2px 8px", borderRadius:4, fontWeight:700 }}>Priorité {c.priorite}</span>
                  <span style={{ fontSize:11, color:C.g2 }}>{c.type}</span>
                </div>
                <h3 style={{ fontSize:16, fontWeight:700, color:C.white, margin:0 }}>{c.nom}</h3>
                <p style={{ fontSize:12, color:C.g1, margin:"4px 0 0" }}>{c.lieu ? `📍 ${c.lieu} — ` : ""}{c.date ? new Date(c.date).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" }) : ""}</p>
              </div>
              <div style={{ textAlign:"center", background:`${prioColor}15`, borderRadius:10, padding:"8px 12px", minWidth:60 }}>
                <p style={{ fontSize:22, fontWeight:800, color:prioColor, margin:0, fontFamily:"'Bebas Neue',sans-serif" }}>J-{days > 0 ? days : 0}</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              {c.distance && <span style={{ fontSize:11, color:C.g1 }}>📏 {c.distance} km</span>}
              {c.dplusEstime && <span style={{ fontSize:11, color:C.g1 }}>⛰️ {c.dplusEstime}m D+</span>}
              {c.nbObstacles && <span style={{ fontSize:11, color:C.g1 }}>🏗️ {c.nbObstacles} obstacles</span>}
            </div>
            {c.lien && (
              <a href={c.lien} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:12, padding:"8px 12px", background:`${prioColor}15`, border:`1px solid ${prioColor}44`, borderRadius:8, color:prioColor, fontSize:12, fontWeight:700, textDecoration:"none" }}>
                🔗 Voir l'événement
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={prioColor} strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
            )}
          </div>
        );
      })}
      {passees.length > 0 && (
        <>
          <h3 style={{ fontSize:13, fontWeight:700, color:C.g2, margin:"20px 0 12px", textTransform:"uppercase", letterSpacing:1.5 }}>Résultats</h3>
          {passees.map((c, i) => (
            <div key={i} style={{ background:C.card, borderRadius:14, padding:16, marginBottom:8, border:`1px solid ${C.border}`, opacity:0.7 }}>
              <p style={{ fontSize:14, color:C.white, fontWeight:600, margin:0 }}>{c.nom}</p>
              <p style={{ fontSize:12, color:C.g2, margin:"4px 0 0" }}>{c.tempsFinal || "—"} {c.classement ? `• ${c.classement}` : ""}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── LISTES DE RÉFÉRENCE PROFIL ─────────────────────
const MATERIEL_MUSCU_OPTIONS = ["Barre olympique","Poids libres","Kettlebells","Haltères ajustables","Banc","Rack de squat","TRX","Corde à sauter","Élastiques","Medicine ball","Barre de traction","Anneaux","Sac de sable","Battle rope","Cordes","Box de plyo"];
const COMPLEMENTS_OPTIONS = ["Whey Protein","Créatine","Oméga-3","Magnésium","Collagène","Vitamine D3","BCAA","Caféine","Zinc","Ashwagandha","Multivitamines","Électrolytes","Fer","Maltodextrine","Gels énergétiques"];
const MONTRE_OPTIONS = ["Garmin","Apple Watch","Polar","Suunto","Coros","Fitbit","Aucune"];
const OBJECTIF_OPTIONS = ["Spartan Sprint","Spartan Super","Spartan Beast","Spartan Ultra","Quadrifecta","Trail Court","Trail Long","Ultra-Trail","Performance globale"];
const EXPERIENCE_OPTIONS = ["Débutant","Intermédiaire","Avancé","Expert","Élite"];
const FREQUENCE_OPTIONS = ["3x/semaine","4x/semaine","5x/semaine","6x/semaine","7x/semaine"];

// ─── ÉCRAN PROFIL ───────────────────────────────────
function ProfilScreen({ profil, onSaveProfil }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nom: profil?.nom || "",
    age: profil?.age || "",
    poids: profil?.poids || "",
    taille: profil?.taille || "",
    objectif: profil?.objectif || "",
    experienceOCR: profil?.experienceOCR || "",
    frequence: profil?.frequence || "",
    metabolismeBase: profil?.metabolismeBase || "",
    vma: profil?.vma || "",
    fcMax: profil?.fcMax || "",
    fcRepos: profil?.fcRepos || "",
    montre: profil?.montre || "",
    ville: profil?.ville || "",
    allergies: profil?.allergies || "",
    alimentsEviter: profil?.alimentsEviter || "",
    zonesFC: profil?.zonesFC || "",
    materielMuscu: profil?.materielMuscu || [],
    complementsDispo: profil?.complementsDispo || [],
  });

  // Sync form when profil loads
  useEffect(() => {
    if (profil && !editing) {
      setForm({
        nom: profil.nom || "",
        age: profil.age || "",
        poids: profil.poids || "",
        taille: profil.taille || "",
        objectif: profil.objectif || "",
        experienceOCR: profil.experienceOCR || "",
        frequence: profil.frequence || "",
        metabolismeBase: profil.metabolismeBase || "",
        vma: profil.vma || "",
        fcMax: profil.fcMax || "",
        fcRepos: profil.fcRepos || "",
        montre: profil.montre || "",
        ville: profil.ville || "",
        allergies: profil.allergies || "",
        alimentsEviter: profil.alimentsEviter || "",
        zonesFC: profil.zonesFC || "",
        materielMuscu: profil.materielMuscu || [],
        complementsDispo: profil.complementsDispo || [],
      });
    }
  }, [profil]);

  function toggleMulti(field, value) {
    const current = form[field] || [];
    if (current.includes(value)) {
      setForm({ ...form, [field]: current.filter(v => v !== value) });
    } else {
      setForm({ ...form, [field]: [...current, value] });
    }
  }

  async function handleSave() {
    setSaving(true); setSaved(false);
    try { await onSaveProfil(form); setSaved(true); setTimeout(() => { setEditing(false); setSaved(false); }, 1500); } catch(e) {}
    setSaving(false);
  }

  if (editing) {
    const inputStyle = { width:"100%", padding:"10px 14px", background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, color:C.white, fontSize:14, outline:"none", fontFamily:"'DM Sans',sans-serif" };
    const labelStyle = { fontSize:11, color:C.g2, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6, display:"block" };
    const sectionStyle = { background:C.card, borderRadius:14, padding:18, marginBottom:12, border:`1px solid ${C.border}` };
    const sectionTitleStyle = { fontSize:11, fontWeight:700, color:C.accent, margin:"0 0 14px", textTransform:"uppercase", letterSpacing:1.5 };

    return (
      <div style={{ padding:"0 20px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h1 style={{ fontSize:24, fontWeight:800, color:C.white, margin:0, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5 }}>ÉDITION PROFIL</h1>
          <button onClick={() => setEditing(false)} style={{ background:"none", border:"none", color:C.g2, fontSize:13, cursor:"pointer" }}>Annuler</button>
        </div>

        {/* Identité */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Identité</h3>
          <div style={{ marginBottom:12 }}><label style={labelStyle}>Nom</label><input style={inputStyle} value={form.nom} onChange={e => setForm({...form, nom:e.target.value})} placeholder="Geoffrey" /></div>
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <div style={{ flex:1 }}><label style={labelStyle}>Âge</label><input style={inputStyle} type="number" value={form.age} onChange={e => setForm({...form, age:e.target.value})} /></div>
            <div style={{ flex:1 }}><label style={labelStyle}>Ville</label><input style={inputStyle} value={form.ville} onChange={e => setForm({...form, ville:e.target.value})} placeholder="Metz" /></div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}><label style={labelStyle}>Poids (kg)</label><input style={inputStyle} type="number" value={form.poids} onChange={e => setForm({...form, poids:e.target.value})} /></div>
            <div style={{ flex:1 }}><label style={labelStyle}>Taille (cm)</label><input style={inputStyle} type="number" value={form.taille} onChange={e => setForm({...form, taille:e.target.value})} /></div>
          </div>
        </div>

        {/* Objectif & expérience */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Objectif & Expérience</h3>
          <div style={{ marginBottom:12 }}>
            <label style={labelStyle}>Objectif principal</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {OBJECTIF_OPTIONS.map(o => (
                <button key={o} onClick={() => setForm({...form, objectif:o})} style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${form.objectif===o?C.accent:C.border}`, background:form.objectif===o?`${C.accent}22`:C.bg, color:form.objectif===o?C.accent:C.g1, fontSize:11, fontWeight:600, cursor:"pointer" }}>{o}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={labelStyle}>Expérience OCR</label>
            <div style={{ display:"flex", gap:6 }}>
              {EXPERIENCE_OPTIONS.map(o => (
                <button key={o} onClick={() => setForm({...form, experienceOCR:o})} style={{ flex:1, padding:"8px 0", borderRadius:8, border:`1px solid ${form.experienceOCR===o?C.accent:C.border}`, background:form.experienceOCR===o?`${C.accent}22`:C.bg, color:form.experienceOCR===o?C.accent:C.g1, fontSize:11, fontWeight:600, cursor:"pointer" }}>{o}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Fréquence entraînements</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {FREQUENCE_OPTIONS.map(o => (
                <button key={o} onClick={() => setForm({...form, frequence:o})} style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${form.frequence===o?C.accent:C.border}`, background:form.frequence===o?`${C.accent}22`:C.bg, color:form.frequence===o?C.accent:C.g1, fontSize:11, fontWeight:600, cursor:"pointer" }}>{o}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Performances */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Performances</h3>
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <div style={{ flex:1 }}><label style={labelStyle}>VMA (km/h)</label><input style={inputStyle} type="number" step="0.1" value={form.vma} onChange={e => setForm({...form, vma:e.target.value})} /></div>
            <div style={{ flex:1 }}><label style={labelStyle}>Métabolisme (kcal)</label><input style={inputStyle} type="number" value={form.metabolismeBase} onChange={e => setForm({...form, metabolismeBase:e.target.value})} /></div>
          </div>
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <div style={{ flex:1 }}><label style={labelStyle}>FC Max</label><input style={inputStyle} type="number" value={form.fcMax} onChange={e => setForm({...form, fcMax:e.target.value})} /></div>
            <div style={{ flex:1 }}><label style={labelStyle}>FC Repos</label><input style={inputStyle} type="number" value={form.fcRepos} onChange={e => setForm({...form, fcRepos:e.target.value})} /></div>
          </div>
          <div>
            <label style={labelStyle}>Montre connectée</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {MONTRE_OPTIONS.map(o => (
                <button key={o} onClick={() => setForm({...form, montre:o})} style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${form.montre===o?C.accent:C.border}`, background:form.montre===o?`${C.accent}22`:C.bg, color:form.montre===o?C.accent:C.g1, fontSize:11, fontWeight:600, cursor:"pointer" }}>{o}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Matériel muscu */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Matériel muscu disponible</h3>
          <p style={{ fontSize:11, color:C.g2, margin:"0 0 12px" }}>Sélectionnez tout ce que vous possédez (multi-sélection)</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {MATERIEL_MUSCU_OPTIONS.map(m => {
              const active = form.materielMuscu.includes(m);
              return (
                <button key={m} onClick={() => toggleMulti("materielMuscu", m)} style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${active?C.blue:C.border}`, background:active?C.blueSoft:C.bg, color:active?C.blue:C.g1, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                  {active ? "✓ " : ""}{m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compléments disponibles */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Compléments disponibles</h3>
          <p style={{ fontSize:11, color:C.g2, margin:"0 0 12px" }}>Sélectionnez tous les compléments que vous possédez</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {COMPLEMENTS_OPTIONS.map(c => {
              const active = form.complementsDispo.includes(c);
              return (
                <button key={c} onClick={() => toggleMulti("complementsDispo", c)} style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${active?C.green:C.border}`, background:active?`${C.green}15`:C.bg, color:active?C.green:C.g1, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                  {active ? "✓ " : ""}{c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nutrition */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Nutrition</h3>
          <div style={{ marginBottom:12 }}><label style={labelStyle}>Allergies alimentaires</label><textarea style={{ ...inputStyle, minHeight:60, resize:"vertical" }} value={form.allergies} onChange={e => setForm({...form, allergies:e.target.value})} placeholder="Gluten, lactose..." /></div>
          <div><label style={labelStyle}>Aliments à éviter (goûts)</label><textarea style={{ ...inputStyle, minHeight:60, resize:"vertical" }} value={form.alimentsEviter} onChange={e => setForm({...form, alimentsEviter:e.target.value})} placeholder="Poisson cru, champignons..." /></div>
        </div>

        {saved && <div style={{ background:`${C.green}22`, border:`1px solid ${C.green}44`, borderRadius:10, padding:"10px 14px", marginBottom:12, textAlign:"center" }}><span style={{ color:C.green, fontSize:13, fontWeight:600 }}>✓ Profil enregistré</span></div>}

        <button onClick={handleSave} disabled={saving} style={{ width:"100%", padding:"14px 0", background:saving?C.g3:C.accent, border:"none", borderRadius:14, color:"#fff", fontSize:14, fontWeight:800, cursor:saving?"wait":"pointer", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, textTransform:"uppercase" }}>
          {saving ? "Enregistrement..." : "Enregistrer le profil"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 20px 24px" }}>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:`linear-gradient(135deg,${C.accent},#FF6B5A)`, margin:"0 auto 12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:800, color:"#fff", fontFamily:"'Bebas Neue',sans-serif" }}>{(profil?.nom || "?")[0].toUpperCase()}</div>
        <h2 style={{ fontSize:22, fontWeight:800, color:C.white, margin:0, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 }}>{(profil?.nom || "MON PROFIL").toUpperCase()}</h2>
        <p style={{ fontSize:13, color:C.g2, margin:"4px 0 0" }}>{profil?.experienceOCR ? `Athlète OCR ${profil.experienceOCR}` : "Athlète OCR"}{profil?.ville ? ` — ${profil.ville}` : ""}</p>
        <button onClick={() => setEditing(true)} style={{ marginTop:12, background:`${C.accent}22`, border:`1px solid ${C.accent}44`, borderRadius:10, padding:"8px 16px", color:C.accent, fontSize:12, fontWeight:700, cursor:"pointer", textTransform:"uppercase", letterSpacing:1 }}>✎ Modifier le profil</button>
      </div>
      <div style={{ background:C.card, borderRadius:14, padding:18, marginBottom:12, border:`1px solid ${C.border}` }}>
        <h3 style={{ fontSize:11, fontWeight:700, color:C.g2, margin:"0 0 14px", textTransform:"uppercase", letterSpacing:1.5 }}>Profil athlète</h3>
        {[
          { l:"Objectif", v:profil?.objectif || "—" },
          { l:"Âge", v:profil?.age ? `${profil.age} ans` : "—" },
          { l:"Poids", v:profil?.poids ? `${profil.poids} kg` : "—" },
          { l:"Taille", v:profil?.taille ? `${profil.taille} cm` : "—" },
          { l:"Expérience", v:profil?.experienceOCR || "—" },
          { l:"Fréquence", v:profil?.frequence || "—" },
          { l:"Métabolisme", v:profil?.metabolismeBase ? `${profil.metabolismeBase} kcal` : "—" },
          { l:"VMA", v:profil?.vma ? `${profil.vma} km/h` : "—" },
          { l:"FC Max", v:profil?.fcMax ? `${profil.fcMax} bpm` : "—" },
          { l:"Montre", v:profil?.montre || "—" },
        ].map((item,i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:i<9?`1px solid ${C.border}`:"none" }}>
            <span style={{ fontSize:13, color:C.g1 }}>{item.l}</span>
            <span style={{ fontSize:13, color:C.white, fontWeight:600 }}>{item.v}</span>
          </div>
        ))}
      </div>
      {profil?.materielMuscu?.length > 0 && (
        <div style={{ background:C.card, borderRadius:14, padding:18, marginBottom:12, border:`1px solid ${C.border}` }}>
          <h3 style={{ fontSize:11, fontWeight:700, color:C.g2, margin:"0 0 12px", textTransform:"uppercase", letterSpacing:1.5 }}>Matériel muscu</h3>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {profil.materielMuscu.map((m,i) => <span key={i} style={{ padding:"6px 12px", borderRadius:8, background:C.blueSoft, color:C.blue, fontSize:12, fontWeight:600 }}>{m}</span>)}
          </div>
        </div>
      )}
      {profil?.complementsDispo?.length > 0 && (
        <div style={{ background:C.card, borderRadius:14, padding:18, marginBottom:12, border:`1px solid ${C.border}` }}>
          <h3 style={{ fontSize:11, fontWeight:700, color:C.g2, margin:"0 0 12px", textTransform:"uppercase", letterSpacing:1.5 }}>Compléments disponibles</h3>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {profil.complementsDispo.map((c,i) => <span key={i} style={{ padding:"6px 12px", borderRadius:8, background:`${C.green}15`, color:C.green, fontSize:12, fontWeight:600 }}>💊 {c}</span>)}
          </div>
        </div>
      )}
      <div style={{ background:`linear-gradient(135deg,${C.accent}15,${C.card})`, borderRadius:14, padding:18, border:`1px solid ${C.accent}22`, textAlign:"center" }}>
        <p style={{ fontSize:10, color:C.accent, fontWeight:700, textTransform:"uppercase", letterSpacing:2, margin:"0 0 4px" }}>Spartan Intelligence</p>
        <p style={{ fontSize:11, color:C.g2, margin:0 }}>v3.4 — Powered by AI</p>
      </div>
    </div>
  );
}

// ─── PARSEUR NUTRITION ──────────────────────────────
function parseNutritionContent(contenu, menus) {
  const text = contenu || menus || "";
  if (!text) return { meals: [], supplements: [] };

  let meals = [];
  let supplements = [];

  // Séparer par --- pour isoler chaque repas
  const sections = text.split("---").map(s => s.trim()).filter(s => s.length > 0);

  for (const section of sections) {
    // Détecter si c'est un repas
    const mealMatch = section.match(/^(🍳|🍖|🥣|🥗|🍽️|🥤)?\s*(Déjeuner|Dîner|Petit[- ]déjeuner|Collation|Snack)\s*:\s*/i);
    if (mealMatch) {
      const iconMap = { "déjeuner":"🍳","dîner":"🍖","petit-déjeuner":"🥣","petit déjeuner":"🥣","collation":"🥗","snack":"🥗" };
      const titre = mealMatch[2];
      const icon = mealMatch[1] || iconMap[titre.toLowerCase()] || "🍽️";
      const rest = section.substring(mealMatch[0].length);

      // Parser avec — (em dash) comme séparateur de champs
      const parts = rest.split("—").map(p => p.trim());

      let nom = "";
      let ingredients = "";
      let recette = "";
      let contenuBrut = "";

      for (const part of parts) {
        if (part.toLowerCase().startsWith("ingrédient")) {
          ingredients = part.replace(/^Ingrédients?\s*:\s*/i, "").trim();
        } else if (part.toLowerCase().startsWith("recette")) {
          recette = part.replace(/^Recette\s*:\s*/i, "").replace(/\\n/g, "\n").trim();
        } else if (!nom) {
          nom = part.replace(/\*\*/g, "").trim();
        } else {
          contenuBrut += part + "\n";
        }
      }

      meals.push({ icon, titre, nom, ingredients, recette, contenuBrut: contenuBrut.trim() });
      continue;
    }

    // Détecter les compléments
    if (section.toLowerCase().includes("supplément") || section.toLowerCase().includes("complément")) {
      const lines = section.split("\n").filter(l => l.trim().length > 2);
      for (const line of lines) {
        if (!line.toLowerCase().includes("supplément") && !line.toLowerCase().includes("complément")) {
          supplements.push(line.replace(/^[-•*\d.]\s*/, "").replace(/\*\*/g, "").trim());
        }
      }
      continue;
    }

    // Collation sans emoji standard
    if (section.toLowerCase().includes("collation")) {
      const collMatch = section.match(/Collation\s*:\s*(.*)/i);
      if (collMatch) {
        meals.push({ icon: "🥤", titre: "Collation", nom: collMatch[1].replace(/\\n/g, " ").trim(), ingredients: "", recette: "", contenuBrut: "" });
      }
    }
  }

  // Fallback : si aucun repas trouvé, essayer ligne par ligne
  if (meals.length === 0) {
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    let currentMeal = null;
    for (const line of lines) {
      const lm = line.match(/^(🍳|🍖|🥣|🥗|🍽️|🥤)?\s*(Déjeuner|Dîner|Petit[- ]déjeuner|Collation|Snack)/i);
      if (lm) {
        if (currentMeal) meals.push(currentMeal);
        const iconMap = { "déjeuner":"🍳","dîner":"🍖","petit-déjeuner":"🥣","petit déjeuner":"🥣","collation":"🥗","snack":"🥗" };
        currentMeal = { icon: lm[1] || iconMap[lm[2].toLowerCase()] || "🍽️", titre: lm[2], nom: "", ingredients: "", recette: "", contenuBrut: "" };
        continue;
      }
      if (currentMeal) {
        if (line.toLowerCase().includes("ingrédient")) { currentMeal.ingredients = line.replace(/^Ingrédients?\s*:\s*/i, "").trim(); }
        else if (line.toLowerCase().includes("recette")) { currentMeal.recette = line.replace(/^Recette\s*:\s*/i, "").trim(); }
        else if (!currentMeal.nom) { currentMeal.nom = line.replace(/\*\*/g, "").trim(); }
        else { currentMeal.contenuBrut += line + "\n"; }
      }
    }
    if (currentMeal) meals.push(currentMeal);
  }

  return { meals, supplements };
}

// ─── APPLICATION PRINCIPALE ─────────────────────────
export default function Home() {
  const [tab, setTab] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [planSessions, setPlanSessions] = useState([]);
  const [nutrition, setNutrition] = useState(null);
  const [semaine, setSemaine] = useState(null);
  const [courses, setCourses] = useState([]);
  const [profil, setProfil] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Séances de la semaine en cours
        const weekNum = getWeekNumber(new Date());
        const resSes = await fetch(`/api/seances?semaine=Semaine ${weekNum}`);
        const dataSes = await resSes.json();
        if (dataSes.success && dataSes.data.length > 0) { setSessions(dataSes.data); setIsLive(true); }

        // Plan semaine prochaine
        try {
          const resPlan = await fetch(`/api/seances?semaine=Semaine ${weekNum + 1}`);
          const dataPlan = await resPlan.json();
          if (dataPlan.success && dataPlan.data.length > 0) { setPlanSessions(dataPlan.data); }
          else if (dataSes.success && dataSes.data.length > 0) { setPlanSessions(dataSes.data); }
        } catch(e) {}

        // Nutrition (aujourd'hui, sinon demain)
        try {
          const td = todayLocal();
          const tmrw = (() => { const d = new Date(); d.setDate(d.getDate()+1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
          let nutData = null;
          const resNut = await fetch(`/api/nutrition?date=${td}`);
          const nutJson = await resNut.json();
          if (nutJson.success && nutJson.data) { nutData = nutJson.data; }
          if (!nutData) {
            const resNut2 = await fetch(`/api/nutrition?date=${tmrw}`);
            const nutJson2 = await resNut2.json();
            if (nutJson2.success && nutJson2.data) { nutData = nutJson2.data; }
          }
          if (nutData) {
            const parsed = parseNutritionContent(nutData.contenu, nutData.menus);
            let complements = [];
            if (nutData.complements && nutData.complements.trim()) {
              complements = nutData.complements.split(/[\/\n]/).map(l => l.trim()).filter(l => l.length > 0);
            } else if (parsed.supplements.length > 0) {
              complements = parsed.supplements;
            }
            setNutrition({
              titre: nutData.titre || "Menu du jour",
              calories: nutData.calories || 0,
              proteines: nutData.proteines || 0,
              glucides: nutData.glucides || 0,
              lipides: nutData.lipides || 0,
              meals: parsed.meals,
              supplements: complements,
            });
          }
        } catch(e) {}

        // Semaine (état + bilan)
        try {
          const resSem = await fetch("/api/semaine");
          const dataSem = await resSem.json();
          if (dataSem.success && dataSem.data) { setSemaine(dataSem.data); }
        } catch(e) {}

        // Courses
        try {
          const resCrs = await fetch("/api/courses");
          const dataCrs = await resCrs.json();
          if (dataCrs.success && dataCrs.data) { setCourses(dataCrs.data); }
        } catch(e) {}

        // Profil
        try {
          const resPro = await fetch("/api/profil");
          const dataPro = await resPro.json();
          if (dataPro.success && dataPro.data) { setProfil(dataPro.data); }
        } catch(e) {}

      } catch(e) { console.log("Erreur chargement:", e); }
    }
    loadData();
  }, []);

  function handleNavigate(target) {
    if (target === "plan") setTab(1);
    else if (target === "nutrition") setTab(2);
    else if (target === "bilan") setTab(3);
    else if (target === "courses") setTab(4);
  }

  async function handleSaveEtat(data) {
    const res = await fetch("/api/semaine", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) });
    const result = await res.json();
    if (result.success) setSemaine(prev => ({ ...prev, fatigue:data.fatigue, motivation:data.motivation, douleurs:data.douleurs }));
  }

  async function handleAddCourse(data) {
    const res = await fetch("/api/courses", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) });
    const result = await res.json();
    if (result.success) {
      const resCrs = await fetch("/api/courses");
      const dataCrs = await resCrs.json();
      if (dataCrs.success) setCourses(dataCrs.data);
    }
  }

  async function handleSaveProfil(data) {
    const res = await fetch("/api/profil", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) });
    const result = await res.json();
    if (result.success) {
      const resPro = await fetch("/api/profil");
      const dataPro = await resPro.json();
      if (dataPro.success && dataPro.data) setProfil(dataPro.data);
    }
  }

  const tabs = [
    { icon: "home", label: "Accueil" },
    { icon: "calendar", label: "Plan" },
    { icon: "food", label: "Nutrition" },
    { icon: "chart", label: "Bilan" },
    { icon: "trophy", label: "Courses" },
    { icon: "user", label: "Profil" },
  ];

  const screens = [
    <AccueilScreen key={0} sessions={sessions} planSessions={planSessions} nutrition={nutrition} semaine={semaine} onNavigate={handleNavigate} onSaveEtat={handleSaveEtat} />,
    <PlanScreen key={1} sessions={planSessions} />,
    <NutritionScreen key={2} nutrition={nutrition} />,
    <BilanScreen key={3} sessions={sessions} semaine={semaine} />,
    <CoursesScreen key={4} courses={courses} onAddCourse={handleAddCourse} />,
    <ProfilScreen key={5} profil={profil} onSaveProfil={handleSaveProfil} />,
  ];

  return (
    <>
      <Head>
        <title>Spartan Intelligence</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0A0A0C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <div style={{ maxWidth:390, margin:"0 auto", background:C.bg, minHeight:"100vh", position:"relative" }}>
        {/* Header */}
        <div style={{ padding:"16px 20px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${C.accent},#8B1A10)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:16, fontWeight:900, color:"#fff", fontFamily:"'Bebas Neue',sans-serif" }}>SI</span>
            </div>
            <p style={{ fontSize:10, color:C.g2, margin:0, fontWeight:600, textTransform:"uppercase", letterSpacing:1.5 }}>Spartan Intelligence</p>
          </div>
          <div>
            {isLive ? <span style={{ fontSize:9, background:C.green+"33", color:C.green, padding:"2px 6px", borderRadius:4, fontWeight:700 }}>LIVE</span>
                     : <span style={{ fontSize:9, background:C.yellow+"33", color:C.yellow, padding:"2px 6px", borderRadius:4, fontWeight:700 }}>DÉMO</span>}
          </div>
        </div>

        {/* Contenu */}
        {screens[tab]}

        {/* Tab bar */}
        <div style={{ position:"sticky", bottom:0, background:"rgba(10,10,12,0.95)", backdropFilter:"blur(20px)", borderTop:`1px solid ${C.border}`, padding:"8px 4px 20px", display:"flex", justifyContent:"space-around" }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ background:"none", border:"none", padding:"6px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer", position:"relative" }}>
              {i === tab && <div style={{ position:"absolute", top:-1, width:20, height:2, background:C.accent, borderRadius:1 }} />}
              <Icon name={t.icon} active={i === tab} />
              <span style={{ fontSize:9, color:i===tab?C.accent:C.g2, fontWeight:i===tab?700:500, textTransform:"uppercase", letterSpacing:0.5 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
