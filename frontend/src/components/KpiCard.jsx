import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";


function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  variant = "default",
}) {
  const hasTrend =
    trend !== undefined &&
    trend !== null &&
    trend !== "";


  const numericTrend =
    typeof trend === "number"
      ? trend
      : Number(trend);


  const trendDirection =
    hasTrend && !Number.isNaN(numericTrend)
      ? numericTrend > 0
        ? "up"
        : numericTrend < 0
          ? "down"
          : "neutral"
      : "neutral";


  const TrendIcon =
    trendDirection === "up"
      ? ArrowUpRight
      : trendDirection === "down"
        ? ArrowDownRight
        : Minus;


  return (
    <div
      className={`kpi-card kpi-card-${variant}`}
    >

      {/* =================================================
          TOP ROW
          ================================================= */}

      <div className="kpi-card-top">

        <div className="kpi-card-heading">

          <span className="kpi-card-title">
            {title}
          </span>

        </div>


        {Icon && (

          <div className="kpi-card-icon">

            <Icon size={20} />

          </div>

        )}

      </div>


      {/* =================================================
          VALUE
          ================================================= */}

      <div className="kpi-card-value">
        {value}
      </div>


      {/* =================================================
          BOTTOM ROW
          ================================================= */}

      <div className="kpi-card-bottom">

        {hasTrend ? (

          <div
            className={`kpi-card-trend kpi-trend-${trendDirection}`}
          >

            <TrendIcon size={14} />

            <span>
              {Math.abs(numericTrend)}
              {typeof trend === "number"
                ? "%"
                : ""}
            </span>

          </div>

        ) : (

          <div className="kpi-card-trend-placeholder">
            <Minus size={14} />
          </div>

        )}


        {trendLabel && (

          <span className="kpi-card-subtitle">
            {trendLabel}
          </span>

        )}

        {!trendLabel && subtitle && (

          <span className="kpi-card-subtitle">
            {subtitle}
          </span>

        )}

      </div>

    </div>
  );
}


export default KpiCard;