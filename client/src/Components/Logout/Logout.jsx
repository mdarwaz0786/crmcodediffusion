/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";

const Logout = () => {
  const { logOutTeam } = useAuth();

  useEffect(() => {
    logOutTeam();
  }, []);

  return <Navigate to="/login" />;
};

export default Logout;