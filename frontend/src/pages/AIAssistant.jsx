import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Building2,
  Info,
  Send,
  Sparkles,
  User,
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
  getProjectFeatures,
  getProjectRisk,
  getProjectAlerts,
} from "../services/api";

import "./ai-assistant.css";


function AIAssistant() {
  const navigate = useNavigate();

  const [projects, setProjects] =
    useState([]);

  const [selectedProjectId, setSelectedProjectId] =
    useState("");

  const [projectContext, setProjectContext] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =====================================================
     LOAD PROJECTS
     ===================================================== */

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getProjects();

      const projectList =
        data || [];

      setProjects(
        projectList
      );

      if (
        projectList.length > 0
      ) {
        setSelectedProjectId(
          projectList[0].project_id
        );
      }

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
          "Unable to load projects."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadProjects();
  }, []);


  /* =====================================================
     LOAD SELECTED PROJECT CONTEXT
     ===================================================== */

  useEffect(() => {

    if (!selectedProjectId) {
      return;
    }


    async function loadContext() {

      try {

        setError("");

        const [
          features,
          risk,
          alertData,
        ] = await Promise.all([
          getProjectFeatures(
            selectedProjectId
          ),
          getProjectRisk(
            selectedProjectId
          ),
          getProjectAlerts(
            selectedProjectId
          ),
        ]);


        const project =
          projects.find(
            (item) =>
              item.project_id ===
              selectedProjectId
          );


        setProjectContext({
          project,
          features,
          risk,
          alerts:
            alertData?.alerts ||
            [],
        });


      } catch (err) {

        console.error(err);

        setError(
          err.message ||
            "Unable to load project intelligence."
        );

      }

    }


    loadContext();

  }, [
    selectedProjectId,
    projects,
  ]);


  /* =====================================================
     INITIAL MESSAGE
     ===================================================== */

  useEffect(() => {

    if (
      !projectContext?.project
    ) {
      return;
    }


    const project =
      projectContext.project;


    const risk =
      projectContext.risk;


    const priority =
      Number(
        risk?.priority_index ??
          risk?.overall_risk ??
          0
      );


    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        text:
          `Hello! I’m the PAIMANA INSIGHT decision-support assistant. I can help you understand the current indicators for ${project.name}, including its risk drivers, progress, cost position, and alerts. Ask me what changed, why the project is at risk, or what indicators require attention.`,
        time: "Now",
      },
    ]);

  }, [
    selectedProjectId,
  ]);


  /* =====================================================
     QUICK QUESTIONS
     ===================================================== */

  const quickQuestions = [
    "Why is this project at risk?",
    "What are the main risk drivers?",
    "What changed in the latest update?",
    "Explain the current alerts.",
  ];


  /* =====================================================
     PROJECT SUMMARY
     ===================================================== */

  const summary =
    useMemo(() => {

      if (!projectContext) {
        return null;
      }


      const {
        project,
        features,
        risk,
        alerts,
      } = projectContext;


      return {
        name:
          project?.name ||
          "Selected Project",

        status:
          project?.status ||
          "Unknown",

        progress:
          Number(
            features?.physical_progress_pct ??
              project?.physical_progress ??
              0
          ),

        financial:
          Number(
            features?.financial_completion_ratio ||
              0
          ) * 100,

        costOverrun:
          Number(
            features?.cost_overrun_ratio ||
              0
          ) * 100,

        priority:
          Number(
            risk?.priority_index ??
              risk?.overall_risk ??
              0
          ),

        costRisk:
          Number(
            risk?.cost_risk ||
              0
          ),

        delayRisk:
          Number(
            risk?.delay_risk ||
              0
          ),

        implementationRisk:
          Number(
            risk?.implementation_risk ||
              0
          ),

        alerts:
          alerts?.length ||
          0,

        burnGap:
          Number(
            features?.burn_vs_progress_gap ||
              0
          ),

        milestoneCompletion:
          Number(
            features?.milestone_completion_ratio ||
              0
          ) * 100,
      };

    }, [
      projectContext,
    ]);


  /* =====================================================
     SEND QUESTION
     ===================================================== */

  async function sendQuestion(
    questionOverride
  ) {

    const question =
      String(
        questionOverride ??
          input
      ).trim();


    if (
      !question ||
      sending
    ) {
      return;
    }


    setInput("");

    setMessages(
      (previous) => [
        ...previous,
        {
          id:
            `user-${Date.now()}`,
          sender: "user",
          text: question,
          time: "Now",
        },
      ]
    );


    setSending(true);


    /*
     * The prototype currently uses a
     * transparent rule-based explanation
     * layer built from the live backend
     * project indicators.
     *
     * A production LLM/RAG service can
     * replace generateAnswer() later.
     */

    setTimeout(() => {

      const answer =
        generateAnswer(
          question,
          projectContext
        );


      setMessages(
        (previous) => [
          ...previous,
          {
            id:
              `assistant-${Date.now()}`,
            sender:
              "assistant",
            text: answer,
            time: "Now",
          },
        ]
      );


      setSending(false);

    }, 450);

  }


  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {

    return (
      <div className="page-loading">

        <div className="loading-spinner" />

        <h3>
          Preparing AI Assistant...
        </h3>

        <p>
          Loading project intelligence.
        </p>

      </div>
    );

  }


  return (
    <div className="ai-assistant-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <section className="page-header">

        <div>

          <div className="page-eyebrow">
            AI DECISION SUPPORT
          </div>

          <h2>
            AI Assistant
          </h2>

          <p>
            Ask questions about project
            performance, risk indicators,
            trends, and alerts.
          </p>

        </div>


        <div className="ai-header-badge">

          <Sparkles size={16} />

          Explainable Monitoring

        </div>

      </section>


      {/* =================================================
          ERROR
          ================================================= */}

      {error && (

        <div className="status-banner status-error">

          <AlertTriangle size={18} />

          <div>

            <strong>
              Assistant context unavailable
            </strong>

            <span>
              {error}
            </span>

          </div>

        </div>

      )}


      {/* =================================================
          PROJECT SELECTOR
          ================================================= */}

      <section className="ai-project-selector">

        <div className="ai-project-selector-label">

          <Building2 size={18} />

          <div>

            <span>
              Analysis Context
            </span>

            <strong>
              Select a project
            </strong>

          </div>

        </div>


        <select
          value={
            selectedProjectId
          }
          onChange={(event) =>
            setSelectedProjectId(
              event.target.value
            )
          }
        >

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
                {" — "}
                {project.project_id}
              </option>

            )
          )}

        </select>

      </section>


      <div className="ai-assistant-layout">

        {/* =================================================
            CHAT
            ================================================= */}

        <section className="ai-chat-card">

          <div className="ai-chat-header">

            <div className="ai-chat-title">

              <div className="ai-bot-avatar">
                <Bot size={20} />
              </div>

              <div>

                <strong>
                  PAIMANA AI
                </strong>

                <span>
                  Project Intelligence Assistant
                </span>

              </div>

            </div>


            <div className="ai-online-status">

              <span />

              Context loaded

            </div>

          </div>


          {/* MESSAGES */}

          <div className="ai-message-area">

            {messages.map(
              (message) => (

                <div
                  key={
                    message.id
                  }
                  className={`ai-message-row ${
                    message.sender ===
                    "user"
                      ? "user-message"
                      : "assistant-message"
                  }`}
                >

                  {message.sender ===
                    "assistant" && (

                    <div className="message-avatar assistant-avatar">
                      <Bot size={16} />
                    </div>

                  )}


                  <div className="ai-message-bubble">

                    <p>
                      {message.text}
                    </p>

                    <span>
                      {message.time}
                    </span>

                  </div>


                  {message.sender ===
                    "user" && (

                    <div className="message-avatar user-avatar">
                      <User size={16} />
                    </div>

                  )}

                </div>

              )
            )}


            {sending && (

              <div className="ai-message-row assistant-message">

                <div className="message-avatar assistant-avatar">
                  <Bot size={16} />
                </div>

                <div className="ai-typing">

                  <span />
                  <span />
                  <span />

                </div>

              </div>

            )}

          </div>


          {/* QUICK QUESTIONS */}

          <div className="ai-quick-questions">

            <span>
              Suggested questions
            </span>

            <div>

              {quickQuestions.map(
                (question) => (

                  <button
                    key={question}
                    onClick={() =>
                      sendQuestion(
                        question
                      )
                    }
                    disabled={sending}
                  >
                    {question}
                  </button>

                )
              )}

            </div>

          </div>


          {/* INPUT */}

          <form
            className="ai-input-area"
            onSubmit={(event) => {
              event.preventDefault();
              sendQuestion();
            }}
          >

            <input
              type="text"
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              placeholder="Ask about project risk, progress, cost, or alerts..."
              disabled={sending}
            />


            <button
              type="submit"
              disabled={
                sending ||
                !input.trim()
              }
              aria-label="Send question"
            >

              <Send size={18} />

            </button>

          </form>


          <div className="ai-disclaimer">

            <Info size={14} />

            <span>
              AI responses are decision-support
              explanations based on available
              project data. Verify important
              conclusions against official
              monitoring records.
            </span>

          </div>

        </section>


        {/* =================================================
            CONTEXT PANEL
            ================================================= */}

        <aside className="ai-context-panel">

          <div className="ai-context-header">

            <span className="card-eyebrow">
              PROJECT CONTEXT
            </span>

            <h3>
              Current Indicators
            </h3>

          </div>


          {summary && (

            <>

              <div className="ai-context-project">

                <div className="ai-context-project-icon">
                  <Building2 size={18} />
                </div>

                <div>

                  <strong>
                    {summary.name}
                  </strong>

                  <span>
                    {selectedProjectId}
                  </span>

                </div>

              </div>


              <div className="ai-context-status">

                <span>
                  Current Status
                </span>

                <strong
                  className={
                    summary.status ===
                    "Delayed"
                      ? "context-danger"
                      : summary.status ===
                        "Watch"
                        ? "context-warning"
                        : "context-success"
                  }
                >
                  {summary.status}
                </strong>

              </div>


              <div className="ai-context-metrics">

                <ContextMetric
                  label="Priority Index"
                  value={`${summary.priority.toFixed(
                    1
                  )}/100`}
                  variant={
                    summary.priority >= 70
                      ? "danger"
                      : summary.priority >=
                        40
                        ? "warning"
                        : "success"
                  }
                />


                <ContextMetric
                  label="Physical Progress"
                  value={`${summary.progress.toFixed(
                    1
                  )}%`}
                />


                <ContextMetric
                  label="Financial Completion"
                  value={`${summary.financial.toFixed(
                    1
                  )}%`}
                />


                <ContextMetric
                  label="Cost Overrun"
                  value={`${summary.costOverrun.toFixed(
                    1
                  )}%`}
                  variant={
                    summary.costOverrun >
                    0
                      ? "danger"
                      : "success"
                  }
                />


                <ContextMetric
                  label="Milestone Completion"
                  value={`${summary.milestoneCompletion.toFixed(
                    1
                  )}%`}
                />


                <ContextMetric
                  label="Active Alerts"
                  value={
                    summary.alerts
                  }
                  variant={
                    summary.alerts > 0
                      ? "warning"
                      : "success"
                  }
                />

              </div>


              <div className="ai-context-risk">

                <div className="ai-context-risk-title">

                  <span>
                    Risk Dimensions
                  </span>

                </div>


                <ContextRisk
                  label="Cost"
                  value={
                    summary.costRisk
                  }
                />

                <ContextRisk
                  label="Delay"
                  value={
                    summary.delayRisk
                  }

                />

                <ContextRisk
                  label="Implementation"
                  value={
                    summary.implementationRisk
                  }

                />

              </div>


              <button
                className="ai-project-button"
                onClick={() =>
                  navigate(
                    `/projects/${selectedProjectId}`
                  )
                }
              >

                View Full Project

                <ArrowLeft
                  size={15}
                  className="rotate-arrow"
                />

              </button>

            </>

          )}

        </aside>

      </div>


      {/* =================================================
          BACK
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


/* =========================================================
   CONTEXT METRIC
   ========================================================= */

function ContextMetric({
  label,
  value,
  variant,
}) {
  return (
    <div className="ai-context-metric">

      <span>
        {label}
      </span>

      <strong
        className={
          variant
            ? `context-${variant}`
            : ""
        }
      >
        {value}
      </strong>

    </div>
  );
}


/* =========================================================
   CONTEXT RISK
   ========================================================= */

function ContextRisk({
  label,
  value,
}) {
  const score =
    Math.max(
      0,
      Math.min(
        100,
        Number(value) || 0
      )
    );


  return (
    <div className="ai-context-risk-row">

      <div>

        <span>
          {label}
        </span>

        <strong>
          {score.toFixed(0)}
        </strong>

      </div>


      <div className="ai-context-risk-track">

        <div
          className={
            score >= 70
              ? "high"
              : score >= 40
                ? "medium"
                : "low"
          }
          style={{
            width: `${score}%`,
          }}
        />

      </div>

    </div>
  );
}


/* =========================================================
   RULE-BASED PROTOTYPE ANSWER GENERATOR
   ========================================================= */

function generateAnswer(
  question,
  context
) {
  if (!context?.project) {
    return "I don't have enough project context loaded to answer that question.";
  }


  const {
    project,
    features,
    risk,
    alerts,
  } = context;


  const q =
    question.toLowerCase();


  const progress =
    Number(
      features?.physical_progress_pct ??
        project.physical_progress ??
        0
    );


  const financial =
    Number(
      features?.financial_completion_ratio ||
        0
    ) * 100;


  const costOverrun =
    Number(
      features?.cost_overrun_ratio ||
        0
    ) * 100;


  const milestoneCompletion =
    Number(
      features?.milestone_completion_ratio ||
        0
    ) * 100;


  const burnGap =
    Number(
      features?.burn_vs_progress_gap ||
        0
    );


  const priority =
    Number(
      risk?.priority_index ??
        risk?.overall_risk ??
        0
    );


  const costRisk =
    Number(
      risk?.cost_risk ||
        0
    );


  const delayRisk =
    Number(
      risk?.delay_risk ||
        0
    );


  const implementationRisk =
    Number(
      risk?.implementation_risk ||
        0
    );


  /* WHY RISK */

  if (
    q.includes("why") &&
    (
      q.includes("risk") ||
      q.includes("high")
    )
  ) {

    return (
      `${project.name} currently has a priority index of ${priority.toFixed(
        1
      )}/100. The main indicators are a ${costOverrun.toFixed(
        1
      )}% cost overrun, ${progress.toFixed(
        1
      )}% physical progress versus ${financial.toFixed(
        1
      )}% financial completion, and ${milestoneCompletion.toFixed(
        1
      )}% milestone completion. The current cost risk is ${costRisk.toFixed(
        0
      )}, delay risk is ${delayRisk.toFixed(
        0
      )}, and implementation risk is ${implementationRisk.toFixed(
        0
      )}. These indicators explain the current elevated monitoring priority; they should be reviewed alongside the underlying project records.`
    );

  }


  /* RISK DRIVERS */

  if (
    q.includes("driver") ||
    q.includes("drivers") ||
    q.includes("cause") ||
    q.includes("factors")
  ) {

    const drivers = [];


    if (
      costRisk >= 40
    ) {
      drivers.push(
        `cost pressure (${costRisk.toFixed(
          0
        )}/100)`
      );
    }


    if (
      delayRisk >= 40
    ) {
      drivers.push(
        `delay pressure (${delayRisk.toFixed(
          0
        )}/100)`
      );
    }


    if (
      implementationRisk >=
      40
    ) {
      drivers.push(
        `implementation pressure (${implementationRisk.toFixed(
          0
        )}/100)`
      );
    }


    if (
      burnGap >= 8
    ) {
      drivers.push(
        `financial expenditure running ${burnGap.toFixed(
          1
        )} percentage points ahead of physical progress`
      );
    }


    if (
      drivers.length === 0
    ) {
      return (
        "The current indicators do not show a strong risk driver above the configured monitoring thresholds."
      );
    }


    return (
      `The main indicators currently contributing to attention are ${drivers.join(
        ", "
      )}. These are derived monitoring signals rather than independent conclusions about project performance.`
    );

  }


  /* LATEST CHANGE */

  if (
    q.includes("changed") ||
    q.includes("latest") ||
    q.includes("update")
  ) {

    return (
      `The latest available update for ${project.name} reports physical progress of ${progress.toFixed(
        1
      )}% and financial completion of ${financial.toFixed(
        1
      )}%. The current burn-vs-progress gap is ${burnGap.toFixed(
        2
      )} percentage points, while milestone completion is ${milestoneCompletion.toFixed(
        1
      )}%. The project is currently marked "${project.status}".`
    );

  }


  /* ALERTS */

  if (
    q.includes("alert") ||
    q.includes("warning")
  ) {

    if (
      !alerts ||
      alerts.length === 0
    ) {
      return (
        "There are currently no active alerts returned by the project's monitoring rules."
      );
    }


    const alertText =
      alerts
        .map(
          (alert) =>
            `${alert.type}: ${alert.message}${
              alert.reason
                ? ` Reason: ${alert.reason}`
                : ""
            }`
        )
        .join(" | ");


    return (
      `There are ${alerts.length} active alert(s) for ${project.name}. ${alertText}`
    );

  }


  /* PROGRESS */

  if (
    q.includes("progress") ||
    q.includes("physical")
  ) {

    return (
      `The latest physical progress is ${progress.toFixed(
        1
      )}%, while financial completion is ${financial.toFixed(
        1
      )}%. The difference is ${(
        financial -
        progress
      ).toFixed(
        2
      )} percentage points.`
    );

  }


  /* COST */

  if (
    q.includes("cost") ||
    q.includes("expenditure") ||
    q.includes("overrun")
  ) {

    return (
      `The current cost overrun ratio is ${costOverrun.toFixed(
        1
      )}%. The project's revised cost is ₹${Number(
        project.revised_cost ??
          project.original_cost ??
          0
      ).toLocaleString(
        "en-IN"
      )}, compared with an original cost of ₹${Number(
        project.original_cost ||
          0
      ).toLocaleString(
        "en-IN"
      )}.`
    );

  }


  /* DEFAULT */

  return (
    `For ${project.name}, the current priority index is ${priority.toFixed(
      1
    )}/100. Physical progress is ${progress.toFixed(
      1
    )}%, financial completion is ${financial.toFixed(
      1
    )}%, and there are ${alerts?.length || 0} active alert(s). You can ask me "why is this project at risk?", "what are the main risk drivers?", "what changed?", or "explain the current alerts".`
  );
}


export default AIAssistant;