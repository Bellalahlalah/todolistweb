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
    quantity: '1',
    assignment_date: new Date().toISOString().slice(0, 10), // ใช้วันที่ปัจจุบันเป็นค่าเริ่มต้น
    plan_date: '',
    deadline: '',
    status: 'Select', // ค่าเริ่มต้นสำหรับ status
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
    const { error } = await supabase.from('todolists').insert([{ ...form }]);
    if (!error) {
      setForm({
        name: '',
        work_group: '',
        work_description: '',
        quantity: '1',
        assignment_date: new Date().toISOString().slice(0, 10), // ใช้วันที่ปัจจุบันเป็นค่าเริ่มต้น
        plan_date: '',
        deadline: '',
        status: 'Select', // รีเซ็ตค่า status เป็น Select
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

  // แก้ไขข้อมูล To-Do ใน Supabase
  const [editId, setEditId] = useState(null);
  const handleEdit = (idx) => {
    const todo = todolists[idx];
    setForm({
      name: todo.name,
      work_group: todo.work_group,
      work_description: todo.work_description,
      quantity: todo.quantity,
      assignment_date: todo.assignment_date,
      plan_date: todo.plan_date,
      deadline: todo.deadline,
      status: todo.status,
    });
    setEditId(todo.id);
  };

  const handleUpdate = async (e) => {
  e.preventDefault();
    if (!form.name || !form.work_group) return;
    const { error } = await supabase
      .from('todolists')
      .update({ ...form })
      .eq('id', editId);
    if (!error) {
      setForm({
        name: '',
        work_group: '',
        work_description: '',
        quantity: '1',
        assignment_date: new Date().toISOString().slice(0, 10),
        plan_date: '',
        deadline: '',
        status: 'Select',
      });
      setEditId(null);
      fetchtodolists();
    }
  };

  const handleLogout = async () => {
  await supabase.auth.signOut();
  // ถ้ามี session ใน localStorage ให้ลบด้วย (ถ้าเคยใช้)
  localStorage.removeItem("supabaseSession");
  router.push("/login");
  };

//Export to CSV File
const handleExport = () => {
  if (!todolists.length) return;
  const header = [
    "ชื่อ",
    "กลุ่มงาน",
    "รายละเอียด",
    "จำนวน",
    "วันที่สั่งงาน",
    "วันที่จะทำ",
    "Deadline",
    "Status"
  ];
  const rows = todolists.map(todo => [
    todo.name,
    todo.work_group,
    todo.work_description,
    todo.quantity,
    todo.assignment_date,
    todo.plan_date,
    todo.deadline,
    todo.status
  ]);
  const csvContent =
    [header, ...rows]
      .map(row => row.map(field => `"${(field ?? '').toString().replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "todolist.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const [filterGroup, setFilterGroup] = useState("");

const filteredTodolists = filterGroup
  ? todolists.filter(todo => todo.work_group === filterGroup)
  : todolists;
  const handleFilterChange = (e) => {
    setFilterGroup(e.target.value);
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
          <div className="col-md-4" style={{minWidth:250, maxWidth:150, width:'100%'}}>
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
                      <option value="">Select</option>
                      <option value="Charoean">Charoean</option>
                      <option value="Supitcha">Supitcha</option>
                      <option value="Newwalux">Newwalux</option>
                      <option value="Watchara">Watchara</option>
                      <option value="Pantiwa">Pantiwa</option>
                      <option value="Nunthawun">Nunthawun</option>
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
                      <option value="">Select</option>
                      <option value="CAPEX">CAPEX</option>
                      <option value="OPEX">OPEX</option>
                      <option value="FLEQ">FLEQ</option>
                      <option value="Master Data">Master Data</option>
                      <option value="Development">Development</option>
                      <option value="Data analyst">Data analyst</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Teaching">Teaching</option>
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
                      required
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
                      min="1"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">วันที่สั่งงาน</label>
                    <input
                      type="date"
                      className={`form-control${form.assignment_date === new Date().toISOString().slice(0, 10) ? " grey-bg" : ""}`}
                      name="assignment_date"
                      value={form.assignment_date}
                      onChange={handleChange}
                      required
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
                      required
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
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={form.status || "Select" }
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      <option value="Pending">Pending</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Delay">Delay</option>
                      <option value="Complete">Complete</option>
                    </select>
                  </div>
                  {/* ปุ่มเพิ่ม/บันทึกการแก้ไข */}
                  {editId ? (
                    <button type="button" className="btn btn-warning w-100 mt-2 text-white" onClick={handleUpdate}>
                      บันทึกการแก้ไข
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-primary w-100 mt-2 text-white">
                      เพิ่ม To-Do
                    </button>
                  )}

                  {/*Clear Button */}
                  <button
                  type="button"
                  className="btn btn-secondary w-100 mt-2 text-white" 
                  onClick={() =>
                    setForm({
                      name: '',
                      work_group: '',
                      work_description: '',
                      quantity: '1',
                      assignment_date: new Date().toISOString().slice(0, 10),
                      plan_date: '',
                      deadline: '',
                      status: 'Select',
                    })
                  }
                  >
                  Clear Filter
                </button>
                </form>
              </div>
            </div>
          </div>
          {/* Right side table */}
          <div className="col-md-8" style={{overflowX:'auto', width:'80%',  minWidth:0}}>
            <div className="card shadow-sm p-3 flex">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">รายการ To-Do</h5>
                  <div className="d-flex gap-2 align-items-center">
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 150}}
                      value={filterGroup}
                      onChange={e => setFilterGroup(e.target.value)}
                    >
                      <option value="">ทุกกลุ่มงาน</option>
                      <option value="CAPEX">CAPEX</option>
                      <option value="OPEX">OPEX</option>
                      <option value="FLEQ">FLEQ</option>
                      <option value="Master Data">Master Data</option>
                      <option value="Development">Development</option>
                      <option value="Data analyst">Data analyst</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Teaching">Teaching</option>
                    </select>
                    {filterGroup && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setFilterGroup("")}
                      >
                        clear Filter
                      </button>
                    )}
                    <button className="btn btn-success btn-sm text-white" onClick={handleExport}>
                      Export CSV
                    </button>
                  </div>
                </div>
                <div className="table-responsive"  style={{overflowX: 'auto', maxWidth: '100%'}}>
                  <table className="table table-striped table-bordered align-middle mb-0"
                  style={{ width: "100%", tableLayout: "fixed", fontSize: "0.78rem" }}>
                    <thead>
                      <tr>
                        <th style={{ width: "40px", textAlign: "center" }}>#</th>
                        <th style={{ width: "90px" }}>ชื่อ</th>
                        <th>กลุ่มงาน</th>
                        <th style={{ width: "150px" }}>รายละเอียด</th>
                        <th style={{ width: "60px", textAlign: "left" }}>จำนวน</th>
                        <th>วันที่สั่งงาน</th>
                        <th>วันที่จะทำ</th>
                        <th>Deadline</th>
                        <th>Status</th>
                        <th>แก้ไข</th>
                        <th>ลบ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTodolists.map((todo, idx) => (
                        <tr
                          key={todo.id}
                          className={
                            todo.work_group === "CAPEX"
                              ? "tr-capex"
                              : todo.work_group === "OPEX"
                              ? "tr-opex"
                              : todo.work_group === "FLEQ" || todo.work_group === "Teaching"
                              ? "tr-fleq"
                              : ""
                          }
                        >
                          <td>{idx + 1}</td>
                          <td>{todo.name}</td>
                          <td>{todo.work_group}</td>
                          <td>{todo.work_description}</td>
                          <td>{todo.quantity}</td>
                          <td>{todo.assignment_date}</td>
                          <td>{todo.plan_date}</td>
                          <td>{todo.deadline}</td>
                          <td>
                            {todo.status === "Pending" && (
                              <span className="badge bg-warning text-dark">Pending</span>
                            )}
                            {todo.status === "Ongoing" && (
                              <span className="badge bg-primary">Ongoing</span>
                            )}
                            {todo.status === "Delay" && (
                              <span className="badge bg-danger">Delay</span>
                            )}
                            {todo.status === "Complete" && (
                              <span className="badge bg-success">Complete</span>
                            )}
                          </td>
                          {/*Edit Button */}
                          <td>
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleEdit(idx)}
                            >
                              แก้ไข
                            </button>
                          </td>
                          {/*Deletes Button */}
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