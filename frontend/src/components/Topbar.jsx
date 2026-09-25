import {
  Bell,
  ChevronDown,
  Menu,
  Search,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";


function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);


  const pageInfo = getPageInfo(
    location.pathname
  );


  function handleProfile() {
    setShowMenu(false);
    navigate("/profile");
  }


  function handleLogout() {
    setShowMenu(false);
    navigate("/login");
  }


  return (
    <header className="topbar">

      {/* =================================================
          LEFT
          ================================================= */}

      <div className="topbar-left">

        <button
          className="mobile-menu-button"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div>

          <div className="topbar-breadcrumb">

            <span>
              Monitoring
            </span>

            <span className="breadcrumb-separator">
              /
            </span>

            <strong>
              {pageInfo.title}
            </strong>

          </div>

          <h1 className="topbar-title">
            {pageInfo.title}
          </h1>

          <p className="topbar-description">
            {pageInfo.description}
          </p>

        </div>

      </div>


      {/* =================================================
          RIGHT
          ================================================= */}

      <div className="topbar-right">

        {/* Search */}

        <button
          className="topbar-icon-button"
          aria-label="Search"
        >
          <Search size={18} />
        </button>


        {/* Notifications */}

        <button
          className="topbar-icon-button notification-button"
          onClick={() =>
            navigate("/risk-alerts")
          }
          aria-label="Notifications"
        >

          <Bell size={18} />

          <span className="notification-dot" />

        </button>


        {/* User */}

        <div className="topbar-user-wrapper">

          <button
            className="topbar-user"
            onClick={() =>
              setShowMenu(!showMenu)
            }
          >

            <div className="topbar-avatar">
              AD
            </div>

            <div className="topbar-user-info">

              <strong>
                Administrator
              </strong>

              <span>
                Executive
              </span>

            </div>

            <ChevronDown
              size={15}
              className={
                showMenu
                  ? "chevron-up"
                  : ""
              }
            />

          </button>


          {/* USER MENU */}

          {showMenu && (

            <div className="topbar-user-menu">

              <button
                onClick={handleProfile}
              >
                My Profile
              </button>

              <button
                onClick={() =>
                  navigate(
                    "/administration"
                  )
                }
              >
                Administration
              </button>

              <div className="menu-divider" />

              <button
                className="logout-menu-item"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}


/* =========================================================
   PAGE INFORMATION
   ========================================================= */

function getPageInfo(pathname) {

  if (
    pathname === "/" ||
    pathname === "/dashboard"
  ) {
    return {
      title: "Executive Dashboard",
      description:
        "Predictive monitoring of infrastructure projects",
    };
  }


  if (pathname === "/projects") {
    return {
      title: "Infrastructure Projects",
      description:
        "View and monitor registered infrastructure projects",
    };
  }


  if (
    pathname.startsWith("/projects/")
  ) {
    return {
      title: "Project Detail",
      description:
        "Detailed project performance and risk analysis",
    };
  }


  if (pathname === "/risk-alerts") {
    return {
      title: "Risk Alerts",
      description:
        "Early-warning signals from project monitoring",
    };
  }


  if (pathname === "/analytics") {
    return {
      title: "Analytics",
      description:
        "Explore project performance and risk analytics",
    };
  }


  if (
    pathname === "/scenario-simulator"
  ) {
    return {
      title: "Scenario Simulator",
      description:
        "Evaluate potential project scenarios",
    };
  }


  if (pathname === "/ai-assistant") {
    return {
      title: "AI Assistant",
      description:
        "Ask questions about project performance and risk",
    };
  }


  if (pathname === "/geography") {
    return {
      title: "Geography",
      description:
        "Explore infrastructure projects by geography",
    };
  }


  if (pathname === "/reports") {
    return {
      title: "Reports",
      description:
        "Generate and review project monitoring reports",
    };
  }


  if (
    pathname === "/administration"
  ) {
    return {
      title: "Administration",
      description:
        "Manage application configuration and access",
    };
  }


  if (pathname === "/profile") {
    return {
      title: "Profile",
      description:
        "Manage your account and preferences",
    };
  }


  return {
    title: "PAIMANA INSIGHT",
    description:
      "Predictive infrastructure monitoring",
  };
}


export default Topbar;