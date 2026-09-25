import {
  BarChart3,
  Building2,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import "./analytics.css";

import {
  getProjects,
  getProjectFeatures,
  getProjectRisk,
} from "../services/api";

function Analytics() {
  const [projects, setProjects] = useState([]);
  const [riskData, setRiskData] = useState({});
  const [featureData, setFeatureData] = useState({});
  const [sectorFilter, setSectorFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const list = (await getProjects()) || [];
      setProjects(list);

      const entries = await Promise.all(
        list.map(async (project) => {
          const [risk, features] = await Promise.all([
            getProjectRisk(project.project_id).catch(() => null),
            getProjectFeatures(project.project_id).catch(() => null),
          ]);

          return [
            project.project_id,
            { risk, features },
          ];
        })
      );

      const combined = Object.fromEntries(entries);
      setRiskData(
        Object.fromEntries(
          Object.entries(combined).map(([id, value]) => [
            id,
            value.risk,
          ])
        )
      );
      setFeatureData(
        Object.fromEntries(
          Object.entries(combined).map(([id, value]) => [
            id,
            value.features,
          ])
        )
      );
    } catch (err) {
      setError(err.message || "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const sectors = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(projects.map((p) => p.sector).filter(Boolean))
      ),
    ],
    [projects]
  );

  const filteredProjects = useMemo(
    () =>
      sectorFilter === "All"
        ? projects
        : projects.filter((p) => p.sector === sectorFilter),
    [projects, sectorFilter]
  );

  const rows = useMemo(
    () =>
      filteredProjects
        .map((project) => {
          const risk = riskData[project.project_id] || {};
          const features = featureData[project.project_id] || {};

          return {
            ...project,
            priority: Number(
              risk.priority_index ?? risk.overall_risk ?? 0
            ),
            costRisk: Number(risk.cost_risk || 0),
            delayRisk: Number(risk.delay_risk || 0),
            implementationRisk: Number(
              risk.implementation_risk || 0
            ),
            progress: Number(
              features.physical_progress_pct ??
                project.physical_progress ??
                0
            ),
            financial:
              Number(features.financial_completion_ratio || 0) *
              100,
          };
        })
        .sort((a, b) => b.priority - a.priority),
    [filteredProjects, riskData, featureData]
  );

  const summary = useMemo(() => {
    const count = rows.length;
    const averageRisk = count
      ? rows.reduce((sum, row) => sum + row.priority, 0) / count
      : 0;

    const high = rows.filter((r) => r.priority >= 70).length;
    const medium = rows.filter(
      (r) => r.priority >= 40 && r.priority < 70
    ).length;
    const low = rows.filter((r) => r.priority < 40).length;

    const averageProgress = count
      ? rows.reduce((sum, row) => sum + row.progress, 0) / count
      : 0;

    const averageFinancial = count
      ? rows.reduce((sum, row) => sum + row.financial, 0) / count
      : 0;

    return {
      count,
      averageRisk,
      high,
      medium,
      low,
      averageProgress,
      averageFinancial,
    };
  }, [rows]);

  const sectorAnalysis = useMemo(() => {
    const map = {};

    rows.forEach((row) => {
      const key = row.sector || "Other";

      if (!map[key]) {
        map[key] = {
          sector: key,
          projects: 0,
          risk: 0,
          progress: 0,
        };
      }

      map[key].projects += 1;
      map[key].risk += row.priority;
      map[key].progress += row.progress;
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        risk: item.risk / item.projects,
        progress: item.progress / item.projects,
      }))
      .sort((a, b) => b.risk - a.risk);
  }, [rows]);

  if (loading) {
    return (
      <section className="analytics-page">
        <div className="page-loading">
          <div className="loading-spinner" />
          <h3>Loading analytics</h3>
          <p>Calculating portfolio indicators...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="analytics-page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">ANALYTICS & BENCHMARKING</div>
          <h2>Portfolio Analytics</h2>
          <p>
            Explore project risk, progress, financial completion and
            sector-level patterns from the monitoring data.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={loadAnalytics}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="status-banner status-error">
          <ShieldAlert size={17} />
          <div>
            <strong>Analytics data warning</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="analytics-filter-row">
        <select
          className="scenario-select"
          value={sectorFilter}
          onChange={(event) => setSectorFilter(event.target.value)}
        >
          {sectors.map((sector) => (
            <option key={sector} value={sector}>
              {sector === "All"
                ? "All Sectors"
                : `Sector: ${sector}`}
            </option>
          ))}
        </select>
      </div>

      <div className="kpi-grid">
        <MetricCard
          icon={<Building2 size={16} />}
          label="Projects Analyzed"
          value={summary.count}
        />
        <MetricCard
          icon={<ShieldAlert size={16} />}
          label="Average Risk Index"
          value={summary.averageRisk.toFixed(1)}
        />
        <MetricCard
          icon={<TrendingUp size={16} />}
          label="Average Physical Progress"
          value={`${summary.averageProgress.toFixed(1)}%`}
        />
        <MetricCard
          icon={<Activity size={16} />}
          label="Average Financial Completion"
          value={`${summary.averageFinancial.toFixed(1)}%`}
        />
      </div>

      <div className="analytics-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">PORTFOLIO POSITION</div>
              <h3>Physical vs Financial Progress</h3>
            </div>
          </div>

          <div className="analytics-chart analytics-progress-chart">
            <div className="analytics-comparison">
              <div className="analytics-comparison-row">
                <span>Physical Progress</span>
                <div className="analytics-wide-track">
                  <div
                    className="analytics-progress-blue"
                    style={{
                      width: `${Math.min(
                        100,
                        summary.averageProgress
                      )}%`,
                    }}
                  />
                </div>
                <strong>
                  {summary.averageProgress.toFixed(1)}%
                </strong>
              </div>

              <div className="analytics-comparison-row">
                <span>Financial Completion</span>
                <div className="analytics-wide-track">
                  <div
                    className="analytics-progress-green"
                    style={{
                      width: `${Math.min(
                        100,
                        summary.averageFinancial
                      )}%`,
                    }}
                  />
                </div>
                <strong>
                  {summary.averageFinancial.toFixed(1)}%
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">RISK DISTRIBUTION</div>
              <h3>Portfolio Risk Profile</h3>
            </div>
          </div>

          <div className="analytics-risk-distribution">
            <RiskDistribution
              label="High"
              value={summary.high}
              total={summary.count}
              level="high"
            />
            <RiskDistribution
              label="Medium"
              value={summary.medium}
              total={summary.count}
              level="medium"
            />
            <RiskDistribution
              label="Low"
              value={summary.low}
              total={summary.count}
              level="low"
            />
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <div>
            <div className="card-eyebrow">SECTOR BENCHMARKING</div>
            <h3>Sector Analysis</h3>
          </div>
          <span className="table-record-count">
            {sectorAnalysis.length} sectors
          </span>
        </div>

        {sectorAnalysis.length === 0 ? (
          <div className="empty-state compact">
            <BarChart3 size={24} />
            <h3>No sector data available</h3>
            <p>Add projects to populate the analysis.</p>
          </div>
        ) : (
          <div className="analytics-sector-list">
            {sectorAnalysis.map((item) => (
              <div
                className="analytics-sector-row"
                key={item.sector}
              >
                <div className="analytics-sector-name">
                  <strong>{item.sector}</strong>
                  <span>{item.projects} project(s)</span>
                </div>

                <div className="analytics-sector-bar">
                  <div
                    style={{
                      width: `${Math.min(100, item.risk)}%`,
                    }}
                  />
                </div>

                <strong>{item.risk.toFixed(1)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-card" style={{ marginTop: 18 }}>
        <div className="card-header">
          <div>
            <div className="card-eyebrow">PROJECT BENCHMARKING</div>
            <h3>Project Risk Ranking</h3>
          </div>
          <span className="table-record-count">
            {rows.length} projects
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="empty-state compact">
            <Building2 size={24} />
            <h3>No projects found</h3>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Sector</th>
                  <th>Cost Risk</th>
                  <th>Delay Risk</th>
                  <th>Implementation</th>
                  <th>Priority</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.project_id}>
                    <td>
                      <strong>{row.name}</strong>
                      <div style={{ color: "#8b98a8", marginTop: 3 }}>
                        {row.project_id}
                      </div>
                    </td>
                    <td>{row.sector}</td>
                    <td>{row.costRisk.toFixed(0)}</td>
                    <td>{row.delayRisk.toFixed(0)}</td>
                    <td>{row.implementationRisk.toFixed(0)}</td>
                    <td>
                      <strong>{row.priority.toFixed(1)}</strong>
                    </td>
                    <td>{row.progress.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <span className="kpi-card-title">{label}</span>
        <div className="kpi-card-icon">{icon}</div>
      </div>
      <div className="kpi-card-value">{value}</div>
      <div className="kpi-card-bottom">
        <span className="kpi-card-subtitle">
          Current monitoring view
        </span>
      </div>
    </div>
  );
}

function RiskDistribution({ label, value, total, level }) {
  const percentage = total
    ? (value / total) * 100
    : 0;

  return (
    <div className="analytics-risk-item">
      <span>{label}</span>
      <div className="analytics-risk-track">
        <div
          className={level}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <strong>{value}</strong>
    </div>
  );
}

export default Analytics;
