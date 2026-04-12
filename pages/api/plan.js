// pages/api/plan.js
// Route API qui retourne le plan d'entraînement depuis Notion
// Lit la base "Plan d'entrainement" (pas "Séance")

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

function getDate(prop) {
  if (!prop || prop.type !== "date") return null;
  return prop.date?.start || null;
}

export default async function handler(req, res) {
  try {
    const dbId = process.env.NOTION_DB_PLAN;
    if (!dbId) {
      return res.status(500).json({ success: false, error: "NOTION_DB_PLAN non configuré" });
    }

    const { semaine } = req.query;

    // Filtre par semaine si fourni, sinon prend les plus récentes
    let filter = undefined;
    if (semaine) {
      filter = {
        property: "Semaine",
        title: { contains: semaine },
      };
    }

    const response = await notion.databases.query({
      database_id: dbId,
      filter,
      sorts: [{ property: "date", direction: "ascending" }],
      page_size: 20,
    });

    const data = response.results.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        semaine: getText(p["Semaine"]),
        date: getDate(p["date"]),
        typeEffort: getSelect(p["type d'effort"]),
        statut: getSelect(p["Statut"]),
        explication: getText(p["explication"]),
        objectif: getSelect(p["objectif"]),
        typeSeance: getSelect(p["type de séance"]),
        jour: getSelect(p["jour"]),
        duree: getNumber(p["Durée (min)"]),
        distance: getNumber(p["Distance (km)"]),
        denivele: getNumber(p["Dénivelé (m)"]),
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Erreur API plan:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
