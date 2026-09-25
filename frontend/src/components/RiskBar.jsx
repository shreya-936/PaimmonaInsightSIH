function RiskBar({
  label,
  value = 0,
  showValue = true,
  size = "medium",
}) {
  const numericValue = Math.max(
    0,
    Math.min(
      100,
      Number(value) || 0
    )
  );


  const getRiskLevel = (score) => {
    if (score >= 70) {
      return "high";
    }

    if (score >= 40) {
      return "medium";
    }

    return "low";
  };


  const riskLevel =
    getRiskLevel(numericValue);


  const riskLabel =
    riskLevel === "high"
      ? "High"
      : riskLevel === "medium"
        ? "Moderate"
        : "Low";


  return (
    <div
      className={`risk-bar-wrapper risk-bar-${size}`}
    >

      {/* =================================================
          LABEL
          ================================================= */}

      <div className="risk-bar-header">

        {label && (
          <span className="risk-bar-label">
            {label}
          </span>
        )}

        {showValue && (
          <div className="risk-bar-value">

            <strong>
              {Math.round(numericValue)}
            </strong>

            <span>
              /100
            </span>

          </div>
        )}

      </div>


      {/* =================================================
          PROGRESS BAR
          ================================================= */}

      <div className="risk-bar-track">

        <div
          className={`risk-bar-fill risk-${riskLevel}`}
          style={{
            width: `${numericValue}%`,
          }}
        />

      </div>


      {/* =================================================
          RISK STATUS
          ================================================= */}

      <div className="risk-bar-footer">

        <span
          className={`risk-status risk-status-${riskLevel}`}
        >
          {riskLabel} Risk
        </span>

        <span className="risk-scale-label">
          {numericValue >= 70
            ? "Requires attention"
            : numericValue >= 40
              ? "Monitor closely"
              : "Within normal range"}
        </span>

      </div>

    </div>
  );
}


export default RiskBar;