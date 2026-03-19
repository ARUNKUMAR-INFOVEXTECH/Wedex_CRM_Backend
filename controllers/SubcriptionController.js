const { supabaseAdmin } = require("../config/supabase");

/* Get subscription for a hall */
const getSubscription = async (req, res) => {
  const hall_id = req.params.hall_id || req.user.hall_id;

  const { data, error } = await supabaseAdmin
    .from("hall_subscriptions")
    .select(`*, packages(name, price, billing_cycle, features, max_users, max_bookings)`)
    .eq("hall_id", hall_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return res.status(500).json({ message: error.message });
  if (!data) return res.status(404).json({ message: "No subscription found" });

  res.json(data);
};

/* Renew/extend subscription */
const renewSubscription = async (req, res) => {
  const { hall_id } = req.params;
  const { months = 1 } = req.body;

  const { data: sub } = await supabaseAdmin
    .from("hall_subscriptions")
    .select("id, end_date")
    .eq("hall_id", hall_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub) return res.status(404).json({ message: "Subscription not found" });

  const currentEnd = new Date(sub.end_date);
  currentEnd.setMonth(currentEnd.getMonth() + months);

  const { error } = await supabaseAdmin
    .from("hall_subscriptions")
    .update({
      end_date: currentEnd.toISOString().split("T")[0],
      status: "active",
      payment_status: "paid",
    })
    .eq("id", sub.id);

  if (error) return res.status(500).json({ message: error.message });

  // Reactivate hall if suspended
  await supabaseAdmin
    .from("marriage_halls")
    .update({ status: "active" })
    .eq("id", hall_id);

  res.json({ message: `Subscription renewed for ${months} month(s)`, new_end_date: currentEnd });
};

/* Change package */
const changePackage = async (req, res) => {
  const { hall_id } = req.params;
  const { package_id } = req.body;

  if (!package_id) return res.status(400).json({ message: "package_id required" });

  const { error } = await supabaseAdmin
    .from("hall_subscriptions")
    .update({ package_id })
    .eq("hall_id", hall_id)
    .eq("status", "active");

  if (error) return res.status(500).json({ message: error.message });
  res.json({ message: "Package changed successfully" });
};

module.exports = { getSubscription, renewSubscription, changePackage };