import { useEffect, useState } from "react";
import api from "../services/api";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const fetchUsers = async () => {
    const response = await api.get("/api/v1/users/");
    setUsers(response.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const createUser = async (e) => {
    e.preventDefault();
    await api.post("/api/v1/users/", formData);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await api.delete(`/api/v1/users/${id}/`);
    fetchUsers();
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <form onSubmit={createUser}>
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          onChange={handleChange}
        />
        <button>Create User</button>
      </form>

      <h3>Users</h3>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.username} ({u.email})
            <button onClick={() => deleteUser(u.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
