import {
  LayoutDashboard,
  FolderKanban,
  Bell,
  BarChart3,
  Map,
  Sparkles,
  SlidersHorizontal,
  FileText,
  Settings,
  Search,
  RefreshCw,
  ChevronDown,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  Activity,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useNavigate } from "react-router-dom";

const riskTrend = [
  { month: "Jan", risk: 48 },
  { month: "Feb", risk: 52 },
  { month: "Mar", risk: 55 },
  { month: "Apr", risk: 58 },
  { month: "May", risk: 61 },
  { month: "Jun", risk: 59 },
  { month: "Jul", risk: 64 },
  { month: "Aug", risk: 61 },
];

const riskDistribution = [
  { name: "Low", value: 174 },
  { name: "Medium", value: 141 },
  { name: "High", value: 27 },
];

const projects = [
  {
    id: "P1001",
    name: "National Highway Package A",
    sector: "Transport",
    progress: 55,
    costRisk: 84,
    delayRisk: 91,
    priority: 87,
    status: "High",
  },
  {
    id: "P1002",
    name: "Regional Water Grid",
    sector: "Water",
    progress: 63,
    costRisk: 38,
    delayRisk: 44,
    priority: 41,
    status: "Low",
  },
  {
    id: "P1003",
    name: "Urban Power Upgrade",
    sector: "Power",
    progress: 47,
    costRisk: 61,
    delayRisk: 57,
    priority: 59,
    status: "Medium",
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const menu = [
    [LayoutDashboard, "Dashboard"],
    [FolderKanban, "Projects"],
    [Bell, "Risk Alerts"],
    [BarChart3, "Analytics"],
    [Map, "Geospatial View"],
    [SlidersHorizontal, "Scenario Simulator"],
    [Sparkles, "AI Assistant"],
    [FileText, "Reports"],
    [Settings, "Administration"],
  ];

  return (
    <aside className="sidebar">

      <div className="sidebar-brand">
        <div className="brand-icon">
          <Activity size={22} />
        </div>

        <div>
          <strong>PAIMANA</strong>
          <span>INSIGHT</span>
        </div>
      </div>

      <div className="sidebar-section">
        <span>MONITORING</span>
      </div>

      <nav>

        {menu.map(([Icon, name], index) => (
          <button
            key={name}
            className={`sidebar-link ${
              index === 0 ? "active" : ""
            }`}
          >
            <Icon size={18} />
            <span>{name}</span>

            {name === "Risk Alerts" && (
              <b className="notification-badge">14</b>
            )}
          </button>
        ))}

      </nav>

      <div className="sidebar-bottom">

        <div className="user-box">
          <div className="avatar">EA</div>

          <div>
            <strong>Executive Analyst</strong>
            <span>Ministry of Infrastructure</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem("paimana_user");
            navigate("/login");
          }}
        >
          Sign out
        </button>

      </div>

    </aside>
  );
}

function Dashboard() {
  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        {/* TOP BAR */}

        <header className="topbar">

          <div className="search-box">
            <Search size={18} />

            <input
              placeholder="Search projects, ministries, sectors..."
            />
          </div>

          <div className="topbar-actions">

            <button className="icon-button">
              <Bell size={20} />

              <span className="bell-dot"></span>
            </button>

            <button className="profile-button">
              <div className="avatar small">EA</div>

              <div>
                <strong>Executive</strong>
                <span>Administrator</span>
              </div>

              <ChevronDown size={16} />
            </button>

          </div>

        </header>

        {/* PAGE HEADER */}

        <section className="page-header">

          <div>
            <span className="page-label">
              PAIMANA / EXECUTIVE OVERVIEW
            </span>

            <h1>Executive Dashboard</h1>

            <p>
              Predictive monitoring for a stronger, more resilient
              infrastructure future.
            </p>
          </div>

          <div className="header-actions">

            <button className="secondary-button">
              <RefreshCw size={16} />
              Refresh Data
            </button>

            <button className="primary-button">
              Export Report
            </button>

          </div>

        </section>

        {/* FILTERS */}

        <section className="filter-bar">

          <button>
            Ministry: All
            <ChevronDown size={15} />
          </button>

          <button>
            Sector: All
            <ChevronDown size={15} />
          </button>

          <button>
            Region: All India
            <ChevronDown size={15} />
          </button>

          <button>
            Last 12 Months
            <ChevronDown size={15} />
          </button>

        </section>

        {/* KPI CARDS */}

        <section className="kpi-grid">

          <div className="kpi-card">

            <div className="kpi-icon blue">
              <FolderKanban size={21} />
            </div>

            <div>
              <span>Total Projects</span>
              <strong>342</strong>
              <small>↑ 8.4% from last month</small>
            </div>

          </div>

          <div className="kpi-card">

            <div className="kpi-icon red">
              <AlertTriangle size={21} />
            </div>

            <div>
              <span>High Risk</span>
              <strong>27</strong>
              <small>7.9% of portfolio</small>
            </div>

          </div>

          <div className="kpi-card">

            <div className="kpi-icon orange">
              <TrendingUp size={21} />
            </div>

            <div>
              <span>Average Risk Index</span>
              <strong>61</strong>
              <small>↑ 4.2% this month</small>
            </div>

          </div>

          <div className="kpi-card">

            <div className="kpi-icon green">
              <IndianRupee size={21} />
            </div>

            <div>
              <span>Project Value</span>
              <strong>₹8,420 Cr</strong>
              <small>Portfolio under monitoring</small>
            </div>

          </div>

          <div className="kpi-card">

            <div className="kpi-icon purple">
              <Bell size={21} />
            </div>

            <div>
              <span>New Warnings</span>
              <strong>14</strong>
              <small>Last 30 days</small>
            </div>

          </div>

        </section>

        {/* CHART ROW */}

        <section className="dashboard-grid">

          {/* RISK DISTRIBUTION */}

          <div className="dashboard-card">

            <div className="card-header">
              <div>
                <h3>Risk Distribution</h3>
                <span>Current portfolio</span>
              </div>

              <button>View details</button>
            </div>

            <div className="donut-container">

              <ResponsiveContainer width="55%" height={220}>

                <PieChart>

                  <Pie
                    data={riskDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                  >

                    <Cell fill="#16a085" />
                    <Cell fill="#f39c12" />
                    <Cell fill="#e74c3c" />

                  </Pie>

                </PieChart>

              </ResponsiveContainer>

              <div className="risk-legend">

                <div>
                  <i className="green-dot"></i>
                  <span>Low</span>
                  <strong>174</strong>
                </div>

                <div>
                  <i className="orange-dot"></i>
                  <span>Medium</span>
                  <strong>141</strong>
                </div>

                <div>
                  <i className="red-dot"></i>
                  <span>High</span>
                  <strong>27</strong>
                </div>

              </div>

            </div>

          </div>

          {/* RISK TREND */}

          <div className="dashboard-card trend-card">

            <div className="card-header">

              <div>
                <h3>Portfolio Risk Trend</h3>
                <span>Average priority index</span>
              </div>

              <button>Last 8 months</button>

            </div>

            <ResponsiveContainer width="100%" height={220}>

              <AreaChart data={riskTrend}>

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={[40, 70]}
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="#1769aa"
                  fill="#dceeff"
                  strokeWidth={3}
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </section>

        {/* PROJECTS + ALERTS */}

        <section className="bottom-grid">

          {/* PROJECT TABLE */}

          <div className="dashboard-card projects-card">

            <div className="card-header">

              <div>
                <h3>Project Risk Monitor</h3>
                <span>Projects requiring attention</span>
              </div>

              <button>View all projects →</button>

            </div>

            <div className="table-container">

              <table>

                <thead>

                  <tr>
                    <th>Project</th>
                    <th>Sector</th>
                    <th>Progress</th>
                    <th>Cost Risk</th>
                    <th>Delay Risk</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>

                </thead>

                <tbody>

                  {projects.map((project) => (

                    <tr key={project.id}>

                      <td>
                        <div className="project-name">
                          <strong>{project.id}</strong>
                          <span>{project.name}</span>
                        </div>
                      </td>

                      <td>{project.sector}</td>

                      <td>
                        <div className="progress-wrapper">

                          <div className="progress-bar">
                            <span
                              style={{
                                width: `${project.progress}%`,
                              }}
                            ></span>
                          </div>

                          <small>
                            {project.progress}%
                          </small>

                        </div>
                      </td>

                      <td>
                        <span className={`risk-pill ${
                          project.costRisk >= 70
                            ? "high"
                            : project.costRisk >= 50
                            ? "medium"
                            : "low"
                        }`}>
                          {project.costRisk}%
                        </span>
                      </td>

                      <td>
                        <span className={`risk-pill ${
                          project.delayRisk >= 70
                            ? "high"
                            : project.delayRisk >= 50
                            ? "medium"
                            : "low"
                        }`}>
                          {project.delayRisk}%
                        </span>
                      </td>

                      <td>
                        <strong>{project.priority}</strong>
                      </td>

                      <td>
                        <span className={`status ${project.status.toLowerCase()}`}>
                          {project.status}
                        </span>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* ALERTS */}

          <div className="dashboard-card alerts-card">

            <div className="card-header">

              <div>
                <h3>Latest Alerts</h3>
                <span>Early warning signals</span>
              </div>

              <button>View all</button>

            </div>

            <div className="alert-list">

              <div className="alert-item">

                <div className="alert-icon red">
                  <AlertTriangle size={17} />
                </div>

                <div>
                  <strong>Cost risk crossed threshold</strong>
                  <span>
                    P1001 · National Highway Package A
                  </span>
                  <small>18 minutes ago</small>
                </div>

              </div>

              <div className="alert-item">

                <div className="alert-icon orange">
                  <TrendingUp size={17} />
                </div>

                <div>
                  <strong>Progress deterioration detected</strong>
                  <span>
                    P1003 · Urban Power Upgrade
                  </span>
                  <small>42 minutes ago</small>
                </div>

              </div>

              <div className="alert-item">

                <div className="alert-icon yellow">
                  <Activity size={17} />
                </div>

                <div>
                  <strong>Milestone slippage risk</strong>
                  <span>
                    P1002 · Regional Water Grid
                  </span>
                  <small>1 hour ago</small>
                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;