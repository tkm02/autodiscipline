"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faSave, faTimes } from "@fortawesome/free-solid-svg-icons"
import { authService, objectifService } from "../services/api.service"
import "../pages/Dashboard.css"

const EditObjective = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [objectif, setObjectif] = useState({
    nom: "",
    categorie: "personnel",
    typeDeTracking: "binaire",
    frequence: "quotidien",
    cible: "",
    description: "",
    statut: "en_attente",
    progression: {},
    commentaires: {},
    duree: 90, // Durée par défaut de 90 jours (3 mois)
    dateDebut: new Date().toISOString().split("T")[0], // Date de début par défaut = aujourd'hui
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchObjectif = async () => {
      try {
        setLoading(true)
        // Si nous sommes en mode démo, récupérer depuis le localStorage
        if (!authService.isAuthenticated()) {
          const storedObjectifs = JSON.parse(localStorage.getItem("objectifs") || "[]")
          const foundObjectif = storedObjectifs.find((obj) => obj.id === id)
          if (foundObjectif) {
            setObjectif({
              ...foundObjectif,
              cible: foundObjectif.cible || "",
              description: foundObjectif.description || "",
            })
          } else {
            setError("Objectif non trouvé")
          }
        } else {
          // Sinon, récupérer depuis l'API
          const response = await objectifService.getObjectif(id)
          setObjectif({
            ...response.data,
            cible: response.data.cible || "",
            description: response.data.description || "",
          })
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setObjectif({
      ...objectif,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!objectif.nom) {
      setError("Le nom de l'objectif est requis")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const objectifMisAJour = {
        ...objectif,
      }

      // Convertir la cible en nombre si nécessaire
      if (objectif.cible) {
        objectifMisAJour.cible =
          objectif.typeDeTracking === "compteur" ? Number.parseInt(objectif.cible) : Number.parseFloat(objectif.cible)
      }

      if (authService.isAuthenticated()) {
        await objectifService.updateObjectif(id, objectifMisAJour)
      } else {
        // En mode démo, mettre à jour dans le localStorage
        const storedObjectifs = JSON.parse(localStorage.getItem("objectifs") || "[]")
        const updatedObjectifs = storedObjectifs.map((obj) => (obj.id === id ? { ...obj, ...objectifMisAJour } : obj))
        localStorage.setItem("objectifs", JSON.stringify(updatedObjectifs))
      }

      navigate("/dashboard")
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'objectif:", error)
      setError("Erreur lors de la mise à jour de l'objectif")
    } finally {
      setSaving(false)
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

  if (error && !objectif.nom) {
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

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="bouton-retour" onClick={() => navigate("/dashboard")}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour au tableau de bord
        </button>
        <h1>Modifier l'objectif</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="objectif-form">
        <div className="form-group">
          <label htmlFor="nom">Nom de l'objectif *</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={objectif.nom}
            onChange={handleChange}
            placeholder="Ex: Faire du sport"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="categorie">Catégorie</label>
            <select id="categorie" name="categorie" value={objectif.categorie} onChange={handleChange}>
              <option value="spirituel">Spirituel</option>
              <option value="professionnel">Professionnel</option>
              <option value="personnel">Personnel</option>
              <option value="finance">Finance</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="statut">Statut</label>
            <select id="statut" name="statut" value={objectif.statut} onChange={handleChange}>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="typeDeTracking">Type de suivi</label>
            <select id="typeDeTracking" name="typeDeTracking" value={objectif.typeDeTracking} onChange={handleChange}>
              <option value="binaire">Binaire (✅/❌)</option>
              <option value="compteur">Compteur</option>
              <option value="numerique">Valeur numérique</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="frequence">Fréquence</label>
            <select id="frequence" name="frequence" value={objectif.frequence} onChange={handleChange}>
              <option value="quotidien">Quotidienne</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="mensuel">Mensuelle</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cible">Objectif cible (optionnel)</label>
          <input
            type="text"
            id="cible"
            name="cible"
            value={objectif.cible}
            onChange={handleChange}
            placeholder="Ex: 30"
          />
          <small>Laissez vide si non applicable</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (optionnelle)</label>
          <textarea
            id="description"
            name="description"
            value={objectif.description}
            onChange={handleChange}
            placeholder="Décrivez votre objectif plus en détail..."
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateDebut">Date de début</label>
          <input type="date" id="dateDebut" name="dateDebut" value={objectif.dateDebut} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="duree">Durée (en jours)</label>
          <input
            type="number"
            id="duree"
            name="duree"
            value={objectif.duree}
            onChange={handleChange}
            min="1"
            placeholder="Ex: 90"
          />
          <small>Durée de l'objectif en jours (90 jours = 3 mois)</small>
        </div>

        <div className="form-actions">
          <button type="button" className="bouton-annuler" onClick={() => navigate("/dashboard")}>
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Annuler
          </button>
          <button type="submit" className="bouton-ajouter" disabled={saving}>
            {saving ? (
              <>
                <div className="spinner-small mr-2"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditObjective
