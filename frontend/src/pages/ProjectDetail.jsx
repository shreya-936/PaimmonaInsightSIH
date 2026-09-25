import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getProject,
  getProjectUpdates,
  getProjectFeatures,
  getProjectRisk,
  getProjectAlerts,
} from "../services/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import "./project-detail.css";


function ProjectDetail() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [features, setFeatures] = useState(null);
  const [risk, setRisk] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");


  /* =====================================================
     LOAD PROJECT DATA
     ===================================================== */

  async function loadProject(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        projectData,
        updateData,
        featureData,
        riskData,
        alertData,
      ] = await Promise.all([
        getProject(projectId),
        getProjectUpdates(projectId),
        getProjectFeatures(projectId),
        getProjectRisk(projectId),
        getProjectAlerts(projectId),
      ]);

      setProject(projectData);
      setUpdates(
        Array.isArray(updateData)
          ? updateData
          : []
      );
      setFeatures(featureData);
      setRisk(riskData);
      setAlerts(
        alertData?.alerts || []
      );

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load project details."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }


  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);


  /* =====================================================
     DERIVED VALUES
     ===================================================== */

  const summary = useMemo(() => {
    const costRisk = Number(
      risk?.cost_risk || 0
    );

    const delayRisk = Number(
      risk?.delay_risk || 0
    );

    const implementationRisk = Number(
      risk?.implementation_risk || 0
    );

    /*
      Prefer the backend priority index.

      If it is unavailable, calculate the same
      simple weighted priority used by the prototype.
    */
    const backendPriority = Number(
      risk?.priority_index ??
        risk?.overall_risk ??
        NaN
    );

    const calculatedPriority =
      costRisk * 0.4 +
      delayRisk * 0.35 +
      implementationRisk * 0.25;

    const priority = Number.isFinite(
      backendPriority
    )
      ? backendPriority
      : calculatedPriority;

    const physicalProgress = Number(
      features?.physical_progress_pct ??
        project?.physical_progress ??
        0
    );

    const financialProgress =
      Number(
        features?.financial_completion_ratio ??
          project?.financial_progress / 100 ??
          0
      ) * 100;

    const costOverrun =
      Number(
        features?.cost_overrun_ratio ??
          0
      ) * 100;

    const milestoneCompletion =
      Number(
        features?.milestone_completion_ratio ??
          0
      ) * 100;

    const burnGap = Number(
      features?.burn_vs_progress_gap ??
        financialProgress -
          physicalProgress
    );

    let level = "Low";

    if (priority >= 80) {
      level = "Critical";
    } else if (priority >= 70) {
      level = "High";
    } else if (priority >= 40) {
      level = "Medium";
    }

    return {
      costRisk,
      delayRisk,
      implementationRisk,
      priority,
      physicalProgress,
      financialProgress,
      costOverrun,
      milestoneCompletion,
      burnGap,
      level,
    };
  }, [
    project,
    features,
    risk,
  ]);


  /* =====================================================
     CHART DATA
     ===================================================== */

  const chartData = useMemo(() => {
    return [...updates]
      .sort(
        (a, b) =>
          new Date(a.update_date) -
          new Date(b.update_date)
      )
      .map((item) => ({
        date: new Date(
          item.update_date
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
          }
        ),

        physical: Number(
          item.physical_progress_pct || 0
        ),

        financial: item.revised_cost
          ? Number(
              (
                (item.expenditure_to_date /
                  item.revised_cost) *
                100
              ).toFixed(1)
            )
          : 0,
      }));
  }, [updates]);


  /* =====================================================
     HELPERS
     ===================================================== */

  function formatCurrency(value) {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  }


  function formatDate(value) {
    if (!value) {
      return "—";
    }

    return new Date(
      value
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }


  function getRiskLabel(value) {
    if (value >= 80) {
      return "Critical";
    }

    if (value >= 70) {
      return "High";
    }

    if (value >= 40) {
      return "Medium";
    }

    return "Low";
  }


  function getRiskClass(value) {
    if (value >= 70) {
      return "critical";
    }

    if (value >= 40) {
      return "medium";
    }

    return "low";
  }


  function getStatusClass(status) {
    const normalized =
      String(status || "")
        .toLowerCase();

    if (
      normalized.includes("delay")
    ) {
      return "delayed";
    }

    if (
      normalized.includes("watch")
    ) {
      return "watch";
    }

    return "on-track";
  }


  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <section className="project-detail-page">
        <div className="project-detail-loading">
          <RefreshCw
            size={24}
            className="spin"
          />

          <span>
            Loading project intelligence...
          </span>
        </div>
      </section>
    );
  }


  /* =====================================================
     ERROR
     ===================================================== */

  if (error || !project) {
    return (
      <section className="project-detail-page">

        <div className="project-detail-error">

          <ShieldAlert
            size={34}
          />

          <h2>
            Unable to load project
          </h2>

          <p>
            {error ||
              "The requested project could not be found."}
          </p>

          <button
            className="pd-primary-button"
            onClick={() =>
              navigate("/projects")
            }
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>

        </div>

      </section>
    );
  }


  /* =====================================================
     MAIN PAGE
     ===================================================== */

  return (
    <section className="project-detail-page">

      {/* =================================================
          BACK / PAGE HEADER
          ================================================= */}

      <div className="pd-page-header">

        <div>

          <button
            className="pd-back-button"
            onClick={() =>
              navigate("/projects")
            }
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>

          <div className="pd-eyebrow">
            <Building2 size={15} />
            PROJECT INTELLIGENCE
          </div>

          <h1>
            {project.name}
          </h1>

          <p className="pd-project-subtitle">
            {project.project_id}
            <span>•</span>
            {project.sector}
            <span>•</span>
            {project.agency}
          </p>

        </div>


        <div className="pd-header-actions">

          <span
            className={`pd-status-badge ${getStatusClass(
              project.status
            )}`}
          >
            {project.status ===
            "Delayed" ? (
              <AlertTriangle
                size={14}
              />
            ) : (
              <CheckCircle2
                size={14}
              />
            )}

            {project.status ||
              "On Track"}
          </span>

          <button
            className="pd-refresh-button"
            onClick={() =>
              loadProject(true)
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

      </div>


      {/* =================================================
          PROJECT INFORMATION
          ================================================= */}

      <div className="pd-info-card">

        <div className="pd-card-heading">

          <div>
            <span>
              PROJECT INFORMATION
            </span>

            <h2>
              Current project position
            </h2>
          </div>

          <div className="pd-update-date">
            <CalendarDays size={15} />
            Latest update:
            <strong>
              {formatDate(
                features?.latest_update
              )}
            </strong>
          </div>

        </div>


        <div className="pd-info-grid">

          <div className="pd-info-item">
            <span>
              Ministry
            </span>

            <strong>
              {project.ministry}
            </strong>
          </div>


          <div className="pd-info-item">
            <span>
              Executing Agency
            </span>

            <strong>
              {project.agency}
            </strong>
          </div>


          <div className="pd-info-item">
            <span>
              Original Cost
            </span>

            <strong>
              {formatCurrency(
                project.original_cost
              )}
            </strong>
          </div>


          <div className="pd-info-item">
            <span>
              Revised Cost
            </span>

            <strong>
              {formatCurrency(
                project.revised_cost
              )}
            </strong>
          </div>

        </div>

      </div>


      {/* =================================================
          RISK SUMMARY
          ================================================= */}

      <div className="pd-risk-layout">

        {/* Overall Priority */}

        <div className="pd-priority-card">

          <div className="pd-card-label">
            PREDICTIVE RISK
          </div>

          <div className="pd-priority-header">

            <div>
              <h2>
                Overall Priority
              </h2>

              <p>
                Combined project priority based
                on current cost, delay, and
                implementation risk indicators.
              </p>
            </div>

            <span
              className={`pd-risk-level ${getRiskClass(
                summary.priority
              )}`}
            >
              {summary.level}
            </span>

          </div>


          <div className="pd-priority-score">

            <strong>
              {summary.priority.toFixed(
                2
              )}
            </strong>

            <span>
              /100
            </span>

          </div>


          <div className="pd-priority-track">
            <div
              className={`pd-priority-fill ${getRiskClass(
                summary.priority
              )}`}
              style={{
                width: `${Math.min(
                  summary.priority,
                  100
                )}%`,
              }}
            />
          </div>

        </div>


        {/* Risk Dimensions */}

        <div className="pd-risk-card">

          <div className="pd-card-label">
            RISK BREAKDOWN
          </div>

          <h2>
            Risk Dimensions
          </h2>


          <div className="pd-risk-list">

            {[
              [
                "Cost Risk",
                summary.costRisk,
              ],
              [
                "Delay Risk",
                summary.delayRisk,
              ],
              [
                "Implementation Risk",
                summary.implementationRisk,
              ],
            ].map(
              ([label, value]) => (
                <div
                  className="pd-risk-item"
                  key={label}
                >

                  <div className="pd-risk-top">

                    <strong>
                      {label}
                    </strong>

                    <span>
                      <b>
                        {value.toFixed(
                          0
                        )}
                      </b>
                      /100
                    </span>

                  </div>


                  <div className="pd-risk-track">

                    <div
                      className={`pd-risk-fill ${getRiskClass(
                        value
                      )}`}
                      style={{
                        width: `${Math.min(
                          value,
                          100
                        )}%`,
                      }}
                    />

                  </div>


                  <div className="pd-risk-bottom">

                    <span
                      className={`pd-risk-text ${getRiskClass(
                        value
                      )}`}
                    >
                      {getRiskLabel(
                        value
                      )}
                    </span>

                    <span>
                      {value >= 70
                        ? "Requires attention"
                        : value >= 40
                          ? "Monitor closely"
                          : "Within range"}
                    </span>

                  </div>

                </div>
              )
            )}

          </div>

        </div>

      </div>


      {/* =================================================
          PERFORMANCE
          ================================================= */}

      <div className="pd-performance-grid">

        <div className="pd-performance-card">

          <div className="pd-card-label">
            PROJECT PERFORMANCE
          </div>

          <h2>
            Current Indicators
          </h2>


          <div className="pd-indicator-grid">

            <div className="pd-indicator">

              <div className="pd-indicator-icon blue">
                <TrendingUp size={17} />
              </div>

              <div>
                <span>
                  Physical Progress
                </span>

                <strong>
                  {summary.physicalProgress.toFixed(
                    1
                  )}
                  %
                </strong>
              </div>

            </div>


            <div className="pd-indicator">

              <div className="pd-indicator-icon green">
                <CheckCircle2 size={17} />
              </div>

              <div>
                <span>
                  Financial Completion
                </span>

                <strong>
                  {summary.financialProgress.toFixed(
                    1
                  )}
                  %
                </strong>
              </div>

            </div>


            <div className="pd-indicator">

              <div className="pd-indicator-icon red">
                <ShieldAlert size={17} />
              </div>

              <div>
                <span>
                  Cost Overrun
                </span>

                <strong>
                  {summary.costOverrun.toFixed(
                    1
                  )}
                  %
                </strong>
              </div>

            </div>


            <div className="pd-indicator">

              <div className="pd-indicator-icon amber">
                <Clock3 size={17} />
              </div>

              <div>
                <span>
                  Milestone Completion
                </span>

                <strong>
                  {summary.milestoneCompletion.toFixed(
                    1
                  )}
                  %
                </strong>
              </div>

            </div>

          </div>


          <div className="pd-gap-box">

            <div>
              <span>
                Burn vs Progress Gap
              </span>

              <strong>
                {summary.burnGap.toFixed(
                  2
                )}
                percentage points
              </strong>
            </div>

            <p>
              Positive values indicate that
              financial completion is ahead of
              physical progress.
            </p>

          </div>

        </div>


        {/* Progress Chart */}

        <div className="pd-chart-card">

          <div className="pd-card-heading">

            <div>
              <span>
                MONITORING TREND
              </span>

              <h2>
                Physical vs Financial Progress
              </h2>
            </div>

            <span className="pd-update-count">
              {updates.length} updates
            </span>

          </div>


          <div className="pd-chart">

            {chartData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={260}
              >
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e7edf4"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 11,
                      fill: "#8090a3",
                    }}
                  />

                  <YAxis
                    domain={[
                      0,
                      100,
                    ]}
                    tick={{
                      fontSize: 11,
                      fill: "#8090a3",
                    }}
                  />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="physical"
                    name="Physical Progress"
                    stroke="#3478d4"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="financial"
                    name="Financial Completion"
                    stroke="#d85b5b"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                    }}
                  />

                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="pd-empty-chart">
                No monitoring history available.
              </div>
            )}

          </div>

        </div>

      </div>


      {/* =================================================
          ALERTS
          ================================================= */}

      <div className="pd-section-card">

        <div className="pd-section-heading">

          <div>
            <span>
              EARLY WARNING SYSTEM
            </span>

            <h2>
              Active Alerts
            </h2>
          </div>

          <button
            className="pd-secondary-button"
            onClick={() =>
              navigate("/risk-alerts")
            }
          >
            View Alert Center
          </button>

        </div>


        {alerts.length === 0 ? (
          <div className="pd-empty-state">
            <CheckCircle2 size={22} />
            <span>
              No active alerts for this project.
            </span>
          </div>
        ) : (
          <div className="pd-alert-list">

            {alerts.map(
              (alert, index) => {

                const high =
                  String(
                    alert.severity ||
                      ""
                  ).toLowerCase() ===
                  "high";

                return (
                  <div
                    className={`pd-alert ${high ? "high" : "medium"}`}
                    key={`${alert.type}-${index}`}
                  >

                    <div className="pd-alert-icon">
                      {high ? (
                        <ShieldAlert
                          size={19}
                        />
                      ) : (
                        <AlertTriangle
                          size={19}
                        />
                      )}
                    </div>


                    <div className="pd-alert-content">

                      <div className="pd-alert-title-row">

                        <strong>
                          {alert.type}
                        </strong>

                        <span>
                          {alert.severity}
                        </span>

                      </div>

                      <p>
                        {alert.message}
                      </p>

                      <small>
                        {alert.reason}
                      </small>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>


      {/* =================================================
          UPDATE HISTORY
          ================================================= */}

      <div className="pd-section-card">

        <div className="pd-section-heading">

          <div>
            <span>
              MONITORING HISTORY
            </span>

            <h2>
              Project Updates
            </h2>
          </div>

          <span className="pd-update-count">
            {updates.length} updates
          </span>

        </div>


        {updates.length === 0 ? (
          <div className="pd-empty-state">
            <Clock3 size={22} />
            <span>
              No monitoring updates available.
            </span>
          </div>
        ) : (
          <div className="pd-table-wrapper">

            <table className="pd-table">

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Revised Cost</th>
                  <th>Expenditure</th>
                  <th>Physical Progress</th>
                  <th>Milestones</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>

              </thead>


              <tbody>

                {[...updates]
                  .sort(
                    (a, b) =>
                      new Date(
                        b.update_date
                      ) -
                      new Date(
                        a.update_date
                      )
                  )
                  .map(
                    (update) => (
                      <tr
                        key={
                          update.id
                        }
                      >

                        <td>
                          <strong>
                            {formatDate(
                              update.update_date
                            )}
                          </strong>
                        </td>

                        <td>
                          {formatCurrency(
                            update.revised_cost
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            update.expenditure_to_date
                          )}
                        </td>

                        <td>
                          <strong>
                            {Number(
                              update.physical_progress_pct ||
                                0
                            ).toFixed(
                              1
                            )}
                            %
                          </strong>
                        </td>

                        <td>
                          {update.milestones_completed}
                          /
                          {update.milestones_planned}
                        </td>

                        <td>
                          <span
                            className={`pd-table-status ${getStatusClass(
                              update.status
                            )}`}
                          >
                            {update.status}
                          </span>
                        </td>

                        <td className="pd-remarks">
                          {update.remarks ||
                            "—"}
                        </td>

                      </tr>
                    )
                  )}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* =================================================
          FOOTER ACTIONS
          ================================================= */}

      <div className="pd-bottom-actions">

        <button
          className="pd-secondary-button"
          onClick={() =>
            navigate("/projects")
          }
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>


        <button
          className="pd-primary-button"
          onClick={() =>
            navigate(
              `/ai-assistant?project=${project.project_id}`
            )
          }
        >
          Ask AI Assistant
        </button>

      </div>

    </section>
  );
}

export default ProjectDetail;