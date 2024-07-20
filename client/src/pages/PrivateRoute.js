import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Context } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { user } = useContext(Context);
  if (!user) {
    return <Navigate to="/login" replace />;
  } else {
    return children;
  }
}
export { PrivateRoute };
