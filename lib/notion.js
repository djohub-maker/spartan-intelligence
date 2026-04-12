// ============================================
// lib/notion.js — Client Notion pour Spartan Intelligence
// ============================================
// Ce fichier gère toutes les communications avec l'API Notion.
// Il lit tes bases de données et transforme les données brutes
// en un format propre pour l'interface de l'app.
// ============================================

const { Client } = require("@notionhq/client");

// Initialise le client Notion avec ta clé API
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ─── UTILITAIRES ───────────────────────────────────
// Ces fonctions aident à extraire les valeurs des propriétés Notion
// (Notion stocke les données dans un format complexe, on le simplifie)

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

function getMultiSelect(prop) {
  if (!prop || prop.type !== "multi_select") return [];
  return prop.multi_select?.map((s) => s.name) || [];
}

function getDate(prop) {
  if (!prop || prop.type !== "date") return null;
  return prop.date?.start || null;
}

function getCheckbox(prop) {
  if (!prop || prop.type !== "checkbox") return false;
  return prop.checkbox;
}

function getFormula(prop) {
  if (!prop || prop.type !== "formula") return null;
  const f = prop.formula;
  if (f.type === "number") return f.number;
  if (f.type === "string") return f.string;
  if (f.type === "boolean") return f.boolean;
  return null;
}

// ─── RÉCUPÉRER LES SÉANCES ────────────────────────
// Lit ta base "Séance" et retourne la liste des séances
// pour une semaine donnée.

async function getSeances(semaine) {
  const dbId = process.env.NOTION_DB_SEANCES;
  if (!dbId) throw new Error("NOTION_DB_SEANCES non configuré dans .env.local");

  // Construit le filtre : on cherche les séances de la semaine demandée
  const filter = semaine
    ? {
        property: "Semaine",
        rich_text: { contains: semaine },
      }
    : undefined;

  const response = await notion.databases.query({
    database_id: dbId,
    filter,
    sorts: [{ property: "Date", direction: "ascending" }],
  });

  // Transforme chaque résultat Notion en objet simple
  return response.results.map((page) => {
    const props = page.properties;
    return {
      id: page.id,
      nom: getText(props["Séance"] || props["Name"] || props["Nom"]),
      jour: getSelect(props["Jour de la semaine"] || props["Jour"]),
      date: getDate(props["Date"]),
      typeSeance: getSelect(props["type de séance"] || props["Type de séance"]),
      typeEffort: getSelect(props["type d'effort"] || props["Type d'effort"]),
      objectif: getSelect(props["objectif"] || props["Objectif"]),
      explication: getText(props["explication"] || props["Explication"]),
      duree: getNumber(props["Durée"] || props["Durée (min)"]),
      distance: getNumber(props["Distance"] || props["Distance (km)"]),
      denivele: getNumber(props["Dénivelé"] || props["Dénivelé (m)"]),
      fcMoyenne: getNumber(props["FC moyenne"] || props["FC moy"]),
      ressenti: getSelect(props["Ressenti"]),
      fatigue: getNumber(props["Fatigue (1-10)"] || props["Fatigue"]),
      commentaire: getText(props["Commentaire"]),
      statut: getSelect(props["Statut séance"] || props["Statut"]),
      type: getSelect(props["type"] || props["Type"]),
    };
  });
}

// ─── RÉCUPÉRER LA NUTRITION ───────────────────────
// Lit ta base "Nutrition" pour une date donnée

async function getNutrition(date) {
  const dbId = process.env.NOTION_DB_NUTRITION;
  if (!dbId) throw new Error("NOTION_DB_NUTRITION non configuré dans .env.local");

  const filter = date
    ? {
        property: "Date",
        date: { equals: date },
      }
    : undefined;

  const response = await notion.databases.query({
    database_id: dbId,
    filter,
    sorts: [{ property: "Date", direction: "descending" }],
    page_size: 1,
  });

  if (response.results.length === 0) return null;

  const page = response.results[0];
  const props = page.properties;

  // Récupère aussi le contenu de la page (le texte du menu)
  const blocks = await notion.blocks.children.list({ block_id: page.id });
  const contenu = blocks.results
    .map((block) => {
      if (block.type === "paragraph") {
        return block.paragraph.rich_text?.map((t) => t.plain_text).join("") || "";
      }
      if (block.type === "heading_3") {
        return "### " + (block.heading_3.rich_text?.map((t) => t.plain_text).join("") || "");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");

  return {
    id: page.id,
    titre: getText(props["Name"] || props["Nom"] || props["Titre"]),
    date: getDate(props["Date"]),
    calories: getNumber(props["Calories"]),
    proteines: getNumber(props["Protéines"] || props["P"]),
    glucides: getNumber(props["Glucides"] || props["G"]),
    lipides: getNumber(props["Lipides"] || props["L"]),
    contenu: contenu,
    menuDuJour: getText(props["Menus du jour"] || props["Menu"]),
  };
}

// ─── RÉCUPÉRER LE BILAN HEBDO ─────────────────────
// Lit ta base "Bilan" pour la semaine demandée

async function getBilan(semaine) {
  const dbId = process.env.NOTION_DB_BILAN;
  if (!dbId) throw new Error("NOTION_DB_BILAN non configuré dans .env.local");

  const response = await notion.databases.query({
    database_id: dbId,
    sorts: [{ property: "Date", direction: "descending" }],
    page_size: 1,
  });

  if (response.results.length === 0) return null;

  const page = response.results[0];
  const props = page.properties;

  // Récupère le contenu du bilan (texte de l'analyse IA)
  const blocks = await notion.blocks.children.list({ block_id: page.id });
  const contenu = blocks.results
    .map((block) => {
      if (block.type === "paragraph") {
        return block.paragraph.rich_text?.map((t) => t.plain_text).join("") || "";
      }
      if (block.type === "heading_3") {
        return "### " + (block.heading_3.rich_text?.map((t) => t.plain_text).join("") || "");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");

  return {
    id: page.id,
    titre: getText(props["Name"] || props["Nom"]),
    date: getDate(props["Date"]),
    bilan: getText(props["Bilan"]),
    contenu: contenu,
  };
}

// ─── RÉCUPÉRER L'ÉTAT DE LA SEMAINE ───────────────
// Lit ta base "Etat Semaine" avec fatigue, motivation, douleurs

async function getEtatSemaine(semaine) {
  const dbId = process.env.NOTION_DB_ETAT_SEMAINE;
  if (!dbId) throw new Error("NOTION_DB_ETAT_SEMAINE non configuré dans .env.local");

  const filter = semaine
    ? {
        property: "Semaine",
        title: { contains: semaine },
      }
    : undefined;

  const response = await notion.databases.query({
    database_id: dbId,
    filter,
    sorts: [{ property: "Semaine", direction: "descending" }],
    page_size: 1,
  });

  if (response.results.length === 0) return null;

  const page = response.results[0];
  const props = page.properties;

  return {
    id: page.id,
    semaine: getText(props["Semaine"]),
    fatigueCalculee: getNumber(props["Fatigue calculée"]) || getFormula(props["Fatigue calculée"]),
    motivation: getNumber(props["Motivation (1-10)"] || props["Motivation"]),
    douleurs: getNumber(props["Douleurs (1-10)"] || props["Douleurs"]),
    statut: getSelect(props["Statut"]),
  };
}

// ─── EXPORTS ──────────────────────────────────────

module.exports = {
  getSeances,
  getNutrition,
  getBilan,
  getEtatSemaine,
};
