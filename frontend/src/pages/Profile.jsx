import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";


function Profile() {
  const navigate = useNavigate();


  const [notifications, setNotifications] =
    useState(true);

  const [saved, setSaved] =
    useState(false);


  const user = {
    name: "Administrator",
    role: "Executive",
    email: "administrator@paimana.gov.in",
    department:
      "Infrastructure Monitoring",
    organization:
      "Government Project Monitoring",
  };


  function handleSave() {

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);

  }


  function handleLogout() {
    navigate("/login");
  }


  return (
    <div className="profile-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <section className="page-header">

        <div>

          <div className="page-eyebrow">
            ACCOUNT MANAGEMENT
          </div>

          <h2>
            Profile
          </h2>

          <p>
            Manage your account information,
            preferences and security settings.
          </p>

        </div>

      </section>


      {/* =================================================
          PROFILE HERO
          ================================================= */}

      <section className="profile-hero dashboard-card">

        <div className="profile-avatar-large">
          AD
        </div>


        <div className="profile-hero-content">

          <span className="profile-role-badge">
            {user.role}
          </span>

          <h2>
            {user.name}
          </h2>

          <p>
            {user.department}
          </p>

          <div className="profile-email">

            <Mail size={15} />

            {user.email}

          </div>

        </div>


        <div className="profile-security-status">

          <div className="profile-security-icon">

            <ShieldCheck size={20} />

          </div>

          <div>

            <strong>
              Account Protected
            </strong>

            <span>
              Role-based access enabled
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          MAIN GRID
          ================================================= */}

      <section className="profile-main-grid">

        {/* -----------------------------------------------
            ACCOUNT INFORMATION
            ----------------------------------------------- */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                ACCOUNT
              </span>

              <h3>
                Personal Information
              </h3>

            </div>

            <User size={19} />

          </div>


          <div className="profile-form">

            <div className="profile-form-row">

              <div className="profile-field">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={user.name}
                  readOnly
                />

              </div>


              <div className="profile-field">

                <label>
                  Role
                </label>

                <input
                  type="text"
                  value={user.role}
                  readOnly
                />

              </div>

            </div>


            <div className="profile-field">

              <label>
                Email Address
              </label>

              <div className="profile-input-icon">

                <Mail size={16} />

                <input
                  type="email"
                  value={user.email}
                  readOnly
                />

              </div>

            </div>


            <div className="profile-field">

              <label>
                Department
              </label>

              <input
                type="text"
                value={
                  user.department
                }
                readOnly
              />

            </div>


            <div className="profile-field">

              <label>
                Organization
              </label>

              <input
                type="text"
                value={
                  user.organization
                }
                readOnly
              />

            </div>


            <div className="profile-form-note">

              <ShieldCheck size={16} />

              <span>
                Account details are currently
                managed by the application
                administrator.
              </span>

            </div>

          </div>

        </div>


        {/* -----------------------------------------------
            PREFERENCES
            ----------------------------------------------- */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                PREFERENCES
              </span>

              <h3>
                Notification Settings
              </h3>

            </div>

            <Bell size={19} />

          </div>


          <div className="profile-settings-list">

            <SettingItem
              icon={Bell}
              title="Risk Alert Notifications"
              description="Receive notifications when monitored project risk crosses configured thresholds."
              enabled={
                notifications
              }
              onChange={() =>
                setNotifications(
                  !notifications
                )
              }
            />


            <div className="profile-setting-divider" />


            <SettingItem
              icon={ShieldCheck}
              title="Security Notifications"
              description="Important account and administrative security events."
              enabled={true}
              disabled={true}
            />

          </div>


          <button
            className="primary-button profile-save-button"
            onClick={
              handleSave
            }
          >

            {saved ? (
              <>
                <CheckCircle2
                  size={16}
                />

                Saved

              </>
            ) : (
              <>
                <CheckCircle2
                  size={16}
                />

                Save Preferences

              </>
            )}

          </button>

        </div>

      </section>


      {/* =================================================
          SECURITY
          ================================================= */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>

            <span className="card-eyebrow">
              SECURITY
            </span>

            <h3>
              Account Security
            </h3>

          </div>

          <Lock size={19} />

        </div>


        <div className="profile-security-grid">

          <SecurityAction
            icon={Lock}
            title="Password & Authentication"
            description="Authentication settings are controlled by the deployment environment."
          />


          <SecurityAction
            icon={ShieldCheck}
            title="Access Role"
            description="Your current application role is Executive."
          />


          <SecurityAction
            icon={User}
            title="Session"
            description="Current session is active in this browser."
          />

        </div>

      </section>


      {/* =================================================
          QUICK ACTIONS
          ================================================= */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>

            <span className="card-eyebrow">
              QUICK ACTIONS
            </span>

            <h3>
              Account Navigation
            </h3>

          </div>

        </div>


        <div className="profile-actions-list">

          <button
            className="profile-action"
            onClick={() =>
              navigate(
                "/administration"
              )
            }
          >

            <div className="profile-action-icon">

              <ShieldCheck
                size={18}
              />

            </div>


            <div>

              <strong>
                Administration
              </strong>

              <span>
                View system health,
                services and configuration
              </span>

            </div>


            <ChevronRight
              size={17}
            />

          </button>


          <button
            className="profile-action"
            onClick={() =>
              navigate(
                "/risk-alerts"
              )
            }
          >

            <div className="profile-action-icon">

              <Bell size={18} />

            </div>


            <div>

              <strong>
                Risk Alerts
              </strong>

              <span>
                Review current project
                early-warning signals
              </span>

            </div>


            <ChevronRight
              size={17}
            />

          </button>


          <button
            className="profile-action profile-action-danger"
            onClick={
              handleLogout
            }
          >

            <div className="profile-action-icon">

              <LogOut size={18} />

            </div>


            <div>

              <strong>
                Logout
              </strong>

              <span>
                End the current application
                session
              </span>

            </div>


            <ChevronRight
              size={17}
            />

          </button>

        </div>

      </section>


      {/* =================================================
          FOOTER
          ================================================= */}

      <div className="profile-footer">

        <ShieldCheck size={15} />

        <span>
          PAIMANA INSIGHT uses role-based
          access and human oversight principles
          for predictive project monitoring.
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   SETTING ITEM
   ========================================================= */

function SettingItem({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
  disabled = false,
}) {
  return (
    <div className="profile-setting-item">

      <div className="profile-setting-icon">

        <Icon size={18} />

      </div>


      <div className="profile-setting-content">

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>


      <button
        type="button"
        className={`profile-toggle ${
          enabled
            ? "enabled"
            : ""
        }`}
        onClick={
          disabled
            ? undefined
            : onChange
        }
        disabled={disabled}
        aria-label={
          enabled
            ? "Disable setting"
            : "Enable setting"
        }
      >

        <span />

      </button>

    </div>
  );
}


/* =========================================================
   SECURITY ACTION
   ========================================================= */

function SecurityAction({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="profile-security-action">

      <div className="profile-security-action-icon">

        <Icon size={19} />

      </div>


      <div>

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>

    </div>
  );
}


export default Profile;