"use client";

import 'bootstrap/dist/css/bootstrap.min.css';
import { supabase } from '@/lib/supabaseClient';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      }
    };
    checkSession();
  }, [router]);

  const [todolists, settodolists] = useState([]);
  const [form, setForm] = useState({
    name: '',
    work_group: '',
    work_description: '',
    quantity: '',
    assignment_date: '',
    plan_date: '',
    deadline: '',
  });

  // ดึงข้อมูล To-Do จาก Supabase
  useEffect(() => {
    fetchtodolists();
  }, []);

  const fetchtodolists = async () => {
    const { data, error } = await supabase.from('todolists').select('*').order('id', { ascending: true });
    if (!error) settodolists(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

   // เพิ่มข้อมูล To-Do ลง Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.work_group) return;
    const { error } = await supabase.from('todolists').insert([{ ...form, status: 'Pending' }]);
    if (!error) {
      setForm({
        name: '',
        work_group: '',
        work_description: '',
        quantity: '',
        assignment_date: '',
        plan_date: '',
        deadline: '',
      });
      fetchtodolists(); // รีเฟรชข้อมูล
    }
  };

  // ลบข้อมูล To-Do ใน Supabase
  const handleDelete = async (idx) => {
  const todo = todolists[idx];
  if (!todo) return;
  console.log('จะลบ todo:', todo); // เพิ่มบรรทัดนี้
  const { error } = await supabase.from('todolists').delete().eq('id', todo.id);
  if (error) {
    console.error('ลบไม่สำเร็จ:', error.message);
  }
  fetchtodolists();
  };

  const handleLogout = async () => {
  await supabase.auth.signOut();
  // ถ้ามี session ใน localStorage ให้ลบด้วย (ถ้าเคยใช้)
  localStorage.removeItem("supabaseSession");
  router.push("/login");
  };

  return (
    <>
      <div className="bg-primary text-white py-4 mb-4 text-center rounded" style={{background:'#e3f2fd', color:'#111'}}>
        <h1 className="mb-0" >To-Do List Manager</h1>
        <p className="mb-0" >จัดการงานของคุณอย่างมีประสิทธิภาพ</p>
      </div>
      <button
        onClick={handleLogout}
        className="btn btn-danger text-white"
        style={{ position: "absolute", top: 24, right: 32, zIndex: 10 }}
      >
        Logout
      </button>
      <div className="container my-5">
        <div className="d-flex custom-flex gap-4 align-items-start">
          {/* Left side form */}
          <div className="col-md-4" style={{minWidth:320, maxWidth:150, width:'100%'}}>
            <div className="card shadow-sm p-3">
              <div className="card-body">
                <h5 className="card-title mb-3">สร้าง To-Do ใหม่</h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">ชื่อ</label>
                    <select
                      className="form-select"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    >
                      <option value="">เลือก</option>
                      <option value="Nunthawun">Nunthawun</option>
                      <option value="Lunchakorn">Lunchakorn</option>
                      <option value="Sai-Mhok">Sai-Mhok</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">กลุ่มงาน</label>
                    <select
                      className="form-select"
                      name="work_group"
                      value={form.work_group}
                      onChange={handleChange}
                      required
                    >
                      <option value="">เลือก</option>
                      <option value="CAPEX">CAPEX</option>
                      <option value="OPEX">OPEX</option>
                      <option value="Master Data">Master Data</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">รายละเอียดงาน</label>
                    <input
                      type="text"
                      className="form-control"
                      name="work_description"
                      value={form.work_description}
                      onChange={handleChange}
                      placeholder="อธิบายเนื้องาน"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">จำนวน</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="ระบุจำนวน"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">วันที่สั่งงาน</label>
                    <input
                      type="date"
                      className="form-control"
                      name="assignment_date"
                      value={form.assignment_date}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">วันที่จะทำ</label>
                    <input
                      type="date"
                      className="form-control"
                      name="plan_date"
                      value={form.plan_date}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">วันที่ต้องส่งงาน</label>
                    <input
                      type="date"
                      className="form-control"
                      name="deadline"
                      value={form.deadline}
                      onChange={handleChange}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mt-2 text-white">
                    เพิ่ม To-Do
                  </button>
                </form>
              </div>
            </div>
          </div>
          {/* Right side table */}
          <div className="col-md-8" style={{width:'80%',  minWidth:0}}>
            <div className="card shadow-sm p-3 flex">
              <div className="card-body">
                <h5 className="card-title mb-3">รายการ To-Do</h5>
                <div className="table-responsive"  style={{overflowX: 'auto', maxWidth: '100%'}}>
                  <table className="table table-striped table-bordered align-middle mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>ชื่อ</th>
                        <th>กลุ่มงาน</th>
                        <th>รายละเอียด</th>
                        <th>จำนวน</th>
                        <th>วันที่สั่งงาน</th>
                        <th>วันที่จะทำ</th>
                        <th>Deadline</th>
                        <th>Status</th>
                        <th>ลบ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todolists.map((todo, idx) => (
                        <tr key={todo.id}>
                          <td>{idx + 1}</td>
                          <td>{todo.name}</td>
                          <td>{todo.work_group}</td>
                          <td>{todo.work_description}</td>
                          <td>{todo.quantity}</td>
                          <td>{todo.assignment_date}</td>
                          <td>{todo.plan_date}</td>
                          <td>{todo.deadline}</td>
                          <td>
                            <span className="badge bg-warning text-dark">{todo.status}</span>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(idx)}
                            >
                              ลบ
                            </button>
                          </td>
                        </tr>
                      ))}
                      {todolists.length === 0 && (
                        <tr>
                          <td colSpan="10" className="text-center text-muted">
                            ไม่มีรายการ
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}