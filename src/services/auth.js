import { jwtDecode } from "jwt-decode";

export const saveToken = (token) => {
  localStorage.setItem("access_token", token);
};

export const getUserFromToken = () => {
  const token = localStorage.getItem("access_token");
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
  localStorage.removeItem("access_token");
  localStorage.removeItem("id_token"); // Also remove id_token for cleanup
};