import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faFilter,
  faTrophy,
  faFire,
  faCalendarAlt,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons"
import "./CategoryStatsCard.css"
export function CategoryStatsCard({ title, stats, color }) {
  const colorClasses = {
    green: "badge-green",
    blue: "badge-blue",
    yellow: "badge-yellow",
    purple: "badge-purple",
  }

  return (
    <div className="content-card">
      <div className="content-card-header">
        <h3 className="content-card-title">{title}</h3>
        <div className="content-card-description">{stats.inProgressObjectives} objectifs en cours</div>
      </div>
      <div className="content-card-body">
        <div className="stats-section">
          <div className="stats-section-header">
            <div className="icon-with-text">
              <FontAwesomeIcon icon={faTrophy} className="text-muted" />
              <span className="text-muted">Taux de complétion</span>
            </div>
            <span className="stats-value">{stats.completionRate.toFixed(1)}%</span>
          </div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${stats.completionRate}%` }}></div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stats-item">
            <div className="icon-with-text">
              <FontAwesomeIcon icon={faFilter} className="text-muted" />
              <span className="text-muted">Objectifs</span>
            </div>
            <p className="stats-value">{stats.totalObjectives}</p>
          </div>
          <div className="stats-item">
            <div className="icon-with-text">
              <FontAwesomeIcon icon={faCheckCircle} className="text-muted" />
              <span className="text-muted">Aujourd'hui</span>
            </div>
            <p className="stats-value">{stats.completedToday}</p>
          </div>
          <div className="stats-item">
            <div className="icon-with-text">
              <FontAwesomeIcon icon={faFire} className="text-muted" />
              <span className="text-muted">Séquence</span>
            </div>
            <p className="stats-value">{stats.streakDays} jours</p>
          </div>
          <div className="stats-item">
            <div className="icon-with-text">
              <FontAwesomeIcon icon={faTrophy} className="text-muted" />
              <span className="text-muted">Record</span>
            </div>
            <p className="stats-value">{stats.bestStreak} jours</p>
          </div>
        </div>

        <div className="stats-section">
          <h4 className="stats-section-title">Jours suivis</h4>
          <div className="stats-row">
            <div className="icon-with-text">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-muted" />
              <span className="text-muted">Total</span>
            </div>
            <span className="stats-value">{stats.totalDaysTracked} jours</span>
          </div>
          <div className="stats-row">
            <div className="icon-with-text">
              <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#4caf50" }} />
              <span className="text-muted">Complétés</span>
            </div>
            <span className="stats-value">{stats.totalDaysCompleted} jours</span>
          </div>
          <div className="stats-row">
            <div className="icon-with-text">
              <FontAwesomeIcon icon={faTimesCircle} style={{ color: "#f44336" }} />
              <span className="text-muted">Non complétés</span>
            </div>
            <span className="stats-value">{stats.totalDaysTracked - stats.totalDaysCompleted} jours</span>
          </div>
        </div>

        {stats.mostCompletedObjective && (
          <div className="stats-section">
            <h4 className="stats-section-title">Objectif le plus complété</h4>
            <div className="stats-card-objective">
              <p className="stats-card-objective-name">{stats.mostCompletedObjective.name}</p>
              <div className="stats-card-objective-stats">
                <span className="text-muted">Taux de complétion</span>
                <span className={`badge ${colorClasses[color]}`}>
                  {stats.mostCompletedObjective.completionRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {stats.leastCompletedObjective && (
          <div className="stats-section">
            <h4 className="stats-section-title">Objectif le moins complété</h4>
            <div className="stats-card-objective">
              <p className="stats-card-objective-name">{stats.leastCompletedObjective.name}</p>
              <div className="stats-card-objective-stats">
                <span className="text-muted">Taux de complétion</span>
                <span className={`badge ${colorClasses[color]}`}>
                  {stats.leastCompletedObjective.completionRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
