import { jwtDecode } from "jwt-decode";

const tenant = window.location.hostname.split(".")[0];




export const saveToken = (token) => {
  localStorage.setItem("access_token_${tenant}", token);
};

export const getUserFromToken = () => {
  const token = localStorage.getItem("access_token_${tenant}");
  if (!token) {
    return null;
  }
  try {
    return jwtDecode(token);
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("access_token_${tenant}");
  localStorage.removeItem("id_token_${tenant}"); // Also remove id_token for cleanup
};