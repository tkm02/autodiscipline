"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrophy, faCalendarAlt, faFire, faChartBar, faFilter } from "@fortawesome/free-solid-svg-icons"
import { LineChart, BarChart, PieChart } from "./charts"
import { CategoryStatsCard } from "./category-stats-card"
import { ObjectivesStatsTable } from "./objectives-stats-table"
import {
  getGlobalStats,
  getCategoriesStats,
  getDailyStats,
  getStartDate,
  getDaysSinceStart,
} from "../../services/statistics.service"

export function GlobalStats() {
  const [activeTab, setActiveTab] = useState("overview")
  const [globalStats, setGlobalStats] = useState(null)
  const [categoriesStats, setCategoriesStats] = useState(null)
  const [dailyStats, setDailyStats] = useState([])
  const [period, setPeriod] = useState(30)
  const [startDate, setStartDate] = useState("")
  const [daysSinceStart, setDaysSinceStart] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Charger les données de base
        const startDateValue = await getStartDate()
        setStartDate(startDateValue)

        const daysSinceStartValue = await getDaysSinceStart()
        setDaysSinceStart(daysSinceStartValue)

        const globalStatsData = await getGlobalStats()
        setGlobalStats(globalStatsData)

        const categoriesStatsData = await getCategoriesStats()
        console.log("Categories Stats Data:", categoriesStatsData);
        
        setCategoriesStats(categoriesStatsData)

        const dailyStatsData = await getDailyStats(period)
        setDailyStats(dailyStatsData)
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err)
        setError("Impossible de charger les données statistiques. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  console.log(categoriesStats)

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="statistics-container">
        <div className="statistics-loading">
          <div className="spinner"></div>
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="statistics-container">
        <div className="statistics-error">
          <p>{error}</p>
          <button className="bouton-primaire" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!globalStats || !categoriesStats) {
    return (
      <div className="statistics-container">
        <div className="statistics-error">
          <p>Aucune donnée statistique disponible.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h2 className="statistics-title">Tableau de bord des statistiques</h2>
        <p className="statistics-subtitle">
          Suivi depuis le {formatDate(startDate)} ({daysSinceStart} jours)
        </p>
      </div>

      <div className="stats-cards-grid">
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-title">Objectifs en cours</div>
            <FontAwesomeIcon icon={faFilter} className="stats-card-icon" />
          </div>
          <div className="stats-card-content">
            <div className="stats-card-value">{globalStats.inProgressObjectives}</div>
            <div className="stats-card-description">{globalStats.completedToday} complétés aujourd'hui</div>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-title">Taux de complétion</div>
            <FontAwesomeIcon icon={faTrophy} className="stats-card-icon" />
          </div>
          <div className="stats-card-content">
            <div className="stats-card-value">{globalStats.completionRate.toFixed(1)}%</div>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${globalStats.completionRate}%` }}></div>
            </div>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-title">Séquence actuelle</div>
            <FontAwesomeIcon icon={faFire} className="stats-card-icon" />
          </div>
          <div className="stats-card-content">
            <div className="stats-card-value">{globalStats.streakDays} jours</div>
            <div className="stats-card-description">Record: {globalStats.bestStreak} jours</div>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-title">Période de suivi</div>
            <FontAwesomeIcon icon={faCalendarAlt} className="stats-card-icon" />
          </div>
          <div className="stats-card-content">
            <div className="stats-card-value">{daysSinceStart} jours</div>
            <div className="stats-card-description">Depuis le {formatDate(startDate)}</div>
          </div>
        </div>
      </div>

      <div className="stats-tabs">
        <div className="stats-tabs-list">
          <button
            className={`stats-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Vue d'ensemble
          </button>
          <button
            className={`stats-tab ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            Par catégorie
          </button>
          <button
            className={`stats-tab ${activeTab === "evolution" ? "active" : ""}`}
            onClick={() => setActiveTab("evolution")}
          >
            Évolution
          </button>
          <button
            className={`stats-tab ${activeTab === "objectives" ? "active" : ""}`}
            onClick={() => setActiveTab("objectives")}
          >
            Par objectif
          </button>
        </div>

        <div className={`stats-tab-content ${activeTab === "overview" ? "active" : ""}`}>
          <div className="charts-grid">
            <div className="content-card full-width">
              <div className="content-card-header">
                <h3 className="content-card-title">Évolution du taux de complétion</h3>
                <div className="content-card-description">Progression quotidienne sur les {period} derniers jours</div>
              </div>
              <div className="content-card-body">
                <div className="chart-container">
                  <LineChart data={dailyStats} />
                </div>
              </div>
            </div>
            <div className="content-card">
              <div className="content-card-header">
                <h3 className="content-card-title">Répartition par catégorie</h3>
                <div className="content-card-description">Distribution des objectifs en cours</div>
              </div>
              <div className="content-card-body">
                <div className="chart-container">
                  <PieChart data={globalStats.categoriesDistribution} />
                </div>
              </div>
            </div>
            <div className="content-card">
              <div className="content-card-header">
                <h3 className="content-card-title">Taux de complétion par catégorie</h3>
                <div className="content-card-description">Comparaison des performances entre catégories</div>
              </div>
              <div className="content-card-body">
                <div className="chart-container">
                  <BarChart data={globalStats.categoryCompletionRates} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`stats-tab-content ${activeTab === "categories" ? "active" : ""}`}>
          <div className="charts-grid">
            <CategoryStatsCard title="Objectifs Spirituels" stats={categoriesStats.spiritual} color="green" />
            <CategoryStatsCard title="Objectifs Professionnels" stats={categoriesStats.professional} color="blue" />
            <CategoryStatsCard title="Objectifs Personnels" stats={categoriesStats.personal} color="yellow" />
            <CategoryStatsCard title="Objectifs Financiers" stats={categoriesStats.finance} color="purple" />
          </div>
        </div>

        <div className={`stats-tab-content ${activeTab === "evolution" ? "active" : ""}`}>
          <div className="period-buttons">
            <button className={`period-button ${period === 7 ? "active" : ""}`} onClick={() => setPeriod(7)}>
              7 jours
            </button>
            <button className={`period-button ${period === 30 ? "active" : ""}`} onClick={() => setPeriod(30)}>
              30 jours
            </button>
            <button className={`period-button ${period === 90 ? "active" : ""}`} onClick={() => setPeriod(90)}>
              90 jours
            </button>
          </div>
          <div className="content-card">
            <div className="content-card-header">
              <h3 className="content-card-title">Évolution quotidienne</h3>
              <div className="content-card-description">
                Taux de complétion quotidien sur les {period} derniers jours
              </div>
            </div>
            <div className="content-card-body">
              <div className="chart-container" style={{ height: "400px" }}>
                <LineChart data={dailyStats} />
              </div>
            </div>
          </div>
          <div className="stats-cards-grid">
            <div className="stats-card">
              <div className="stats-card-header">
                <div className="stats-card-title">Jours suivis</div>
                <FontAwesomeIcon icon={faCalendarAlt} className="stats-card-icon" />
              </div>
              <div className="stats-card-content">
                <div className="stats-card-value">{dailyStats.filter((day) => day.totalObjectives > 0).length}</div>
                <div className="stats-card-description">
                  Sur {period} jours (
                  {((dailyStats.filter((day) => day.totalObjectives > 0).length / period) * 100).toFixed(1)}%)
                </div>
              </div>
            </div>
            <div className="stats-card">
              <div className="stats-card-header">
                <div className="stats-card-title">Meilleur jour</div>
                <FontAwesomeIcon icon={faTrophy} className="stats-card-icon" />
              <div className="stats-card-content">
                {dailyStats.length > 0 ? (
                  <>
                    <div className="stats-card-value">
                      {formatDate(
                        dailyStats.reduce((best, current) =>
                          current.completionRate > best.completionRate ? current : best,
                        ).date,
                      )}
                    </div>
                    <div className="stats-card-description">
                      {dailyStats
                        .reduce((best, current) => (current.completionRate > best.completionRate ? current : best))
                        .completionRate.toFixed(1)}
                      % de complétion
                    </div>
                  </>
                ) : (
                  <div className="stats-card-description">Aucune donnée</div>
                )}
              </div>
                {dailyStats.length > 0 ? (
                  <>
                    <div className="stats-card-value">
                      {formatDate(
                        dailyStats.reduce((best, current) =>
                          current.completionRate > best.completionRate ? current : best,
                        ).date,
                      )}
                    </div>
                    <div className="stats-card-description">
                      {dailyStats
                        .reduce((best, current) => (current.completionRate > best.completionRate ? current : best))
                        .completionRate.toFixed(1)}
                      % de complétion
                    </div>
                  </>
                ) : (
                  <div className="stats-card-description">Aucune donnée</div>
                )}
              </div>
            </div>
            <div className="stats-card">
              <div className="stats-card-header">
                <div className="stats-card-title">Moyenne</div>
                <FontAwesomeIcon icon={faChartBar} className="stats-card-icon" />
              </div>
              <div className="stats-card-content">
                <div className="stats-card-value">
                  {dailyStats.length > 0
                    ? (dailyStats.reduce((sum, day) => sum + day.completionRate, 0) / dailyStats.length).toFixed(1)
                    : 0}
                  %
                </div>
                <div className="stats-card-description">Taux de complétion moyen</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`stats-tab-content ${activeTab === "objectives" ? "active" : ""}`}>
          <div className="content-card">
            <div className="content-card-header">
              <h3 className="content-card-title">Statistiques par objectif</h3>
              <div className="content-card-description">Performance détaillée de chaque objectif en cours</div>
            </div>
            <div className="content-card-body">
              <ObjectivesStatsTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
