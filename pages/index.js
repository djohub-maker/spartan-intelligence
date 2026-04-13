// pages/index.js
// ============================================
// SPARTAN INTELLIGENCE — Page principale
// ============================================
// Cette page affiche l'application complète.
// Elle essaie de charger les données depuis Notion.
// Si Notion n'est pas configuré, elle affiche des données de démo.
// ============================================

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

// Calcule le numéro de semaine ISO
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const mois = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  return `${monday.getDate()} – ${sunday.getDate()} ${mois[sunday.getMonth()]} ${sunday.getFullYear()}`;
}

// ─── DONNÉES DE DÉMO ─────────────────────────────────
// Utilisées quand Notion n'est pas encore connecté
const DEMO_SESSIONS = [
  { jour: "Lun", nom: "Renfo OCR", type: "force", done: true, intensity: 85, duree: 25, typeSeance: "RENFO OCR SPÉCIFIQUE", objectif: "Force", explication: "🏃 ÉCHAUFFEMENT : 10 min corde à sauter\n---\n💪 CORPS DE SÉANCE :\n- 4×5 tractions gilet lesté 10kg\n- 3×10 squats sandbag 35kg\n- 3×1min pendaison barre (grip)\n---\n🧊 RETOUR AU CALME : 15 min stretching", fcMoyenne: 135, ressenti: "Facile", fatigue: 3 },
  { jour: "Mar", nom: "Fractionné Côte", type: "run", done: true, intensity: 90, duree: 36, distance: 6.1, denivele: 168, typeSeance: "FRACTIONNÉ CÔTE", objectif: "VMA", explication: "🏃 ÉCHAUFFEMENT : 15 min footing terrain vallonné\n---\n💪 CORPS DE SÉANCE :\n- 8×1min montée rapide\n- Récup 2 min en marchant\n---\n🧊 RETOUR AU CALME : 10 min jogging + 10 min stretching", fcMoyenne: 157, ressenti: "Normal", fatigue: 3 },
  { jour: "Mer", nom: "Renfo PPG", type: "force", done: true, intensity: 60, duree: 38, typeSeance: "RENFO PPG", objectif: "Endurance musculaire", explication: "🏃 ÉCHAUFFEMENT : 10 min mobilité dynamique\n---\n💪 CORPS DE SÉANCE :\n- 5×5 burpees\n- 4×12 fentes alternées\n- 3×20 mountain climbers\n- 4×30s gainage\n---\n🧊 RETOUR AU CALME : 10 min stretching", fcMoyenne: 128, ressenti: "Facile", fatigue: 2 },
  { jour: "Jeu", nom: "Trail EF", type: "run", done: true, intensity: 70, duree: 65, distance: 9.6, denivele: 233, typeSeance: "TRAIL ENDURANCE FONDAMENTALE", objectif: "Endurance", explication: "🏃 ÉCHAUFFEMENT : Intégré au parcours\n---\n💪 CORPS DE SÉANCE :\n- 1h de trail en zone cardio basse\n- Allure conversationnelle\n- Terrain vallonné\n---\n🧊 RETOUR AU CALME : 5 min marche + stretching", fcMoyenne: 146, ressenti: "Facile", fatigue: 3 },
  { jour: "Ven", nom: "Renfo Spéc", type: "force", done: true, intensity: 65, duree: 25, typeSeance: "RENFO SPÉCIFIQUE OCR", objectif: "Force-Endurance", explication: "🏃 ÉCHAUFFEMENT : 10 min corde + mobilité\n---\n💪 CORPS DE SÉANCE :\n- Rope climb 3×2 montées\n- 3×10 wall balls\n- 4×8 kettlebell swings\n- 3×30s farmer walk\n---\n🧊 RETOUR AU CALME : 15 min stretching", fcMoyenne: 135, ressenti: "Facile", fatigue: 3 },
  { jour: "Sam", nom: "Sortie Longue", type: "run", done: false, intensity: 95, duree: 122, distance: 17.0, denivele: 559, typeSeance: "SORTIE LONGUE", objectif: "Endurance", explication: "🏃 ÉCHAUFFEMENT : Intégré\n---\n💪 CORPS DE SÉANCE :\n- 2h trail endurance fondamentale\n- Terrain mixte forêt/sentier\n- Ravitaillement toutes les 45min\n---\n🧊 RETOUR AU CALME : 10 min marche + étirements" },
  { jour: "Dim", nom: "Repos actif", type: "rest", done: false, intensity: 20, duree: 60, typeSeance: "REPOS ACTIF", objectif: "Mobilité", explication: "💪 CORPS DE SÉANCE :\n- Marche 45 min + mobilité douce\n- Foam roller 15 min\n- Stretching global" },
];

const DEMO_NUTRITION = {
  calories: 2450, proteines: 180, glucides: 250, lipides: 85,
  titre: "Menu du jour",
  meals: [
    { icon: "🍳", titre: "Déjeuner", nom: "Salade de Quinoa et Poulet Grillé", ingredients: "150g de poulet, 100g de quinoa cuit, 50g de pois chiches, 30g de feta, 50g de roquette, 15ml d'huile d'olive, jus d'un citron, épices (sel, poivre, curcuma).", recette: "Grillez le poulet après l'avoir assaisonné. Mélangez quinoa, pois chiches, roquette et feta. Ajoutez le poulet émincé, arrosez de jus de citron et d'huile, mélangez bien.", kcal: 620, p: 48, g: 55, l: 22 },
    { icon: "🍖", titre: "Dîner", nom: "Saumon au Four et Légumes Rôtis", ingredients: "150g de saumon, 200g de patates douces, 100g de brocolis, 15ml d'huile d'olive, herbes de Provence.", recette: "Assaisonnez le saumon et les légumes avec huile et herbes. Faites cuire au four à 200°C pendant 20 min.", kcal: 580, p: 42, g: 48, l: 24 },
  ],
  supplements: [
    { name: "Whey Protein", timing: "Après la séance", icon: "🥤" },
    { name: "Créatine", timing: "Avant la séance", icon: "⚡" },
    { name: "Oméga-3", timing: "Le matin", icon: "🐟" },
    { name: "Magnésium", timing: "Le soir", icon: "💊" },
    { name: "Collagène", timing: "Avant coucher", icon: "🦴" },
  ],
};

const DEMO_ETAT = { fatigue: 5.5, motivation: 8, douleurs: 2 };

// ─── COMPOSANTS RÉUTILISABLES ────────────────────────

function MacroBar({ label, value, max, color }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: C.g2, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, color: C.white, fontWeight: 700 }}>{value}g</span>
      </div>
      <div style={{ height: 5, background: C.g3, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: "100%", background: color, borderRadius: 3, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

function CircularProgress({ value, max, size = 52, stroke = 4, color = C.accent }) {
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

// ─── ICÔNES ──────────────────────────────────────────

function Icon({ name, active }) {
  const s = active ? C.accent : C.g2;
  const icons = {
    home: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    calendar: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    food: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
    chart: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    user: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  };
  return icons[name] || null;
}

// ─── ÉCRAN ACCUEIL ───────────────────────────────────

function DashboardScreen({ sessions, planSessions, nutrition, etat, onNavigate, onSaveEtat }) {
  const [ressentiOpen, setRessentiOpen] = useState(false);
  const [fatigue, setFatigue] = useState(etat.fatigue || 5);
  const [motivation, setMotivation] = useState(etat.motivation || 5);
  const [douleurs, setDouleurs] = useState(etat.douleurs || 2);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const now = new Date();
  const joursSemaine = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  const mois = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const dateStr = `${joursSemaine[now.getDay()]} ${now.getDate()} ${mois[now.getMonth()]}`;
  
  // Trouver la séance du jour : d'abord dans Séance, puis dans Plan
  const todayDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  let todayIndex = sessions.findIndex(s => s.date === todayDate);
  let today = todayIndex >= 0 ? sessions[todayIndex] : null;
  let todayIdx = todayIndex >= 0 ? todayIndex : -1;
  let todaySource = "seance";
  
  // Si pas trouvé dans Séance, chercher dans Plan
  if (!today && planSessions && planSessions.length > 0) {
    const planIndex = planSessions.findIndex(s => s.date === todayDate);
    if (planIndex >= 0) {
      today = planSessions[planIndex];
      todayIdx = planIndex;
      todaySource = "plan";
    }
  }
  return (
    <div style={{ padding: "0 20px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: C.g2, marginBottom: 2 }}>{dateStr}</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.white, margin: 0, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5, lineHeight: 1.2 }}>
          {today?.nom ? <>PRÊT POUR<br/><span style={{ color: C.accent }}>{(today.nom || "").toUpperCase()}</span> ?</> : <>BIENVENUE<br/><span style={{ color: C.accent }}>SPARTAN</span></>}
        </h1>
      </div>

      {/* Séance du jour — cliquable */}
      {today ? (
      <div onClick={() => onNavigate("plan", todayIdx)} style={{ background: `linear-gradient(135deg,${C.card} 0%,#1E1215 100%)`, borderRadius: 16, padding: 20, marginBottom: 16, border: `1px solid ${C.accent}33`, position: "relative", overflow: "hidden", cursor: "pointer" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: C.accentGlow, borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, position: "relative" }}>
          <div>
            <span style={{ fontSize: 10, color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Séance du jour</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.white, margin: "4px 0 0", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>{(today.nom || "Repos").toUpperCase()}</h2>
            <p style={{ fontSize: 13, color: C.g1, margin: "4px 0 0" }}>{today.explication ? today.explication.split("\n")[0].replace(/^[🏃💪🧊🏔️]\s*/, "").substring(0, 50) : "Voir le détail"}</p>
          </div>
          {today?.distance ? <div style={{ background: C.accent, borderRadius: 10, padding: "6px 12px", fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>{Math.round(today.distance * 10) / 10} km</div> : null}
        </div>
        <div style={{ display: "flex", gap: 20, position: "relative" }}>
          {[
            today?.duree ? { l: "Durée", v: today.duree >= 60 ? `${Math.floor(today.duree/60)}h${String(Math.round(today.duree%60)).padStart(2,"0")}` : `${Math.round(today.duree)} min` } : null,
            today?.denivele ? { l: "D+", v: `${Math.round(today.denivele)}m` } : null,
            today?.fcMoyenne ? { l: "FC moy", v: `${Math.round(today.fcMoyenne)} bpm` } : null,
          ].filter(Boolean).map((d,i) => (
            <div key={i}>
              <p style={{ fontSize: 10, color: C.g2, textTransform: "uppercase", letterSpacing: 1, margin: 0, fontWeight: 600 }}>{d.l}</p>
              <p style={{ fontSize: 18, color: C.white, fontWeight: 700, margin: "2px 0 0" }}>{d.v}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 14, gap: 6 }}>
          <span style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>Voir le détail</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
      ) : (
      <div style={{ background: C.card, borderRadius: 16, padding: 20, marginBottom: 16, border: `1px solid ${C.border}`, textAlign: "center" }}>
        <span style={{ fontSize: 10, color: C.g2, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Séance du jour</span>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.green, margin: "8px 0 0", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>REPOS</h2>
        <p style={{ fontSize: 13, color: C.g1, margin: "4px 0 0" }}>Pas de séance programmée aujourd'hui</p>
      </div>
      )}

      {/* Semaine — jours cliquables */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: C.white, margin: 0, textTransform: "uppercase", letterSpacing: 1.5 }}>Semaine {getWeekNumber(new Date())}</h3>
          <span style={{ fontSize: 11, color: C.g2 }}>{sessions.filter(s=>s.done && s.date && s.date <= todayDate).length}/{sessions.length} séances</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {sessions.map((s,i) => {
            const isCompleted = s.done && s.date && s.date <= todayDate;
            return (
            <div key={i} onClick={() => onNavigate("plan", i)} style={{ flex: 1, background: isCompleted ? (s.type==="run" ? "rgba(230,54,38,0.15)" : s.type==="force" ? C.blueSoft : C.greenSoft) : C.card, borderRadius: 10, padding: "10px 0", textAlign: "center", border: i===todayIdx ? `1.5px solid ${C.accent}` : `1px solid ${C.border}`, cursor: "pointer" }}>
              <p style={{ fontSize: 10, color: i===todayIdx ? C.accent : C.g2, fontWeight: 700, margin: 0, textTransform: "uppercase" }}>{s.jour}</p>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: isCompleted ? C.green : C.g3, margin: "6px auto 0" }} />
            </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: C.g2, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 1.5 }}>Bilan en cours</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { v: Math.round(sessions.reduce((a,s) => a + (s.distance||0), 0) * 10) / 10 || "—", l: "km" },
            { v: Math.round(sessions.reduce((a,s) => a + (s.denivele||0), 0)) || "—", l: "D+ (m)" },
            { v: (() => { const t = Math.round(sessions.reduce((a,s) => a + (s.duree||0), 0)); return t >= 60 ? `${Math.floor(t/60)}h${String(t%60).padStart(2,"0")}` : `${t}min`; })(), l: "Durée" },
          ].map((s,i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: 0 }}>{s.v}</p>
              <p style={{ fontSize: 10, color: C.g2, margin: "2px 0 0", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nutrition preview — cliquable */}
      <div onClick={() => onNavigate("nutrition")} style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: C.g2, margin: 0, textTransform: "uppercase", letterSpacing: 1.5 }}>Nutrition du jour</h3>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.white }}>{nutrition.calories} <span style={{ fontSize: 11, color: C.g2, fontWeight: 600 }}>kcal</span></span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <MacroBar label="Prot" value={nutrition.proteines} max={200} color={C.accent} />
          <MacroBar label="Gluc" value={nutrition.glucides} max={300} color={C.yellow} />
          <MacroBar label="Lip" value={nutrition.lipides} max={100} color={C.blue} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 14, gap: 6 }}>
          <span style={{ fontSize: 11, color: C.yellow, fontWeight: 600 }}>Voir le menu complet</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      {/* Mon ressenti */}
      <div style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, marginTop: 16 }}>
        <div onClick={() => setRessentiOpen(!ressentiOpen)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: C.g2, margin: 0, textTransform: "uppercase", letterSpacing: 1.5 }}>📋 Mon ressenti</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!ressentiOpen && (
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 11, color: fatigue<=4?C.green:fatigue<=6?C.yellow:C.accent, fontWeight: 700 }}>F:{fatigue}</span>
                <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>M:{motivation}</span>
                <span style={{ fontSize: 11, color: douleurs<=3?C.green:douleurs<=6?C.yellow:C.accent, fontWeight: 700 }}>D:{douleurs}</span>
              </div>
            )}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.g2} strokeWidth="2" style={{ transform: ressentiOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>

        {ressentiOpen && (
          <div style={{ marginTop: 16 }}>
            {saved && (
              <div style={{ background: `${C.green}22`, border: `1px solid ${C.green}44`, borderRadius: 10, padding: "8px 12px", marginBottom: 14, textAlign: "center" }}>
                <span style={{ color: C.green, fontSize: 12, fontWeight: 600 }}>✓ Ressenti sauvegardé</span>
              </div>
            )}

            {/* Fatigue */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: C.g1, fontWeight: 600 }}>Fatigue</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: fatigue<=4?C.green:fatigue<=6?C.yellow:C.accent, fontFamily: "'Bebas Neue',sans-serif" }}>{fatigue}<span style={{ fontSize: 11, color: C.g2 }}>/10</span></span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[1,2,3,4,5,6,7,8,9,10].map(v => (
                  <div key={v} onClick={() => setFatigue(v)} style={{
                    flex: 1, height: 28, borderRadius: 6, cursor: "pointer",
                    background: v <= fatigue ? (fatigue<=4 ? C.green : fatigue<=6 ? C.yellow : C.accent) : C.g3,
                    opacity: v <= fatigue ? 1 : 0.3,
                    transition: "all 0.15s",
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 9, color: C.g2 }}>Frais</span>
                <span style={{ fontSize: 9, color: C.g2 }}>Épuisé</span>
              </div>
            </div>

            {/* Motivation */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: C.g1, fontWeight: 600 }}>Motivation</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: C.green, fontFamily: "'Bebas Neue',sans-serif" }}>{motivation}<span style={{ fontSize: 11, color: C.g2 }}>/10</span></span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[1,2,3,4,5,6,7,8,9,10].map(v => (
                  <div key={v} onClick={() => setMotivation(v)} style={{
                    flex: 1, height: 28, borderRadius: 6, cursor: "pointer",
                    background: v <= motivation ? C.green : C.g3,
                    opacity: v <= motivation ? 1 : 0.3,
                    transition: "all 0.15s",
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 9, color: C.g2 }}>Basse</span>
                <span style={{ fontSize: 9, color: C.g2 }}>À bloc</span>
              </div>
            </div>

            {/* Douleurs */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: C.g1, fontWeight: 600 }}>Douleurs</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: douleurs<=3?C.green:douleurs<=6?C.yellow:C.accent, fontFamily: "'Bebas Neue',sans-serif" }}>{douleurs}<span style={{ fontSize: 11, color: C.g2 }}>/10</span></span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[1,2,3,4,5,6,7,8,9,10].map(v => (
                  <div key={v} onClick={() => setDouleurs(v)} style={{
                    flex: 1, height: 28, borderRadius: 6, cursor: "pointer",
                    background: v <= douleurs ? (douleurs<=3 ? C.green : douleurs<=6 ? C.yellow : C.accent) : C.g3,
                    opacity: v <= douleurs ? 1 : 0.3,
                    transition: "all 0.15s",
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 9, color: C.g2 }}>Aucune</span>
                <span style={{ fontSize: 9, color: C.g2 }}>Intense</span>
              </div>
            </div>

            {/* Bouton sauvegarder */}
            <button onClick={async () => {
              setSaving(true);
              setSaved(false);
              try {
                await onSaveEtat({ fatigue, motivation, douleurs });
                setSaved(true);
                setTimeout(() => { setSaved(false); setRessentiOpen(false); }, 2000);
              } catch (e) {
                alert("Erreur lors de la sauvegarde");
              }
              setSaving(false);
            }} disabled={saving} style={{
              width: "100%", padding: "12px 0", background: saving ? C.g3 : C.accent, border: "none",
              borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "wait" : "pointer",
              textTransform: "uppercase", letterSpacing: 1,
            }}>
              {saving ? "Sauvegarde..." : "Enregistrer mon ressenti"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ÉCRAN PLAN ──────────────────────────────────────

function PlanScreen({ sessions, initialSelected }) {
  const [selected, setSelected] = useState(null);
  
  // Quand on navigue depuis l'accueil, ouvrir la séance demandée
  useEffect(() => {
    if (initialSelected !== null && initialSelected !== undefined) {
      setSelected(initialSelected);
    }
  }, [initialSelected]);

  if (selected !== null) {
    const s = sessions[selected];
    return (
      <div style={{ padding: "0 20px 24px" }}>
        <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: C.g2, fontSize: 13, padding: 0, marginBottom: 16, cursor: "pointer" }}>← Retour au plan</button>
        <div style={{ background: `linear-gradient(135deg,${C.card} 0%,${s.type==="run"?"#1E1215":s.type==="force"?"#0E1525":"#0E1A18"} 100%)`, borderRadius: 16, padding: 20, border: `1px solid ${(s.type==="run"?C.accent:s.type==="force"?C.blue:C.green)+"33"}`, marginBottom: 16 }}>
          <span style={{ fontSize: 10, color: s.type==="run"?C.accent:s.type==="force"?C.blue:C.green, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>{s.jour}</span>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "6px 0 4px", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>{s.typeSeance}</h2>
          <p style={{ fontSize: 12, color: C.g1, margin: 0 }}>Objectif : {s.objectif}</p>
        </div>

        {(s.duree || s.distance || s.fcMoyenne) && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {s.duree && <div style={{ background: C.card, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}><span style={{ fontSize: 9, color: C.g2, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Durée</span><p style={{ fontSize: 16, fontWeight: 700, color: C.white, margin: "2px 0 0" }}>{Math.round(s.duree)} min</p></div>}
            {s.distance && <div style={{ background: C.card, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}><span style={{ fontSize: 9, color: C.g2, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Distance</span><p style={{ fontSize: 16, fontWeight: 700, color: C.white, margin: "2px 0 0" }}>{Math.round(s.distance * 10) / 10} km</p></div>}
            {s.denivele && <div style={{ background: C.card, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}><span style={{ fontSize: 9, color: C.g2, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>D+</span><p style={{ fontSize: 16, fontWeight: 700, color: C.white, margin: "2px 0 0" }}>{Math.round(s.denivele)}m</p></div>}
            {s.fcMoyenne && <div style={{ background: C.card, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}><span style={{ fontSize: 9, color: C.g2, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>FC moy</span><p style={{ fontSize: 16, fontWeight: 700, color: C.white, margin: "2px 0 0" }}>{Math.round(s.fcMoyenne)} bpm</p></div>}
          </div>
        )}

        {s.explication && s.explication.split("---").map((block, i) => {
          const trimmed = block.trim();
          if (!trimmed) return null;
          return (
            <div key={i} style={{ background: C.card, borderRadius: 12, padding: 16, marginBottom: 8, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 13, color: C.white, margin: 0, lineHeight: 1.6, whiteSpace: "pre-line" }}>{trimmed}</p>
            </div>
          );
        })}

        {(s.ressenti || s.fatigue) && (
          <div style={{ background: C.card, borderRadius: 12, padding: 16, marginTop: 8, border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
            {s.ressenti && <div><span style={{ fontSize: 11, fontWeight: 700, color: C.g2, textTransform: "uppercase", letterSpacing: 1 }}>Ressenti</span><p style={{ fontSize: 14, color: C.white, fontWeight: 600, margin: "2px 0 0" }}>{s.ressenti}</p></div>}
            {s.fatigue && <div style={{ textAlign: "right" }}><span style={{ fontSize: 11, fontWeight: 700, color: C.g2, textTransform: "uppercase", letterSpacing: 1 }}>Fatigue</span><p style={{ fontSize: 14, color: s.fatigue<=3?C.green:s.fatigue<=6?C.yellow:C.accent, fontWeight: 700, margin: "2px 0 0" }}>{s.fatigue}/10</p></div>}
          </div>
        )}

        {s.commentaire && (
          <div style={{ background: C.card, borderRadius: 12, padding: 16, marginTop: 8, border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.g2, textTransform: "uppercase", letterSpacing: 1 }}>Commentaire</span>
            <p style={{ fontSize: 13, color: C.white, margin: "4px 0 0", lineHeight: 1.6 }}>{s.commentaire}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "0 20px 24px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.white, margin: 0, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>PLAN {sessions[0]?.semaine ? sessions[0].semaine.toUpperCase() : `SEMAINE ${getWeekNumber(new Date()) + 1}`}</h1>
        <p style={{ fontSize: 13, color: C.g2, margin: "4px 0 0" }}>Programme à venir</p>
      </div>
      {sessions.map((s, i) => (
        <div key={i} onClick={() => setSelected(i)} style={{ background: C.card, borderRadius: 14, padding: "16px 18px", marginBottom: 8, border: `1px solid ${i===5?C.accent+"44":C.border}`, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: s.type==="run"?"rgba(230,54,38,0.12)":s.type==="force"?C.blueSoft:C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            {s.type==="run"?"🏔️":s.type==="force"?"💪":"🌿"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: C.g2, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{s.jour}</span>
              {false && <span style={{ fontSize: 9, background: C.accent, color: "#fff", padding: "2px 6px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Aujourd'hui</span>}
            </div>
            <p style={{ fontSize: 15, color: C.white, fontWeight: 700, margin: "3px 0 0" }}>{s.nom}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {s.done && <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ÉCRAN NUTRITION ─────────────────────────────────

function NutritionScreen({ nutrition }) {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedSupplement, setSelectedSupplement] = useState(null);

  // Base de connaissances suppléments
  const supplementInfo = {
    "whey protein": { color: "#E63626", benefits: "Favorise la synthèse protéique musculaire après l'effort. Accélère la récupération en apportant des acides aminés rapidement assimilables. Idéale dans les 30 minutes suivant une séance intense.", dosage: "25-30g dans un shaker avec de l'eau ou du lait végétal.", timing: "Après la séance" },
    "créatine": { color: "#4A9EFF", benefits: "Augmente les réserves de phosphocréatine dans les muscles, permettant des efforts explosifs plus longs. Améliore la force, la puissance et l'endurance musculaire. Effet prouvé scientifiquement sur la performance.", dosage: "3-5g par jour, tous les jours (pas besoin de phase de charge).", timing: "Avant la séance ou le matin" },
    "oméga-3": { color: "#2DD4A0", benefits: "Propriétés anti-inflammatoires puissantes — réduit les douleurs articulaires et musculaires. Soutient la santé cardiovasculaire et améliore la récupération. Favorise aussi la concentration et la santé cérébrale.", dosage: "2-3g d'EPA/DHA combinés par jour.", timing: "Le matin avec le petit-déjeuner" },
    "magnésium bisglycinate": { color: "#F5A623", benefits: "Réduit les crampes et la tension musculaire. Améliore la qualité du sommeil et favorise la relaxation nerveuse. La forme bisglycinate est la mieux absorbée et la plus douce pour l'estomac.", dosage: "300-400mg le soir avant le coucher.", timing: "Le soir" },
    "magnésium": { color: "#F5A623", benefits: "Réduit les crampes et la tension musculaire. Améliore la qualité du sommeil et favorise la relaxation nerveuse. Essentiel pour la récupération après des efforts intenses.", dosage: "300-400mg le soir avant le coucher.", timing: "Le soir" },
    "collagène": { color: "#FF6B5A", benefits: "Renforce les tendons, ligaments et cartilages — crucial en OCR où les articulations sont très sollicitées. Prévient les blessures et accélère la guérison des tissus conjonctifs. Améliore aussi l'élasticité de la peau.", dosage: "10-15g par jour avec de la vitamine C pour optimiser l'absorption.", timing: "Avant le coucher" },
    "multivitamines": { color: "#B8B8BF", benefits: "Comble les carences possibles dues à un entraînement intensif. Soutient le système immunitaire et l'énergie globale. Apporte les micronutriments que l'alimentation seule ne couvre pas toujours.", dosage: "1 comprimé par jour.", timing: "Après le déjeuner" },
    "ashwagandha": { color: "#9B59B6", benefits: "Adaptogène puissant qui aide à réguler le cortisol (hormone du stress). Favorise la récupération nerveuse après des entraînements intenses. Améliore la qualité du sommeil et réduit l'anxiété.", dosage: "300-600mg d'extrait standardisé.", timing: "Le soir" },
    "vitamine d": { color: "#F5A623", benefits: "Essentielle pour la santé osseuse et la force musculaire. Renforce le système immunitaire, surtout en hiver. La majorité des sportifs en sont carencés.", dosage: "2000-4000 UI par jour.", timing: "Le matin avec un repas gras" },
    "bcaa": { color: "#4A9EFF", benefits: "Acides aminés à chaîne ramifiée qui réduisent la fatigue pendant l'effort et limitent la dégradation musculaire. Utiles pendant les séances longues de trail.", dosage: "5-10g pendant ou après l'entraînement.", timing: "Pendant la séance" },
    "caféine": { color: "#E63626", benefits: "Améliore la vigilance, réduit la perception de la fatigue et augmente la performance en endurance. Effet prouvé sur les performances en course à pied et en OCR.", dosage: "3-6mg par kg de poids de corps, 30-60 min avant l'effort.", timing: "Avant la séance" },
    "zinc": { color: "#B8B8BF", benefits: "Soutient le système immunitaire et la récupération. Joue un rôle dans la synthèse de testostérone et la réparation tissulaire.", dosage: "15-30mg par jour.", timing: "Le soir" },
    "fer": { color: "#E63626", benefits: "Essentiel pour le transport de l'oxygène dans le sang. Les sportifs d'endurance ont des besoins accrus en fer. Une carence entraîne fatigue et baisse de performance.", dosage: "Selon bilan sanguin. Ne pas supplémenter sans avis médical.", timing: "Le matin à jeun" },
  };

  function getSupplementDetail(name) {
    const key = Object.keys(supplementInfo).find(k => name.toLowerCase().includes(k));
    return key ? supplementInfo[key] : { color: "#B8B8BF", benefits: "Complément alimentaire qui soutient ta performance et ta récupération sportive.", dosage: "Selon les recommandations du fabricant.", timing: "Selon les recommandations" };
  }

  // Vue détail d'un supplément
  if (selectedSupplement !== null) {
    const s = nutrition.supplements[selectedSupplement];
    const detail = getSupplementDetail(s.name);
    return (
      <div style={{ padding: "0 20px 24px" }}>
        <button onClick={() => setSelectedSupplement(null)} style={{ background: "none", border: "none", color: C.g2, fontSize: 13, padding: 0, marginBottom: 16, cursor: "pointer" }}>← Retour à la nutrition</button>

        <div style={{
          background: `linear-gradient(135deg,${C.card} 0%,${detail.color}11 100%)`,
          borderRadius: 16, padding: 20, marginBottom: 16,
          border: `1px solid ${detail.color}33`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: `${detail.color}20`, borderRadius: "50%", filter: "blur(30px)" }} />
          <div style={{ position: "relative" }}>
            <span style={{ fontSize: 36 }}>{s.icon}</span>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "8px 0 4px", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>{s.name.toUpperCase()}</h2>
            <div style={{ display: "inline-block", background: `${detail.color}22`, borderRadius: 8, padding: "4px 10px", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: detail.color, fontWeight: 700 }}>⏱ {s.timing}</span>
            </div>
          </div>
        </div>

        <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 8, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>💪</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.g1, textTransform: "uppercase", letterSpacing: 1.5 }}>Bienfaits</span>
          </div>
          <p style={{ fontSize: 13, color: C.white, margin: 0, lineHeight: 1.7 }}>{detail.benefits}</p>
        </div>

        <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 8, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>💊</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.g1, textTransform: "uppercase", letterSpacing: 1.5 }}>Dosage recommandé</span>
          </div>
          <p style={{ fontSize: 13, color: C.white, margin: 0, lineHeight: 1.7 }}>{detail.dosage}</p>
        </div>

        <div style={{ background: C.card, borderRadius: 14, padding: 18, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>⏰</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.g1, textTransform: "uppercase", letterSpacing: 1.5 }}>Quand le prendre</span>
          </div>
          <p style={{ fontSize: 13, color: C.white, margin: 0, lineHeight: 1.7 }}>{detail.timing}</p>
        </div>
      </div>
    );
  }

  // Vue détail d'un repas
  if (selectedMeal !== null) {
    const m = nutrition.meals[selectedMeal];
    return (
      <div style={{ padding: "0 20px 24px" }}>
        <button onClick={() => setSelectedMeal(null)} style={{ background: "none", border: "none", color: C.g2, fontSize: 13, padding: 0, marginBottom: 16, cursor: "pointer" }}>← Retour à la nutrition</button>

        {/* Header du repas */}
        <div style={{
          background: `linear-gradient(135deg,${C.card} 0%,#18140E 100%)`,
          borderRadius: 16, padding: 20, marginBottom: 16,
          border: `1px solid ${C.yellow}33`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: "rgba(245,166,35,0.2)", borderRadius: "50%", filter: "blur(30px)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{m.icon}</span>
              <div>
                <span style={{ fontSize: 10, color: C.yellow, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>{m.titre}</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.white, margin: "4px 0 0", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>{m.nom}</h2>
              </div>
            </div>
            {(m.kcal || m.p || m.g || m.l) && (
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                {m.kcal && <span style={{ fontSize: 13, color: C.white, fontWeight: 700 }}>{m.kcal} <span style={{ color: C.g2, fontWeight: 500 }}>kcal</span></span>}
                {m.p && <span style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>{m.p}g P</span>}
                {m.g && <span style={{ fontSize: 13, color: C.yellow, fontWeight: 600 }}>{m.g}g G</span>}
                {m.l && <span style={{ fontSize: 13, color: C.blue, fontWeight: 600 }}>{m.l}g L</span>}
              </div>
            )}
          </div>
        </div>

        {/* Ingrédients */}
        {m.ingredients && (
          <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 8, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>🥘</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.g1, textTransform: "uppercase", letterSpacing: 1.5 }}>Ingrédients</span>
            </div>
            <p style={{ fontSize: 13, color: C.white, margin: 0, lineHeight: 1.7 }}>{m.ingredients}</p>
          </div>
        )}

        {/* Recette */}
        {m.recette && (
          <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 8, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>👨‍🍳</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.g1, textTransform: "uppercase", letterSpacing: 1.5 }}>Recette</span>
            </div>
            <p style={{ fontSize: 13, color: C.white, margin: 0, lineHeight: 1.7, whiteSpace: "pre-line" }}>{m.recette}</p>
          </div>
        )}

        {/* Contenu brut si pas de recette structurée */}
        {!m.recette && m.contenuBrut && (
          <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 8, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>📋</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.g1, textTransform: "uppercase", letterSpacing: 1.5 }}>Détail</span>
            </div>
            <p style={{ fontSize: 13, color: C.white, margin: 0, lineHeight: 1.7, whiteSpace: "pre-line" }}>{m.contenuBrut}</p>
          </div>
        )}
      </div>
    );
  }

  // Vue liste principale
  return (
    <div style={{ padding: "0 20px 24px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.white, margin: 0, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>NUTRITION</h1>
        <p style={{ fontSize: 13, color: C.g2, margin: "4px 0 0" }}>{nutrition.titre || "Menu du jour"}</p>
      </div>

      <div style={{ background: `linear-gradient(135deg,${C.card} 0%,#18140E 100%)`, borderRadius: 16, padding: 20, marginBottom: 16, border: `1px solid ${C.yellow}22` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <span style={{ fontSize: 10, color: C.yellow, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Objectif calorique</span>
            <p style={{ fontSize: 32, fontWeight: 800, color: C.white, margin: "4px 0 0", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>{(nutrition.calories || 0).toLocaleString()} <span style={{ fontSize: 14, color: C.g2 }}>KCAL</span></p>
          </div>
          <CircularProgress value={75} max={100} size={56} color={C.yellow} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <MacroBar label="Protéines" value={nutrition.proteines || 0} max={200} color={C.accent} />
          <MacroBar label="Glucides" value={nutrition.glucides || 0} max={300} color={C.yellow} />
          <MacroBar label="Lipides" value={nutrition.lipides || 0} max={100} color={C.blue} />
        </div>
      </div>

      {nutrition.meals.map((m, i) => (
        <div key={i} onClick={() => setSelectedMeal(i)} style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 8, border: `1px solid ${C.border}`, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{m.icon}</span>
              <div>
                <span style={{ fontSize: 10, color: C.g2, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{m.titre}</span>
                <p style={{ fontSize: 15, color: C.white, fontWeight: 700, margin: "2px 0 0" }}>{m.nom}</p>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          {m.ingredients && <p style={{ fontSize: 12, color: C.g1, margin: "0 0 10px", lineHeight: 1.5 }}>{m.ingredients.length > 80 ? m.ingredients.substring(0, 80) + "..." : m.ingredients}</p>}
          <div style={{ display: "flex", gap: 16 }}>
            {m.kcal && <span style={{ fontSize: 11, color: C.white, fontWeight: 700 }}>{m.kcal} <span style={{ color: C.g2, fontWeight: 500 }}>kcal</span></span>}
            {m.p && <span style={{ fontSize: 11, color: C.accent }}>{m.p}g P</span>}
            {m.g && <span style={{ fontSize: 11, color: C.yellow }}>{m.g}g G</span>}
            {m.l && <span style={{ fontSize: 11, color: C.blue }}>{m.l}g L</span>}
          </div>
        </div>
      ))}

      <div style={{ background: C.card, borderRadius: 14, padding: 18, marginTop: 8, border: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, color: C.g2, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 1.5 }}>💊 Supplémentation</h3>
        {nutrition.supplements.map((s, i) => (
          <div key={i} onClick={() => setSelectedSupplement(i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < nutrition.supplements.length-1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <span style={{ fontSize: 13, color: C.white, fontWeight: 600 }}>{s.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: C.g2 }}>{s.timing}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ÉCRAN BILAN ─────────────────────────────────────

function BilanScreen({ sessions, etat, bilan }) {
  const intensities = sessions.map(s => s.intensity);
  const maxI = Math.max(...intensities, 1);
  const weekNum = getWeekNumber(new Date());
  
  // Stats dynamiques depuis les séances
  const totalKm = Math.round(sessions.reduce((a,s) => a + (s.distance||0), 0) * 10) / 10;
  const totalD = Math.round(sessions.reduce((a,s) => a + (s.denivele||0), 0));
  const totalMin = Math.round(sessions.reduce((a,s) => a + (s.duree||0), 0));
  const totalDuree = totalMin >= 60 ? `${Math.floor(totalMin/60)}h${String(totalMin%60).padStart(2,"0")}` : `${totalMin}min`;
  const avgFC = sessions.filter(s=>s.fcMoyenne).length > 0 ? Math.round(sessions.filter(s=>s.fcMoyenne).reduce((a,s) => a + s.fcMoyenne, 0) / sessions.filter(s=>s.fcMoyenne).length) : 0;

  // Parse le contenu du bilan Notion en paragraphes
  const bilanParagraphs = (bilan?.contenu || bilan?.bilan || "").split("\n").filter(l => l.trim().length > 0);

  return (
    <div style={{ padding: "0 20px 24px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.white, margin: 0, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>BILAN HEBDO</h1>
        <p style={{ fontSize: 13, color: C.g2, margin: "4px 0 0" }}>Bilan de la semaine écoulée</p>
      </div>

      <div style={{ background: `linear-gradient(135deg,${C.card} 0%,#0E1A12 100%)`, borderRadius: 16, padding: 20, marginBottom: 16, border: `1px solid ${C.green}22`, display: "flex", alignItems: "center", gap: 20 }}>
        <CircularProgress value={etat.motivation * 10 || 78} max={100} size={72} stroke={5} color={C.green} />
        <div>
          <span style={{ fontSize: 10, color: C.green, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Score forme</span>
          <p style={{ fontSize: 28, fontWeight: 800, color: C.white, margin: "4px 0 2px", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>{etat.motivation * 10 || 78}/100</p>
          <p style={{ fontSize: 12, color: C.g1, margin: 0 }}>{etat.fatigue <= 4 ? "OK pour augmenter l'intensité" : etat.fatigue <= 6 ? "Maintenir le rythme actuel" : "Semaine de décharge recommandée"}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[ {l:"Volume",v:`${totalKm} km`,c:C.accent,i:"🏔️"}, {l:"Dénivelé",v:`${totalD} m D+`,c:C.yellow,i:"📈"}, {l:"Durée totale",v:totalDuree,c:C.blue,i:"⏱️"}, {l:"FC moyenne",v:avgFC ? `${avgFC} bpm` : "—",c:C.accentSoft,i:"❤️"} ].map((s,i) => (
          <div key={i} style={{ background: C.card, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>{s.i}</span>
              <span style={{ fontSize: 10, color: C.g2, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{s.l}</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: s.c, margin: 0 }}>{s.v}</p>
          </div>
        ))}
      </div>

      <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 16, border: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, color: C.g2, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 1.5 }}>Charge d'intensité</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
          {intensities.map((v,i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", height: `${(v/maxI)*70}px`, background: v>85 ? `linear-gradient(180deg,${C.accent},${C.accent}88)` : v<30 ? `linear-gradient(180deg,${C.green},${C.green}88)` : `linear-gradient(180deg,${C.yellow},${C.yellow}88)`, borderRadius: 4, transition: "height 0.8s ease" }} />
              <span style={{ fontSize: 9, color: C.g2, fontWeight: 600 }}>{sessions[i]?.jour || ""}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: 14, padding: 18, border: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(230,54,38,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: 1.5 }}>Analyse du coach IA</span>
        </div>
        <div style={{ fontSize: 13, color: C.g1, lineHeight: 1.7 }}>
          {bilanParagraphs.length > 0 ? (
            bilanParagraphs.map((line, i) => {
              const isTitle = line.startsWith("**") || line.startsWith("###");
              const cleaned = line.replace(/\*\*/g, "").replace(/###\s*/g, "").trim();
              if (isTitle) return <p key={i} style={{ margin: "12px 0 4px", color: C.white, fontWeight: 700, fontSize: 14 }}>{cleaned}</p>;
              return <p key={i} style={{ margin: "0 0 8px" }}>{cleaned}</p>;
            })
          ) : (
            <>
              <p style={{ margin: "0 0 10px" }}><strong style={{ color: C.white }}>Volume</strong> — {totalKm} km avec {totalD}m D+ sur {totalDuree}.</p>
              <p style={{ margin: "0 0 10px" }}><strong style={{ color: C.white }}>FC moyenne</strong> — {avgFC ? `${avgFC} bpm sur les séances réalisées.` : "Pas de données FC cette semaine."}</p>
              <p style={{ margin: 0 }}><strong style={{ color: C.green }}>→ Connecte la base Bilan dans Notion</strong> pour voir l'analyse complète du coach IA.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ÉCRAN PROFIL ────────────────────────────────────

function ProfileScreen() {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profil, setProfil] = useState({
    nom: "", age: "", poids: "", taille: "", objectif: "Spartan Beast",
    experienceOCR: "Intermédiaire", metabolismeBase: "", frequence: "5 séances/semaine",
    allergies: "", montre: "Garmin", ville: "",
  });

  // Charger le profil au montage
  useEffect(() => {
    async function loadProfil() {
      try {
        const res = await fetch("/api/profil");
        const data = await res.json();
        if (data.success && data.data) {
          setProfil({
            nom: data.data.nom || "",
            age: data.data.age || "",
            poids: data.data.poids || "",
            taille: data.data.taille || "",
            objectif: data.data.objectif || "Spartan Beast",
            experienceOCR: data.data.experienceOCR || "Intermédiaire",
            metabolismeBase: data.data.metabolismeBase || "",
            frequence: data.data.frequence || "5 séances/semaine",
            allergies: data.data.allergies || "",
            montre: data.data.montre || "Garmin",
            ville: data.data.ville || "",
          });
        }
      } catch (e) {
        console.log("Profil: mode démo");
      }
    }
    loadProfil();
  }, []);

  // Sauvegarder le profil
  async function saveProfil() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profil),
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert("Erreur lors de la sauvegarde");
    }
    setSaving(false);
  }

  function update(field, value) {
    setProfil(prev => ({ ...prev, [field]: value }));
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px", background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 10, color: C.white, fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif",
  };

  const selectStyle = { ...inputStyle, appearance: "none", WebkitAppearance: "none" };

  const labelStyle = {
    fontSize: 11, color: C.g2, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: 1, marginBottom: 6, display: "block",
  };

  // Calcul automatique du métabolisme de base (Harris-Benedict)
  const calculerMB = () => {
    if (profil.poids && profil.taille && profil.age) {
      const mb = Math.round(88.362 + (13.397 * profil.poids) + (4.799 * profil.taille) - (5.677 * profil.age));
      update("metabolismeBase", mb);
    }
  };

  if (editing) {
    return (
      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.white, margin: 0, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>MODIFIER PROFIL</h1>
          <button onClick={() => setEditing(false)} style={{ background: "none", border: "none", color: C.g2, fontSize: 13, cursor: "pointer" }}>Annuler</button>
        </div>

        {/* Identité */}
        <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 12, border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: C.accent, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 1.5 }}>👤 Identité</h3>
          
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Prénom</label>
            <input style={inputStyle} value={profil.nom} onChange={e => update("nom", e.target.value)} placeholder="Ton prénom" />
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Âge</label>
              <input style={inputStyle} type="number" value={profil.age} onChange={e => update("age", e.target.value)} placeholder="41" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Ville</label>
              <input style={inputStyle} value={profil.ville} onChange={e => update("ville", e.target.value)} placeholder="Metz" />
            </div>
          </div>
        </div>

        {/* Mensurations */}
        <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 12, border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: C.yellow, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 1.5 }}>📏 Mensurations</h3>
          
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Poids (kg)</label>
              <input style={inputStyle} type="number" value={profil.poids} onChange={e => update("poids", e.target.value)} placeholder="80" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Taille (cm)</label>
              <input style={inputStyle} type="number" value={profil.taille} onChange={e => update("taille", e.target.value)} placeholder="178" />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Métabolisme de base (kcal)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} type="number" value={profil.metabolismeBase} onChange={e => update("metabolismeBase", e.target.value)} placeholder="1850" />
              <button onClick={calculerMB} style={{ background: C.accent, border: "none", borderRadius: 10, padding: "0 14px", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>Auto</button>
            </div>
            <p style={{ fontSize: 10, color: C.g2, margin: "4px 0 0" }}>Clique "Auto" pour calculer depuis ton âge, poids et taille</p>
          </div>
        </div>

        {/* Objectifs sportifs */}
        <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 12, border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: C.green, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 1.5 }}>🎯 Objectifs sportifs</h3>
          
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Objectif course</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Spartan Sprint", "Spartan Super", "Spartan Beast", "Spartan Ultra", "Trail court", "Trail long", "Ultra-trail"].map(opt => (
                <button key={opt} onClick={() => update("objectif", opt)} style={{
                  padding: "8px 14px", borderRadius: 8, border: `1px solid ${profil.objectif === opt ? C.accent : C.border}`,
                  background: profil.objectif === opt ? `${C.accent}22` : C.card,
                  color: profil.objectif === opt ? C.accent : C.g1, fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>{opt}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Expérience OCR</label>
            <div style={{ display: "flex", gap: 6 }}>
              {["Débutant", "Intermédiaire", "Confirmé", "Expert"].map(opt => (
                <button key={opt} onClick={() => update("experienceOCR", opt)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${profil.experienceOCR === opt ? C.blue : C.border}`,
                  background: profil.experienceOCR === opt ? `${C.blue}22` : C.card,
                  color: profil.experienceOCR === opt ? C.blue : C.g1, fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "center",
                }}>{opt}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Fréquence d'entraînement</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["3 séances/semaine", "4 séances/semaine", "5 séances/semaine", "6 séances/semaine", "7 séances/semaine"].map(opt => (
                <button key={opt} onClick={() => update("frequence", opt)} style={{
                  padding: "8px 12px", borderRadius: 8, border: `1px solid ${profil.frequence === opt ? C.green : C.border}`,
                  background: profil.frequence === opt ? `${C.green}22` : C.card,
                  color: profil.frequence === opt ? C.green : C.g1, fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>{opt}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrition & Équipement */}
        <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 12, border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: C.blue, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 1.5 }}>🍽️ Nutrition & Équipement</h3>
          
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Allergies / Régime alimentaire</label>
            <input style={inputStyle} value={profil.allergies} onChange={e => update("allergies", e.target.value)} placeholder="Aucune, sans gluten, végétarien..." />
          </div>
          <div>
            <label style={labelStyle}>Montre connectée</label>
            <div style={{ display: "flex", gap: 6 }}>
              {["Garmin", "Apple Watch", "Suunto", "Coros", "Polar", "Autre"].map(opt => (
                <button key={opt} onClick={() => update("montre", opt)} style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${profil.montre === opt ? C.yellow : C.border}`,
                  background: profil.montre === opt ? `${C.yellow}22` : C.card,
                  color: profil.montre === opt ? C.yellow : C.g1, fontSize: 11, fontWeight: 600, cursor: "pointer", textAlign: "center",
                }}>{opt}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Bouton sauvegarder */}
        <button onClick={saveProfil} disabled={saving} style={{
          width: "100%", padding: "16px 0", background: saving ? C.g3 : C.accent, border: "none", borderRadius: 14,
          color: "#fff", fontSize: 16, fontWeight: 800, cursor: saving ? "wait" : "pointer",
          fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, textTransform: "uppercase",
        }}>
          {saving ? "Sauvegarde en cours..." : "Sauvegarder le profil"}
        </button>
      </div>
    );
  }

  // Vue lecture
  return (
    <div style={{ padding: "0 20px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},#FF6B5A)`, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#fff", fontFamily: "'Bebas Neue',sans-serif" }}>{(profil.nom || "?")[0].toUpperCase()}</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: 0, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>{(profil.nom || "Mon profil").toUpperCase()}</h2>
        <p style={{ fontSize: 13, color: C.g2, margin: "4px 0 0" }}>{profil.experienceOCR ? `Athlète OCR ${profil.experienceOCR}` : "Athlète OCR"}{profil.ville ? ` — ${profil.ville}` : ""}</p>
      </div>

      {saved && (
        <div style={{ background: `${C.green}22`, border: `1px solid ${C.green}44`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, textAlign: "center" }}>
          <span style={{ color: C.green, fontSize: 13, fontWeight: 600 }}>✓ Profil sauvegardé avec succès</span>
        </div>
      )}

      <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 12, border: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, color: C.g2, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 1.5 }}>Profil athlète</h3>
        {[
          { l: "Objectif", v: profil.objectif || "—" },
          { l: "Âge", v: profil.age ? `${profil.age} ans` : "—" },
          { l: "Poids", v: profil.poids ? `${profil.poids} kg` : "—" },
          { l: "Taille", v: profil.taille ? `${profil.taille} cm` : "—" },
          { l: "Expérience OCR", v: profil.experienceOCR || "—" },
          { l: "Fréquence", v: profil.frequence || "—" },
          { l: "Métabolisme de base", v: profil.metabolismeBase ? `${profil.metabolismeBase} kcal` : "—" },
          { l: "Montre", v: profil.montre || "—" },
          { l: "Allergies", v: profil.allergies || "Aucune" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 8 ? `1px solid ${C.border}` : "none" }}>
            <span style={{ fontSize: 13, color: C.g1 }}>{item.l}</span>
            <span style={{ fontSize: 13, color: C.white, fontWeight: 600 }}>{item.v}</span>
          </div>
        ))}
      </div>

      <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 12, border: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, color: C.g2, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 1.5 }}>Connexions</h3>
        {[
          { n: "Strava", s: "Connecté", c: C.green },
          { n: "Garmin Connect", s: "Connecté", c: C.green },
          { n: "Apple Health", s: "Non connecté", c: C.g2 },
        ].map((c, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
            <span style={{ fontSize: 13, color: C.white }}>{c.n}</span>
            <span style={{ fontSize: 11, color: c.c, fontWeight: 600 }}>{c.s}</span>
          </div>
        ))}
      </div>

      {/* Bouton modifier */}
      <button onClick={() => setEditing(true)} style={{
        width: "100%", padding: "14px 0", background: "none", border: `2px solid ${C.accent}`,
        borderRadius: 14, color: C.accent, fontSize: 14, fontWeight: 800, cursor: "pointer",
        fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12,
      }}>
        Modifier mon profil
      </button>

      <div style={{ background: `linear-gradient(135deg,${C.accent}15,${C.card})`, borderRadius: 14, padding: 18, border: `1px solid ${C.accent}22`, textAlign: "center" }}>
        <p style={{ fontSize: 10, color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, margin: "0 0 4px" }}>Spartan Intelligence</p>
        <p style={{ fontSize: 11, color: C.g2, margin: 0 }}>v1.0 — Powered by AI</p>
      </div>
    </div>
  );
}

// ─── APPLICATION PRINCIPALE ──────────────────────────

export default function Home() {
  const [tab, setTab] = useState(0);
  const [sessions, setSessions] = useState(DEMO_SESSIONS);
  const [nutrition, setNutrition] = useState(DEMO_NUTRITION);
  const [etat, setEtat] = useState(DEMO_ETAT);
  const [isLive, setIsLive] = useState(false);
  const [planSelected, setPlanSelected] = useState(null);
  const [bilan, setBilan] = useState(null);
  const [planSessions, setPlanSessions] = useState(DEMO_SESSIONS);

  // Navigation depuis l'accueil
  function handleNavigate(target, index) {
    if (target === "plan") {
      setPlanSelected(index !== undefined ? index : null);
      setTab(1);
    } else if (target === "nutrition") {
      setTab(2);
    } else if (target === "bilan") {
      setTab(3);
    }
  }

  // Transforme les données Notion en format compatible avec l'UI
  function mapNotionSessions(notionData) {
    const jourMap = {
      "lundi": "Lun", "mardi": "Mar", "mercredi": "Mer",
      "jeudi": "Jeu", "vendredi": "Ven", "samedi": "Sam", "dimanche": "Dim",
      "monday": "Lun", "tuesday": "Mar", "wednesday": "Mer",
      "thursday": "Jeu", "friday": "Ven", "saturday": "Sam", "sunday": "Dim",
    };
    const typeMap = { "Run": "run", "WeightTraining": "force", "Hiking": "rest" };

    return notionData.map((s) => ({
      ...s,
      jour: jourMap[(s.jour || "").toLowerCase()] || s.jour || "?",
      type: typeMap[s.type] || (s.type ? "force" : "rest"),
      done: (s.statut || "").toLowerCase() === "fait",
      intensity: s.fatigue ? s.fatigue * 10 : (s.fcMoyenne ? Math.round((s.fcMoyenne / 180) * 100) : 50),
      typeSeance: (s.nom || "").toUpperCase(),
      objectif: "",
    }));
  }

  // Parse le contenu texte de la page Nutrition Notion en repas structurés
  function parseNutritionContent(contenu) {
    if (!contenu) return { meals: [], supplements: [], calories: 0, proteines: 0, glucides: 0, lipides: 0 };

    const lines = contenu.split("\n").filter(Boolean);
    let meals = [];
    let supplements = [];
    let calories = 0, proteines = 0, glucides = 0, lipides = 0;
    let currentMeal = null;
    let currentSection = null;

    for (const line of lines) {
      // Parse macros ligne : "Calories : 2450 kcal | P : 180g | G : 250g | L : 85g"
      if (line.includes("Calories") && line.includes("kcal")) {
        const calMatch = line.match(/Calories\s*:\s*(\d+)/);
        const pMatch = line.match(/P\s*:\s*(\d+)/);
        const gMatch = line.match(/G\s*:\s*(\d+)/);
        const lMatch = line.match(/L\s*:\s*(\d+)/);
        if (calMatch) calories = parseInt(calMatch[1]);
        if (pMatch) proteines = parseInt(pMatch[1]);
        if (gMatch) glucides = parseInt(gMatch[1]);
        if (lMatch) lipides = parseInt(lMatch[1]);
        continue;
      }

      // Détecte un repas : "🍳 Déjeuner" ou "🍖 Dîner" ou "Déjeuner" etc.
      const mealMatch = line.match(/^(🍳|🥣|🍖|🥗|🍽️|🌅)?\s*(Petit[ -]?déjeuner|Déjeuner|Dîner|Collation|Snack)/i);
      if (mealMatch) {
        if (currentMeal) meals.push(currentMeal);
        const titre = mealMatch[2];
        const iconMap = { "déjeuner": "🍳", "dîner": "🍖", "petit-déjeuner": "🥣", "petit déjeuner": "🥣", "collation": "🥗", "snack": "🥗" };
        currentMeal = {
          icon: mealMatch[1] || iconMap[titre.toLowerCase()] || "🍽️",
          titre: titre,
          nom: "",
          ingredients: "",
          recette: "",
          contenuBrut: "",
        };
        currentSection = "meal";
        continue;
      }

      // Détecte la supplémentation
      if (line.includes("Supplémentation") || line.includes("supplémentation")) {
        if (currentMeal) { meals.push(currentMeal); currentMeal = null; }
        currentSection = "supplements";
        continue;
      }

      // Parse le contenu selon la section
      if (currentSection === "supplements") {
        // Parse "1. **Whey Protein** : Après la séance - Pour..." ou "**Créatine** : Avant..."
        const suppMatch = line.match(/\*?\*?(\w[\w\s-]+\w)\*?\*?\s*:\s*(.+)/);
        if (suppMatch) {
          const name = suppMatch[1].replace(/\*/g, "").trim();
          const rest = suppMatch[2].trim();
          const timingMatch = rest.match(/^([\w\s']+?)(?:\s*[-–]\s*|$)/);
          const iconMap2 = { "whey": "🥤", "créatine": "⚡", "oméga": "🐟", "magnésium": "💊", "collagène": "🦴", "multivitamine": "💊", "ashwagandha": "🌿", "vitamine": "💊" };
          const iconKey = Object.keys(iconMap2).find(k => name.toLowerCase().includes(k));
          supplements.push({
            name: name,
            timing: timingMatch ? timingMatch[1].trim() : rest.split("-")[0].trim(),
            icon: iconKey ? iconMap2[iconKey] : "💊",
          });
        }
        continue;
      }

      if (currentMeal) {
        // Nom du plat : ligne en **gras** ou première ligne après le titre du repas
        if (line.includes("**") && !currentMeal.nom) {
          currentMeal.nom = line.replace(/\*/g, "").trim();
          continue;
        }
        if (!currentMeal.nom && line.trim().length > 3 && !line.startsWith("-")) {
          currentMeal.nom = line.replace(/\*/g, "").trim();
          continue;
        }
        // Ingrédients (peut être sur plusieurs lignes)
        if (line.toLowerCase().includes("ingrédient")) {
          const content = line.replace(/^-\s*/, "").replace(/^Ingrédients?\s*:\s*/i, "").trim();
          currentMeal.ingredients = currentMeal.ingredients ? currentMeal.ingredients + " " + content : content;
          currentMeal._lastField = "ingredients";
          continue;
        }
        // Recette (peut être sur plusieurs lignes)
        if (line.toLowerCase().includes("recette")) {
          const content = line.replace(/^-\s*/, "").replace(/^Recette\s*:\s*/i, "").trim();
          currentMeal.recette = currentMeal.recette ? currentMeal.recette + " " + content : content;
          currentMeal._lastField = "recette";
          continue;
        }
        // Continuation de la dernière section (ligne qui ne commence pas par un marqueur)
        if (currentMeal._lastField && line.trim().length > 0 && !line.startsWith("-") && !line.includes("**")) {
          currentMeal[currentMeal._lastField] += " " + line.trim();
          continue;
        }
        // Ligne avec tiret = potentielle continuation d'ingrédients ou nouvelle info
        if (line.startsWith("-") && currentMeal._lastField) {
          const content = line.replace(/^-\s*/, "").trim();
          currentMeal[currentMeal._lastField] += " " + content;
          continue;
        }
        // Tout le reste va dans contenuBrut
        currentMeal._lastField = null;
        currentMeal.contenuBrut += line + "\n";
      }
    }
    if (currentMeal) meals.push(currentMeal);

    // Nettoyer les propriétés internes
    meals = meals.map(m => { const { _lastField, ...rest } = m; return rest; });

    return { meals, supplements, calories, proteines, glucides, lipides };
  }

  // Essaie de charger les données depuis Notion au démarrage
  useEffect(() => {
    async function loadData() {
      try {
        // Charger les séances de la semaine en cours (pour accueil + bilan)
        const res = await fetch("/api/seances");
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          const mapped = mapNotionSessions(data.data);
          setSessions(mapped);
          setIsLive(true);
        }

        // Charger le PLAN de la semaine prochaine
        try {
          const weekNum = getWeekNumber(new Date()) + 1;
          const resPlan = await fetch(`/api/plan?semaine=Semaine ${weekNum}`);
          const dataPlan = await resPlan.json();
          if (dataPlan.success && dataPlan.data.length > 0) {
            // Mapper les données du plan (colonnes différentes de Séance)
            const jourMap2 = {
              "lundi": "Lun", "mardi": "Mar", "mercredi": "Mer",
              "jeudi": "Jeu", "vendredi": "Ven", "samedi": "Sam", "dimanche": "Dim",
            };
            const typeMap2 = { "Trail": "run", "Renforcement": "force", "Repos": "rest" };
            const mapped = dataPlan.data.map(s => ({
              ...s,
              nom: s.typeSeance || s.semaine,
              jour: jourMap2[(s.jour || "").toLowerCase()] || s.jour || "?",
              type: typeMap2[s.typeEffort] || "force",
              done: (s.statut || "").toLowerCase() === "done" || (s.statut || "").toLowerCase() === "fait",
              intensity: 50,
              typeSeance: (s.typeSeance || "").toUpperCase(),
            }));
            setPlanSessions(mapped);
          } else {
            // Si pas de plan semaine prochaine, essayer la semaine en cours
            const weekNumCurrent = getWeekNumber(new Date());
            const resPlan2 = await fetch(`/api/plan?semaine=Semaine ${weekNumCurrent}`);
            const dataPlan2 = await resPlan2.json();
            if (dataPlan2.success && dataPlan2.data.length > 0) {
              const jourMap2 = { "lundi": "Lun", "mardi": "Mar", "mercredi": "Mer", "jeudi": "Jeu", "vendredi": "Ven", "samedi": "Sam", "dimanche": "Dim" };
              const typeMap2 = { "Trail": "run", "Renforcement": "force", "Repos": "rest" };
              const mapped = dataPlan2.data.map(s => ({
                ...s, nom: s.typeSeance || s.semaine,
                jour: jourMap2[(s.jour || "").toLowerCase()] || s.jour || "?",
                type: typeMap2[s.typeEffort] || "force",
                done: (s.statut || "").toLowerCase() === "done" || (s.statut || "").toLowerCase() === "fait",
                intensity: 50, typeSeance: (s.typeSeance || "").toUpperCase(),
              }));
              setPlanSessions(mapped);
            }
          }
        } catch (e) {
          console.log("Plan: mode démo");
        }

        // Charger la nutrition
        try {
          const today = new Date().toISOString().split("T")[0];
          const resNut = await fetch("/api/nutrition?date=" + today);
          const dataNut = await resNut.json();
          if (dataNut.success && dataNut.data) {
            const parsed = parseNutritionContent(dataNut.data.contenu);
            if (parsed.meals.length > 0 || parsed.calories > 0) {
              setNutrition({
                ...DEMO_NUTRITION,
                titre: dataNut.data.titre || "Menu du jour",
                calories: parsed.calories || dataNut.data.calories || DEMO_NUTRITION.calories,
                proteines: parsed.proteines || dataNut.data.proteines || DEMO_NUTRITION.proteines,
                glucides: parsed.glucides || dataNut.data.glucides || DEMO_NUTRITION.glucides,
                lipides: parsed.lipides || dataNut.data.lipides || DEMO_NUTRITION.lipides,
                meals: parsed.meals.length > 0 ? parsed.meals : DEMO_NUTRITION.meals,
                supplements: parsed.supplements.length > 0 ? parsed.supplements : DEMO_NUTRITION.supplements,
              });
            }
          }
        } catch (e) {
          console.log("Nutrition: mode démo");
        }

        // Charger l'état de la semaine
        try {
          const resEtat = await fetch("/api/etat-semaine");
          const dataEtat = await resEtat.json();
          if (dataEtat.success && dataEtat.data) {
            setEtat({
              fatigue: dataEtat.data.fatigueCalculee || DEMO_ETAT.fatigue,
              motivation: dataEtat.data.motivation || DEMO_ETAT.motivation,
              douleurs: dataEtat.data.douleurs || DEMO_ETAT.douleurs,
            });
          }
        } catch (e) {
          console.log("État semaine: mode démo");
        }

        // Charger le bilan du coach
        try {
          const resBilan = await fetch("/api/bilan");
          const dataBilan = await resBilan.json();
          if (dataBilan.success && dataBilan.data) {
            setBilan(dataBilan.data);
          }
        } catch (e) {
          console.log("Bilan: mode démo");
        }

      } catch (e) {
        console.log("Mode démo (Notion non connecté)");
      }
    }
    loadData();
  }, []);

  const tabs = [
    { icon: "home", label: "Accueil" },
    { icon: "calendar", label: "Plan" },
    { icon: "food", label: "Nutrition" },
    { icon: "chart", label: "Bilan" },
    { icon: "user", label: "Profil" },
  ];

  // Sauvegarder le ressenti dans Notion
  async function handleSaveEtat(data) {
    const res = await fetch("/api/etat-semaine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      setEtat({ fatigue: data.fatigue, motivation: data.motivation, douleurs: data.douleurs });
    }
    return result;
  }

  const screens = [
    <DashboardScreen key={0} sessions={sessions} planSessions={planSessions} nutrition={nutrition} etat={etat} onNavigate={handleNavigate} onSaveEtat={handleSaveEtat} />,
    <PlanScreen key={1} sessions={planSessions} initialSelected={planSelected} />,
    <NutritionScreen key={2} nutrition={nutrition} />,
    <BilanScreen key={3} sessions={sessions} etat={etat} bilan={bilan} />,
    <ProfileScreen key={4} />,
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

      <div style={{ maxWidth: 390, margin: "0 auto", background: C.bg, minHeight: "100vh", position: "relative" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${C.accent},#8B1A10)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: "'Bebas Neue',sans-serif" }}>SI</span>
            </div>
            <p style={{ fontSize: 10, color: C.g2, margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5 }}>Spartan Intelligence</p>
          </div>
          <div>
            {!isLive && <span style={{ fontSize: 9, background: C.yellow+"33", color: C.yellow, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>DÉMO</span>}
            {isLive && <span style={{ fontSize: 9, background: C.green+"33", color: C.green, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>LIVE</span>}
          </div>
        </div>

        {/* Contenu */}
        <div style={{ paddingBottom: 80 }}>{screens[tab]}</div>

        {/* Barre de navigation */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: "rgba(10,10,12,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "8px 0 24px" }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => { setTab(i); if (i !== 1) setPlanSelected(null); }} style={{ background: "none", border: "none", padding: "6px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", position: "relative" }}>
              {tab===i && <div style={{ position: "absolute", top: -8, width: 20, height: 2, background: C.accent, borderRadius: 1 }} />}
              <Icon name={t.icon} active={tab===i} />
              <span style={{ fontSize: 10, color: tab===i?C.accent:C.g2, fontWeight: tab===i?700:500, letterSpacing: 0.5 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
