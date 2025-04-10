"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faComment, faSave, faTimes } from "@fortawesome/free-solid-svg-icons"

const CommentaireObjectif = ({ objectif, date, onSaveCommentaire, isAuthenticated }) => {
  const [commentaire, setCommentaire] = useState("")
  const [afficherCommentaire, setAfficherCommentaire] = useState(false)

  // Charger le commentaire existant s'il y en a un
  useEffect(() => {
    if (objectif.commentaires && objectif.commentaires[date]) {
      setCommentaire(objectif.commentaires[date])
    } else {
      setCommentaire("")
    }
  }, [objectif, date])

  const handleSaveCommentaire = () => {
    onSaveCommentaire(objectif.id, date, commentaire)
    setAfficherCommentaire(false)
  }

  return (
    <div className="commentaire-objectif">
      {!afficherCommentaire ? (
        <button
          className="bouton-commentaire"
          onClick={() => setAfficherCommentaire(true)}
          title={
            objectif.commentaires && objectif.commentaires[date] ? "Modifier le commentaire" : "Ajouter un commentaire"
          }
        >
          <FontAwesomeIcon
            icon={faComment}
            className={objectif.commentaires && objectif.commentaires[date] ? "avec-commentaire" : ""}
          />
          {objectif.commentaires && objectif.commentaires[date] ? "Modifier" : "Commenter"}
        </button>
      ) : (
        <div className="editeur-commentaire">
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Notez vos expériences, contraintes, succès et échecs..."
            className="textarea-commentaire"
          />
          <div className="actions-commentaire">
            <button className="bouton-annuler-commentaire" onClick={() => setAfficherCommentaire(false)}>
              <FontAwesomeIcon icon={faTimes} /> Annuler
            </button>
            <button className="bouton-sauvegarder-commentaire" onClick={handleSaveCommentaire}>
              <FontAwesomeIcon icon={faSave} /> Sauvegarder
            </button>
          </div>
        </div>
      )}

      {!afficherCommentaire && objectif.commentaires && objectif.commentaires[date] && (
        <div className="apercu-commentaire">
          <p>{objectif.commentaires[date]}</p>
        </div>
      )}
    </div>
  )
}

export default CommentaireObjectif

