process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  try {
    const { data, error } = await supabase
      .from("todolists")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: `Fetch error: ${error.message}` });
    }

    return res.status(200).json({ message: "Fetched successfully", data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
