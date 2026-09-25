import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  BarChart3,
  Activity,
  Bot,
  Map,
  FileText,
  Settings,
  UserCircle,
  LogOut,
  ChevronLeft,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";


function Sidebar() {
  const navigate = useNavigate();

  const navigationItems = [
    {
      label: "Executive Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Projects",
      path: "/projects",
      icon: FolderKanban,
    },
    {
      label: "Risk Alerts",
      path: "/risk-alerts",
      icon: AlertTriangle,
      badge: true,
    },
    {
      label: "Analytics",
      path: "/analytics",
      icon: BarChart3,
    },
    {
      label: "Scenario Simulator",
      path: "/scenario-simulator",
      icon: Activity,
    },
    {
      label: "AI Assistant",
      path: "/ai-assistant",
      icon: Bot,
    },
    {
      label: "Geography",
      path: "/geography",
      icon: Map,
    },
    {
      label: "Reports",
      path: "/reports",
      icon: FileText,
    },
  ];


  const systemItems = [
    {
      label: "Administration",
      path: "/administration",
      icon: Settings,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: UserCircle,
    },
  ];


  function handleLogout() {
    navigate("/login");
  }


  return (
    <aside className="sidebar">

      {/* =================================================
          BRAND
          ================================================= */}

      <div className="sidebar-brand">

        <div className="sidebar-logo">
          P
        </div>

        <div className="sidebar-brand-text">

          <strong>
            PAIMANA
          </strong>

          <span>
            INSIGHT
          </span>

        </div>

      </div>


      {/* =================================================
          MAIN NAVIGATION
          ================================================= */}

      <div className="sidebar-section-label">
        MONITORING
      </div>

      <nav className="sidebar-navigation">

        {navigationItems.map(
          ({
            label,
            path,
            icon: Icon,
            badge,
          }) => (

            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <Icon size={18} />

              <span>
                {label}
              </span>

              {badge && (
                <span className="sidebar-alert-badge">
                  !
                </span>
              )}

            </NavLink>

          )
        )}

      </nav>


      {/* =================================================
          SYSTEM
          ================================================= */}

      <div className="sidebar-spacer" />

      <div className="sidebar-section-label">
        SYSTEM
      </div>

      <nav className="sidebar-navigation">

        {systemItems.map(
          ({
            label,
            path,
            icon: Icon,
          }) => (

            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >

              <Icon size={18} />

              <span>
                {label}
              </span>

            </NavLink>

          )
        )}

      </nav>


      {/* =================================================
          LOGOUT
          ================================================= */}

      <button
        className="sidebar-logout"
        onClick={handleLogout}
      >

        <LogOut size={18} />

        <span>
          Logout
        </span>

      </button>


      {/* =================================================
          COLLAPSE / VERSION
          ================================================= */}

      <div className="sidebar-footer">

        <div className="sidebar-footer-line" />

        <div className="sidebar-version">
          PAIMANA INSIGHT v1.0
        </div>

      </div>

    </aside>
  );
}


export default Sidebar;