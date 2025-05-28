import { supabase } from '@/lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  console.log('📥 signup request:', email, password)  // <== เพิ่มบรรทัดนี้

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      console.log('❌ Supabase signup error:', error.message)  // <== เพิ่ม log
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ user: data.user })
  } catch (err) {
    console.error('🔥 Internal server error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
