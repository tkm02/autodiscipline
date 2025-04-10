"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faSave, faTimes } from "@fortawesome/free-solid-svg-icons"
import { authService, objectifService } from "../services/api.service"
import "../pages/Dashboard.css"

const AddObjective = () => {
  const navigate = useNavigate()
  const today = new Date().toISOString().split("T")[0]

  const [nouvelObjectif, setNouvelObjectif] = useState({
    nom: "",
    categorie: "personnel",
    typeDeTracking: "binaire",
    frequence: "quotidien",
    cible: "",
    description: "",
    statut: "en_attente",
    duree: 90,
    dateDebut: today,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setNouvelObjectif({
      ...nouvelObjectif,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nouvelObjectif.nom) {
      setError("Le nom de l'objectif est requis")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const objectifAjoute = {
        ...nouvelObjectif,
        progression: {},
        commentaires: {},
      }

      // Convertir la cible en nombre si nécessaire
      if (nouvelObjectif.cible) {
        objectifAjoute.cible =
          nouvelObjectif.typeDeTracking === "compteur"
            ? Number.parseInt(nouvelObjectif.cible)
            : Number.parseFloat(nouvelObjectif.cible)
      }

      // Convertir la durée en nombre
      objectifAjoute.duree = Number.parseInt(nouvelObjectif.duree) || 90

      if (authService.isAuthenticated()) {
        await objectifService.createObjectif(objectifAjoute)
      } else {
        // En mode démo, ajouter au localStorage
        const storedObjectifs = JSON.parse(localStorage.getItem("objectifs") || "[]")
        objectifAjoute.id = Date.now().toString(36) + Math.random().toString(36).substring(2)
        storedObjectifs.push(objectifAjoute)
        localStorage.setItem("objectifs", JSON.stringify(storedObjectifs))
      }

      navigate("/dashboard")
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'objectif:", error)
      setError("Erreur lors de l'ajout de l'objectif")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="bouton-retour" onClick={() => navigate("/dashboard")}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour au tableau de bord
        </button>
        <h1>Ajouter un nouvel objectif</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="objectif-form">
        <div className="form-group">
          <label htmlFor="nom">Nom de l'objectif *</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={nouvelObjectif.nom}
            onChange={handleChange}
            placeholder="Ex: Faire du sport"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="categorie">Catégorie</label>
            <select id="categorie" name="categorie" value={nouvelObjectif.categorie} onChange={handleChange}>
              <option value="spirituel">Spirituel</option>
              <option value="professionnel">Professionnel</option>
              <option value="personnel">Personnel</option>
              <option value="finance">Finance</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="statut">Statut</label>
            <select id="statut" name="statut" value={nouvelObjectif.statut} onChange={handleChange}>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="typeDeTracking">Type de suivi</label>
            <select
              id="typeDeTracking"
              name="typeDeTracking"
              value={nouvelObjectif.typeDeTracking}
              onChange={handleChange}
            >
              <option value="binaire">Binaire (✅/❌)</option>
              <option value="compteur">Compteur</option>
              <option value="numerique">Valeur numérique</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="frequence">Fréquence</label>
            <select id="frequence" name="frequence" value={nouvelObjectif.frequence} onChange={handleChange}>
              <option value="quotidien">Quotidienne</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="mensuel">Mensuelle</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateDebut">Date de début</label>
            <input
              type="date"
              id="dateDebut"
              name="dateDebut"
              value={nouvelObjectif.dateDebut}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="duree">Durée (jours)</label>
            <input
              type="number"
              id="duree"
              name="duree"
              value={nouvelObjectif.duree}
              onChange={handleChange}
              min="1"
              max="365"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="cible">Objectif cible (optionnel)</label>
          <input
            type="text"
            id="cible"
            name="cible"
            value={nouvelObjectif.cible}
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
            value={nouvelObjectif.description}
            onChange={handleChange}
            placeholder="Décrivez votre objectif plus en détail..."
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="bouton-annuler" onClick={() => navigate("/dashboard")}>
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Annuler
          </button>
          <button type="submit" className="bouton-ajouter" disabled={loading}>
            {loading ? (
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

export default AddObjective
