import { FaHome, FaTasks, FaUsers, FaUserTie } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "./BottomTab.css";

const tabs = [
  { name: "Home", path: "/", icon: FaHome },
  { name: "Project", path: "/project", icon: FaTasks },
  { name: "Client", path: "/client", icon: FaUsers },
  { name: "Employee", path: "/employee", icon: FaUserTie },
];

const BottomTab = () => {
  const location = useLocation();

  return (
    <nav className="bottom-tab">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.name}
            to={tab.path}
            className={`tab-link ${isActive ? "active" : ""}`}
          >
            <Icon size={isActive ? 26 : 22} />
            <span className="tab-label">{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomTab;
