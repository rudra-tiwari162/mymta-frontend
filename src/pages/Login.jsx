import { useState } from "react";
import axios from "axios";
import { saveToken, getUserFromToken } from "../services/auth";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const host = window.location.hostname; // vtec.localhost

        const url = `http://${host}:8000/api/login/`;

        console.log("Calling URL:", url); // debug

        const response = await axios.post(url, formData);
        console.log("Full response:", response.data);



        const token = response.data.access_token;

    saveToken(token);

      const user = getUserFromToken();

      if (user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/profile";
      }

    } catch (error) {
      console.error(error);
      alert("Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
