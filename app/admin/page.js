"use client";

import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from 'next/navigation';
import React from 'react';

function AdminPage() {
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    const fetchRoleAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // ดึง role จาก table profiles
      const { data: users } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (users?.role === 'admin') {
        setRole('admin');
        const { data: todosData, error } = await supabase.from('todolists').select('*').order('id', { ascending: true });
        if (!error) setTodos(todosData || []);
      } else {
        setRole('user');
      }
      setLoading(false);
    };
    fetchRoleAndData();
  }, []);

  if (role === null || loading) return <div className="container my-5">Loading...</div>;
  if (role !== 'admin') return <div className="container my-5">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>; 

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("supabaseSession");
    router.push('/login');
  };

  const handleExport = () => {
    if (!todos.length) return;
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
    const rows = todos.map(todo => [
      todo.name,
      todo.work_group,
      todo.work_description,
      todo.quantity,
      todo.assignment_date,
      todo.plan_date,
      todo.deadline,
      todo.status
    ]);
    const csvContent = [header, ...rows]
      .map(row => row.map(field => `"${(field ?? '').toString().replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "todolist-all.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // สร้างรายการชื่อที่ไม่ซ้ำจาก todos
  const uniqueNames = [...new Set(todos.map(t => t.name).filter(Boolean))];

  const filteredTodos = filterName
    ? todos.filter(t => t.name === filterName)
    : todos;

  return (
    <> 
      <div className="bg-primary text-white py-4 mb-4 text-center rounded" style={{background:'#e3f2fd', color:'#111'}}>
        <h1 className="mb-0">To-Do List Manager</h1>
        <p className="mb-0">Admin view — ดูข้อมูลทั้งหมด</p>
      </div>
      <button
        onClick={() => router.push('/')}
        className="btn btn-light text-blue"
        style={{ position: "absolute", top: 70, right: 120, zIndex: 10 }}
      >
        Home
      </button>
      <button
        onClick={handleLogout}
        className="btn btn-danger text-white"
        style={{ position: "absolute", top: 70, right: 32, zIndex: 10 }}
      >
        Logout
      </button>

      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Admin: ข้อมูล To-Do ทั้งหมด</h3>
          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-select form-select-sm"
              style={{ width: 220 }}
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
            >
              <option value="">ทุกชื่อ</option>
              {uniqueNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            {filterName && (
              <button className="btn btn-secondary btn-sm text-white" onClick={() => setFilterName('')}>Clear</button>
            )}
            <button className="btn btn-success btn-sm text-white" onClick={handleExport}>Export CSV</button>
          </div>
        </div>

        <div className="table-responsive" style={{overflowX: 'auto'}}>
          <table className="table table-striped table-bordered align-middle mb-0" style={{ width: "100%", tableLayout: "fixed", fontSize: "0.85rem" }}>
            <thead>
              <tr>
                <th style={{ width: "40px", textAlign: "center" }}>#</th>
                <th style={{ width: "120px" }}>ชื่อ</th>
                <th>กลุ่มงาน</th>
                <th style={{ width: "220px" }}>รายละเอียด</th>
                <th style={{ width: "60px" }}>จำนวน</th>
                <th>วันที่สั่งงาน</th>
                <th>วันที่จะทำ</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTodos && filteredTodos.map((todo, idx) => (
                <tr key={todo.id} className={
                  todo.work_group === "CAPEX" ? "tr-capex" :
                  todo.work_group === "OPEX" ? "tr-opex" :
                  (todo.work_group === "FLEQ" || todo.work_group === "Teaching") ? "tr-fleq" : ""
                }>
                  <td>{idx + 1}</td>
                  <td>{todo.name}</td>
                  <td>{todo.work_group}</td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{todo.work_description}</td>
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
                </tr>
              ))}
              {(!todos || todos.length === 0) && (
                <tr>
                  <td colSpan="9" className="text-center text-muted">ไม่มีข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AdminPage;
