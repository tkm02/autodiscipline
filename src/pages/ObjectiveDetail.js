"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowLeft,
  faEdit,
  faTrash,
  faCheckCircle,
  faTimesCircle,
  faChurch,
  faBriefcase,
  faDumbbell,
  faClock,
  faSpinner,
  faCheckDouble,
  faHistory,
  faCalendarAlt,
  faMoneyBillWave,
  faLink,
  faQuran,
  faRobot,
} from "@fortawesome/free-solid-svg-icons"
import { objectifService } from "../services/api.service"
import CommentaireObjectif from "../components/CommentaireObjectif"
import HistoriqueCommentaires from "../components/HistoriqueCommentaires"
import StatutObjectif from "../components/StatutObjectif"
import RessourcesList from "../components/ressources/RessourcesList"
import CoranReader from "../components/coran/CoranReader"
import CultureIslamique from "../components/culture/CultureIslamique"
import IAAssistant from "../components/ia/IAAssistant"
import "../pages/Dashboard.css"

const ObjectiveDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [objectif, setObjectif] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progressionEdition, setProgressionEdition] = useState("")
  const [objectifHistorique, setObjectifHistorique] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("details") // 'details', 'ressources', 'coran', 'culture', 'ia'

  useEffect(() => {
    const fetchObjectif = async () => {
      try {
        setLoading(true)
        // Si nous sommes en mode démo, récupérer depuis le localStorage
        if (!objectifService.isAuthenticated()) {
          const storedObjectifs = JSON.parse(localStorage.getItem("objectifs") || "[]")
          const foundObjectif = storedObjectifs.find((obj) => obj.id === id)
          if (foundObjectif) {
            setObjectif(foundObjectif)
          } else {
            setError("Objectif non trouvé")
          }
        } else {
          // Sinon, récupérer depuis l'API
          const response = await objectifService.getObjectif(id)
          console.log("Objectif récupéré:", response.data);
          
          setObjectif(response.data)
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'objectif:", error)
        setError("Erreur lors du chargement de l'objectif")
      } finally {
        setLoading(false)
      }
    }

    fetchObjectif()
  }, [id])

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet objectif ?")) {
      try {
        if (objectifService.isAuthenticated()) {
          await objectifService.deleteObjectif(id)
        } else {
          // En mode démo, supprimer du localStorage
          const storedObjectifs = JSON.parse(localStorage.getItem("objectifs") || "[]")
          const updatedObjectifs = storedObjectifs.filter((obj) => obj.id !== id)
          localStorage.setItem("objectifs", JSON.stringify(updatedObjectifs))
        }
        navigate("/dashboard")
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
        alert("Erreur lors de la suppression de l'objectif")
      }
    }
  }

  const handleStatusChange = async (statut) => {
    try {
      if (objectifService.isAuthenticated()) {
        await objectifService.updateStatut(id, statut)
      } else {
        // En mode démo, mettre à jour dans le localStorage
        const storedObjectifs = JSON.parse(localStorage.getItem("objectifs") || "[]")
        const updatedObjectifs = storedObjectifs.map((obj) => (obj.id === id ? { ...obj, statut } : obj))
        localStorage.setItem("objectifs", JSON.stringify(updatedObjectifs))
      }
      setObjectif({ ...objectif, statut })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
      alert("Erreur lors de la mise à jour du statut")
    }
  }

  const handleProgressUpdate = async () => {
    if (!progressionEdition) return

    const aujourdhui = new Date().toISOString().split("T")[0]
    const valeur =
      objectif.typeDeTracking === "compteur"
        ? Number.parseInt(progressionEdition)
        : Number.parseFloat(progressionEdition)

    try {
      if (objectifService.isAuthenticated()) {
        await objectifService.updateProgression(id, aujourdhui, valeur)
      } else {
        // En mode démo, mettre à jour dans le localStorage
        const storedObjectifs = JSON.parse(localStorage.getItem("objectifs") || "[]")
        const updatedObjectifs = storedObjectifs.map((obj) => {
          if (obj.id === id) {
            return {
              ...obj,
              progression: {
                ...obj.progression,
                [aujourdhui]: valeur,
              },
            }
          }
          return obj
        })
        localStorage.setItem("objectifs", JSON.stringify(updatedObjectifs))
      }

      setObjectif({
        ...objectif,
        progression: {
          ...objectif.progression,
          [aujourdhui]: valeur,
        },
      })
      setProgressionEdition("")
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la progression:", error)
      alert("Erreur lors de la mise à jour de la progression")
    }
  }

  const handleBinaryToggle = async () => {
    const aujourdhui = new Date().toISOString().split("T")[0]
    const currentValue = objectif.progression[aujourdhui] === true
    const newValue = !currentValue

    try {
      if (objectifService.isAuthenticated()) {
        await objectifService.updateProgression(id, aujourdhui, newValue)
      } else {
        // En mode démo, mettre à jour dans le localStorage
        const storedObjectifs = JSON.parse(localStorage.getItem("objectifs") || "[]")
        const updatedObjectifs = storedObjectifs.map((obj) => {
          if (obj.id === id) {
            return {
              ...obj,
              progression: {
                ...obj.progression,
                [aujourdhui]: newValue,
              },
            }
          }
          return obj
        })
        localStorage.setItem("objectifs", JSON.stringify(updatedObjectifs))
      }

      setObjectif({
        ...objectif,
        progression: {
          ...objectif.progression,
          [aujourdhui]: newValue,
        },
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la progression:", error)
      alert("Erreur lors de la mise à jour de la progression")
    }
  }

  const handleCommentSave = async (id, date, commentaire) => {
    try {
      if (objectifService.isAuthenticated()) {
        await objectifService.updateCommentaire(id, date, commentaire)
      } else {
        // En mode démo, mettre à jour dans le localStorage
        const storedObjectifs = JSON.parse(localStorage.getItem("objectifs") || "[]")
        const updatedObjectifs = storedObjectifs.map((obj) => {
          if (obj.id === id) {
            return {
              ...obj,
              commentaires: {
                ...obj.commentaires,
                [date]: commentaire,
              },
            }
          }
          return obj
        })
        localStorage.setItem("objectifs", JSON.stringify(updatedObjectifs))
      }

      setObjectif({
        ...objectif,
        commentaires: {
          ...objectif.commentaires,
          [date]: commentaire,
        },
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du commentaire:", error)
      alert("Erreur lors de la mise à jour du commentaire")
    }
  }

  const getCategoryIcon = (categorie) => {
    switch (categorie) {
      case "spirituel":
        return <FontAwesomeIcon icon={faChurch} className="icone-categorie spirituel" />
      case "professionnel":
        return <FontAwesomeIcon icon={faBriefcase} className="icone-categorie professionnel" />
      case "personnel":
        return <FontAwesomeIcon icon={faDumbbell} className="icone-categorie personnel" />
      case "finance":
        return <FontAwesomeIcon icon={faMoneyBillWave} className="icone-categorie finance" />
      default:
        return null
    }
  }

  const getStatusIcon = (statut) => {
    switch (statut) {
      case "en_attente":
        return <FontAwesomeIcon icon={faClock} className="icone-statut en-attente" />
      case "en_cours":
        return <FontAwesomeIcon icon={faSpinner} className="icone-statut en-cours" />
      case "termine":
        return <FontAwesomeIcon icon={faCheckDouble} className="icone-statut termine" />
      default:
        return <FontAwesomeIcon icon={faClock} className="icone-statut en-attente" />
    }
  }

  const getFrequencyLabel = (frequence) => {
    switch (frequence) {
      case "quotidien":
        return "Quotidien"
      case "hebdomadaire":
        return "Hebdomadaire"
      case "mensuel":
        return "Mensuel"
      default:
        return frequence
    }
  }

  const getTrackingTypeLabel = (type) => {
    switch (type) {
      case "binaire":
        return "Binaire (✅/❌)"
      case "compteur":
        return "Compteur"
      case "numerique":
        return "Valeur numérique"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="spinner"></div>
        <p>Chargement de l'objectif...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
        <button className="bouton-retour" onClick={() => navigate("/dashboard")}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour au tableau de bord
        </button>
      </div>
    )
  }

  if (!objectif) {
    return (
      <div className="page-container">
        <div className="error-message">Objectif non trouvé</div>
        <button className="bouton-retour" onClick={() => navigate("/dashboard")}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour au tableau de bord
        </button>
      </div>
    )
  }

  const aujourdhui = new Date().toISOString().split("T")[0]
  const progressionAujourdhui = objectif.progression[aujourdhui]

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="bouton-retour" onClick={() => navigate("/dashboard")}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour au tableau de bord
        </button>
        <div className="actions-header">
          <button className="bouton-action-header" onClick={() => navigate(`/objectif/${id}/modifier`)}>
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Modifier
          </button>
          <button className="bouton-action-header bouton-supprimer" onClick={handleDelete}>
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="objectif-detail-card">
        <div className="objectif-header">
          <div className="objectif-title-container">
            <h1 className="objectif-title">{objectif.nom}</h1>
            <div className="objectif-badges">
              <div className="badge-categorie">
                {getCategoryIcon(objectif.categorie)}
                <span>
                  {objectif.categorie === "spirituel" && "Spirituel"}
                  {objectif.categorie === "professionnel" && "Professionnel"}
                  {objectif.categorie === "personnel" && "Personnel"}
                  {objectif.categorie === "finance" && "Finance"}
                </span>
              </div>
            </div>
          </div>
          <div className="objectif-statut-container">
            <StatutObjectif statut={objectif.statut || "en_attente"} onChange={handleStatusChange} />
          </div>
        </div>

        {objectif.description && <div className="objectif-description">{objectif.description}</div>}

        <div className="objectif-tabs">
          <button
            className={`objectif-tab ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
            Détails
          </button>
          <button
            className={`objectif-tab ${activeTab === "ressources" ? "active" : ""}`}
            onClick={() => setActiveTab("ressources")}
          >
            <FontAwesomeIcon icon={faLink} className="mr-2" />
            Ressources
          </button>
          {objectif.categorie === "spirituel" && (
            <>
              <button
                className={`objectif-tab ${activeTab === "coran" ? "active" : ""}`}
                onClick={() => setActiveTab("coran")}
              >
                <FontAwesomeIcon icon={faQuran} className="mr-2" />
                Coran
              </button>
              <button
                className={`objectif-tab ${activeTab === "culture" ? "active" : ""}`}
                onClick={() => setActiveTab("culture")}
              >
                <FontAwesomeIcon icon={faChurch} className="mr-2" />
                Culture Islamique
              </button>
            </>
          )}
          <button className={`objectif-tab ${activeTab === "ia" ? "active" : ""}`} onClick={() => setActiveTab("ia")}>
            <FontAwesomeIcon icon={faRobot} className="mr-2" />
            Assistant IA
          </button>
        </div>

        <div className="objectif-tab-content">
          {activeTab === "details" && (
            <div className="tab-details">
              <div className="objectif-details">
                <div className="detail-item">
                  <div className="detail-label">Fréquence</div>
                  <div className="detail-value">{getFrequencyLabel(objectif.frequence)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Type de suivi</div>
                  <div className="detail-value">{getTrackingTypeLabel(objectif.typeDeTracking)}</div>
                </div>
                {objectif.cible && (
                  <div className="detail-item">
                    <div className="detail-label">Objectif cible</div>
                    <div className="detail-value">{objectif.cible}</div>
                  </div>
                )}
              </div>

              <div className="objectif-progression-section">
                <h2 className="section-title">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  Progression du jour
                </h2>
                <div className="progression-container">
                  {objectif.typeDeTracking === "binaire" ? (
                    <button
                      className={`bouton-statut ${progressionAujourdhui ? "complete" : "non-complete"}`}
                      onClick={handleBinaryToggle}
                    >
                      <FontAwesomeIcon
                        icon={progressionAujourdhui ? faCheckCircle : faTimesCircle}
                        className={progressionAujourdhui ? "icone-check" : "icone-times"}
                      />
                      {progressionAujourdhui ? "Complété" : "Non complété"}
                    </button>
                  ) : (
                    <div className="progression-numerique">
                      <input
                        type="number"
                        value={progressionEdition}
                        onChange={(e) => setProgressionEdition(e.target.value)}
                        placeholder={progressionAujourdhui ? progressionAujourdhui.toString() : "0"}
                        className="input-progression"
                      />
                      <button className="bouton-enregistrer" onClick={handleProgressUpdate}>
                        Enregistrer
                      </button>
                      <span className="valeur-actuelle">
                        {progressionAujourdhui ? `Actuel: ${progressionAujourdhui}` : "Non suivi"}
                        {objectif.cible ? ` / Cible: ${objectif.cible}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="objectif-commentaire-section">
                <h2 className="section-title">Commentaires</h2>
                <CommentaireObjectif
                  objectif={objectif}
                  date={aujourdhui}
                  onSaveCommentaire={handleCommentSave}
                  isAuthenticated={objectifService.isAuthenticated()}
                />

                {objectif.commentaires && Object.keys(objectif.commentaires).length > 0 && (
                  <button className="bouton-historique" onClick={() => setObjectifHistorique(objectif)}>
                    <FontAwesomeIcon icon={faHistory} className="mr-2" />
                    Voir l'historique des commentaires
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "ressources" && (
            <div className="tab-ressources">
              <RessourcesList objectifId={id} />
            </div>
          )}

          {activeTab === "coran" && objectif.categorie === "spirituel" && (
            <div className="tab-coran">
              <CoranReader />
            </div>
          )}

          {activeTab === "culture" && objectif.categorie === "spirituel" && (
            <div className="tab-culture">
              <CultureIslamique />
            </div>
          )}

          {activeTab === "ia" && (
            <div className="tab-ia">
              <IAAssistant objectifId={id} />
            </div>
          )}
        </div>
      </div>

      {objectifHistorique && (
        <HistoriqueCommentaires objectif={objectifHistorique} onClose={() => setObjectifHistorique(null)} />
      )}
    </div>
  )
}

export default ObjectiveDetail

