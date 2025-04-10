"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle, faTimesCircle, faSave, faSpinner } from "@fortawesome/free-solid-svg-icons"
import { objectifService } from "../services/api.service"
import "./HistoriqueProgressions.css"

const HistoriqueProgressions = ({ objectifId }) => {
  const [objectif, setObjectif] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [progressions, setProgressions] = useState({})

  useEffect(() => {
    const fetchObjectif = async () => {
      try {
        setLoading(true)
        const response = await objectifService.getObjectifs(objectifId)
        setObjectif(response.data)

        // Avec Prisma, progression est déjà un objet JSON
        setProgressions(response.data.progression || {})

        setLoading(false)
      } catch (error) {
        setError("Erreur lors du chargement de l'objectif")
        setLoading(false)
      }
    }

    fetchObjectif()
  }, [objectifId])

  const handleProgressionChange = (date, value) => {
    setProgressions({
      ...progressions,
      [date]: value,
    })
  }

  const saveProgression = async (date) => {
    try {
      setSaving(true)
      await objectifService.updateProgression(objectifId, date, progressions[date])
      setSaving(false)
    } catch (error) {
      setError("Erreur lors de la sauvegarde de la progression")
      setSaving(false)
    }
  }

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const renderCalendar = () => {
    if (!objectif) return null

    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay()
    const days = []

    // Ajouter les jours vides pour aligner le calendrier
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Ajouter les jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(selectedYear, selectedMonth, i)
      const dateStr = date.toISOString().split("T")[0]
      const today = new Date().toISOString().split("T")[0]
      const isPast = dateStr < today
      const isFuture = dateStr > today

      // Vérifier si la date est dans la plage de l'objectif
      const dateDebut = new Date(objectif.dateDebut || objectif.createdAt)
      const dateFin = new Date(dateDebut)
      dateFin.setDate(dateFin.getDate() + (objectif.duree || 90))

      const isInRange = date >= dateDebut && date <= dateFin

      days.push(
        <div
          key={dateStr}
          className={`calendar-day ${dateStr === today ? "today" : ""} ${!isInRange ? "out-of-range" : ""}`}
        >
          <div className="day-number">{i}</div>
          {isInRange && (
            <div className="day-content">
              {objectif.typeDeTracking === "binaire" ? (
                <div className="binary-progress">
                  <button
                    className={`progress-btn ${progressions[dateStr] === true ? "completed" : ""}`}
                    onClick={() => handleProgressionChange(dateStr, true)}
                    disabled={isFuture}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </button>
                  <button
                    className={`progress-btn ${progressions[dateStr] === false ? "not-completed" : ""}`}
                    onClick={() => handleProgressionChange(dateStr, false)}
                    disabled={isFuture}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </button>
                  {(progressions[dateStr] === true || progressions[dateStr] === false) && (
                    <button className="save-btn" onClick={() => saveProgression(dateStr)} disabled={saving || isFuture}>
                      {saving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                    </button>
                  )}
                </div>
              ) : (
                <div className="numeric-progress">
                  <input
                    type="number"
                    value={progressions[dateStr] || ""}
                    onChange={(e) => handleProgressionChange(dateStr, Number.parseFloat(e.target.value))}
                    disabled={isFuture}
                    className="progress-input"
                  />
                  <button
                    className="save-btn"
                    onClick={() => saveProgression(dateStr)}
                    disabled={saving || isFuture || progressions[dateStr] === undefined}
                  >
                    {saving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  if (loading) {
    return <div className="loading">Chargement de l'historique...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!objectif) {
    return <div className="error">Objectif non trouvé</div>
  }

  const months = [
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

  const years = []
  const currentYear = new Date().getFullYear()
  for (let i = currentYear - 2; i <= currentYear + 1; i++) {
    years.push(i)
  }

  return (
    <div className="historique-progressions">
      <h3>Historique des progressions</h3>

      <div className="calendar-controls">
        <div className="month-selector">
          <label>Mois:</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number.parseInt(e.target.value))}>
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className="year-selector">
          <label>Année:</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="calendar-header">
        <div>Dim</div>
        <div>Lun</div>
        <div>Mar</div>
        <div>Mer</div>
        <div>Jeu</div>
        <div>Ven</div>
        <div>Sam</div>
      </div>

      <div className="calendar-grid">{renderCalendar()}</div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Aujourd'hui</span>
        </div>
        <div className="legend-item">
          <div className="legend-color completed"></div>
          <span>Complété</span>
        </div>
        <div className="legend-item">
          <div className="legend-color not-completed"></div>
          <span>Non complété</span>
        </div>
        <div className="legend-item">
          <div className="legend-color out-of-range"></div>
          <span>Hors période</span>
        </div>
      </div>

      <div className="objectif-info">
        <p>
          <strong>Durée:</strong> {objectif.duree || 90} jours
        </p>
        <p>
          <strong>Date de début:</strong> {new Date(objectif.dateDebut || objectif.createdAt).toLocaleDateString()}
        </p>
        <p>
          <strong>Date de fin prévue:</strong> {(() => {
            const dateFin = new Date(objectif.dateDebut || objectif.createdAt)
            dateFin.setDate(dateFin.getDate() + (objectif.duree || 90))
            return dateFin.toLocaleDateString()
          })()}
        </p>
      </div>

      <button
        className="btn btn-primary mt-4"
        onClick={async () => {
          try {
            setLoading(true)
            await objectifService.updateMissingProgressions()
            // Recharger l'objectif pour obtenir les progressions mises à jour
            const response = await objectifService.getObjectif(objectifId)
            setObjectif(response.data)
            setProgressions(response.data.progression || {})
            setLoading(false)
          } catch (error) {
            setError("Erreur lors de la mise à jour des progressions manquantes")
            setLoading(false)
          }
        }}
      >
        Initialiser les jours manquants
      </button>
    </div>
  )
}

export default HistoriqueProgressions
