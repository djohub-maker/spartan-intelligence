// pages/api/seances.js
// Route API qui retourne les séances depuis Notion
// Appel : GET /api/seances (semaine en cours)
// Appel : GET /api/seances?debut=2026-04-06&fin=2026-04-12

const { getSeances } = require("../../lib/notion");

export default async function handler(req, res) {
  try {
    const { debut, fin } = req.query;
    const seances = await getSeances(debut || null, fin || null);
    res.status(200).json({ success: true, data: seances });
  } catch (error) {
    console.error("Erreur API séances:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
