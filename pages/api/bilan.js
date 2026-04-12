// pages/api/bilan.js
// Route API qui retourne le bilan hebdomadaire depuis Notion
// Appel : GET /api/bilan

const { getBilan } = require("../../lib/notion");

export default async function handler(req, res) {
  try {
    const bilan = await getBilan();
    res.status(200).json({ success: true, data: bilan });
  } catch (error) {
    console.error("Erreur API bilan:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
