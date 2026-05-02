import { useEffect, useState } from "react";
import api from "../services/api";
import { getUserFromToken, logout } from "../services/auth";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const user = getUserFromToken();
    const userRoles = user?.["https://mymta.com/roles"] || [];

    if (!user || !userRoles.includes("ADMIN")) {
      logout();
      window.location.href = "/login";
    } else {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/v1/users/");
      setUsers(response.data);
    } catch (error) {
      setErrorMessage("Failed to load users");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const createUser = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await api.post("/api/v1/users/", formData);
      setSuccessMessage("User created successfully");
      setFormData({ username: "", password: "" });
      fetchUsers();
    } catch (error) {
      if (error.response?.status === 403) {
        setErrorMessage("You are not allowed to create users.");
      } else {
        setErrorMessage("Failed to create user.");
      }
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/api/v1/users/${id}/`);
      fetchUsers();
    } catch (error) {
      setErrorMessage("Failed to delete user.");
    }
  };

  return (
    <div style={{ width: "700px", margin: "50px auto" }}>
      <h2>Admin Dashboard</h2>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <h3>Create Employee</h3>
      <form onSubmit={createUser}>
        <input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />
        <br /><br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <br /><br />
        <button type="submit">Create User</button>
      </form>

      <hr />

      <h3>Users</h3>
      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Username</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, index) => (
            <tr key={u.email || u.username}>
              <td>{index + 1}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>
                <button onClick={() => deleteUser(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      <button
        onClick={() => {
          logout();
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default AdminDashboard;
