process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import { Router } from 'next/router';
import { useState } from 'react';

export default function LoginPage() {
  // สร้าง state เก็บ email, password, user info, และ error message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    // เรียก API login
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // ถ้า login สำเร็จ เก็บ token ใน localStorage
      localStorage.setItem('access_token', data.session.access_token);

      // เก็บข้อมูล user ไว้ใน state
      setUser(data.user);

      setError('');
      
    } else {
      // ถ้า login ไม่สำเร็จ แสดง error message
      setError(data.error || 'Login failed');
    }
  }

  // ถ้า user login แล้วให้แสดงข้อความต้อนรับ
  if (user) {
    return (
      <div>
        <h2>Welcome, {user.email}!</h2>
         
      </div>
    );
  }

  // หน้า Login form
  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: '100%', padding: 8, margin: '8px 0' }}
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%', padding: 8, margin: '8px 0' }}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ padding: '10px 20px' }}>
          Login
        </button>
      </form>
    </div>
  );
}
