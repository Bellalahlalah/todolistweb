"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      // สำเร็จ: ไปหน้า ToDo
      router.push("/");
    }
  };

  return (
    <div className="container" style={{maxWidth: 400, marginTop: 80}}>
      <h2 className="mb-4">เข้าสู่ระบบ</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="อีเมล"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger py-1">{error}</div>}
        <button type="submit" className="btn btn-primary w-100  text-white">เข้าสู่ระบบ</button>
      </form>
      <div className="mt-3 text-center">
        ยังไม่มีบัญชี? <a href="/signup">สมัครสมาชิก</a>
      </div>
    </div>
  );
}