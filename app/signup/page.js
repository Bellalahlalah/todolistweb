"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลของคุณ");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight: "80vh", background: "#fff"}}>
      <div className="container" style={{maxWidth: 400}}>
        <h2 className="mb-4 text-center" >สมัครสมาชิก</h2>
        <form onSubmit={handleSignUp}>
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
          {success && <div className="alert alert-success py-1">{success}</div>}
          <button type="submit" className="btn btn-primary w-100 text-white">สมัครสมาชิก</button>
        </form>
        <div className="mt-3 text-center">
          มีบัญชีแล้ว? <a href="/login">เข้าสู่ระบบ</a>
        </div>
      </div>
    </div>
  );
}