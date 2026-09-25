import {
  ArrowRight,
  BarChart3,
  LockKeyhole,
  ShieldCheck,
  TrendingUp,
  User,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useState,
} from "react";


function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState(
    "Executive"
  );

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");


  function handleSubmit(event) {
    event.preventDefault();

    setError("");

    /*
     * Demo authentication for the prototype.
     * Backend authentication can be connected later.
     */

    if (!username.trim()) {
      setError(
        "Please enter your username."
      );
      return;
    }

    if (!password.trim()) {
      setError(
        "Please enter your password."
      );
      return;
    }

    localStorage.setItem(
      "paimana_user",
      JSON.stringify({
        username: username.trim(),
        role,
      })
    );

    navigate("/dashboard");
  }


  function handleDemoLogin() {
    localStorage.setItem(
      "paimana_user",
      JSON.stringify({
        username: "demo.admin",
        role,
      })
    );

    navigate("/dashboard");
  }


  return (
    <div className="login-page">

      {/* =================================================
          LEFT — BRAND / PRODUCT INTRO
          ================================================= */}

      <section className="login-left">

        <div>

          {/* BRAND */}

          <div className="login-brand">

            <div className="login-brand-logo">
              P
            </div>

            <div className="login-brand-text">

              <strong>
                PAIMANA
              </strong>

              <span>
                INSIGHT
              </span>

            </div>

          </div>


          {/* HERO */}

          <h1>
            Predict risk.
            <br />
            Prevent delays.
            <br />
            <span>
              Improve outcomes.
            </span>
          </h1>


          <p>
            A predictive decision-support
            platform for monitoring
            infrastructure projects,
            identifying emerging risks,
            and supporting timely
            intervention.
          </p>


          {/* FEATURES */}

          <div className="login-feature-grid">

            <div className="login-feature">

              <TrendingUp size={20} />

              <strong>
                Predictive Risk
              </strong>

              <span>
                Identify cost and delay
                risks early.
              </span>

            </div>


            <div className="login-feature">

              <BarChart3 size={20} />

              <strong>
                Explainable AI
              </strong>

              <span>
                Understand what drives
                project risk.
              </span>

            </div>


            <div className="login-feature">

              <ShieldCheck size={20} />

              <strong>
                Human Oversight
              </strong>

              <span>
                Keep decisions with
                authorized officers.
              </span>

            </div>

          </div>


          {/* FOOTER NOTE */}

          <div
            style={{
              marginTop: "25px",
              color: "#8a98a9",
              fontSize: "9px",
              lineHeight: "1.5",
            }}
          >
            Government infrastructure
            monitoring • Decision support
            system
          </div>

        </div>

      </section>


      {/* =================================================
          RIGHT — LOGIN CARD
          ================================================= */}

      <section className="login-right">

        <div className="login-card">

          <h2>
            Welcome back
          </h2>

          <p>
            Sign in to access the
            PAIMANA INSIGHT monitoring
            platform.
          </p>


          <form
            onSubmit={handleSubmit}
          >

            {/* USERNAME */}

            <div className="login-field">

              <label htmlFor="username">
                Username
              </label>

              <div className="login-input">

                <User size={16} />

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(
                      event.target.value
                    )
                  }
                  placeholder="Enter your username"
                  autoComplete="username"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="login-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="login-input">

                <LockKeyhole size={16} />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

              </div>

            </div>


            {/* ROLE */}

            <div className="login-field">

              <label htmlFor="role">
                Access Role
              </label>

              <div className="login-input">

                <ShieldCheck size={16} />

                <select
                  id="role"
                  value={role}
                  onChange={(event) =>
                    setRole(
                      event.target.value
                    )
                  }
                >

                  <option value="Executive">
                    Executive
                  </option>

                  <option value="Analyst">
                    Analyst
                  </option>

                  <option value="Officer">
                    Project Officer
                  </option>

                </select>

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div
                style={{
                  marginBottom: "12px",
                  padding: "9px 11px",
                  borderRadius: "7px",
                  border:
                    "1px solid #f0caca",
                  background: "#fff5f5",
                  color: "#b74d4d",
                  fontSize: "9px",
                  lineHeight: "1.5",
                }}
              >
                {error}
              </div>

            )}


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
            >

              <span>
                Sign in
              </span>

              <ArrowRight size={17} />

            </button>

          </form>


          {/* DEMO ACCESS */}

          <div className="login-demo">

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "9px",
              }}
            >

              <span
                style={{
                  flex: 1,
                  height: "1px",
                  background: "#dfe5ec",
                }}
              />

              <small>
                OR
              </small>

              <span
                style={{
                  flex: 1,
                  height: "1px",
                  background: "#dfe5ec",
                }}
              />

            </div>


            <button
              type="button"
              onClick={handleDemoLogin}
              style={{
                width: "100%",
                minHeight: "34px",
                border: "1px solid #d5dfeb",
                borderRadius: "6px",
                background: "white",
                color: "#3975c8",
                fontSize: "9px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Continue with Demo Access
            </button>

            <div
              style={{
                marginTop: "7px",
              }}
            >
              Prototype access — no real
              government credentials are
              required.
            </div>

          </div>


          {/* SECURITY */}

          <div className="login-security">

            <ShieldCheck size={15} />

            <span>
              Secure role-based monitoring
              environment
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}


export default Login;