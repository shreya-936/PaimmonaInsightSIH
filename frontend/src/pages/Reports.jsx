import {
  BarChart3,
  Calendar,
  Download,
  FileText,
  Filter,
  Printer,
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
} from "react-router-dom";

import {
  getProjects,
  getProjectRisk,
  getProjectFeatures,
  getProjectAlerts,
} from "../services/api";


function Reports() {
  const navigate = useNavigate();

  const [projects, setProjects] =
    useState([]);

  const [riskData, setRiskData] =
    useState({});

  const [featureData, setFeatureData] =
    useState({});

  const [alertData, setAlertData] =
    useState({});

  const [selectedProject, setSelectedProject] =
    useState("all");

  const [reportType, setReportType] =
    useState("executive");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  async function loadReportData() {

    try {

      setLoading(true);
      setError("");


      const projectList =
        await getProjects();

      setProjects(
        projectList || []
      );


      const results =
        await Promise.all(
          (projectList || []).map(
            async (project) => {

              const projectId =
                project.project_id;


              const [
                risk,
                features,
                alerts,
              ] = await Promise.all([
                getProjectRisk(
                  projectId
                ).catch(
                  () => null
                ),

                getProjectFeatures(
                  projectId
                ).catch(
                  () => null
                ),

                getProjectAlerts(
                  projectId
                ).catch(
                  () => null
                ),
              ]);


              return {
                projectId,
                risk,
                features,
                alerts,
              };

            }
          )
        );


      const riskMap = {};
      const featureMap = {};
      const alertMap = {};


      results.forEach(
        (item) => {

          riskMap[
            item.projectId
          ] = item.risk;

          featureMap[
            item.projectId
          ] = item.features;

          alertMap[
            item.projectId
          ] = item.alerts;

        }
      );


      setRiskData(riskMap);
      setFeatureData(featureMap);
      setAlertData(alertMap);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
          "Unable to load report data."
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {
    loadReportData();
  }, []);


  /* =====================================================
     SELECTED PROJECTS
     ===================================================== */

  const reportProjects =
    useMemo(() => {

      if (
        selectedProject ===
        "all"
      ) {
        return projects;
      }


      return projects.filter(
        (project) =>
          project.project_id ===
          selectedProject
      );

    }, [
      projects,
      selectedProject,
    ]);


  /* =====================================================
     REPORT METRICS
     ===================================================== */

  const metrics =
    useMemo(() => {

      const total =
        reportProjects.length;


      const delayed =
        reportProjects.filter(
          (project) =>
            project.status ===
            "Delayed"
        ).length;


      const highRisk =
        reportProjects.filter(
          (project) => {

            const score =
              Number(
                riskData[
                  project.project_id
                ]?.priority_index ??
                  riskData[
                    project.project_id
                  ]?.overall_risk ??
                  0
              );

            return score >= 70;

          }
        ).length;


      const totalAlerts =
        reportProjects.reduce(
          (sum, project) =>
            sum +
            Number(
              alertData[
                project.project_id
              ]?.alert_count ??
                0
            ),
          0
        );


      const averageRisk =
        total > 0
          ? reportProjects.reduce(
              (sum, project) =>
                sum +
                Number(
                  riskData[
                    project.project_id
                  ]?.priority_index ??
                    riskData[
                      project.project_id
                    ]?.overall_risk ??
                    0
                ),
              0
            ) / total
          : 0;


      const averagePhysicalProgress =
        total > 0
          ? reportProjects.reduce(
              (sum, project) => {

                const feature =
                  featureData[
                    project.project_id
                  ];

                return (
                  sum +
                  Number(
                    feature?.physical_progress_pct ??
                      project.physical_progress ??
                      0
                  )
                );

              },
              0
            ) / total
          : 0;


      return {
        total,
        delayed,
        highRisk,
        totalAlerts,
        averageRisk,
        averagePhysicalProgress,
      };

    }, [
      reportProjects,
      riskData,
      featureData,
      alertData,
    ]);


  /* =====================================================
     REPORT DATE
     ===================================================== */

  const currentDate =
    new Date().toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );


  /* =====================================================
     PRINT
     ===================================================== */

  function handlePrint() {
    window.print();
  }


  /* =====================================================
     CSV EXPORT
     ===================================================== */

  function handleExport() {

    if (
      reportProjects.length ===
      0
    ) {
      return;
    }


    const headers = [
      "Project ID",
      "Project Name",
      "Sector",
      "Ministry",
      "Agency",
      "Status",
      "Original Cost",
      "Revised Cost",
      "Physical Progress",
      "Financial Progress",
      "Priority Risk",
      "Cost Risk",
      "Delay Risk",
      "Implementation Risk",
      "Alerts",
    ];


    const rows =
      reportProjects.map(
        (project) => {

          const risk =
            riskData[
              project.project_id
            ] || {};

          const alerts =
            alertData[
              project.project_id
            ] || {};


          return [
            project.project_id,
            project.name,
            project.sector,
            project.ministry,
            project.agency,
            project.status,
            project.original_cost,
            project.revised_cost,
            project.physical_progress,
            project.financial_progress,
            risk.priority_index ??
              risk.overall_risk ??
              0,
            risk.cost_risk ?? 0,
            risk.delay_risk ?? 0,
            risk.implementation_risk ??
              0,
            alerts.alert_count ??
              0,
          ];

        }
      );


    const csv = [
      headers,
      ...rows,
    ]
      .map(
        (row) =>
          row
            .map(
              (value) =>
                `"${String(
                  value ?? ""
                ).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(",")
      )
      .join("\n");


    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `paimana-insight-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );

  }


  /* =====================================================
     REPORT TYPE
     ===================================================== */

  const reportTitle =
    reportType === "executive"
      ? "Executive Portfolio Report"
      : reportType === "risk"
        ? "Risk Monitoring Report"
        : "Project Performance Report";


  return (
    <div className="reports-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <section className="page-header">

        <div>

          <div className="page-eyebrow">
            REPORTING & GOVERNANCE
          </div>

          <h2>
            Reports
          </h2>

          <p>
            Generate monitoring summaries
            from the current PAIMANA INSIGHT
            project data.
          </p>

        </div>


        <div className="report-header-actions">

          <button
            className="secondary-button"
            onClick={
              loadReportData
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

            Refresh

          </button>


          <button
            className="primary-button"
            onClick={
              handleExport
            }
            disabled={
              reportProjects.length ===
              0
            }
          >

            <Download size={16} />

            Export CSV

          </button>

        </div>

      </section>


      {/* =================================================
          ERROR
          ================================================= */}

      {error && (

        <div className="status-banner status-error">

          <ShieldAlert size={18} />

          <div>

            <strong>
              Report data unavailable
            </strong>

            <span>
              {error}
            </span>

          </div>

        </div>

      )}


      {/* =================================================
          REPORT CONTROLS
          ================================================= */}

      <section className="report-controls dashboard-card">

        <div className="report-control-group">

          <label>
            <FileText size={15} />
            Report Type
          </label>

          <select
            value={reportType}
            onChange={(event) =>
              setReportType(
                event.target.value
              )
            }
          >

            <option value="executive">
              Executive Portfolio Report
            </option>

            <option value="risk">
              Risk Monitoring Report
            </option>

            <option value="performance">
              Project Performance Report
            </option>

          </select>

        </div>


        <div className="report-control-group">

          <label>
            <Filter size={15} />
            Project Scope
          </label>

          <select
            value={selectedProject}
            onChange={(event) =>
              setSelectedProject(
                event.target.value
              )
            }
          >

            <option value="all">
              All Projects
            </option>

            {projects.map(
              (project) => (

                <option
                  key={
                    project.project_id
                  }
                  value={
                    project.project_id
                  }
                >
                  {project.name}
                </option>

              )
            )}

          </select>

        </div>


        <div className="report-control-date">

          <Calendar size={17} />

          <div>

            <span>
              Report date
            </span>

            <strong>
              {currentDate}
            </strong>

          </div>

        </div>


        <button
          className="secondary-button report-print-button"
          onClick={
            handlePrint
          }
        >

          <Printer size={16} />

          Print

        </button>

      </section>


      {loading ? (

        <div className="page-loading">

          <div className="loading-spinner" />

          <h3>
            Preparing report...
          </h3>

          <p>
            Collecting project, risk and
            alert information.
          </p>

        </div>

      ) : (

        <>

          {/* =================================================
              REPORT PREVIEW
              ================================================= */}

          <section className="report-preview">

            <div className="report-document">

              {/* ---------------------------------------------
                  REPORT HEADER
                  --------------------------------------------- */}

              <div className="report-document-header">

                <div>

                  <div className="report-brand">

                    <div className="report-logo">
                      P
                    </div>

                    <div>

                      <strong>
                        PAIMANA
                      </strong>

                      <span>
                        INSIGHT
                      </span>

                    </div>

                  </div>


                  <div className="report-document-type">
                    INFRASTRUCTURE MONITORING
                  </div>

                  <h2>
                    {reportTitle}
                  </h2>

                  <p>
                    Predictive monitoring
                    summary for the selected
                    infrastructure portfolio.
                  </p>

                </div>


                <div className="report-meta">

                  <span>
                    Report Date
                  </span>

                  <strong>
                    {currentDate}
                  </strong>

                  <span>
                    Scope
                  </span>

                  <strong>
                    {selectedProject ===
                    "all"
                      ? "Portfolio"
                      : selectedProject}
                  </strong>

                </div>

              </div>


              {/* ---------------------------------------------
                  EXECUTIVE METRICS
                  --------------------------------------------- */}

              <div className="report-section">

                <div className="report-section-heading">

                  <div>

                    <span>
                      01
                    </span>

                    <h3>
                      Executive Summary
                    </h3>

                  </div>

                </div>


                <div className="report-metric-grid">

                  <ReportMetric
                    label="Projects Monitored"
                    value={
                      metrics.total
                    }
                    icon={FileText}
                  />


                  <ReportMetric
                    label="High-Risk Projects"
                    value={
                      metrics.highRisk
                    }
                    icon={ShieldAlert}
                    danger
                  />


                  <ReportMetric
                    label="Delayed Projects"
                    value={
                      metrics.delayed
                    }
                    icon={TrendingUp}
                  />


                  <ReportMetric
                    label="Active Alerts"
                    value={
                      metrics.totalAlerts
                    }
                    icon={BarChart3}
                  />

                </div>

              </div>


              {/* ---------------------------------------------
                  PORTFOLIO OBSERVATIONS
                  --------------------------------------------- */}

              <div className="report-section">

                <div className="report-section-heading">

                  <div>

                    <span>
                      02
                    </span>

                    <h3>
                      Portfolio Indicators
                    </h3>

                  </div>

                </div>


                <div className="report-indicator-grid">

                  <div className="report-indicator">

                    <span>
                      Average Priority Risk
                    </span>

                    <strong>
                      {metrics.averageRisk.toFixed(
                        1
                      )}
                      /100
                    </strong>

                    <div className="report-progress">

                      <div
                        style={{
                          width:
                            `${Math.min(
                              100,
                              metrics.averageRisk
                            )}%`,
                        }}
                      />

                    </div>

                  </div>


                  <div className="report-indicator">

                    <span>
                      Average Physical Progress
                    </span>

                    <strong>
                      {metrics.averagePhysicalProgress.toFixed(
                        1
                      )}
                      %
                    </strong>

                    <div className="report-progress">

                      <div
                        style={{
                          width:
                            `${Math.min(
                              100,
                              metrics.averagePhysicalProgress
                            )}%`,
                        }}
                      />

                    </div>

                  </div>


                  <div className="report-indicator">

                    <span>
                      Delayed Share
                    </span>

                    <strong>
                      {metrics.total > 0
                        ? (
                            (metrics.delayed /
                              metrics.total) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      %
                    </strong>

                    <div className="report-progress">

                      <div
                        style={{
                          width:
                            `${
                              metrics.total > 0
                                ? (
                                    metrics.delayed /
                                    metrics.total
                                  ) * 100
                                : 0
                            }%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              </div>


              {/* ---------------------------------------------
                  PROJECT TABLE
                  --------------------------------------------- */}

              <div className="report-section">

                <div className="report-section-heading">

                  <div>

                    <span>
                      03
                    </span>

                    <h3>
                      Project Monitoring Summary
                    </h3>

                  </div>

                </div>


                {reportProjects.length ===
                0 ? (

                  <div className="empty-state">

                    <FileText size={32} />

                    <h3>
                      No project data
                    </h3>

                    <p>
                      Select another project
                      scope or refresh the
                      report.
                    </p>

                  </div>

                ) : (

                  <div className="report-table-wrapper">

                    <table className="report-table">

                      <thead>

                        <tr>

                          <th>
                            Project
                          </th>

                          <th>
                            Sector
                          </th>

                          <th>
                            Status
                          </th>

                          <th>
                            Physical
                          </th>

                          <th>
                            Cost Risk
                          </th>

                          <th>
                            Delay Risk
                          </th>

                          <th>
                            Priority
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {reportProjects.map(
                          (project) => {

                            const risk =
                              riskData[
                                project.project_id
                              ] || {};


                            const feature =
                              featureData[
                                project.project_id
                              ] || {};


                            const priority =
                              Number(
                                risk.priority_index ??
                                  risk.overall_risk ??
                                  0
                              );


                            return (

                              <tr
                                key={
                                  project.project_id
                                }
                                onClick={() =>
                                  navigate(
                                    `/projects/${project.project_id}`
                                  )
                                }
                              >

                                <td>

                                  <strong>
                                    {project.name}
                                  </strong>

                                  <span>
                                    {project.project_id}
                                  </span>

                                </td>


                                <td>
                                  {project.sector}
                                </td>


                                <td>

                                  <span
                                    className={`report-status ${
                                      project.status ===
                                      "Delayed"
                                        ? "delayed"
                                        : "normal"
                                    }`}
                                  >
                                    {project.status}
                                  </span>

                                </td>


                                <td>
                                  {Number(
                                    feature.physical_progress_pct ??
                                      project.physical_progress ??
                                      0
                                  ).toFixed(1)}
                                  %
                                </td>


                                <td>
                                  {Number(
                                    risk.cost_risk ??
                                      0
                                  ).toFixed(0)}
                                </td>


                                <td>
                                  {Number(
                                    risk.delay_risk ??
                                      0
                                  ).toFixed(0)}
                                </td>


                                <td>

                                  <strong
                                    className={
                                      priority >=
                                      70
                                        ? "risk-high"
                                        : priority >=
                                          40
                                          ? "risk-medium"
                                          : "risk-low"
                                    }
                                  >
                                    {priority.toFixed(
                                      0
                                    )}
                                  </strong>

                                </td>

                              </tr>

                            );

                          }
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>


              {/* ---------------------------------------------
                  RISK REPORT DETAIL
                  --------------------------------------------- */}

              {reportType ===
                "risk" && (

                <div className="report-section">

                  <div className="report-section-heading">

                    <div>

                      <span>
                        04
                      </span>

                      <h3>
                        Risk Monitoring
                      </h3>

                    </div>

                  </div>


                  <div className="risk-report-list">

                    {reportProjects.map(
                      (project) => {

                        const risk =
                          riskData[
                            project.project_id
                          ] || {};


                        const alerts =
                          alertData[
                            project.project_id
                          ] || {};


                        return (

                          <div
                            className="risk-report-row"
                            key={
                              project.project_id
                            }
                          >

                            <div>

                              <strong>
                                {project.name}
                              </strong>

                              <span>
                                {project.project_id}
                                {" • "}
                                {project.sector}
                              </span>

                            </div>


                            <RiskValue
                              label="Cost"
                              value={
                                risk.cost_risk
                              }
                            />

                            <RiskValue
                              label="Delay"
                              value={
                                risk.delay_risk
                              }

                            />

                            <RiskValue
                              label="Implementation"
                              value={
                                risk.implementation_risk
                              }
                            />

                            <div className="report-alert-count">

                              <span>
                                Alerts
                              </span>

                              <strong>
                                {alerts.alert_count ??
                                  0}
                              </strong>

                            </div>

                          </div>

                        );

                      }
                    )}

                  </div>

                </div>

              )}


              {/* ---------------------------------------------
                  FOOTER
                  --------------------------------------------- */}

              <div className="report-document-footer">

                <span>
                  PAIMANA INSIGHT
                </span>

                <span>
                  Predictive decision-support
                  for infrastructure monitoring
                </span>

                <span>
                  {currentDate}
                </span>

              </div>

            </div>

          </section>


          {/* =================================================
              NOTE
              ================================================= */}

          <div className="report-disclaimer">

            <ShieldAlert size={16} />

            <span>
              This report is generated from the
              current application data and
              predictive monitoring outputs.
              It is intended as decision-support
              material and should be reviewed by
              authorized personnel before formal
              use.
            </span>

          </div>

        </>

      )}

    </div>
  );
}


/* =========================================================
   REPORT METRIC
   ========================================================= */

function ReportMetric({
  label,
  value,
  icon: Icon,
  danger = false,
}) {
  return (
    <div
      className={`report-metric ${
        danger
          ? "report-metric-danger"
          : ""
      }`}
    >

      <div className="report-metric-icon">

        <Icon size={18} />

      </div>

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
   RISK VALUE
   ========================================================= */

function RiskValue({
  label,
  value,
}) {
  const numericValue =
    Math.max(
      0,
      Math.min(
        100,
        Number(value) || 0
      )
    );


  return (
    <div className="risk-report-value">

      <span>
        {label}
      </span>

      <strong
        className={
          numericValue >= 70
            ? "risk-high"
            : numericValue >= 40
              ? "risk-medium"
              : "risk-low"
        }
      >
        {numericValue.toFixed(0)}
      </strong>

    </div>
  );
}


export default Reports;
