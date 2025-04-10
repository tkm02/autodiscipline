"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { getObjectives } from "../../services/statistics.service"
import "./history-calendar.css";
export function HistoryCalendar({ category }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [objectives, setObjectives] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const allObjectives = await getObjectives()
        const filteredObjectives = allObjectives.filter((obj) => obj.statut === "en_cours")

        if (category) {
          setObjectives(filteredObjectives.filter((obj) => obj.categorie === category))
        } else {
          setObjectives(filteredObjectives)
        }
      } catch (err) {
        console.error("Erreur lors du chargement des objectifs:", err)
        setError("Impossible de charger les données du calendrier. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [category])

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getCompletionRate = (date) => {
    let completedObjectives = 0
    let totalTrackedObjectives = 0

    objectives.forEach((obj) => {
      if (obj.progression[date] !== undefined) {
        totalTrackedObjectives++
        if (obj.typeDeTracking === "binaire") {
          if (obj.progression[date] === true) completedObjectives++
        } else if (typeof obj.progression[date] === "number" && obj.progression[date] > 0) {
          completedObjectives++
        }
      }
    })

    return totalTrackedObjectives > 0 ? (completedObjectives / totalTrackedObjectives) * 100 : 0
  }

  const getCompletionColor = (rate) => {
    if (rate === 0) return "bg-gray-200"
    if (rate < 25) return "bg-red-200"
    if (rate < 50) return "bg-orange-200"
    if (rate < 75) return "bg-yellow-200"
    if (rate < 100) return "bg-lime-200"
    return "bg-green-200"
  }

  const getDayDetails = (date) => {
    const completedObjectives = []
    const incompleteObjectives = []

    objectives.forEach((obj) => {
      if (obj.progression[date] !== undefined) {
        const isCompleted =
          obj.typeDeTracking === "binaire"
            ? obj.progression[date] === true
            : typeof obj.progression[date] === "number" && obj.progression[date] > 0

        if (isCompleted) {
          completedObjectives.push(obj)
        } else {
          incompleteObjectives.push(obj)
        }
      }
    })

    return {
      completedObjectives,
      incompleteObjectives,
      totalTracked: completedObjectives.length + incompleteObjectives.length,
    }
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ]

  if (loading) {
    return (
      <div className="content-card">
        <div className="content-card-header">
          <h3 className="content-card-title">Historique de progression</h3>
        </div>
        <div className="content-card-body">
          <div className="statistics-loading">
            <div className="spinner"></div>
            <p>Chargement du calendrier...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="content-card">
        <div className="content-card-header">
          <h3 className="content-card-title">Historique de progression</h3>
        </div>
        <div className="content-card-body">
          <div className="statistics-error">
            <p>{error}</p>
            <button className="bouton-primaire" onClick={() => window.location.reload()}>
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-card">
      <div className="content-card-header">
        <div className="calendar-header-container">
          <h3 className="content-card-title">Historique de progression</h3>
          <div className="calendar-navigation">
            <button onClick={previousMonth} className="calendar-nav-button" aria-label="Mois précédent">
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span className="calendar-current-month">
              {monthNames[month]} {year}
            </span>
            <button onClick={nextMonth} className="calendar-nav-button" aria-label="Mois suivant">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
        <div className="content-card-description">Visualisez votre progression quotidienne</div>
      </div>
      <div className="content-card-body">
        <div className="calendar-grid">
          {dayNames.map((day) => (
            <div key={day} className="calendar-header">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="calendar-day empty"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const dateStr = formatDate(year, month, day)
            const completionRate = getCompletionRate(dateStr)
            const colorClass = getCompletionColor(completionRate)
            const isSelected = selectedDate === dateStr
            const isToday = dateStr === new Date().toISOString().split("T")[0]
            const details = getDayDetails(dateStr)

            return (
              <div
                key={`day-${day}`}
                className={`calendar-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              >
                <div
                  className="calendar-day-background"
                  style={{
                    backgroundColor: details.totalTracked > 0 ? colorClass.replace("bg-", "") : "transparent",
                    opacity: details.totalTracked > 0 ? 0.7 : 0,
                  }}
                ></div>
                <div className="calendar-day-content">{day}</div>
                {details.totalTracked > 0 && (
                  <div className="calendar-day-indicator">
                    {details.completedObjectives.length}/{details.totalTracked}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {selectedDate && (
          <div className="calendar-details">
            <h3 className="calendar-details-title">
              Détails du{" "}
              {new Date(selectedDate).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h3>
            <div className="calendar-details-content">
              <div className="calendar-details-section">
                <h4 className="calendar-details-section-title" style={{ color: "#4caf50" }}>
                  Objectifs complétés
                </h4>
                {getDayDetails(selectedDate).completedObjectives.length > 0 ? (
                  <ul className="calendar-details-list">
                    {getDayDetails(selectedDate).completedObjectives.map((obj) => (
                      <li key={obj.id} className="calendar-details-item">
                        <span>{obj.nom}</span>
                        <span className="badge badge-green">
                          {obj.typeDeTracking === "binaire"
                            ? "Complété"
                            : `${obj.progression[selectedDate]} ${obj.cible ? `/ ${obj.cible}` : ""}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">Aucun objectif complété ce jour</p>
                )}
              </div>
              <div className="calendar-details-section">
                <h4 className="calendar-details-section-title" style={{ color: "#f44336" }}>
                  Objectifs non complétés
                </h4>
                {getDayDetails(selectedDate).incompleteObjectives.length > 0 ? (
                  <ul className="calendar-details-list">
                    {getDayDetails(selectedDate).incompleteObjectives.map((obj) => (
                      <li key={obj.id} className="calendar-details-item">
                        <span>{obj.nom}</span>
                        <span className="badge" style={{ backgroundColor: "#ffebee", color: "#d32f2f" }}>
                          {obj.typeDeTracking === "binaire"
                            ? "Non complété"
                            : `${obj.progression[selectedDate]} ${obj.cible ? `/ ${obj.cible}` : ""}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">Aucun objectif non complété ce jour</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
