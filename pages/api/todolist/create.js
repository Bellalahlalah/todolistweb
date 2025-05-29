process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import { supabase } from '@/lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    name,
    work_group,
    work_description,
    quantity,
    assignment_date,
    plan_date,
    deadline,
    status,
    user_id
  } = req.body

  try {
    const { data, error } = await supabase
      .from('todolists')
      .insert([
        {
          name,
          work_group,
          work_description,
          quantity,
          assignment_date,
          plan_date,
          deadline,
          status,
          user_id
        }
      ])
  

    if (error) {
      console.error('❌ Insert error:', error.message)
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ message: 'To-do created successfully', data })
  } catch (err) {
    console.error('🔥 Internal server error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
