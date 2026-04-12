// pages/api/nutrition.js
// Route API qui retourne le menu du jour depuis Notion
// Appel : GET /api/nutrition?date=2026-04-12

const { getNutrition } = require("../../lib/notion");

export default async function handler(req, res) {
  try {
    const { date } = req.query;
    const nutrition = await getNutrition(date || null);
    res.status(200).json({ success: true, data: nutrition });
  } catch (error) {
    console.error("Erreur API nutrition:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
