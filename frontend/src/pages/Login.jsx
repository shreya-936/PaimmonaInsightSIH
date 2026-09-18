import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    // Demo login for prototype
    localStorage.setItem("paimana_user", email || "admin@paimana.gov.in");

    navigate("/dashboard");
  };

  const demoLogin = (role) => {
    const accounts = {
      Executive: "executive@paimana.gov.in",
      Analyst: "analyst@paimana.gov.in",
      Officer: "officer@paimana.gov.in",
    };

    localStorage.setItem("paimana_user", accounts[role]);

    navigate("/dashboard");
  };

  return (
    <div className="login-page">

      {/* Left visual section */}
      <div className="login-visual">

        <div className="login-brand">
          <div className="brand-symbol">
            <ShieldCheck size={30} />
          </div>

          <div>
            <h2>PAIMANA</h2>
            <span>INSIGHT</span>
          </div>
        </div>

        <div className="login-hero-content">
          <span className="eyebrow">
            PREDICTIVE INFRASTRUCTURE MONITORING
          </span>

          <h1>
            From Data
            <br />
            to <span>Decisions.</span>
          </h1>

          <p>
            Predict project risks, understand emerging issues and
            help decision-makers act before problems escalate.
          </p>

          <div className="login-stats">
            <div>
              <strong>342+</strong>
              <span>Projects Monitored</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Risk Monitoring</span>
            </div>

            <div>
              <strong>AI</strong>
              <span>Decision Support</span>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <span>Infrastructure for a Better Tomorrow</span>
          <span>Government Decision Support Platform</span>
        </div>

      </div>

      {/* Login form */}
      <div className="login-form-section">

        <div className="login-card">

          <div className="mobile-brand">
            <div className="brand-symbol">
              <ShieldCheck size={26} />
            </div>

            <div>
              <h2>PAIMANA</h2>
              <span>INSIGHT</span>
            </div>
          </div>

          <div className="login-heading">
            <span className="small-label">SECURE ACCESS</span>

            <h1>Welcome Back</h1>

            <p>
              Sign in to access the PAIMANA INSIGHT monitoring platform.
            </p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label>Email / User ID</label>

              <input
                type="text"
                placeholder="Enter your email or user ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="password-label">
                <label>Password</label>

                <button
                  type="button"
                  className="forgot-button"
                  onClick={() => alert("Demo prototype")}
                >
                  Forgot password?
                </button>
              </div>

              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button className="login-button" type="submit">
              Sign In

              <ArrowRight size={19} />
            </button>

          </form>

          <div className="demo-divider">
            <span>OR USE DEMO ACCOUNT</span>
          </div>

          <div className="demo-buttons">

            <button onClick={() => demoLogin("Executive")}>
              <strong>Executive</strong>
              <span>Portfolio overview</span>
            </button>

            <button onClick={() => demoLogin("Analyst")}>
              <strong>Analyst</strong>
              <span>Data & models</span>
            </button>

            <button onClick={() => demoLogin("Officer")}>
              <strong>Officer</strong>
              <span>Project monitoring</span>
            </button>

          </div>

          <p className="prototype-note">
            Demo accounts are for prototype demonstration only.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;