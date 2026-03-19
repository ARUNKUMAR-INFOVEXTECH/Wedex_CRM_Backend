const EDGE_FUNCTION_URL = process.env.SUPABASE_URL + "/functions/v1/resend-email";
const EDGE_FUNCTION_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Send hall owner verification email
 */
async function sendHallOwnerEmail({
  to,
  owner_name,
  hall_name,
  city,
  package_name,
  temp_password,
  verification_link,
}) {
  return callEdgeFunction({
    type: "hall_owner_verification",
    to,
    owner_name,
    hall_name,
    city,
    package_name,
    temp_password,
    verification_link,
  });
}

/**
 * Send staff verification email
 */
async function sendStaffEmail({
  to,
  staff_name,
  hall_name,
  role,
  temp_password,
  verification_link,
  owner_name,
}) {
  return callEdgeFunction({
    type: "staff_verification",
    to,
    staff_name,
    hall_name,
    role,
    temp_password,
    verification_link,
    owner_name,
  });
}

async function callEdgeFunction(payload) {
  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EDGE_FUNCTION_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Edge function email error:", data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to call email edge function:", err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendHallOwnerEmail, sendStaffEmail };