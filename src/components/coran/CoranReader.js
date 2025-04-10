"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faPlay, faPause, faBookmark, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { coranService } from "../../services/api.service"

const CoranReader = () => {
  const [sourates, setSourates] = useState([])
  const [selectedSourate, setSelectedSourate] = useState(null)
  const [versets, setVersets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(null)
  const [audioElement, setAudioElement] = useState(null)

  useEffect(() => {
    loadSourates()
  }, [])

  useEffect(() => {
    if (selectedSourate) {
      loadVersets(selectedSourate)
    }
  }, [selectedSourate])

  useEffect(() => {
    // Créer un élément audio pour la lecture
    const audio = new Audio()
    audio.addEventListener("ended", () => {
      setAudioPlaying(null)
    })
    setAudioElement(audio)

    // Nettoyer l'élément audio lors du démontage du composant
    return () => {
      if (audio) {
        audio.pause()
        audio.src = ""
      }
    }
  }, [])

  const loadSourates = async () => {
    try {
      setLoading(true)
      const response = await coranService.getSourates()
      setSourates(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement des sourates:", error)
      setLoading(false)
    }
  }

  const loadVersets = async (sourate) => {
    try {
      setLoading(true)
      const response = await coranService.getVersets(sourate)
      setVersets(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement des versets:", error)
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)
      const response = await coranService.rechercherCoran(searchQuery)
      setSearchResults(response.data)
      setIsSearching(false)
    } catch (error) {
      console.error("Erreur lors de la recherche:", error)
      setIsSearching(false)
    }
  }

  const handlePlayAudio = (audioUrl, versetId) => {
    if (audioElement) {
      // Si le même verset est en cours de lecture, mettre en pauseours de lecture, mettre en pause
      if (audioPlaying === versetId) {
        audioElement.pause()
        setAudioPlaying(null)
      } else {
        // Sinon, lire le nouveau verset
        audioElement.src = audioUrl
        audioElement.play()
        setAudioPlaying(versetId)
      }
    }
  }

  const handlePreviousSourate = () => {
    if (selectedSourate > 1) {
      setSelectedSourate(selectedSourate - 1)
    }
  }

  const handleNextSourate = () => {
    if (selectedSourate < 114) {
      setSelectedSourate(selectedSourate + 1)
    }
  }

  if (loading) {
    return (
      <div className="coran-loading">
        <div className="spinner"></div>
        <p>Chargement du Coran...</p>
      </div>
    )
  }

  return (
    <div className="coran-reader">
      <div className="coran-header">
        <h3 className="coran-title">Lecteur du Coran</h3>
        <div className="coran-search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans le Coran..."
            className="coran-search-input"
          />
          <button className="coran-search-button" onClick={handleSearch} disabled={isSearching}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>

      <div className="coran-content">
        <div className="coran-sourates">
          <h4 className="sourates-title">Sourates</h4>
          <div className="sourates-list">
            {sourates.map((sourate) => (
              <div
                key={sourate.numero}
                className={`sourate-item ${selectedSourate === sourate.numero ? "active" : ""}`}
                onClick={() => setSelectedSourate(sourate.numero)}
              >
                <span className="sourate-numero">{sourate.numero}.</span>
                <span className="sourate-nom">{sourate.nom}</span>
                <span className="sourate-nom-arabe">{sourate.nomArabe}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="coran-versets">
          {isSearching ? (
            <div className="coran-searching">
              <div className="spinner"></div>
              <p>Recherche en cours...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="search-results">
              <h4 className="results-title">Résultats de recherche pour "{searchQuery}"</h4>
              <button
                className="clear-search"
                onClick={() => {
                  setSearchResults([])
                  setSearchQuery("")
                }}
              >
                Effacer la recherche
              </button>
              <div className="results-list">
                {searchResults.map((verset) => (
                  <div key={`${verset.sourate}-${verset.verset}`} className="result-item">
                    <div className="result-header">
                      <span className="result-reference">
                        Sourate {verset.sourate}, Verset {verset.verset}
                      </span>
                      <div className="result-actions">
                        <button
                          className="action-button"
                          onClick={() => {
                            setSelectedSourate(verset.sourate)
                            setSearchResults([])
                          }}
                        >
                          Voir la sourate
                        </button>
                        {verset.audio && (
                          <button
                            className={`audio-button ${audioPlaying === `${verset.sourate}-${verset.verset}` ? "playing" : ""}`}
                            onClick={() => handlePlayAudio(verset.audio, `${verset.sourate}-${verset.verset}`)}
                          >
                            <FontAwesomeIcon
                              icon={audioPlaying === `${verset.sourate}-${verset.verset}` ? faPause : faPlay}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="result-content">
                      <p className="texte-arabe">{verset.texteArabe}</p>
                      <p className="texte-francais">{verset.texteFrancais}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedSourate ? (
            <div className="sourate-versets">
              <div className="sourate-navigation">
                <button className="nav-button" onClick={handlePreviousSourate} disabled={selectedSourate <= 1}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <h4 className="sourate-title">
                  {sourates.find((s) => s.numero === selectedSourate)?.nom} (
                  {sourates.find((s) => s.numero === selectedSourate)?.nomArabe})
                </h4>
                <button className="nav-button" onClick={handleNextSourate} disabled={selectedSourate >= 114}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
              <div className="versets-list">
                {versets.map((verset) => (
                  <div key={verset.id} className="verset-item">
                    <div className="verset-header">
                      <span className="verset-numero">{verset.verset}</span>
                      <div className="verset-actions">
                        <button className="bookmark-button" title="Ajouter aux favoris">
                          <FontAwesomeIcon icon={faBookmark} />
                        </button>
                        {verset.audio && (
                          <button
                            className={`audio-button ${audioPlaying === verset.id ? "playing" : ""}`}
                            onClick={() => handlePlayAudio(verset.audio, verset.id)}
                          >
                            <FontAwesomeIcon icon={audioPlaying === verset.id ? faPause : faPlay} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="verset-content">
                      <p className="texte-arabe">{verset.texteArabe}</p>
                      <p className="texte-francais">{verset.texteFrancais}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="coran-placeholder">
              <p>Sélectionnez une sourate pour commencer la lecture</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CoranReader

