import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

import {
  getProjects,
  getProjectFeatures,
  getProjectRisk,
  getProjectAlerts,
} from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [portfolioRisk, setPortfolioRisk] = useState({});
  const [loading, setLoading] = useState(true);
  const [contextLoading, setContextLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const projectList = (await getProjects()) || [];
      setProjects(projectList);

      if (projectList.length > 0) {
        setSelectedProjectId((current) =>
          current || projectList[0].project_id
        );
      }

      const riskEntries = await Promise.all(
        projectList.map(async (project) => {
          try {
            const risk = await getProjectRisk(project.project_id);
            return [project.project_id, risk];
          } catch {
            return [project.project_id, null];
          }
        })
      );

      setPortfolioRisk(Object.fromEntries(riskEntries));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSelectedProject(projectId) {
    if (!projectId) return;

    try {
      setContextLoading(true);

      const project =
        projects.find((item) => item.project_id === projectId) || null;

      const [features, risk, alertData] = await Promise.all([
        getProjectFeatures(projectId),
        getProjectRisk(projectId),
        getProjectAlerts(projectId),
      ]);

      setSelectedData({
        project,
        features,
        risk,
        alerts: alertData?.alerts || [],
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load selected project.");
    } finally {
      setContextLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (projects.length && selectedProjectId) {
      loadSelectedProject(selectedProjectId);
    }
  }, [selectedProjectId, projects]);

  const portfolioSummary = useMemo(() => {
    const riskValues = Object.values(portfolioRisk).filter(Boolean);

    const highRisk = riskValues.filter(
      (item) =>
        Number(item.priority_index ?? item.overall_risk ?? 0) >= 70
    ).length;

    const mediumRisk = riskValues.filter((item) => {
      const score = Number(
        item.priority_index ?? item.overall_risk ?? 0
      );
      return score >= 40 && score < 70;
    }).length;

    const delayed = projects.filter(
      (project) =>
        String(project.status || "").toLowerCase() === "delayed"
    ).length;

    return {
      total: projects.length,
      highRisk,
      mediumRisk,
      delayed,
    };
  }, [projects, portfolioRisk]);

  const summary = useMemo(() => {
    if (!selectedData) {
      return {
        project: null,
        progress: 0,
        financial: 0,
        costOverrun: 0,
        milestoneCompletion: 0,
        burnGap: 0,
        costRisk: 0,
        delayRisk: 0,
        implementationRisk: 0,
        priority: 0,
        alerts: [],
      };
    }

    const { project, features, risk, alerts } = selectedData;

    return {
      project,
      progress: Number(
        features?.physical_progress_pct ??
          project?.physical_progress ??
          0
      ),
      financial:
        Number(features?.financial_completion_ratio || 0) * 100,
      costOverrun:
        Number(features?.cost_overrun_ratio || 0) * 100,
      milestoneCompletion:
        Number(features?.milestone_completion_ratio || 0) * 100,
      burnGap: Number(features?.burn_vs_progress_gap || 0),
      costRisk: Number(risk?.cost_risk || 0),
      delayRisk: Number(risk?.delay_risk || 0),
      implementationRisk: Number(
        risk?.implementation_risk || 0
      ),
      priority: Number(
        risk?.priority_index ?? risk?.overall_risk ?? 0
      ),
      alerts: alerts || [],
    };
  }, [selectedData]);

  const riskLevel =
    summary.priority >= 80
      ? "Critical"
      : summary.priority >= 70
        ? "High"
        : summary.priority >= 40
          ? "Medium"
          : "Low";

  if (loading) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-loading">
          <RefreshCw className="spin" size={22} />
          <span>Loading executive dashboard...</span>
        </div>
      </section>
    );
  }

  if (error && projects.length === 0) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-error">
          <AlertTriangle size={24} />
          <h2>Dashboard data unavailable</h2>
          <p>{error}</p>
          <button
            type="button"
            onClick={loadDashboard}
            className="dashboard-primary-button"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-page-header">
        <div>
          <span className="dashboard-eyebrow">
            EXECUTIVE MONITORING
          </span>
          <h1>Infrastructure Risk Overview</h1>
          <p>
            Predictive monitoring of cost, schedule and implementation
            risk across the project portfolio.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            type="button"
            className="dashboard-secondary-button"
            onClick={loadDashboard}
          >
            <RefreshCw size={15} />
            Refresh
          </button>

          <button
            type="button"
            className="dashboard-primary-button"
            onClick={() => navigate("/projects")}
          >
            View Projects
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard-inline-error">
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      <div className="dashboard-kpi-grid">
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-icon blue">
            <Building2 size={18} />
          </div>
          <div>
            <span>Monitored Projects</span>
            <strong>{portfolioSummary.total}</strong>
            <small>Projects in current portfolio</small>
          </div>
        </div>

        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-icon red">
            <AlertTriangle size={18} />
          </div>
          <div>
            <span>High Risk</span>
            <strong>{portfolioSummary.highRisk}</strong>
            <small>Priority index ≥ 70</small>
          </div>
        </div>

        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-icon amber">
            <Clock3 size={18} />
          </div>
          <div>
            <span>Delayed Projects</span>
            <strong>{portfolioSummary.delayed}</strong>
            <small>Latest reported status</small>
          </div>
        </div>

        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-icon green">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span>Medium Risk</span>
            <strong>{portfolioSummary.mediumRisk}</strong>
            <small>Priority index 40–69</small>
          </div>
        </div>
      </div>

      <div className="dashboard-project-selector">
        <div>
          <span className="dashboard-section-label">
            FOCUS PROJECT
          </span>
          <h2>
            {summary.project?.name || "No project selected"}
          </h2>
          <p>
            {summary.project?.project_id || "Select a project"}{" "}
            {summary.project?.sector
              ? `• ${summary.project.sector}`
              : ""}
          </p>
        </div>

        <select
          value={selectedProjectId}
          onChange={(event) =>
            setSelectedProjectId(event.target.value)
          }
          className="dashboard-project-select"
        >
          {projects.map((project) => (
            <option
              key={project.project_id}
              value={project.project_id}
            >
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {contextLoading ? (
        <div className="dashboard-context-loading">
          <RefreshCw className="spin" size={18} />
          Updating project intelligence...
        </div>
      ) : (
        <>
          <div className="dashboard-main-grid">
            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <span>PROJECT RISK PROFILE</span>
                  <h3>Current Risk Assessment</h3>
                </div>
                <span className={`dashboard-risk-badge ${riskLevel.toLowerCase()}`}>
                  {riskLevel}
                </span>
              </div>

              <div className="dashboard-risk-grid">
                <RiskRow
                  label="Cost Risk"
                  value={summary.costRisk}
                />
                <RiskRow
                  label="Delay Risk"
                  value={summary.delayRisk}
                />
                <RiskRow
                  label="Implementation Risk"
                  value={summary.implementationRisk}
                />
              </div>

              <div className="dashboard-priority-card">
                <div>
                  <span>Priority Index</span>
                  <strong>
                    {summary.priority.toFixed(1)}
                    <small>/100</small>
                  </strong>
                </div>
                <div className="dashboard-priority-track">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, summary.priority)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <span>PROJECT INDICATORS</span>
                  <h3>Current Performance</h3>
                </div>
              </div>

              <Indicator
                label="Physical Progress"
                value={`${summary.progress.toFixed(1)}%`}
              />
              <Indicator
                label="Financial Completion"
                value={`${summary.financial.toFixed(1)}%`}
              />
              <Indicator
                label="Cost Overrun"
                value={`${summary.costOverrun.toFixed(1)}%`}
              />
              <Indicator
                label="Milestone Completion"
                value={`${summary.milestoneCompletion.toFixed(1)}%`}
              />
              <Indicator
                label="Burn vs Progress Gap"
                value={`${summary.burnGap.toFixed(2)} pp`}
              />

              <div className="dashboard-last-update">
                Latest update:{" "}
                {selectedData?.features?.latest_update || "—"}
              </div>
            </div>
          </div>

          <div className="dashboard-secondary-grid">
            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <span>PROGRESS MONITORING</span>
                  <h3>Physical vs Financial Progress</h3>
                </div>
              </div>

              <ProgressRow
                label="Physical Progress"
                value={summary.progress}
              />

              <ProgressRow
                label="Financial Completion"
                value={summary.financial}
              />

              <div className="dashboard-gap-note">
                <TrendingUp size={15} />
                Financial completion is{" "}
                {summary.burnGap >= 0 ? "ahead of" : "behind"} physical
                progress by{" "}
                <strong>
                  {Math.abs(summary.burnGap).toFixed(2)} percentage points
                </strong>
                .
              </div>
            </div>

            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <span>EARLY WARNINGS</span>
                  <h3>Active Alerts</h3>
                </div>

                <button
                  type="button"
                  className="dashboard-link-button"
                  onClick={() => navigate("/risk-alerts")}
                >
                  View all
                  <ArrowRight size={14} />
                </button>
              </div>

              {summary.alerts.length === 0 ? (
                <div className="dashboard-empty">
                  <ShieldCheck size={22} />
                  <span>No active alerts for this project.</span>
                </div>
              ) : (
                <div className="dashboard-alert-list">
                  {summary.alerts.slice(0, 4).map((alert, index) => (
                    <div
                      className="dashboard-alert-item"
                      key={`${alert.type}-${index}`}
                    >
                      <div className="dashboard-alert-icon">
                        <AlertTriangle size={15} />
                      </div>
                      <div>
                        <strong>{alert.type}</strong>
                        <p>{alert.message}</p>
                        {alert.reason && (
                          <small>{alert.reason}</small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-ai-strip">
            <div className="dashboard-ai-icon">
              <Bot size={20} />
            </div>
            <div>
              <span>PAIMANA INSIGHT AI ASSISTANT</span>
              <h3>Understand why this project requires attention</h3>
              <p>
                Ask about current risk drivers, recent changes, progress,
                cost position and alerts using the selected project's
                monitoring data.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/ai-assistant")}
              className="dashboard-primary-button"
            >
              Open AI Assistant
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="dashboard-quick-grid">
            <QuickAction
              title="Project Register"
              text="Review all monitored projects."
              onClick={() => navigate("/projects")}
            />
            <QuickAction
              title="Risk Alerts"
              text="Review early-warning events."
              onClick={() => navigate("/risk-alerts")}
            />
            <QuickAction
              title="Analytics"
              text="Explore portfolio indicators."
              onClick={() => navigate("/analytics")}
            />
            <QuickAction
              title="Scenario Simulator"
              text="Test controlled what-if assumptions."
              onClick={() => navigate("/scenario-simulator")}
            />
          </div>
        </>
      )}
    </section>
  );
}

function RiskRow({ label, value }) {
  const score = Math.max(0, Math.min(100, Number(value) || 0));
  const level =
    score >= 70 ? "high" : score >= 40 ? "medium" : "low";

  return (
    <div className="dashboard-risk-row">
      <div className="dashboard-risk-row-top">
        <span>{label}</span>
        <strong>{score.toFixed(0)}/100</strong>
      </div>
      <div className="dashboard-risk-track">
        <div
          className={level}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function Indicator({ label, value }) {
  return (
    <div className="dashboard-indicator">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProgressRow({ label, value }) {
  const safeValue = Math.max(
    0,
    Math.min(100, Number(value) || 0)
  );

  return (
    <div className="dashboard-progress-row">
      <div>
        <span>{label}</span>
        <strong>{safeValue.toFixed(1)}%</strong>
      </div>
      <div className="dashboard-progress-track">
        <div style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

function QuickAction({ title, text, onClick }) {
  return (
    <button
      type="button"
      className="dashboard-quick-card"
      onClick={onClick}
    >
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
      <ArrowRight size={16} />
    </button>
  );
}

export default Dashboard;
