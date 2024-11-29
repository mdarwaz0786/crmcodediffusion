/* eslint-disable no-extra-semi */
import { Navigate, Outlet } from "react-router-dom";
import Header from "../../Components/Header/Header";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { useAuth } from "../../context/authContext.jsx";
import Preloader from "../../Preloader.jsx";

const MainPage = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <Preloader />
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  };

  return (
    <>
      <Header />
      <Outlet />
      <Sidebar />
    </>
  );
};

export default MainPage;