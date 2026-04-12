// pages/api/seances.js
// Route API qui retourne les séances depuis Notion
// Appel : GET /api/seances?semaine=Semaine 15

const { getSeances } = require("../../lib/notion");

export default async function handler(req, res) {
  try {
    const { semaine } = req.query;
    const seances = await getSeances(semaine || null);
    res.status(200).json({ success: true, data: seances });
  } catch (error) {
    console.error("Erreur API séances:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
