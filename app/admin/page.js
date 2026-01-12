  "use client";

  import { useState, useEffect } from "react";
  import { supabase } from "../../lib/supabaseClient";


  function AdminPage() {
    const [todolists, settodolists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const [todos, setTodos] = useState([]);

    useEffect(() => {
      const fetchRoleAndData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // ดึง role จาก table users
        const { data: users, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (users?.role === 'admin') {
          setRole('admin');
          // ดึงข้อมูล todo ทั้งหมด
          const { data: todosData } = await supabase
            .from('todolists')
            .select('*');
          setTodos(todosData);
        } else {
          setRole('user');
        }
      };
      fetchRoleAndData();
    }, []);

    if (role === null) return <div>Loading...</div>;
    if (role !== 'admin') return <div>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>;

    return (
      <div className="container my-5">
        <h1 className="mb-4">Admin: ข้อมูล To-Do List ทั้งหมด</h1>
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle mb-0"
            style={{ width: "100%", tableLayout: "fixed", fontSize: "0.9rem" }}>
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
                  <td>{todo.status}</td>
                </tr>
              ))}
              {todolists.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center text-muted">ไม่มีข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  export default AdminPage;
