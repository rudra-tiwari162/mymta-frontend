import { useEffect, useState } from "react";
import api from "../services/api";
import { getUserFromToken, logout } from "../services/auth";

function Profile() {
  const [profile, setProfile] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    username: ""
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const user = getUserFromToken();

    if (!user) {
      logout();
      window.location.href = "/login";
      return;
    }

    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/api/v1/users/me/");
      setProfile(response.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load profile.");
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await api.put("/api/v1/users/me/", {
        first_name: profile.first_name,
        last_name: profile.last_name
      });

      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to update profile.");
    }
  };

  return (
    <div style={{ width: "400px", margin: "50px auto" }}>
      <h2>My Profile</h2>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <form onSubmit={updateProfile}>
        <div>
          <label>Username</label>
          <input value={profile.username} disabled />
        </div>

        <div>
          <label>Email</label>
          <input value={profile.email} disabled />
        </div>

        <div>
          <label>First Name</label>
          <input
            name="first_name"
            value={profile.first_name || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Last Name</label>
          <input
            name="last_name"
            value={profile.last_name || ""}
            onChange={handleChange}
          />
        </div>

        <br />
        <button type="submit">Update Profile</button>
      </form>

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

export default Profile;
