import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    id,
    name,
    work_group,
    work_description,
    quantity,
    assignment_date,
    plan_date,
    deadline,
    status,
  } = req.body;

  try {
    const { data, error } = await supabase
      .from("todolists")
      .update({
        name,
        work_group,
        work_description,
        quantity,
        assignment_date,
        plan_date,
        deadline,
        status,
      })
      .eq("id", id)
      

    if (error) {
      console.error("Update error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: "To-do updated successfully", data });
  } catch (error) {
    console.error("❌ Update error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
