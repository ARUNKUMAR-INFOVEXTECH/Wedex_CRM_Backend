const { supabase, supabaseAdmin } = require("../config/supabase");

const createHall = async (req, res) => {
  const { hall_name, owner_name, owner_email, password, phone, city, address, package_id } = req.body;

  if (!hall_name || !owner_name || !owner_email || !password || !package_id) {
    return res.status(400).json({
      message: "hall_name, owner_name, owner_email, password, package_id are required",
    });
  }

  // ---- 1. Create hall ----
  const { data: hall, error: hallError } = await supabaseAdmin
    .from("marriage_halls")
    .insert([{ hall_name, owner_name, phone, city, address, status: "active" }])
    .select()
    .single();

  if (hallError) return res.status(500).json({ message: hallError.message });

  // ---- 2. Create Supabase Auth user via signUp (auto-sends confirmation email) ----
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: owner_email,
    password,
    options: {
      data: { name: owner_name, role: "owner", hall_id: hall.id },
    },
  });

  if (authError || !authData?.user) {
    await supabaseAdmin.from("marriage_halls").delete().eq("id", hall.id);
    return res.status(400).json({ message: authError?.message || "Auth user creation failed" });
  }

  // ---- 3. Create user profile ----
  const { error: userError } = await supabaseAdmin.from("users").insert([{
    name: owner_name,
    email: owner_email,
    password: "supabase_auth",
    role: "owner",
    hall_id: hall.id,
    auth_user_id: authData.user.id,
  }]);

  if (userError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    await supabaseAdmin.from("marriage_halls").delete().eq("id", hall.id);
    return res.status(500).json({ message: userError.message });
  }

  // ---- 4. Create subscription ----
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  const { error: subError } = await supabaseAdmin.from("hall_subscriptions").insert([{
    hall_id: hall.id,
    package_id,
    start_date: startDate.toISOString().split("T")[0],
    end_date: endDate.toISOString().split("T")[0],
    status: "active",
    payment_status: "pending",
  }]);

  if (subError) console.error("Subscription creation failed:", subError.message);

  // ---- 5. Update hall with owner email ----
  await supabaseAdmin.from("marriage_halls").update({ email: owner_email }).eq("id", hall.id);

  res.status(201).json({
    message: "Hall created successfully. A confirmation email has been sent to the owner.",
    hall_id: hall.id,
    owner_email,
  });
};

const getAllHalls = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("marriage_halls")
    .select(`*, hall_subscriptions ( id, status, start_date, end_date, payment_status, packages ( name, price, billing_cycle ) )`)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};

const getHallById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("marriage_halls")
    .select(`*, hall_subscriptions ( id, status, start_date, end_date, payment_status, packages ( name, price, billing_cycle, features ) ), users ( id, name, email, role, created_at )`)
    .eq("id", id)
    .single();

  if (error) return res.status(404).json({ message: "Hall not found" });
  res.json(data);
};

const suspendHall = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin.from("marriage_halls").update({ status: "suspended" }).eq("id", id);
  if (error) return res.status(500).json({ message: error.message });

  await supabaseAdmin.from("hall_subscriptions").update({ status: "inactive" }).eq("hall_id", id);
  res.json({ message: "Hall suspended successfully" });
};

const activateHall = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin.from("marriage_halls").update({ status: "active" }).eq("id", id);
  if (error) return res.status(500).json({ message: error.message });

  const today = new Date().toISOString().split("T")[0];
  await supabaseAdmin.from("hall_subscriptions").update({ status: "active" }).eq("hall_id", id).gte("end_date", today);
  res.json({ message: "Hall activated successfully" });
};

const deleteHall = async (req, res) => {
  const { id } = req.params;

  const { data: users } = await supabaseAdmin.from("users").select("auth_user_id").eq("hall_id", id);

  const { error } = await supabaseAdmin.from("marriage_halls").delete().eq("id", id);
  if (error) return res.status(500).json({ message: error.message });

  if (users?.length > 0) {
    await Promise.all(
      users.map((u) =>
        u.auth_user_id ? supabaseAdmin.auth.admin.deleteUser(u.auth_user_id) : Promise.resolve()
      )
    );
  }

  res.json({ message: "Hall deleted successfully" });
};

const getHallStats = async (req, res) => {
  const { data: halls } = await supabaseAdmin.from("marriage_halls").select("id, status");
  const total = halls?.length || 0;
  const active = halls?.filter((h) => h.status === "active").length || 0;
  const suspended = halls?.filter((h) => h.status === "suspended").length || 0;
  res.json({ total, active, suspended });
};

module.exports = { createHall, getAllHalls, getHallById, suspendHall, activateHall, deleteHall, getHallStats };