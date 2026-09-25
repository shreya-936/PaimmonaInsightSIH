import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Map,
  MapPin,
  RefreshCw,
  Search,
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
} from "../services/api";


function Geography() {
  const navigate = useNavigate();

  const [projects, setProjects] =
    useState([]);

  const [riskData, setRiskData] =
    useState({});

  const [searchTerm, setSearchTerm] =
    useState("");

  const [sectorFilter, setSectorFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  async function loadGeographyData() {
    try {
      setLoading(true);
      setError("");

      const projectList =
        await getProjects();

      setProjects(
        projectList || []
      );


      const riskEntries =
        await Promise.all(
          (projectList || []).map(
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
          "Unable to load geography data."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadGeographyData();
  }, []);


  /* =====================================================
     SECTORS
     ===================================================== */

  const sectors =
    useMemo(() => {

      return [
        "All",
        ...new Set(
          projects
            .map(
              (project) =>
                project.sector
            )
            .filter(Boolean)
        ),
      ];

    }, [projects]);


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


          return (
            matchesSearch &&
            matchesSector
          );

        }
      );

    }, [
      projects,
      searchTerm,
      sectorFilter,
    ]);


  /* =====================================================
     SECTOR SUMMARY
     ===================================================== */

  const sectorSummary =
    useMemo(() => {

      const grouped = {};


      filteredProjects.forEach(
        (project) => {

          const sector =
            project.sector ||
            "Other";


          if (!grouped[sector]) {

            grouped[sector] = {
              name: sector,
              count: 0,
              delayed: 0,
              highRisk: 0,
              totalCost: 0,
            };

          }


          grouped[sector].count += 1;


          if (
            project.status ===
            "Delayed"
          ) {
            grouped[sector].delayed += 1;
          }


          const risk =
            Number(
              riskData[
                project.project_id
              ]?.priority_index ??
                riskData[
                  project.project_id
                ]?.overall_risk ??
                0
            );


          if (risk >= 70) {
            grouped[sector].highRisk += 1;
          }


          grouped[sector].totalCost +=
            Number(
              project.revised_cost ??
                project.original_cost ??
                0
            );

        }
      );


      return Object.values(
        grouped
      ).sort(
        (a, b) =>
          b.count -
          a.count
      );

    }, [
      filteredProjects,
      riskData,
    ]);


  /* =====================================================
     SUMMARY
     ===================================================== */

  const highRiskCount =
    filteredProjects.filter(
      (project) =>
        Number(
          riskData[
            project.project_id
          ]?.priority_index ??
            riskData[
              project.project_id
            ]?.overall_risk ??
            0
        ) >= 70
    ).length;


  const delayedCount =
    filteredProjects.filter(
      (project) =>
        project.status ===
        "Delayed"
    ).length;


  const totalCost =
    filteredProjects.reduce(
      (sum, project) =>
        sum +
        Number(
          project.revised_cost ??
            project.original_cost ??
            0
        ),
      0
    );


  return (
    <div className="geography-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <section className="page-header">

        <div>

          <div className="page-eyebrow">
            GEOSPATIAL MONITORING
          </div>

          <h2>
            Geography
          </h2>

          <p>
            Explore the infrastructure
            portfolio by sector and
            geographic monitoring context.
          </p>

        </div>


        <button
          className="secondary-button"
          onClick={loadGeographyData}
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

      </section>


      {/* =================================================
          ERROR
          ================================================= */}

      {error && (

        <div className="status-banner status-error">

          <AlertTriangle size={18} />

          <div>

            <strong>
              Geography data unavailable
            </strong>

            <span>
              {error}
            </span>

          </div>

        </div>

      )}


      {loading ? (

        <div className="page-loading">

          <div className="loading-spinner" />

          <h3>
            Loading geographic portfolio...
          </h3>

          <p>
            Preparing project locations and
            monitoring indicators.
          </p>

        </div>

      ) : (

        <>

          {/* =================================================
              SUMMARY
              ================================================= */}

          <section className="geo-summary-grid">

            <GeoSummary
              icon={Building2}
              label="Projects"
              value={
                filteredProjects.length
              }
              variant="blue"
            />


            <GeoSummary
              icon={AlertTriangle}
              label="High Risk"
              value={
                highRiskCount
              }
              variant="red"
            />


            <GeoSummary
              icon={MapPin}
              label="Delayed"
              value={
                delayedCount
              }
              variant="orange"
            />


            <GeoSummary
              icon={Map}
              label="Cost Exposure"
              value={formatCurrency(
                totalCost
              )}
              variant="green"
            />

          </section>


          {/* =================================================
              FILTERS
              ================================================= */}

          <section className="geo-filter-card">

            <div className="geo-search">

              <Search size={18} />

              <input
                type="text"
                placeholder="Search project, ministry or agency..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />

            </div>


            <div className="filter-control">

              <label htmlFor="geo-sector">
                Sector
              </label>

              <select
                id="geo-sector"
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
                      {sector === "All"
                        ? "All Sectors"
                        : sector}
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
              {" "}projects

            </div>

          </section>


          {/* =================================================
              MAP / PORTFOLIO VIEW
              ================================================= */}

          <section className="geo-main-grid">

            {/* -----------------------------------------------
                MAP PLACEHOLDER
                ----------------------------------------------- */}

            <div className="dashboard-card geo-map-card">

              <div className="card-header">

                <div>

                  <span className="card-eyebrow">
                    PROJECT MAP
                  </span>

                  <h3>
                    Infrastructure Portfolio
                  </h3>

                </div>

                <Map size={19} />

              </div>


              <div className="geo-map-placeholder">

                <div className="geo-map-grid">

                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />

                </div>


                <div className="india-map-outline">

                  <div className="india-map-title">
                    INDIA
                  </div>

                  <div className="map-marker marker-1">
                    <span />
                  </div>

                  <div className="map-marker marker-2">
                    <span />
                  </div>

                  <div className="map-marker marker-3">
                    <span />
                  </div>

                  <div className="map-marker marker-4">
                    <span />
                  </div>

                  <div className="map-marker marker-5">
                    <span />
                  </div>

                </div>


                <div className="map-overlay-note">

                  <MapPin size={16} />

                  <span>
                    Geographic coordinates can
                    be connected to the project
                    master data for live mapping.
                  </span>

                </div>

              </div>


              <div className="map-legend">

                <span>
                  <i className="legend-dot high" />
                  High Risk
                </span>

                <span>
                  <i className="legend-dot medium" />
                  Moderate
                </span>

                <span>
                  <i className="legend-dot low" />
                  Low Risk
                </span>

              </div>

            </div>


            {/* -----------------------------------------------
                PROJECT LOCATION LIST
                ----------------------------------------------- */}

            <div className="dashboard-card geo-project-list-card">

              <div className="card-header">

                <div>

                  <span className="card-eyebrow">
                    PROJECT LOCATIONS
                  </span>

                  <h3>
                    Monitored Projects
                  </h3>

                </div>

                <span className="table-record-count">
                  {filteredProjects.length}
                </span>

              </div>


              <div className="geo-project-list">

                {filteredProjects.length === 0 ? (

                  <div className="empty-state compact">

                    <Search size={28} />

                    <h3>
                      No projects found
                    </h3>

                    <p>
                      Change the search or
                      sector filter.
                    </p>

                  </div>

                ) : (

                  filteredProjects.map(
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


                      return (

                        <button
                          className="geo-project-item"
                          key={
                            project.project_id
                          }
                          onClick={() =>
                            navigate(
                              `/projects/${project.project_id}`
                            )
                          }
                        >

                          <div
                            className={`geo-project-marker ${
                              score >= 70
                                ? "high"
                                : score >= 40
                                  ? "medium"
                                  : "low"
                            }`}
                          >
                            <MapPin size={16} />
                          </div>


                          <div className="geo-project-info">

                            <strong>
                              {project.name}
                            </strong>

                            <span>
                              {project.sector}
                              {" • "}
                              {project.agency}
                            </span>

                            <small>
                              {project.project_id}
                            </small>

                          </div>


                          <div className="geo-project-risk">

                            <strong
                              className={
                                score >= 70
                                  ? "risk-high"
                                  : score >= 40
                                    ? "risk-medium"
                                    : "risk-low"
                              }
                            >
                              {score.toFixed(0)}
                            </strong>

                            <span>
                              Risk
                            </span>

                          </div>


                          <ArrowRight
                            size={16}
                          />

                        </button>

                      );

                    }
                  )

                )}

              </div>

            </div>

          </section>


          {/* =================================================
              SECTOR DISTRIBUTION
              ================================================= */}

          <section className="dashboard-card">

            <div className="card-header">

              <div>

                <span className="card-eyebrow">
                  PORTFOLIO DISTRIBUTION
                </span>

                <h3>
                  Projects by Sector
                </h3>

              </div>

              <span className="table-record-count">
                {sectorSummary.length} sectors
              </span>

            </div>


            <div className="geo-sector-grid">

              {sectorSummary.map(
                (sector) => {

                  const percentage =
                    filteredProjects.length >
                    0
                      ? (
                          sector.count /
                          filteredProjects.length
                        ) * 100
                      : 0;


                  return (

                    <div
                      className="geo-sector-card"
                      key={
                        sector.name
                      }
                    >

                      <div className="geo-sector-icon">
                        <Building2
                          size={18}
                        />
                      </div>


                      <div className="geo-sector-content">

                        <strong>
                          {sector.name}
                        </strong>

                        <span>
                          {sector.count} project
                          {sector.count !==
                          1
                            ? "s"
                            : ""}
                        </span>


                        <div className="geo-sector-track">

                          <div
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />

                        </div>


                        <small>
                          {percentage.toFixed(
                            0
                          )}% of filtered portfolio
                        </small>

                      </div>


                      <div className="geo-sector-stats">

                        <strong>
                          {sector.highRisk}
                        </strong>

                        <span>
                          High risk
                        </span>


                        <strong>
                          {sector.delayed}
                        </strong>

                        <span>
                          Delayed
                        </span>

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          </section>


          {/* =================================================
              DATA NOTE
              ================================================= */}

          <section className="geo-information-card">

            <div className="geo-information-icon">
              <Map size={20} />
            </div>

            <div>

              <strong>
                Geographic data readiness
              </strong>

              <p>
                The current prototype is
                structured to consume project
                latitude, longitude, state,
                district, and location metadata
                when those fields are available
                in the authorized project data.
                The visual map layer can then be
                connected to MapLibre or Leaflet
                without changing the monitoring
                workflow.
              </p>

            </div>

          </section>


          {/* =================================================
              BACK
              ================================================= */}

          <button
            className="back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >

            ← Back to Dashboard

          </button>

        </>

      )}

    </div>
  );
}


/* =========================================================
   SUMMARY CARD
   ========================================================= */

function GeoSummary({
  icon: Icon,
  label,
  value,
  variant,
}) {
  return (
    <div className="geo-summary-card">

      <div
        className={`geo-summary-icon ${variant}`}
      >
        <Icon size={20} />
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}


/* =========================================================
   CURRENCY
   ========================================================= */

function formatCurrency(
  value
) {
  const amount =
    Number(value) || 0;


  if (
    amount >= 10000000
  ) {
    return `₹${(
      amount /
      10000000
    ).toFixed(2)} Cr`;
  }


  if (
    amount >= 100000
  ) {
    return `₹${(
      amount /
      100000
    ).toFixed(2)} L`;
  }


  return `₹${amount.toLocaleString(
    "en-IN"
  )}`;
}


export default Geography;