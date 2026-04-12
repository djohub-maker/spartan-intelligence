// pages/api/etat-semaine.js
// Route API qui retourne l'état de la semaine depuis Notion
// Appel : GET /api/etat-semaine?semaine=Semaine 14

const { getEtatSemaine } = require("../../lib/notion");

export default async function handler(req, res) {
  try {
    const { semaine } = req.query;
    const etat = await getEtatSemaine(semaine || null);
    res.status(200).json({ success: true, data: etat });
  } catch (error) {
    console.error("Erreur API état semaine:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
