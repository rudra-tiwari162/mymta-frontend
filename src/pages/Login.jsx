import { useState, useEffect } from "react";
import axios from "axios";
import { saveToken, getUserFromToken, logout } from "../services/auth";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [errorMessage, setErrorMessage] = useState("");

  // 🔁 Clear old session when user comes back to login page
  useEffect(() => {
    setFormData({ username: "", password: "" });
    setErrorMessage("");
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // clear previous error

    try {
      const host = window.location.hostname; // vtec.localhost
      const url = `http://${host}:8000/api/login/`;

      const response = await axios.post(url, formData);

      const token = response.data.access_token;

      saveToken(token);

      const user = getUserFromToken();

      const userRoles = user?.['https://mymta.com/roles'] || [];

      if (userRoles.includes('ADMIN')) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/profile";
      }

    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage(
            error.response.data.error ||
            "Invalid username or password."
          );

          setFormData({
            username: "",
            password: ""
          });
        } else {
          setErrorMessage("Something went wrong. Please try again.");
        }
      } else {
        setErrorMessage("Server not reachable.");
      }
    }
  };

  return (
    <div style={{ width: "300px", margin: "100px auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
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

        <button type="submit">Login</button>
      </form>

      {/* 🔴 Error message in red */}
      {errorMessage && (
        <p style={{ color: "red", marginTop: "10px" }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default Login;
