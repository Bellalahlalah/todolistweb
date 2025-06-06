process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  //เพิ่งเพิ่ม ดึง access token จาก headers
  const token = req.headers.authorization?.split(" ")[1];
  //เพิ่งเพิ่ม
   if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token" });
  }

  //เพิ่งเพิ่ม สร้าง Supabase client ใหม่พร้อม token
  const supabaseWithAuth = supabase.auth.setAuth(token);

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
    user_id // Ensure user_id is included in the request body
  } = req.body;

  //เพิ่งเพิ่ม Validate required fields
  try {
    // ใช้ Supabase Auth client ดึง user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }


  
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
        status
      })
      .eq("id", id)
      .eq("user_id", user_id)
      .select("*")

    if (error) {
      console.error("Update error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: "To-do updated successfully", data :data[0] });
  } catch (error) {
    console.error("❌ Update error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
