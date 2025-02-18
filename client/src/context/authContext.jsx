/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
const base_url = import.meta.env.VITE_API_BASE_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [team, setTeam] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const validToken = `Bearer ${token}`;
  let isLoggedIn = !!token;

  const storeToken = (serverToken) => {
    setToken(serverToken);
    return localStorage.setItem("token", serverToken);
  };

  const logOutTeam = () => {
    setToken("");
    setTeam("");
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
      logOutTeam();
    };
  };

  const loggedInCustomer = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${base_url}/api/v1/customer/loggedin-customer`, {
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
      logOutTeam();
    };
  };

  useEffect(() => {
    if (isLoggedIn) {
      const userType = localStorage.getItem("userType");

      if (userType === "Employee") {
        loggedInTeam();
      } else if (userType === "Client") {
        loggedInCustomer();
      };
    } else {
      setIsLoading(false);
    };
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider value={{ storeToken, logOutTeam, isLoggedIn, team, isLoading, validToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};