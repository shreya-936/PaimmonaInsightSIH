import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Filter,
  Plus,
  RefreshCw,
  Search,
  X,
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
  createProject,
  getProjects,
  getProjectRisk,
} from "../services/api";
import "./Projects.css";


function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] =
    useState([]);

  const [riskData, setRiskData] =
    useState({});

  const [searchTerm, setSearchTerm] =
    useState("");

  const [sectorFilter, setSectorFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =====================================================
     ADD PROJECT
     ===================================================== */

  const [showAddProject, setShowAddProject] =
    useState(false);

  const [creatingProject, setCreatingProject] =
    useState(false);

  const [createError, setCreateError] =
    useState("");

  const [createSuccess, setCreateSuccess] =
    useState("");

  const [form, setForm] = useState({
    project_id: "",
    name: "",
    sector: "Transport",
    ministry: "",
    agency: "",
    original_cost: "",
    revised_cost: "",
    physical_progress: "0",
    financial_progress: "0",
    status: "On Track",
  });


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

      setProjects(projectList);


      const riskEntries =
        await Promise.all(
          projectList.map(
            async (project) => {

              try {
                const risk =
                  await getProjectRisk(
                    project.project_id
                  );

                return [
                  project.project_id,
                  risk,
                ];

              } catch {
                return [
                  project.project_id,
                  null,
                ];
              }

            }
          )
        );


      setRiskData(
        Object.fromEntries(
          riskEntries
        )
      );

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
     FILTER OPTIONS
     ===================================================== */

  const sectors =
    useMemo(() => {

      const values =
        projects
          .map(
            (project) =>
              project.sector
          )
          .filter(Boolean);

      return [
        "All",
        ...new Set(values),
      ];

    }, [projects]);


  const statuses = [
    "All",
    "On Track",
    "Watch",
    "Delayed",
  ];


  /* =====================================================
     FILTERED PROJECTS
     ===================================================== */

  const filteredProjects =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      return projects.filter(
        (project) => {

          const matchesSearch =
            !search ||
            project.name
              ?.toLowerCase()
              .includes(search) ||
            project.project_id
              ?.toLowerCase()
              .includes(search) ||
            project.ministry
              ?.toLowerCase()
              .includes(search) ||
            project.agency
              ?.toLowerCase()
              .includes(search);


          const matchesSector =
            sectorFilter === "All" ||
            project.sector ===
            sectorFilter;


          const matchesStatus =
            statusFilter === "All" ||
            project.status ===
            statusFilter;


          return (
            matchesSearch &&
            matchesSector &&
            matchesStatus
          );

        }
      );

    }, [
      projects,
      searchTerm,
      sectorFilter,
      statusFilter,
    ]);


  /* =====================================================
     SUMMARY
     ===================================================== */

  const summary = useMemo(() => {

    const total =
      projects.length;

    const delayed =
      projects.filter(
        (project) =>
          project.status ===
          "Delayed"
      ).length;

    const watch =
      projects.filter(
        (project) =>
          project.status ===
          "Watch"
      ).length;

    const highRisk =
      projects.filter(
        (project) => {

          const risk =
            riskData[
            project.project_id
            ];

          return (
            Number(
              risk?.priority_index ??
              risk?.overall_risk ??
              0
            ) >= 70
          );

        }
      ).length;


    return {
      total,
      delayed,
      watch,
      highRisk,
    };

  }, [
    projects,
    riskData,
  ]);


  /* =====================================================
     RISK HELPERS
     ===================================================== */

  function getRiskScore(
    projectId
  ) {
    const risk =
      riskData[projectId];

    return Number(
      risk?.priority_index ??
      risk?.overall_risk ??
      0
    );
  }


  function getRiskLabel(score) {

    if (score >= 70) {
      return "High";
    }

    if (score >= 40) {
      return "Moderate";
    }

    return "Low";

  }


  function getRiskClass(score) {

    if (score >= 70) {
      return "risk-high";
    }

    if (score >= 40) {
      return "risk-medium";
    }

    return "risk-low";

  }


  /* =====================================================
     FORM HANDLERS
     ===================================================== */

  function handleFormChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  }


  function resetForm() {
    setForm({
      project_id: "",
      name: "",
      sector: "Transport",
      ministry: "",
      agency: "",
      original_cost: "",
      revised_cost: "",
      physical_progress: "0",
      financial_progress: "0",
      status: "On Track",
    });

    setCreateError("");
    setCreateSuccess("");
  }


  function closeAddProject() {
    if (creatingProject) {
      return;
    }

    setShowAddProject(false);
    resetForm();
  }


  async function handleCreateProject(
    event
  ) {
    event.preventDefault();

    setCreateError("");
    setCreateSuccess("");

    const originalCost =
      Number(
        form.original_cost
      );

    const revisedCost =
      form.revised_cost === ""
        ? null
        : Number(
          form.revised_cost
        );

    const physicalProgress =
      Number(
        form.physical_progress
      );

    const financialProgress =
      Number(
        form.financial_progress
      );


    if (
      !form.project_id.trim() ||
      !form.name.trim() ||
      !form.ministry.trim() ||
      !form.agency.trim()
    ) {
      setCreateError(
        "Please fill in all required fields."
      );

      return;
    }


    if (
      !Number.isFinite(
        originalCost
      ) ||
      originalCost <= 0
    ) {
      setCreateError(
        "Original cost must be greater than 0."
      );

      return;
    }


    if (
      revisedCost !== null &&
      (
        !Number.isFinite(
          revisedCost
        ) ||
        revisedCost <= 0
      )
    ) {
      setCreateError(
        "Revised cost must be greater than 0."
      );

      return;
    }


    if (
      physicalProgress < 0 ||
      physicalProgress > 100
    ) {
      setCreateError(
        "Physical progress must be between 0 and 100."
      );

      return;
    }


    if (
      financialProgress < 0 ||
      financialProgress > 100
    ) {
      setCreateError(
        "Financial progress must be between 0 and 100."
      );

      return;
    }


    try {
      setCreatingProject(true);

      const payload = {
        project_id:
          form.project_id
            .trim()
            .toUpperCase(),

        name:
          form.name.trim(),

        sector:
          form.sector,

        ministry:
          form.ministry.trim(),

        agency:
          form.agency.trim(),

        original_cost:
          originalCost,

        revised_cost:
          revisedCost,

        physical_progress:
          physicalProgress,

        financial_progress:
          financialProgress,

        status:
          form.status,
      };


      await createProject(
        payload
      );


      setCreateSuccess(
        "Project created successfully."
      );


      resetForm();

      /*
       * Refresh the project register so
       * the new project appears immediately.
       */
      await loadProjects();


      setTimeout(() => {
        setShowAddProject(false);
        setCreateSuccess("");
      }, 900);

    } catch (err) {
      console.error(err);

      setCreateError(
        err.message ||
        "Unable to create project."
      );

    } finally {
      setCreatingProject(false);
    }
  }


  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <div className="projects-page">

      {/* =================================================
          PAGE HEADER
          ================================================= */}

      <section className="page-header">

        <div>

          <div className="page-eyebrow">
            PROJECT PORTFOLIO
          </div>

          <h2>
            Infrastructure Projects
          </h2>

          <p>
            Search, filter, and monitor
            projects across the infrastructure
            portfolio.
          </p>

        </div>


        <div className="projects-header-actions">

          <button
            className="secondary-button"
            onClick={loadProjects}
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
            onClick={() => {
              setCreateError("");
              setCreateSuccess("");
              setShowAddProject(true);
            }}
          >

            <Plus
              size={16}
            />

            Add New Project

          </button>

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
              Unable to load projects
            </strong>

            <span>
              {error}
            </span>

          </div>

        </div>

      )}


      {/* =================================================
          SUMMARY CARDS
          ================================================= */}

      <section className="portfolio-summary-grid">

        <div className="portfolio-summary-card">

          <div className="portfolio-summary-icon blue">
            <Building2 size={19} />
          </div>

          <div>

            <span>
              Total Projects
            </span>

            <strong>
              {summary.total}
            </strong>

          </div>

        </div>


        <div className="portfolio-summary-card">

          <div className="portfolio-summary-icon red">
            <AlertTriangle size={19} />
          </div>

          <div>

            <span>
              High Risk
            </span>

            <strong>
              {summary.highRisk}
            </strong>

          </div>

        </div>


        <div className="portfolio-summary-card">

          <div className="portfolio-summary-icon orange">
            <Clock3 size={19} />
          </div>

          <div>

            <span>
              Delayed
            </span>

            <strong>
              {summary.delayed}
            </strong>

          </div>

        </div>


        <div className="portfolio-summary-card">

          <div className="portfolio-summary-icon yellow">
            <Filter size={19} />
          </div>

          <div>

            <span>
              Watch
            </span>

            <strong>
              {summary.watch}
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          FILTER PANEL
          ================================================= */}

      <section className="projects-filter-card">

        <div className="projects-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search project, ministry, agency or ID..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />

        </div>


        <div className="filter-control">

          <label htmlFor="sector-filter">
            Sector
          </label>

          <select
            id="sector-filter"
            value={sectorFilter}
            onChange={(event) =>
              setSectorFilter(
                event.target.value
              )
            }
          >

            {sectors.map(
              (sector) => (

                <option
                  key={sector}
                  value={sector}
                >
                  {sector}
                </option>

              )
            )}

          </select>

        </div>


        <div className="filter-control">

          <label htmlFor="status-filter">
            Status
          </label>

          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >

            {statuses.map(
              (status) => (

                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>

              )
            )}

          </select>

        </div>


        <div className="filter-result-count">

          Showing{" "}
          <strong>
            {filteredProjects.length}
          </strong>
          {" "}of{" "}
          <strong>
            {projects.length}
          </strong>
          {" "}projects

        </div>

      </section>


      {/* =================================================
          PROJECT TABLE
          ================================================= */}

      <section className="projects-table-card">

        <div className="card-header">

          <div>

            <span className="card-eyebrow">
              LIVE PORTFOLIO
            </span>

            <h3>
              Project Register
            </h3>

          </div>

          <span className="table-record-count">
            {filteredProjects.length} records
          </span>

        </div>


        {loading ? (

          <div className="table-loading">

            <div className="loading-spinner" />

            <span>
              Loading projects...
            </span>

          </div>

        ) : filteredProjects.length === 0 ? (

          <div className="empty-state compact">

            <Search size={30} />

            <h3>
              No projects found
            </h3>

            <p>
              Try changing your search
              or filters.
            </p>

          </div>

        ) : (

          <div className="projects-table-wrapper">

            <table className="projects-table">

              <thead>

                <tr>

                  <th>
                    Project
                  </th>

                  <th>
                    Sector
                  </th>

                  <th>
                    Ministry / Agency
                  </th>

                  <th>
                    Progress
                  </th>

                  <th>
                    Cost
                  </th>

                  <th>
                    Risk
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredProjects.map(
                  (project) => {

                    const score =
                      getRiskScore(
                        project.project_id
                      );

                    const riskLabel =
                      getRiskLabel(
                        score
                      );

                    const riskClass =
                      getRiskClass(
                        score
                      );


                    return (

                      <tr
                        key={
                          project.project_id
                        }
                      >

                        <td>

                          <div className="project-table-name">

                            <div className="project-table-icon">
                              <Building2
                                size={17}
                              />
                            </div>

                            <div>

                              <strong>
                                {project.name}
                              </strong>

                              <span>
                                {
                                  project.project_id
                                }
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          <span className="sector-tag">
                            {project.sector}
                          </span>

                        </td>


                        <td>

                          <div className="agency-cell">

                            <strong>
                              {project.ministry}
                            </strong>

                            <span>
                              {project.agency}
                            </span>

                          </div>

                        </td>


                        <td>

                          <div className="table-progress">

                            <div className="table-progress-header">

                              <span>
                                Physical
                              </span>

                              <strong>
                                {
                                  Number(
                                    project.physical_progress ||
                                    0
                                  ).toFixed(1)
                                }%
                              </strong>

                            </div>

                            <div className="table-progress-track">

                              <div
                                className="table-progress-fill"
                                style={{
                                  width: `${Math.min(
                                    Number(
                                      project.physical_progress ||
                                      0
                                    ),
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>


                        <td>

                          <div className="cost-cell">

                            <strong>
                              ₹
                              {Number(
                                project.revised_cost ??
                                project.original_cost ??
                                0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </strong>

                            {project.revised_cost &&
                              project.original_cost && (
                                <span>
                                  Original ₹
                                  {Number(
                                    project.original_cost
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </span>
                              )}

                          </div>

                        </td>


                        <td>

                          <div className="table-risk">

                            <strong
                              className={
                                riskClass
                              }
                            >
                              {score.toFixed(0)}
                            </strong>

                            <span>
                              {riskLabel}
                            </span>

                          </div>

                        </td>


                        <td>

                          <span
                            className={`status-pill ${project.status ===
                                "Delayed"
                                ? "status-delayed"
                                : project.status ===
                                  "Watch"
                                  ? "status-watch"
                                  : "status-track"
                              }`}
                          >

                            {project.status ===
                              "Delayed" && (
                                <AlertTriangle
                                  size={13}
                                />
                              )}

                            {project.status ===
                              "On Track" && (
                                <CheckCircle2
                                  size={13}
                                />
                              )}

                            {project.status ===
                              "Watch" && (
                                <Clock3
                                  size={13}
                                />
                              )}

                            {project.status}

                          </span>

                        </td>


                        <td>

                          <button
                            className="table-action-button"
                            onClick={() =>
                              navigate(
                                `/projects/${project.project_id}`
                              )
                            }
                            aria-label={`Open ${project.name}`}
                          >

                            <ArrowRight
                              size={17}
                            />

                          </button>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =================================================
          ADD PROJECT MODAL
          ================================================= */}

      {showAddProject && (

        <div
          className="project-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeAddProject();
            }
          }}
        >

          <div
            className="project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-project-title"
          >

            <div className="project-modal-header">

              <div>

                <span>
                  PROJECT REGISTRATION
                </span>

                <h2 id="add-project-title">
                  Add New Project
                </h2>

                <p>
                  Register a new infrastructure
                  project in the monitoring portfolio.
                </p>

              </div>


              <button
                type="button"
                className="project-modal-close"
                onClick={
                  closeAddProject
                }
                disabled={
                  creatingProject
                }
                aria-label="Close"
              >
                <X size={19} />
              </button>

            </div>


            <form
              className="project-form"
              onSubmit={
                handleCreateProject
              }
            >

              <div className="project-form-grid">

                <div className="project-form-field">

                  <label>
                    Project ID *
                  </label>

                  <input
                    name="project_id"
                    value={
                      form.project_id
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="e.g. P1002"
                    required
                  />

                </div>


                <div className="project-form-field">

                  <label>
                    Project Name *
                  </label>

                  <input
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="e.g. Regional Water Grid"
                    required
                  />

                </div>


                <div className="project-form-field">

                  <label>
                    Sector *
                  </label>

                  <select
                    name="sector"
                    value={
                      form.sector
                    }
                    onChange={
                      handleFormChange
                    }
                  >

                    <option>
                      Transport
                    </option>

                    <option>
                      Water Resources
                    </option>

                    <option>
                      Power
                    </option>

                    <option>
                      Urban Development
                    </option>

                    <option>
                      Railways
                    </option>

                    <option>
                      Health
                    </option>

                    <option>
                      Education
                    </option>

                    <option>
                      Other
                    </option>

                  </select>

                </div>


                <div className="project-form-field">

                  <label>
                    Ministry *
                  </label>

                  <input
                    name="ministry"
                    value={
                      form.ministry
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Ministry / Department"
                    required
                  />

                </div>


                <div className="project-form-field">

                  <label>
                    Executing Agency *
                  </label>

                  <input
                    name="agency"
                    value={
                      form.agency
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Executing agency"
                    required
                  />

                </div>


                <div className="project-form-field">

                  <label>
                    Original Cost (₹ Cr) *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="original_cost"
                    value={
                      form.original_cost
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="1000"
                    required
                  />

                </div>


                <div className="project-form-field">

                  <label>
                    Revised Cost (₹ Cr)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="revised_cost"
                    value={
                      form.revised_cost
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Optional"
                  />

                </div>


                <div className="project-form-field">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleFormChange
                    }
                  >

                    <option>
                      On Track
                    </option>

                    <option>
                      Watch
                    </option>

                    <option>
                      Delayed
                    </option>

                  </select>

                </div>


                <div className="project-form-field">

                  <label>
                    Physical Progress (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    name="physical_progress"
                    value={
                      form.physical_progress
                    }
                    onChange={
                      handleFormChange
                    }
                  />

                </div>


                <div className="project-form-field">

                  <label>
                    Financial Progress (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    name="financial_progress"
                    value={
                      form.financial_progress
                    }
                    onChange={
                      handleFormChange
                    }
                  />

                </div>

              </div>


              {createError && (

                <div className="project-form-message error">

                  <AlertTriangle size={16} />

                  <span>
                    {createError}
                  </span>

                </div>

              )}


              {createSuccess && (

                <div className="project-form-message success">

                  <CheckCircle2 size={16} />

                  <span>
                    {createSuccess}
                  </span>

                </div>

              )}


              <div className="project-form-footer">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeAddProject
                  }
                  disabled={
                    creatingProject
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    creatingProject
                  }
                >

                  {creatingProject ? (
                    <>
                      <RefreshCw
                        size={15}
                        className="spin"
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={15} />

                      Create Project
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


export default Projects;