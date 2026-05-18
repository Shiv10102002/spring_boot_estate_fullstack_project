import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function OwnerRoutes() {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) return <Navigate to="/sign-in" />;
  if (currentUser.role !== "OWNER") return <Navigate to="/profile" />;

  return <Outlet />;
}

export default OwnerRoutes;
