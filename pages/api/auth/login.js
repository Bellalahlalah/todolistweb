
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  console.log('📥 login request:', email)

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('❌ Supabase login error:', error.message)
      return res.status(401).json({ error: error.message })
    }

    return res.status(200).json({
      user: data.user,
      session: data.session
    })
  } catch (err) {
    console.error('🔥 Internal server error:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
