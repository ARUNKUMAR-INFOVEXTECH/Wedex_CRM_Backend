const { supabaseAdmin } = require("../config/supabase");

/**
 * Checks that the logged-in user's hall has an active subscription.
 * Skip for super_admin role.
 */
module.exports = async (req, res, next) => {
  if (req.user.role === "super_admin") return next();

  const hall_id = req.user.hall_id;
  if (!hall_id) {
    return res.status(403).json({ message: "No hall associated with this user" });
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: sub, error } = await supabaseAdmin
    .from("hall_subscriptions")
    .select("status, end_date")
    .eq("hall_id", hall_id)
    .eq("status", "active")
    .gte("end_date", today)
    .maybeSingle();

  if (error || !sub) {
    return res.status(403).json({
      message: "Subscription expired or inactive. Please renew your plan.",
    });
  }

  next();
};