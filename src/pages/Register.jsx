import { useState } from "react";
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
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
      await axios.post("http://localhost:8000/api/register/", formData);
      window.location.href = `http://${formData.subdomain}.localhost:5173/login`;
    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  return (
    <div>
      <h2>Register Company</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Company Name"
          onChange={handleChange}
        />

        <input
          name="subdomain"
          placeholder="Subdomain"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Admin Password"
          onChange={handleChange}
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
