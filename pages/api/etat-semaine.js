// pages/api/etat-semaine.js
// GET /api/etat-semaine → lire l'état de la semaine
// POST /api/etat-semaine → sauvegarder fatigue, motivation, douleurs

const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_API_KEY });

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

function getFormula(prop) {
  if (!prop || prop.type !== "formula") return null;
  const f = prop.formula;
  if (f.type === "number") return f.number;
  if (f.type === "string") return f.string;
  return null;
}

// Calcule le numéro de semaine ISO
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default async function handler(req, res) {
  const dbId = process.env.NOTION_DB_ETAT_SEMAINE;
  if (!dbId) {
    return res.status(500).json({ success: false, error: "NOTION_DB_ETAT_SEMAINE non configuré" });
  }

  // ─── GET : Lire l'état ───
  if (req.method === "GET") {
    try {
      const response = await notion.databases.query({
        database_id: dbId,
        sorts: [{ property: "Semaine", direction: "descending" }],
        page_size: 1,
      });

      if (response.results.length === 0) {
        return res.status(200).json({ success: true, data: null });
      }

      const page = response.results[0];
      const p = page.properties;

      return res.status(200).json({
        success: true,
        data: {
          id: page.id,
          semaine: getText(p["Semaine"]),
          fatigueCalculee: getNumber(p["Fatigue calculée"]) || getFormula(p["Fatigue calculée"]),
          motivation: getNumber(p["Motivation (1-10)"]),
          douleurs: getNumber(p["Douleurs (1-10)"]),
          statut: getSelect(p["Statut"]),
        },
      });
    } catch (error) {
      console.error("Erreur GET état semaine:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // ─── POST : Sauvegarder fatigue, motivation, douleurs ───
  if (req.method === "POST") {
    try {
      const { fatigue, motivation, douleurs } = req.body;
      const weekNum = getWeekNumber(new Date());
      const semaineName = `Semaine ${weekNum}`;

      // Chercher si une entrée existe déjà pour cette semaine
      const existing = await notion.databases.query({
        database_id: dbId,
        filter: {
          property: "Semaine",
          title: { equals: semaineName },
        },
        page_size: 1,
      });

      const properties = {};
      if (motivation !== undefined) properties["Motivation (1-10)"] = { number: Number(motivation) };
      if (douleurs !== undefined) properties["Douleurs (1-10)"] = { number: Number(douleurs) };
      // Fatigue : essayer d'écrire dans une colonne "Fatigue (1-10)" 
      // (à créer dans Notion si elle n'existe pas, car "Fatigue calculée" est une formule)
      if (fatigue !== undefined) properties["Fatigue (1-10)"] = { number: Number(fatigue) };

      let result;
      if (existing.results.length > 0) {
        // Mettre à jour l'entrée existante
        result = await notion.pages.update({
          page_id: existing.results[0].id,
          properties,
        });
      } else {
        // Créer une nouvelle entrée
        properties["Semaine"] = { title: [{ text: { content: semaineName } }] };
        result = await notion.pages.create({
          parent: { database_id: dbId },
          properties,
        });
      }

      return res.status(200).json({ success: true, data: { id: result.id } });
    } catch (error) {
      console.error("Erreur POST état semaine:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: "Méthode non supportée" });
}
