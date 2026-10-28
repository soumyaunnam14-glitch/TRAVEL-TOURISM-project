const express = require("express");
const { getSupabase } = require("../supabase");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 80) : "";
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const allowedCategories = ["Beach", "Mountains", "Culture", "Nature"];
    if (category && category !== "all" && !allowedCategories.includes(category)) {
      return res.status(400).json({ error: "Choose a valid destination category." });
    }

    let query = getSupabase()
      .from("destinations")
      .select("id, name, country, category, description, duration_days, starting_price_inr, image_url")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (search) query = query.or(`name.ilike.%${search.replace(/[%_,()]/g, " ")}%,country.ilike.%${search.replace(/[%_,()]/g, " ")}%`);
    if (category && category !== "all") query = query.eq("category", category);

    const { data, error } = await query;
    if (error) throw error;
    return res.json({ data });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
    return next(error);
  }
});

module.exports = router;
