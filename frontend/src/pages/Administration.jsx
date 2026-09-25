import {
  Activity,
  CheckCircle2,
  Database,
  LockKeyhole,
  RefreshCw,
  Server,
  ShieldCheck,
  Users,
  Wifi,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getHealth,
  getProjects,
} from "../services/api";


function Administration() {
  const [health, setHealth] =
    useState(null);

  const [projectCount, setProjectCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  async function loadSystemStatus() {

    try {

      setLoading(true);
      setError("");


      const [
        healthResponse,
        projectsResponse,
      ] = await Promise.all([
        getHealth(),
        getProjects(),
      ]);


      setHealth(
        healthResponse
      );

      setProjectCount(
        Array.isArray(
          projectsResponse
        )
          ? projectsResponse.length
          : 0
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
          "Unable to connect to the backend."
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {
    loadSystemStatus();
  }, []);


  const backendOnline =
    health?.status ===
    "healthy";


  return (
    <div className="administration-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <section className="page-header">

        <div>

          <div className="page-eyebrow">
            SYSTEM MANAGEMENT
          </div>

          <h2>
            Administration
          </h2>

          <p>
            Monitor platform services,
            configuration and access controls.
          </p>

        </div>


        <button
          className="secondary-button"
          onClick={
            loadSystemStatus
          }
          disabled={loading}
        >

          <RefreshCw
            size={16}
            className={
              loading
                ? "spin"
                : ""
            }
          />

          Refresh Status

        </button>

      </section>


      {/* =================================================
          CONNECTION STATUS
          ================================================= */}

      {error && (

        <div className="status-banner status-error">

          <XCircle size={18} />

          <div>

            <strong>
              Backend connection issue
            </strong>

            <span>
              {error}
            </span>

          </div>

        </div>

      )}


      <section className="admin-status-banner">

        <div
          className={`admin-status-icon ${
            backendOnline
              ? "online"
              : "offline"
          }`}
        >

          {backendOnline ? (
            <CheckCircle2 size={24} />
          ) : (
            <XCircle size={24} />
          )}

        </div>


        <div className="admin-status-content">

          <strong>
            {backendOnline
              ? "PAIMANA INSIGHT services are operational"
              : "PAIMANA INSIGHT backend is unavailable"}
          </strong>

          <span>
            {backendOnline
              ? "The application is connected to the FastAPI monitoring backend."
              : "Check that the FastAPI backend is running and accessible."}
          </span>

        </div>


        <div
          className={`admin-status-pill ${
            backendOnline
              ? "online"
              : "offline"
          }`}
        >

          <span />

          {backendOnline
            ? "Operational"
            : "Offline"}

        </div>

      </section>


      {/* =================================================
          SYSTEM SERVICES
          ================================================= */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>

            <span className="card-eyebrow">
              SYSTEM HEALTH
            </span>

            <h3>
              Service Status
            </h3>

          </div>

          <Activity size={19} />

        </div>


        <div className="admin-service-grid">

          <ServiceCard
            icon={Server}
            title="FastAPI Backend"
            description="Application API and monitoring services"
            status={
              backendOnline
                ? "Operational"
                : "Offline"
            }
            online={backendOnline}
          />


          <ServiceCard
            icon={Database}
            title="Project Database"
            description="SQLite project and monitoring records"
            status={
              backendOnline
                ? "Connected"
                : "Unavailable"
            }
            online={backendOnline}
          />


          <ServiceCard
            icon={Wifi}
            title="API Connectivity"
            description="Frontend to backend communication"
            status={
              backendOnline
                ? "Connected"
                : "Disconnected"
            }
            online={backendOnline}
          />


          <ServiceCard
            icon={Activity}
            title="Risk Engine"
            description="Predictive risk calculation service"
            status={
              backendOnline
                ? "Available"
                : "Unavailable"
            }
            online={backendOnline}
          />

        </div>

      </section>


      {/* =================================================
          PLATFORM OVERVIEW
          ================================================= */}

      <section className="admin-overview-grid">

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                PLATFORM
              </span>

              <h3>
                Application Overview
              </h3>

            </div>

          </div>


          <div className="admin-info-list">

            <InfoRow
              label="Application"
              value="PAIMANA INSIGHT"
            />

            <InfoRow
              label="Version"
              value="1.0"
            />

            <InfoRow
              label="Backend"
              value="FastAPI"
            />

            <InfoRow
              label="Database"
              value="SQLite"
            />

            <InfoRow
              label="Frontend"
              value="React + Vite"
            />

            <InfoRow
              label="Projects Loaded"
              value={projectCount}
            />

          </div>

        </div>


        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                ACCESS CONTROL
              </span>

              <h3>
                Security Configuration
              </h3>

            </div>

            <LockKeyhole size={19} />

          </div>


          <div className="admin-security-list">

            <SecurityItem
              icon={ShieldCheck}
              title="Role-Based Access"
              description="Executive, Analyst and Project Officer roles"
              status="Configured"
            />


            <SecurityItem
              icon={Users}
              title="User Management"
              description="Administrative user controls"
              status="Configured"
            />


            <SecurityItem
              icon={LockKeyhole}
              title="Protected Operations"
              description="Administrative functions require authorization"
              status="Enabled"
            />

          </div>

        </div>

      </section>


      {/* =================================================
          CONFIGURATION
          ================================================= */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>

            <span className="card-eyebrow">
              CONFIGURATION
            </span>

            <h3>
              Monitoring Configuration
            </h3>

          </div>

        </div>


        <div className="admin-config-grid">

          <ConfigCard
            title="Risk Threshold"
            value="70 / 100"
            description="High-risk alert threshold"
          />


          <ConfigCard
            title="Moderate Threshold"
            value="40 / 100"
            description="Monitoring threshold"
          />


          <ConfigCard
            title="Alert Engine"
            value="Enabled"
            description="Rule-based early warning alerts"
          />


          <ConfigCard
            title="Human Review"
            value="Required"
            description="Decision-support workflow"
          />

        </div>

      </section>


      {/* =================================================
          GOVERNANCE NOTE
          ================================================= */}

      <section className="admin-governance-card">

        <div className="admin-governance-icon">

          <ShieldCheck size={22} />

        </div>


        <div>

          <strong>
            Governance & Human Oversight
          </strong>

          <p>
            PAIMANA INSIGHT is designed as a
            predictive decision-support layer.
            Risk scores and alerts should support
            authorized officers in reviewing
            project conditions. The system does
            not automatically take punitive or
            administrative action.
          </p>

        </div>

      </section>


      {/* =================================================
          BACKEND DETAILS
          ================================================= */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>

            <span className="card-eyebrow">
              SERVICE INFORMATION
            </span>

            <h3>
              Backend Status
            </h3>

          </div>

        </div>


        <div className="admin-backend-panel">

          <div className="admin-backend-status">

            <div
              className={`backend-indicator ${
                backendOnline
                  ? "online"
                  : "offline"
              }`}
            />

            <div>

              <strong>
                {backendOnline
                  ? "Backend reachable"
                  : "Backend unreachable"}
              </strong>

              <span>
                API endpoint:
                {" "}
                http://127.0.0.1:8000
              </span>

            </div>

          </div>


          <div className="admin-backend-version">

            <span>
              Service
            </span>

            <strong>
              {health?.service ||
                "paimana-insight-backend"}
            </strong>

          </div>


          <div className="admin-backend-version">

            <span>
              API Version
            </span>

            <strong>
              {health
                ? "0.1.0"
                : "—"}
            </strong>

          </div>

        </div>

      </section>


      <div className="admin-footer-note">

        <ShieldCheck size={15} />

        <span>
          Administrative configuration shown
          here represents the current prototype
          environment. Production deployment
          should use secure environment variables,
          authentication, audit logging and
          encrypted connections.
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   SERVICE CARD
   ========================================================= */

function ServiceCard({
  icon: Icon,
  title,
  description,
  status,
  online,
}) {
  return (
    <div className="admin-service-card">

      <div className="admin-service-icon">

        <Icon size={20} />

      </div>


      <div className="admin-service-content">

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>


      <div
        className={`admin-service-status ${
          online
            ? "online"
            : "offline"
        }`}
      >

        <span />

        {status}

      </div>

    </div>
  );
}


/* =========================================================
   INFO ROW
   ========================================================= */

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="admin-info-row">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


/* =========================================================
   SECURITY ITEM
   ========================================================= */

function SecurityItem({
  icon: Icon,
  title,
  description,
  status,
}) {
  return (
    <div className="admin-security-item">

      <div className="admin-security-icon">

        <Icon size={18} />

      </div>


      <div className="admin-security-content">

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>


      <span className="admin-configured-badge">
        {status}
      </span>

    </div>
  );
}


/* =========================================================
   CONFIG CARD
   ========================================================= */

function ConfigCard({
  title,
  value,
  description,
}) {
  return (
    <div className="admin-config-card">

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {description}
      </small>

    </div>
  );
}


export default Administration;