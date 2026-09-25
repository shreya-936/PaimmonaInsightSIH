import {
  AlertTriangle,
  Info,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import "./scenario.css";

import {
  getProjects,
  getProjectFeatures,
  getProjectRisk,
} from "../services/api";

function ScenarioSimulator() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [baseline, setBaseline] = useState(null);

  const [physicalProgress, setPhysicalProgress] = useState(55);
  const [monthlyExpenditure, setMonthlyExpenditure] = useState(750);
  const [milestonesCompleted, setMilestonesCompleted] =
    useState(12);

  const [loading, setLoading] = useState(true);
  const [contextLoading, setContextLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const list = (await getProjects()) || [];
      setProjects(list);

      if (list.length) {
        setSelectedId((current) => current || list[0].project_id);
      }
    } catch (err) {
      setError(err.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }

  async function loadBaseline(projectId) {
    if (!projectId) return;

    try {
      setContextLoading(true);
      setError("");

      const [project, features, risk] = await Promise.all([
        Promise.resolve(
          projects.find((p) => p.project_id === projectId)
        ),
        getProjectFeatures(projectId),
        getProjectRisk(projectId),
      ]);

      const progress = Number(
        features?.physical_progress_pct ??
          project?.physical_progress ??
          0
      );

      const expenditure =
        Number(features?.expenditure_trend_3 || 0) / 3 ||
        Number(project?.original_cost || 0) * 0.02;

      const milestones = Math.round(
        Number(features?.milestone_completion_ratio || 0) *
          Number(
            features?.milestones_planned ||
              20
          )
      );

      setBaseline({
        project,
        features,
        risk,
        progress,
        expenditure: expenditure > 0 ? expenditure : 750,
        milestones:
          milestones > 0 ? milestones : 12,
      });

      setPhysicalProgress(progress);
      setMonthlyExpenditure(
        expenditure > 0 ? Math.round(expenditure) : 750
      );
      setMilestonesCompleted(
        milestones > 0 ? milestones : 12
      );
    } catch (err) {
      setError(err.message || "Unable to load scenario data.");
    } finally {
      setContextLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (projects.length && selectedId) {
      loadBaseline(selectedId);
    }
  }, [selectedId, projects]);

  const scenario = useMemo(() => {
    if (!baseline) {
      return {
        costRisk: 0,
        delayRisk: 0,
        implementationRisk: 0,
        priority: 0,
        progress: physicalProgress,
        expenditure: monthlyExpenditure,
      };
    }

    const baseCost = Number(baseline.risk?.cost_risk || 0);
    const baseDelay = Number(baseline.risk?.delay_risk || 0);
    const baseImplementation = Number(
      baseline.risk?.implementation_risk || 0
    );

    const progressDelta =
      physicalProgress - baseline.progress;

    const expenditureDelta =
      monthlyExpenditure -
      Number(baseline.expenditure || monthlyExpenditure);

    const milestoneDelta =
      milestonesCompleted -
      Number(baseline.milestones || milestonesCompleted);

    const progressEffect = progressDelta * 0.7;
    const spendEffect = expenditureDelta > 0
      ? Math.min(20, expenditureDelta / 30)
      : Math.max(-12, expenditureDelta / 30);

    const milestoneEffect = milestoneDelta * 1.2;

    const costRisk = clamp(
      baseCost -
        progressEffect * 0.35 +
        spendEffect * 0.45 -
        milestoneEffect * 0.15
    );

    const delayRisk = clamp(
      baseDelay -
        progressEffect * 0.75 -
        milestoneEffect * 0.5
    );

    const implementationRisk = clamp(
      baseImplementation -
        progressEffect * 0.35 -
        milestoneEffect * 0.35 +
        Math.max(0, spendEffect) * 0.2
    );

    const priority =
      costRisk * 0.35 +
      delayRisk * 0.4 +
      implementationRisk * 0.25;

    return {
      costRisk,
      delayRisk,
      implementationRisk,
      priority,
      progress: physicalProgress,
      expenditure: monthlyExpenditure,
    };
  }, [
    baseline,
    physicalProgress,
    monthlyExpenditure,
    milestonesCompleted,
  ]);

  const baselineValues = {
    costRisk: Number(baseline?.risk?.cost_risk || 0),
    delayRisk: Number(baseline?.risk?.delay_risk || 0),
    priority: Number(
      baseline?.risk?.priority_index ??
        baseline?.risk?.overall_risk ??
        0
    ),
  };

  if (loading) {
    return (
      <section className="scenario-page">
        <div className="page-loading">
          <div className="loading-spinner" />
          <h3>Loading scenario simulator</h3>
          <p>Preparing project assumptions...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="scenario-page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">WHAT-IF ANALYSIS</div>
          <h2>Scenario Simulator</h2>
          <p>
            Adjust project parameters in a sandbox and inspect the
            potential change in the monitoring risk profile.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => loadBaseline(selectedId)}
        >
          <RefreshCw size={14} />
          Reset
        </button>
      </div>

      {error && (
        <div className="status-banner status-error">
          <AlertTriangle size={17} />
          <div>
            <strong>Scenario data warning</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="scenario-layout">
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">SCENARIO CONTROLS</div>
              <h3>Adjust Project Parameters</h3>
            </div>
            <SlidersHorizontal size={18} />
          </div>

          <div className="scenario-controls">
            <div className="scenario-control">
              <label>
                <span>Select Project</span>
              </label>

              <select
                className="scenario-select"
                value={selectedId}
                onChange={(event) =>
                  setSelectedId(event.target.value)
                }
              >
                {projects.map((project) => (
                  <option
                    key={project.project_id}
                    value={project.project_id}
                  >
                    {project.project_id} — {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="scenario-control">
              <label>
                <span>Physical Progress (%)</span>
                <strong>{physicalProgress}%</strong>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={physicalProgress}
                onChange={(event) =>
                  setPhysicalProgress(
                    Number(event.target.value)
                  )
                }
              />
            </div>

            <div className="scenario-control">
              <label>
                <span>Monthly Expenditure (₹ Cr)</span>
                <strong>{monthlyExpenditure}</strong>
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="10"
                value={monthlyExpenditure}
                onChange={(event) =>
                  setMonthlyExpenditure(
                    Number(event.target.value)
                  )
                }
              />
            </div>

            <div className="scenario-control">
              <label>
                <span>Milestones Completed</span>
                <strong>{milestonesCompleted}</strong>
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={milestonesCompleted}
                onChange={(event) =>
                  setMilestonesCompleted(
                    Number(event.target.value)
                  )
                }
              />
            </div>

            <div className="scenario-explanation">
              <strong>Sandbox only.</strong> These controls do not
              modify official project records. The calculation is a
              transparent prototype sensitivity model, not a trained
              production prediction model.
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <div className="card-eyebrow">RESULTS COMPARISON</div>
              <h3>Baseline vs Scenario</h3>
            </div>
          </div>

          {contextLoading ? (
            <div className="empty-state compact">
              <div className="loading-spinner" />
              <p>Loading project risk...</p>
            </div>
          ) : (
            <>
              <div className="scenario-result-grid">
                <ResultCard
                  label="Priority Index"
                  value={scenario.priority}
                />
                <ResultCard
                  label="Physical Progress"
                  value={scenario.progress}
                  suffix="%"
                />
                <ResultCard
                  label="Monthly Expenditure"
                  value={scenario.expenditure}
                  prefix="₹ "
                  suffix=" Cr"
                />
              </div>

              <div className="scenario-risk-comparison">
                <RiskComparison
                  label="Cost Risk"
                  baseline={baselineValues.costRisk}
                  scenario={scenario.costRisk}
                />

                <RiskComparison
                  label="Delay Risk"
                  baseline={baselineValues.delayRisk}
                  scenario={scenario.delayRisk}
                />

                <RiskComparison
                  label="Priority Index"
                  baseline={baselineValues.priority}
                  scenario={scenario.priority}
                />
              </div>

              <div className="scenario-explanation">
                <Info size={14} style={{ marginRight: 7 }} />
                The scenario uses the currently loaded project risk
                values as its baseline and applies transparent
                sensitivity adjustments to the selected assumptions.
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function ResultCard({ label, value, prefix = "", suffix = "" }) {
  return (
    <div className="scenario-result">
      <span>{label}</span>
      <strong>
        {prefix}
        {Number(value).toFixed(1)}
        {suffix}
      </strong>
    </div>
  );
}

function RiskComparison({ label, baseline, scenario }) {
  const safeBaseline = clamp(baseline);
  const safeScenario = clamp(scenario);

  return (
    <div className="scenario-risk-row">
      <span>{label}</span>

      <div className="scenario-risk-track">
        <div
          style={{
            width: `${safeScenario}%`,
            background:
              safeScenario >= 70
                ? "#d66060"
                : safeScenario >= 40
                  ? "#d2a052"
                  : "#55a47c",
          }}
        />
      </div>

      <strong className="scenario-risk-value">
        {safeBaseline.toFixed(0)} → {safeScenario.toFixed(0)}
      </strong>
    </div>
  );
}

function clamp(value) {
  return Math.max(
    0,
    Math.min(100, Number(value) || 0)
  );
}

export default ScenarioSimulator;
