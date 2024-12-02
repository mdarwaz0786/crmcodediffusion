/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const base_url = import.meta.env.VITE_API_BASE_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [team, setTeam] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const validToken = `Bearer ${token}`;
  let isLoggedIn = !!token;
  let status;

  const storeToken = (serverToken) => {
    setToken(serverToken);
    return localStorage.setItem("token", serverToken);
  };

  const logOutTeam = () => {
    setToken("");
    setTeam("");
    if (status !== 401) {
      toast.success("Logout successful");
    };
    return localStorage.removeItem("token");
  };

  const loggedInTeam = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${base_url}/api/v1/team/loggedin-team`, {
        headers: {
          Authorization: validToken,
        },
      });
      if (response?.data?.success) {
        setTeam(response?.data?.team);
        setIsLoading(false);
      };
    } catch (error) {
      setIsLoading(false);
      if (error?.response && error?.response?.status === 401) {
        status = error?.response?.status;
        logOutTeam();
        toast.error("Please log in to continue");
      } else {
        console.log("Error while fetching logged in employee:", error.message);
      };
    };
  };

  useEffect(() => {
    loggedInTeam();
  }, []);

  return (
    <AuthContext.Provider value={{ storeToken, logOutTeam, isLoggedIn, team, isLoading, validToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};