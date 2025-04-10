"use client"

import { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPaperPlane,
  faRobot,
  faUser,
  faTrash,
  faPlus,
  faLightbulb,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons"
import { iaService } from "../../services/api.service"

const IAAssistant = ({ objectifId }) => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [actualites, setActualites] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [loadingActualites, setLoadingActualites] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadConversations()
  }, [objectifId])

  useEffect(() => {
    if (objectifId) {
      loadSuggestions()
      loadActualites()
    }
  }, [objectifId])

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await iaService.getConversations()

      // Filtrer les conversations pour cet objectif si objectifId est fourni
      const filteredConversations = objectifId
        ? response.data.filter((conv) => conv.objectifId === objectifId)
        : response.data

      setConversations(filteredConversations)

      // Sélectionner la première conversation si disponible
      if (filteredConversations.length > 0) {
        setSelectedConversation(filteredConversations[0])
      }

      setLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement des conversations:", error)
      setLoading(false)
    }
  }

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true)
      const response = await iaService.getSuggestions(objectifId)
      setSuggestions(response.data.suggestions)
      setLoadingSuggestions(false)
    } catch (error) {
      console.error("Erreur lors du chargement des suggestions:", error)
      setLoadingSuggestions(false)
    }
  }

  const loadActualites = async () => {
    try {
      setLoadingActualites(true)
      const response = await iaService.getActualites(objectifId)
      setActualites(response.data)
      setLoadingActualites(false)
    } catch (error) {
      console.error("Erreur lors du chargement des actualités:", error)
      setLoadingActualites(false)
    }
  }

  const createConversation = async () => {
    try {
      const response = await iaService.createConversation(objectifId)
      setConversations([response.data, ...conversations])
      setSelectedConversation(response.data)
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error)
    }
  }

  const deleteConversation = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette conversation ?")) {
      try {
        await iaService.deleteConversation(id)

        // Mettre à jour la liste des conversations
        const updatedConversations = conversations.filter((conv) => conv.id !== id)
        setConversations(updatedConversations)

        // Si la conversation supprimée était sélectionnée, sélectionner la première conversation disponible
        if (selectedConversation && selectedConversation.id === id) {
          setSelectedConversation(updatedConversations.length > 0 ? updatedConversations[0] : null)
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la conversation:", error)
      }
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) return

    // Si aucune conversation n'est sélectionnée, en créer une nouvelle
    if (!selectedConversation) {
      try {
        const response = await iaService.createConversation(objectifId)
        setConversations([response.data, ...conversations])
        setSelectedConversation(response.data)

        // Envoyer le message après la création de la conversation
        sendMessageToConversation(response.data.id, message)
      } catch (error) {
        console.error("Erreur lors de la création de la conversation:", error)
      }
    } else {
      // Envoyer le message à la conversation existante
      sendMessageToConversation(selectedConversation.id, message)
    }
  }

  const sendMessageToConversation = async (conversationId, messageText) => {
    try {
      setSending(true)

      // Mettre à jour l'interface utilisateur immédiatement
      const tempMessage = { role: "user", content: messageText }
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, tempMessage],
          }
        }
        return conv
      })
      setConversations(updatedConversations)

      if (selectedConversation && selectedConversation.id === conversationId) {
        setSelectedConversation({
          ...selectedConversation,
          messages: [...selectedConversation.messages, tempMessage],
        })
      }

      // Vider le champ de message
      setMessage("")

      // Envoyer le message à l'API
      const response = await iaService.addMessage(conversationId, messageText)

      // Mettre à jour la conversation avec la réponse de l'IA
      const updatedConversationsWithResponse = conversations.map((conv) => {
        if (conv.id === conversationId) {
          return response.data
        }
        return conv
      })
      setConversations(updatedConversationsWithResponse)

      if (selectedConversation && selectedConversation.id === conversationId) {
        setSelectedConversation(response.data)
      }

      setSending(false)
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="ia-loading">
        <div className="spinner"></div>
        <p>Chargement de l'assistant IA...</p>
      </div>
    )
  }

  return (
    <div className="ia-assistant">
      <div className="ia-container">
        <div className="ia-sidebar">
          <div className="ia-sidebar-header">
            <h3 className="ia-sidebar-title">Conversations</h3>
            <button className="new-conversation-button" onClick={createConversation}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">
                <p>Aucune conversation</p>
                <button className="start-conversation-button" onClick={createConversation}>
                  Démarrer une conversation
                </button>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation && selectedConversation.id === conversation.id ? "active" : ""}`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="conversation-icon">
                    <FontAwesomeIcon icon={faRobot} />
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-title">
                      {conversation.objectif ? conversation.objectif.nom : "Conversation générale"}
                    </div>
                    <div className="conversation-date">{formatDate(conversation.updatedAt)}</div>
                  </div>
                  <button
                    className="delete-conversation-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conversation.id)
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="ia-chat">
          {selectedConversation ? (
            <>
              <div className="ia-chat-header">
                <h3 className="ia-chat-title">
                  {selectedConversation.objectif ? selectedConversation.objectif.nom : "Conversation générale"}
                </h3>
              </div>
              <div className="ia-chat-messages">
                {selectedConversation.messages.length === 0 ? (
                  <div className="ia-welcome-message">
                    <div className="ia-welcome-icon">
                      <FontAwesomeIcon icon={faRobot} />
                    </div>
                    <h4>Bienvenue dans votre assistant IA</h4>
                    <p>
                      Je suis là pour vous aider à atteindre vos objectifs. Posez-moi des questions, demandez des
                      conseils ou discutez de vos progrès.
                    </p>
                    {selectedConversation.objectif && (
                      <p>
                        Je suis spécialisé pour vous aider avec votre objectif :{" "}
                        <strong>{selectedConversation.objectif.nom}</strong>
                      </p>
                    )}
                  </div>
                ) : (
                  selectedConversation.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`ia-message ${msg.role === "user" ? "user-message" : "assistant-message"}`}
                    >
                      <div className="message-avatar">
                        <FontAwesomeIcon icon={msg.role === "user" ? faUser : faRobot} />
                      </div>
                      <div className="message-content">
                        <div className="message-text">{msg.content}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="ia-chat-input">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  disabled={sending}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendMessage()
                    }
                  }}
                />
                <button className="send-button" onClick={sendMessage} disabled={sending || !message.trim()}>
                  {sending ? <div className="spinner-small"></div> : <FontAwesomeIcon icon={faPaperPlane} />}
                </button>
              </div>
            </>
          ) : (
            <div className="ia-placeholder">
              <div className="ia-placeholder-icon">
                <FontAwesomeIcon icon={faRobot} />
              </div>
              <h4>Aucune conversation sélectionnée</h4>
              <p>
                Sélectionnez une conversation existante ou créez-en une nouvelle pour commencer à discuter avec
                l'assistant IA.
              </p>
              <button className="start-conversation-button" onClick={createConversation}>
                Démarrer une conversation
              </button>
            </div>
          )}
        </div>

        <div className="ia-sidebar-right">
          <div className="ia-suggestions">
            <div className="ia-suggestions-header">
              <h3 className="ia-suggestions-title">
                <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
                Suggestions
              </h3>
            </div>
            <div className="ia-suggestions-content">
              {loadingSuggestions ? (
                <div className="ia-loading-small">
                  <div className="spinner-small"></div>
                  <p>Chargement des suggestions...</p>
                </div>
              ) : suggestions ? (
                <div className="suggestions-text">
                  <pre>{suggestions}</pre>
                </div>
              ) : (
                <div className="no-suggestions">
                  <p>Aucune suggestion disponible pour cet objectif.</p>
                </div>
              )}
            </div>
          </div>

          <div className="ia-actualites">
            <div className="ia-actualites-header">
              <h3 className="ia-actualites-title">
                <FontAwesomeIcon icon={faNewspaper} className="mr-2" />
                Actualités
              </h3>
            </div>
            <div className="ia-actualites-content">
              {loadingActualites ? (
                <div className="ia-loading-small">
                  <div className="spinner-small"></div>
                  <p>Chargement des actualités...</p>
                </div>
              ) : actualites.length > 0 ? (
                <div className="actualites-list">
                  {actualites.map((actualite) => (
                    <div key={actualite.id} className="actualite-item">
                      <h4 className="actualite-titre">{actualite.titre}</h4>
                      <p className="actualite-description">{actualite.description}</p>
                      <div className="actualite-footer">
                        <span className="actualite-date">{formatDate(actualite.date)}</span>
                        <a href={actualite.url} target="_blank" rel="noopener noreferrer" className="actualite-link">
                          Lire l'article
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-actualites">
                  <p>Aucune actualité disponible pour cet objectif.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IAAssistant

