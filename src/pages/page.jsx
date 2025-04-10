"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import "../components/statistics/statistics.css"
import "./pages.css"
import {GlobalStats}  from "../components/statistics/global-stats"
// import { GlobalStats } from "../components/statistics/global-stats"
import { HistoryCalendar } from "../components/statistics/history-calendar"
import { authService } from "../services/api.service"

const StatisticsPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    // Vérifier l'authentification
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          setIsAuthenticated(true)
        } else {
          navigate("/login")
        }
      } catch (error) {
        console.error("Erreur d'authentification:", error)
        navigate("/login")
      } finally {
        setLoading(false)
      }
    }

    // Vérifier le thème
    const hour = new Date().getHours()
    if (hour >= 18 || hour < 6) {
      setTheme("light")
      document.body.classList.add("light")
    } else {
      setTheme("light")
      document.body.classList.remove("dark")
    }

    checkAuth()
  }, [navigate])

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Chargement des statistiques...</p>
      </div>
    )
  }

  return (
    <div className={`statistics-page ${theme}`}>
      <div className="statistics-header">
        <button className="bouton-retour" onClick={() => navigate("/dashboard")}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour au tableau de bord
        </button>
        <h1 className="statistics-title">Statistiques détaillées</h1>
        <p className="statistics-subtitle">Analysez en profondeur vos performances et votre progression</p>
      </div>

      <GlobalStats />
      <HistoryCalendar />
    </div>
  )
}

export default StatisticsPage
