import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  CheckCircle2,
  Filter,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import AlertCard from "../components/AlertCard";

import {
  getProjects,
  getProjectAlerts,
} from "../services/api";


function RiskAlerts() {
  const navigate = useNavigate();

  const [projects, setProjects] =
    useState([]);

  const [alerts, setAlerts] =
    useState([]);

  const [severityFilter, setSeverityFilter] =
    useState("All");

  const [typeFilter, setTypeFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  async function loadAlerts() {
    try {
      setLoading(true);
      setError("");

      const projectList =
        await getProjects();

      setProjects(
        projectList || []
      );


      const alertResults =
        await Promise.all(
          (projectList || []).map(
            async (project) => {

              try {

                const result =
                  await getProjectAlerts(
                    project.project_id
                  );

                return (
                  result?.alerts || []
                ).map(
                  (alert) => ({
                    ...alert,
                    project_id:
                      project.project_id,
                    project_name:
                      project.name,
                  })
                );

              } catch {
                return [];
              }

            }
          )
        );


      setAlerts(
        alertResults.flat()
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
          "Unable to load risk alerts."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadAlerts();
  }, []);


  /* =====================================================
     FILTER OPTIONS
     ===================================================== */

  const alertTypes =
    useMemo(() => {

      const types =
        alerts
          .map(
            (alert) =>
              alert.type
          )
          .filter(Boolean);

      return [
        "All",
        ...new Set(types),
      ];

    }, [alerts]);


  /* =====================================================
     FILTERED ALERTS
     ===================================================== */

  const filteredAlerts =
    useMemo(() => {

      return alerts.filter(
        (alert) => {

          const matchesSeverity =
            severityFilter ===
              "All" ||
            String(
              alert.severity
            ).toLowerCase() ===
              severityFilter.toLowerCase();


          const matchesType =
            typeFilter ===
              "All" ||
            alert.type ===
              typeFilter;


          return (
            matchesSeverity &&
            matchesType
          );

        }
      );

    }, [
      alerts,
      severityFilter,
      typeFilter,
    ]);


  /* =====================================================
     SUMMARY
     ===================================================== */

  const highAlerts =
    alerts.filter(
      (alert) =>
        String(
          alert.severity
        ).toLowerCase() ===
        "high"
    ).length;


  const mediumAlerts =
    alerts.filter(
      (alert) =>
        String(
          alert.severity
        ).toLowerCase() ===
        "medium"
    ).length;


  const affectedProjects =
    new Set(
      alerts.map(
        (alert) =>
          alert.project_id
      )
    ).size;


  return (
    <div className="risk-alerts-page">

      {/* =================================================
          PAGE HEADER
          ================================================= */}

      <section className="page-header">

        <div>

          <div className="page-eyebrow">
            EARLY WARNING SYSTEM
          </div>

          <h2>
            Risk Alerts
          </h2>

          <p>
            Review predictive warnings,
            understand their drivers, and
            identify projects requiring
            attention.
          </p>

        </div>


        <button
          className="secondary-button"
          onClick={loadAlerts}
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

          Refresh Alerts

        </button>

      </section>


      {/* =================================================
          ERROR
          ================================================= */}

      {error && (

        <div className="status-banner status-error">

          <AlertTriangle size={18} />

          <div>

            <strong>
              Alert data unavailable
            </strong>

            <span>
              {error}
            </span>

          </div>

        </div>

      )}


      {/* =================================================
          SUMMARY
          ================================================= */}

      <section className="alert-summary-grid">

        <div className="alert-summary-card">

          <div className="alert-summary-icon red">
            <ShieldAlert size={20} />
          </div>

          <div>

            <span>
              High Severity
            </span>

            <strong>
              {highAlerts}
            </strong>

          </div>

        </div>


        <div className="alert-summary-card">

          <div className="alert-summary-icon orange">
            <AlertTriangle size={20} />
          </div>

          <div>

            <span>
              Medium Severity
            </span>

            <strong>
              {mediumAlerts}
            </strong>

          </div>

        </div>


        <div className="alert-summary-card">

          <div className="alert-summary-icon blue">
            <BellRing size={20} />
          </div>

          <div>

            <span>
              Total Alerts
            </span>

            <strong>
              {alerts.length}
            </strong>

          </div>

        </div>


        <div className="alert-summary-card">

          <div className="alert-summary-icon purple">
            <Filter size={20} />
          </div>

          <div>

            <span>
              Affected Projects
            </span>

            <strong>
              {affectedProjects}
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          FILTERS
          ================================================= */}

      <section className="alert-filter-card">

        <div className="filter-heading">

          <Filter size={17} />

          <strong>
            Filter Alerts
          </strong>

        </div>


        <div className="filter-control">

          <label htmlFor="alert-severity">
            Severity
          </label>

          <select
            id="alert-severity"
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(
                event.target.value
              )
            }
          >

            <option value="All">
              All Severities
            </option>

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>

          </select>

        </div>


        <div className="filter-control">

          <label htmlFor="alert-type">
            Alert Type
          </label>

          <select
            id="alert-type"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
          >

            {alertTypes.map(
              (type) => (

                <option
                  key={type}
                  value={type}
                >
                  {type === "All"
                    ? "All Types"
                    : type}
                </option>

              )
            )}

          </select>

        </div>


        <div className="filter-result-count">

          Showing{" "}
          <strong>
            {filteredAlerts.length}
          </strong>
          {" "}of{" "}
          <strong>
            {alerts.length}
          </strong>
          {" "}alerts

        </div>

      </section>


      {/* =================================================
          ALERT CONTENT
          ================================================= */}

      {loading ? (

        <div className="page-loading">

          <div className="loading-spinner" />

          <h3>
            Loading risk alerts...
          </h3>

          <p>
            Checking the latest project
            monitoring signals.
          </p>

        </div>

      ) : filteredAlerts.length === 0 ? (

        <div className="dashboard-card">

          <div className="no-alerts large">

            <CheckCircle2 size={38} />

            <strong>
              No alerts match the current filters
            </strong>

            <span>
              Try changing the severity or
              alert type filter.
            </span>

          </div>

        </div>

      ) : (

        <section className="alerts-page-content">

          <div className="alerts-list-header">

            <div>

              <span className="card-eyebrow">
                ACTIVE SIGNALS
              </span>

              <h3>
                Attention Required
              </h3>

            </div>

            <span className="table-record-count">
              {filteredAlerts.length} alerts
            </span>

          </div>


          <div className="alerts-page-list">

            {filteredAlerts.map(
              (alert, index) => (

                <AlertCard
                  key={`${alert.project_id}-${alert.type}-${index}`}
                  type={alert.type}
                  severity={
                    alert.severity
                  }
                  message={
                    alert.message
                  }
                  reason={
                    alert.reason
                  }
                  projectName={
                    alert.project_name
                  }
                  onClick={() =>
                    navigate(
                      `/projects/${alert.project_id}`
                    )
                  }
                />

              )
            )}

          </div>

        </section>

      )}


      {/* =================================================
          ALERT PRINCIPLE
          ================================================= */}

      <section className="alert-information-card">

        <div className="alert-information-icon">
          <ShieldAlert size={21} />
        </div>

        <div>

          <strong>
            Decision-support alerting
          </strong>

          <p>
            Alerts identify indicators that
            cross configured monitoring
            thresholds. They are intended to
            support human review and timely
            intervention; they do not trigger
            automatic punitive action.
          </p>

        </div>

      </section>


      {/* =================================================
          BACK TO DASHBOARD
          ================================================= */}

      <button
        className="back-button"
        onClick={() =>
          navigate("/dashboard")
        }
      >

        <ArrowLeft size={17} />

        Back to Dashboard

      </button>

    </div>
  );
}


export default RiskAlerts;