// ============================================
// lib/notion.js — Client Notion pour Spartan Intelligence
// ============================================
// Colonnes Séance : Séance, Semaine associée, Date, Jour de la semaine,
// explication, Durée (min), Distance (km), Dénivelé (m), FC moyenne,
// Ressenti, Fatigue (1-10), Commentaire, Statut séance, type,
// Strava ID, Puissance moyenne, Vitesse moyenne, fréquence cardiaque max
// ============================================

const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ─── UTILITAIRES ───────────────────────────────────

function getText(prop) {
  if (!prop) return "";
  if (prop.type === "title") return prop.title?.map((t) => t.plain_text).join("") || "";
  if (prop.type === "rich_text") return prop.rich_text?.map((t) => t.plain_text).join("") || "";
  return "";
}

function getNumber(prop) {
  if (!prop || prop.type !== "number") return null;
  return prop.number;
}

function getSelect(prop) {
  if (!prop || prop.type !== "select") return "";
  return prop.select?.name || "";
}

function getDate(prop) {
  if (!prop || prop.type !== "date") return null;
  return prop.date?.start || null;
}

function getFormula(prop) {
  if (!prop || prop.type !== "formula") return null;
  const f = prop.formula;
  if (f.type === "number") return f.number;
  if (f.type === "string") return f.string;
  if (f.type === "boolean") return f.boolean;
  return null;
}

function getRelationTitle(prop) {
  if (!prop || prop.type !== "relation") return "";
  return prop.relation?.length > 0 ? prop.relation[0].id : "";
}

// ─── RÉCUPÉRER LES SÉANCES ────────────────────────
// Filtre par plage de dates de la semaine en cours

async function getSeances(dateDebut, dateFin) {
  const dbId = process.env.NOTION_DB_SEANCES;
  if (!dbId) throw new Error("NOTION_DB_SEANCES non configuré");

  // Si pas de dates fournies, on prend la semaine en cours
  if (!dateDebut || !dateFin) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    dateDebut = monday.toISOString().split("T")[0];
    dateFin = sunday.toISOString().split("T")[0];
  }

  const response = await notion.databases.query({
    database_id: dbId,
    filter: {
      and: [
        { property: "Date", date: { on_or_after: dateDebut } },
        { property: "Date", date: { on_or_before: dateFin } },
      ],
    },
    sorts: [{ property: "Date", direction: "ascending" }],
  });

  return response.results.map((page) => {
    const p = page.properties;
    return {
      id: page.id,
      nom: getText(p["Séance"]),
      date: getDate(p["Date"]),
      jour: getSelect(p["Jour de la semaine"]),
      explication: getText(p["explication"]),
      duree: getNumber(p["Durée (min)"]),
      distance: getNumber(p["Distance (km)"]),
      denivele: getNumber(p["Dénivelé (m)"]),
      fcMoyenne: getNumber(p["FC moyenne"]),
      fcMax: getNumber(p["fréquence cardiaque max"]),
      ressenti: getSelect(p["Ressenti"]),
      fatigue: getNumber(p["Fatigue (1-10)"]),
      commentaire: getText(p["Commentaire"]),
      statut: getSelect(p["Statut séance"]),
      type: getSelect(p["type"]),
      stravaId: getText(p["Strava ID"]),
      puissance: getNumber(p["Puissance moyenne (watts)"]),
      vitesse: getText(p["Vitesse moyenne (min/km)"]),
    };
  });
}

// ─── RÉCUPÉRER TOUTES LES SÉANCES (sans filtre) ──
async function getAllSeances() {
  const dbId = process.env.NOTION_DB_SEANCES;
  if (!dbId) throw new Error("NOTION_DB_SEANCES non configuré");

  const response = await notion.databases.query({
    database_id: dbId,
    sorts: [{ property: "Date", direction: "descending" }],
    page_size: 100,
  });

  return response.results.map((page) => {
    const p = page.properties;
    return {
      id: page.id,
      nom: getText(p["Séance"]),
      date: getDate(p["Date"]),
      jour: getSelect(p["Jour de la semaine"]),
      explication: getText(p["explication"]),
      duree: getNumber(p["Durée (min)"]),
      distance: getNumber(p["Distance (km)"]),
      denivele: getNumber(p["Dénivelé (m)"]),
      fcMoyenne: getNumber(p["FC moyenne"]),
      fcMax: getNumber(p["fréquence cardiaque max"]),
      ressenti: getSelect(p["Ressenti"]),
      fatigue: getNumber(p["Fatigue (1-10)"]),
      commentaire: getText(p["Commentaire"]),
      statut: getSelect(p["Statut séance"]),
      type: getSelect(p["type"]),
    };
  });
}

// ─── RÉCUPÉRER LA NUTRITION ───────────────────────

async function getNutrition(date) {
  const dbId = process.env.NOTION_DB_NUTRITION;
  if (!dbId) throw new Error("NOTION_DB_NUTRITION non configuré");

  const filter = date
    ? { property: "Date", date: { equals: date } }
    : undefined;

  const response = await notion.databases.query({
    database_id: dbId,
    filter,
    sorts: [{ property: "Date", direction: "descending" }],
    page_size: 1,
  });

  if (response.results.length === 0) return null;

  const page = response.results[0];
  const p = page.properties;

  // Récupère le contenu de la page
  const blocks = await notion.blocks.children.list({ block_id: page.id });
  const contenu = blocks.results
    .map((block) => {
      if (block.type === "paragraph")
        return block.paragraph.rich_text?.map((t) => t.plain_text).join("") || "";
      if (block.type === "heading_3")
        return "### " + (block.heading_3.rich_text?.map((t) => t.plain_text).join("") || "");
      return "";
    })
    .filter(Boolean)
    .join("\n");

  return {
    id: page.id,
    titre: getText(p["Name"] || p["Nom"] || p["Titre"]),
    date: getDate(p["Date"]),
    calories: getNumber(p["Calories"]),
    proteines: getNumber(p["Protéines"] || p["P"]),
    glucides: getNumber(p["Glucides"] || p["G"]),
    lipides: getNumber(p["Lipides"] || p["L"]),
    contenu: contenu,
  };
}

// ─── RÉCUPÉRER LE BILAN HEBDO ─────────────────────

async function getBilan() {
  const dbId = process.env.NOTION_DB_BILAN;
  if (!dbId) throw new Error("NOTION_DB_BILAN non configuré");

  const response = await notion.databases.query({
    database_id: dbId,
    sorts: [{ property: "Date", direction: "descending" }],
    page_size: 1,
  });

  if (response.results.length === 0) return null;

  const page = response.results[0];
  const p = page.properties;

  // Lire le contenu de la propriété "Bilan" (rich_text)
  const bilanProp = getText(p["Bilan"] || p["bilan"] || p["Analyse"] || p["analyse"]);

  // Lire aussi les blocs de contenu de la page
  const blocks = await notion.blocks.children.list({ block_id: page.id });
  const contenu = blocks.results
    .map((block) => {
      if (block.type === "paragraph")
        return block.paragraph.rich_text?.map((t) => t.plain_text).join("") || "";
      if (block.type === "heading_1")
        return "### " + (block.heading_1.rich_text?.map((t) => t.plain_text).join("") || "");
      if (block.type === "heading_2")
        return "### " + (block.heading_2.rich_text?.map((t) => t.plain_text).join("") || "");
      if (block.type === "heading_3")
        return "### " + (block.heading_3.rich_text?.map((t) => t.plain_text).join("") || "");
      if (block.type === "bulleted_list_item")
        return "• " + (block.bulleted_list_item.rich_text?.map((t) => t.plain_text).join("") || "");
      if (block.type === "numbered_list_item")
        return "- " + (block.numbered_list_item.rich_text?.map((t) => t.plain_text).join("") || "");
      return "";
    })
    .filter(Boolean)
    .join("\n");

  // Utiliser la propriété Bilan si le contenu des blocs est vide, ou combiner les deux
  const finalContenu = contenu || bilanProp || "";

  return {
    id: page.id,
    titre: getText(p["Name"] || p["Nom"] || p["Titre"]),
    date: getDate(p["Date"]),
    bilan: bilanProp,
    contenu: finalContenu,
  };
}

// ─── RÉCUPÉRER L'ÉTAT DE LA SEMAINE ───────────────

async function getEtatSemaine() {
  const dbId = process.env.NOTION_DB_ETAT_SEMAINE;
  if (!dbId) throw new Error("NOTION_DB_ETAT_SEMAINE non configuré");

  const response = await notion.databases.query({
    database_id: dbId,
    sorts: [{ property: "Semaine", direction: "descending" }],
    page_size: 1,
  });

  if (response.results.length === 0) return null;

  const page = response.results[0];
  const p = page.properties;

  return {
    id: page.id,
    semaine: getText(p["Semaine"]),
    fatigueCalculee: getNumber(p["Fatigue calculée"]) || getFormula(p["Fatigue calculée"]),
    motivation: getNumber(p["Motivation (1-10)"]),
    douleurs: getNumber(p["Douleurs (1-10)"]),
    statut: getSelect(p["Statut"]),
  };
}

module.exports = {
  getSeances,
  getAllSeances,
  getNutrition,
  getBilan,
  getEtatSemaine,
};
