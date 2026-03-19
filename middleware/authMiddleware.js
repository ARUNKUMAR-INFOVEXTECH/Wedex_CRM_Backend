const { supabaseAdmin } = require("../config/supabase");

/**
 * Verifies Supabase JWT token from Authorization header.
 * Attaches req.user = { id, email, role, hall_id, ... }
 */
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify with Supabase Auth — this validates the JWT signature
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Fetch full user profile from our users table using auth_user_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("id, name, email, role, hall_id, auth_user_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({ message: "Error fetching user profile" });
    }

    if (!profile) {
      // Could be super_admin — check super_admins table
      const { data: adminProfile } = await supabaseAdmin
        .from("super_admins")
        .select("id, name, email")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!adminProfile) {
        return res.status(401).json({ message: "User profile not found" });
      }

      req.user = { ...adminProfile, role: "super_admin" };
      return next();
    }

    req.user = profile;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Token verification failed" });
  }
};