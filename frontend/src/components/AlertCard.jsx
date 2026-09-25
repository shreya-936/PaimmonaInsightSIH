import {
  AlertTriangle,
  ArrowRight,
  CircleAlert,
  Info,
  ShieldAlert,
} from "lucide-react";


function AlertCard({
  type = "Risk Alert",
  severity = "Medium",
  message,
  reason,
  timestamp,
  projectName,
  onClick,
  compact = false,
}) {

  const normalizedSeverity =
    String(severity).toLowerCase();


  const severityConfig = {
    high: {
      icon: ShieldAlert,
      className: "alert-high",
      label: "High",
    },

    medium: {
      icon: AlertTriangle,
      className: "alert-medium",
      label: "Medium",
    },

    low: {
      icon: Info,
      className: "alert-low",
      label: "Low",
    },
  };


  const config =
    severityConfig[normalizedSeverity] ||
    severityConfig.medium;


  const AlertIcon = config.icon;


  return (
    <article
      className={`alert-card ${config.className} ${
        compact
          ? "alert-card-compact"
          : ""
      }`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {

        if (
          onClick &&
          (event.key === "Enter" ||
            event.key === " ")
        ) {
          event.preventDefault();
          onClick();
        }

      }}
    >

      {/* =================================================
          ICON
          ================================================= */}

      <div className="alert-card-icon">

        <AlertIcon size={20} />

      </div>


      {/* =================================================
          CONTENT
          ================================================= */}

      <div className="alert-card-content">

        <div className="alert-card-top">

          <div className="alert-card-type">
            {type}
          </div>

          <span className="alert-severity">
            {config.label}
          </span>

        </div>


        {projectName && (

          <div className="alert-card-project">
            {projectName}
          </div>

        )}


        {message && (

          <div className="alert-card-message">
            {message}
          </div>

        )}


        {reason && (

          <div className="alert-card-reason">
            {reason}
          </div>

        )}


        {timestamp && (

          <div className="alert-card-meta">
            {timestamp}
          </div>

        )}

      </div>


      {/* =================================================
          ACTION
          ================================================= */}

      {onClick && (

        <div className="alert-card-action">

          <ArrowRight size={17} />

        </div>

      )}

    </article>
  );
}


export default AlertCard;