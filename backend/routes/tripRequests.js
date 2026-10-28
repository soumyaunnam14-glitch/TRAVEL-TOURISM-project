const express = require("express");
const { randomBytes } = require("crypto");
const { getSupabase } = require("../supabase");
const router = express.Router();

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}
function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}
function isDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

router.post("/", async (req, res, next) => {
  try {
    const name = cleanText(req.body.name);
    const email = cleanText(req.body.email).toLowerCase();
    const destinationId = Number(req.body.destinationId);
    const travelDate = req.body.travelDate;
    const travellers = Number(req.body.travellers);
    const message = cleanText(req.body.message);

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({ error: "Name must be between 2 and 80 characters." });
    }
    if (!validEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
    if (!Number.isSafeInteger(destinationId) || destinationId < 1) {
      return res.status(400).json({ error: "Choose a valid destination." });
    }
    if (!isDateOnly(travelDate) || travelDate < new Date().toISOString().slice(0, 10)) {
      return res.status(400).json({ error: "Choose today or a future travel date." });
    }
    if (!Number.isInteger(travellers) || travellers < 1 || travellers > 20) {
      return res.status(400).json({ error: "Travellers must be between 1 and 20." });
    }
    if (message.length > 1000) return res.status(400).json({ error: "Message must be 1,000 characters or fewer." });

    const supabase = getSupabase();
    const { data: destination, error: destinationError } = await supabase
      .from("destinations").select("id").eq("id", destinationId).eq("is_active", true).maybeSingle();
    if (destinationError) throw destinationError;
    if (!destination) return res.status(400).json({ error: "That destination is not available. Please choose another." });

    const reference = `TT-${randomBytes(4).toString("hex").toUpperCase()}`;
    const { data, error } = await supabase.from("trip_requests").insert({
      reference, name, email, destination_id: destinationId, travel_date: travelDate,
      travellers, message: message || null, status: "new"
    }).select("reference, status, created_at").single();
    if (error) throw error;

    return res.status(201).json({
      message: "Trip enquiry saved successfully.",
      data: { reference: data.reference, status: data.status, createdAt: data.created_at }
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
    return next(error);
  }
});

module.exports = router;
