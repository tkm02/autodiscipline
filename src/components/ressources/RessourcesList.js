"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faLink,
  faVideo,
  faImage,
  faFile,
  faMusic,
  faPlus,
  faEdit,
  faTrash,
  faTimes,
} from "@fortawesome/free-solid-svg-icons"
import { ressourceService } from "../../services/api.service"

const RessourcesList = ({ objectifId }) => {
  const [ressources, setRessources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState("add") // 'add' ou 'edit'
  const [currentRessource, setCurrentRessource] = useState(null)
  const [formData, setFormData] = useState({
    titre: "",
    type: "lien",
    url: "",
    description: "",
  })

  useEffect(() => {
    loadRessources()
  }, [objectifId])

  const loadRessources = async () => {
    try {
      setLoading(true)
      const response = await ressourceService.getRessources(objectifId)
      setRessources(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement des ressources:", error)
      setLoading(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (formMode === "add") {
        await ressourceService.createRessource(objectifId, formData)
      } else {
        await ressourceService.updateRessource(currentRessource.id, formData)
      }

      // Recharger les ressources
      loadRessources()

      // Réinitialiser le formulaire
      setShowForm(false)
      setFormData({
        titre: "",
        type: "lien",
        url: "",
        description: "",
      })
      setCurrentRessource(null)
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error)
    }
  }

  const handleEdit = (ressource) => {
    setCurrentRessource(ressource)
    setFormData({
      titre: ressource.titre,
      type: ressource.type,
      url: ressource.url,
      description: ressource.description || "",
    })
    setFormMode("edit")
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) {
      try {
        await ressourceService.deleteRessource(id)
        loadRessources()
      } catch (error) {
        console.error("Erreur lors de la suppression de la ressource:", error)
      }
    }
  }

  const getIconForType = (type) => {
    switch (type) {
      case "lien":
        return <FontAwesomeIcon icon={faLink} />
      case "video":
        return <FontAwesomeIcon icon={faVideo} />
      case "image":
        return <FontAwesomeIcon icon={faImage} />
      case "document":
        return <FontAwesomeIcon icon={faFile} />
      case "audio":
        return <FontAwesomeIcon icon={faMusic} />
      default:
        return <FontAwesomeIcon icon={faLink} />
    }
  }

  const renderRessourceContent = (ressource) => {
    switch (ressource.type) {
      case "lien":
        return (
          <a href={ressource.url} target="_blank" rel="noopener noreferrer" className="ressource-link">
            {ressource.titre}
          </a>
        )
      case "video":
        return (
          <div className="ressource-video">
            <h4>{ressource.titre}</h4>
            <div className="video-container">
              <iframe
                src={ressource.url}
                title={ressource.titre}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )
      case "image":
        return (
          <div className="ressource-image">
            <h4>{ressource.titre}</h4>
            <img src={ressource.url || "/placeholder.svg"} alt={ressource.titre} />
          </div>
        )
      case "document":
        return (
          <div className="ressource-document">
            <a href={ressource.url} target="_blank" rel="noopener noreferrer" className="document-link">
              <FontAwesomeIcon icon={faFile} className="mr-2" />
              {ressource.titre}
            </a>
          </div>
        )
      case "audio":
        return (
          <div className="ressource-audio">
            <h4>{ressource.titre}</h4>
            <audio controls>
              <source src={ressource.url} />
              Votre navigateur ne supporte pas l'élément audio.
            </audio>
          </div>
        )
      default:
        return (
          <a href={ressource.url} target="_blank" rel="noopener noreferrer" className="ressource-link">
            {ressource.titre}
          </a>
        )
    }
  }

  if (loading) {
    return (
      <div className="ressources-loading">
        <div className="spinner"></div>
        <p>Chargement des ressources...</p>
      </div>
    )
  }

  return (
    <div className="ressources-container">
      <div className="ressources-header">
        <h3 className="ressources-title">Ressources</h3>
        <button
          className="bouton-ajouter-ressource"
          onClick={() => {
            setFormMode("add")
            setShowForm(true)
          }}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Ajouter une ressource
        </button>
      </div>

      {showForm && (
        <div className="ressource-form-container">
          <h4 className="ressource-form-title">
            {formMode === "add" ? "Ajouter une nouvelle ressource" : "Modifier la ressource"}
          </h4>
          <form onSubmit={handleSubmit} className="ressource-form">
            <div className="form-group">
              <label className="form-label">Titre</label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleFormChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select name="type" value={formData.type} onChange={handleFormChange} className="form-input" required>
                <option value="lien">Lien</option>
                <option value="video">Vidéo</option>
                <option value="image">Image</option>
                <option value="document">Document</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">URL</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleFormChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description (optionnelle)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="form-input"
                rows="3"
              ></textarea>
            </div>
            <div className="form-buttons">
              <button
                type="button"
                className="bouton-annuler"
                onClick={() => {
                  setShowForm(false)
                  setCurrentRessource(null)
                  setFormData({
                    titre: "",
                    type: "lien",
                    url: "",
                    description: "",
                  })
                }}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Annuler
              </button>
              <button type="submit" className="bouton-ajouter">
                {formMode === "add" ? "Ajouter" : "Mettre à jour"}
              </button>
            </div>
          </form>
        </div>
      )}

      {ressources.length === 0 ? (
        <div className="aucune-ressource">
          <p>Aucune ressource disponible pour cet objectif.</p>
          <p>Ajoutez des liens, vidéos, images ou documents pour vous aider à atteindre votre objectif.</p>
        </div>
      ) : (
        <div className="ressources-list">
          {ressources.map((ressource) => (
            <div key={ressource.id} className={`ressource-item ressource-${ressource.type}`}>
              <div className="ressource-icon">{getIconForType(ressource.type)}</div>
              <div className="ressource-content">
                {renderRessourceContent(ressource)}
                {ressource.description && <p className="ressource-description">{ressource.description}</p>}
              </div>
              <div className="ressource-actions">
                <button className="bouton-action" onClick={() => handleEdit(ressource)} title="Modifier">
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button className="bouton-action" onClick={() => handleDelete(ressource.id)} title="Supprimer">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RessourcesList

