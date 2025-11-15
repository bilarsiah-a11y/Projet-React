// src/Admin/RequireAdmin.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const RequireAdmin = ({ children }) => {
  const role = localStorage.getItem("role");
  const location = useLocation();

  console.log("RequireAdmin → rôle:", role);

  if (role !== "admin") {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default RequireAdmin;