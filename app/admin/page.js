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
  const [filterStatus, setFilterStatus] = useState("");
  const [planFrom, setPlanFrom] = useState("");
  const [planTo, setPlanTo] = useState("");
  const [deadlineFrom, setDeadlineFrom] = useState("");
  const [deadlineTo, setDeadlineTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

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
    const BOM = "\uFEFF"; // UTF-8 BOM so Excel recognizes UTF-8 (fixes Thai garbling)
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
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

  // Apply chained filters: name -> status -> plan_date range -> deadline range
  const filteredTodos = todos
    .filter(t => (filterName ? t.name === filterName : true))
    .filter(t => (filterStatus ? t.status === filterStatus : true))
    .filter(t => (planFrom ? (t.plan_date && t.plan_date >= planFrom) : true))
    .filter(t => (planTo ? (t.plan_date && t.plan_date <= planTo) : true))
    .filter(t => (deadlineFrom ? (t.deadline && t.deadline >= deadlineFrom) : true))
    .filter(t => (deadlineTo ? (t.deadline && t.deadline <= deadlineTo) : true));

  const totalPages = Math.ceil(filteredTodos.length / ROWS_PER_PAGE);
  const pagedTodos = filteredTodos.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <> 
      <div className="bg-primary text-white py-4 mb-4 text-center" style={{background:'#e3f2fd', color:'#111', position:'sticky', top:0, zIndex:100}}>
        <h1 className="mb-0">To-Do List Manager</h1>
        <p className="mb-0">Admin view — ดูข้อมูลทั้งหมด</p>
        <div style={{ position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)", display: "flex", gap: 8 }}>
          <button onClick={() => router.push('/')} className="btn btn-light btn-sm">Home</button>
          <button onClick={handleLogout} className="btn btn-danger btn-sm text-white">Logout</button>
        </div>
      </div>

      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Admin: ข้อมูล To-Do ทั้งหมด</h3>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <select
              className="form-select form-select-sm"
              style={{ width: 220 }}
              value={filterName}
              onChange={handleFilterChange(setFilterName)}
            >
              <option value="">ทุกชื่อ</option>
              {uniqueNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            {filterName && (
              <button className="btn btn-secondary btn-sm text-white" onClick={() => setFilterName('')}>Clear</button>
            )}

            <select
              className="form-select form-select-sm"
              style={{ width: 150 }}
              value={filterStatus}
              onChange={handleFilterChange(setFilterStatus)}
            >
              <option value="">ทุกสถานะ</option>
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Delay">Delay</option>
              <option value="Complete">Complete</option>
            </select>

            <div className="d-flex gap-1 align-items-center">
              <label className="small mb-0 me-1">วันที่จะทำ:</label>
              <input type="date" className="form-control form-control-sm" value={planFrom} onChange={handleFilterChange(setPlanFrom)} />
              <span className="small mx-1">to</span>
              <input type="date" className="form-control form-control-sm" value={planTo} onChange={handleFilterChange(setPlanTo)} />
            </div>

            <div className="d-flex gap-1 align-items-center">
              <label className="small mb-0 me-1">Deadline:</label>
              <input type="date" className="form-control form-control-sm" value={deadlineFrom} onChange={handleFilterChange(setDeadlineFrom)} />
              <span className="small mx-1">to</span>
              <input type="date" className="form-control form-control-sm" value={deadlineTo} onChange={handleFilterChange(setDeadlineTo)} />
            </div>

            {(filterName || filterStatus || planFrom || planTo || deadlineFrom || deadlineTo) && (
              <button className="btn btn-secondary btn-sm text-white" onClick={() => { setFilterName(''); setFilterStatus(''); setPlanFrom(''); setPlanTo(''); setDeadlineFrom(''); setDeadlineTo(''); setCurrentPage(1); }}>Clear All</button>
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
              {pagedTodos && pagedTodos.map((todo, idx) => (
                <tr key={todo.id} className={
                  todo.work_group === "CAPEX" ? "tr-capex" :
                  todo.work_group === "OPEX" ? "tr-opex" :
                  (todo.work_group === "FLEQ" || todo.work_group === "Teaching") ? "tr-fleq" : ""
                }>
                  <td>{(currentPage - 1) * ROWS_PER_PAGE + idx + 1}</td>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-muted small">
              แสดง {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filteredTodos.length)} จาก {filteredTodos.length} รายการ
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(1)}>«</button>
                </li>
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>‹</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <li key={`ellipsis-${i}`} className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    ) : (
                      <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage(p)}>{p}</button>
                      </li>
                    )
                  )}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>›</button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(totalPages)}>»</button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminPage;
