"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faChurch,
  faBriefcase,
  faDumbbell,
  faMoneyBillWave,
  faFire,
  faCalendarAlt,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons"
import { getObjectivesStats } from "../../services/statistics.service"

export function ObjectivesStatsTable() {
  const [stats, setStats] = useState([])
  const [sortBy, setSortBy] = useState("completionRate")
  const [sortOrder, setSortOrder] = useState("desc")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const objectivesStats = await getObjectivesStats()
        setStats(objectivesStats)
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques par objectif:", err)
        setError("Impossible de charger les statistiques par objectif. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const sortedStats = [...stats].sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortBy] < b[sortBy] ? -1 : 1
    } else {
      return a[sortBy] > b[sortBy] ? -1 : 1
    }
  })

  const getCategoryIcon = (category) => {
    switch (category) {
      case "spirituel":
        return <FontAwesomeIcon icon={faChurch} style={{ color: "#4caf50" }} />
      case "professionnel":
        return <FontAwesomeIcon icon={faBriefcase} style={{ color: "#2196f3" }} />
      case "personnel":
        return <FontAwesomeIcon icon={faDumbbell} style={{ color: "#ff9800" }} />
      case "finance":
        return <FontAwesomeIcon icon={faMoneyBillWave} style={{ color: "#9c27b0" }} />
      default:
        return null
    }
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case "spirituel":
        return "Spirituel"
      case "professionnel":
        return "Professionnel"
      case "personnel":
        return "Personnel"
      case "finance":
        return "Finance"
      default:
        return category
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "Jamais"
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="statistics-loading">
        <div className="spinner"></div>
        <p>Chargement des statistiques par objectif...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="statistics-error">
        <p>{error}</p>
        <button className="bouton-primaire" onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="stats-table-container">
      <table className="stats-table">
        <thead>
          <tr>
            <th>Objectif</th>
            <th>Catégorie</th>
            <th className="sortable" onClick={() => handleSort("completionRate")}>
              Taux de complétion {sortBy === "completionRate" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="sortable" onClick={() => handleSort("daysTracked")}>
              Jours suivis {sortBy === "daysTracked" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="sortable" onClick={() => handleSort("daysCompleted")}>
              Jours complétés {sortBy === "daysCompleted" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="sortable" onClick={() => handleSort("currentStreak")}>
              Séquence {sortBy === "currentStreak" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="sortable" onClick={() => handleSort("bestStreak")}>
              Record {sortBy === "bestStreak" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="sortable" onClick={() => handleSort("lastCompletedDate")}>
              Dernière complétion {sortBy === "lastCompletedDate" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedStats.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center">
                Aucun objectif en cours trouvé
              </td>
            </tr>
          ) : (
            sortedStats.map((stat) => (
              <tr key={stat.id}>
                <td className="stats-table-name">
                  <a href={`/objectif/${stat.id}`} className="stats-table-link">
                    {stat.name}
                  </a>
                </td>
                <td>
                  <div className="icon-with-text">
                    {getCategoryIcon(stat.category)}
                    <span>{getCategoryLabel(stat.category)}</span>
                  </div>
                </td>
                <td>
                  <div className="stats-progress">
                    <div className="stats-progress-value">{stat.completionRate.toFixed(1)}%</div>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${stat.completionRate}%` }}></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="icon-with-text">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-muted" />
                    <span>{stat.daysTracked}</span>
                  </div>
                </td>
                <td>
                  <div className="icon-with-text">
                    <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#4caf50" }} />
                    <span>{stat.daysCompleted}</span>
                  </div>
                </td>
                <td>
                  <div className="icon-with-text">
                    <FontAwesomeIcon icon={faFire} style={{ color: stat.currentStreak > 0 ? "#ff9800" : "#666" }} />
                    <span>{stat.currentStreak} jours</span>
                  </div>
                </td>
                <td>
                  <div className="icon-with-text">
                    <FontAwesomeIcon icon={faFire} style={{ color: "#f44336" }} />
                    <span>{stat.bestStreak} jours</span>
                  </div>
                </td>
                <td>{formatDate(stat.lastCompletedDate)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
