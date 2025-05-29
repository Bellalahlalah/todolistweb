import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.body;

  try {
    const { data, error } = await supabase
      .from("todolists")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: "To-do deleted successfully", data });
  } catch (error) {
    console.error("❌ Delete error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
