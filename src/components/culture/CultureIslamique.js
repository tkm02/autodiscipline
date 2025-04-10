"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBook, faHistory, faPray, faQuran, faCalendarAlt, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { cultureService } from "../../services/api.service"

const CultureIslamique = () => {
  const [articles, setArticles] = useState([])
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticles()
  }, [selectedCategory])

  const loadArticles = async () => {
    try {
      setLoading(true)
      const response = await cultureService.getArticles(selectedCategory === "all" ? null : selectedCategory)
      setArticles(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement des articles:", error)
      setLoading(false)
    }
  }

  const loadArticle = async (id) => {
    try {
      setLoading(true)
      const response = await cultureService.getArticle(id)
      setSelectedArticle(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement de l'article:", error)
      setLoading(false)
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "histoire":
        return <FontAwesomeIcon icon={faHistory} />
      case "pratiques":
        return <FontAwesomeIcon icon={faPray} />
      case "coran":
        return <FontAwesomeIcon icon={faQuran} />
      case "fetes":
        return <FontAwesomeIcon icon={faCalendarAlt} />
      default:
        return <FontAwesomeIcon icon={faBook} />
    }
  }

  if (loading) {
    return (
      <div className="culture-loading">
        <div className="spinner"></div>
        <p>Chargement des articles...</p>
      </div>
    )
  }

  return (
    <div className="culture-islamique">
      <div className="culture-header">
        <h3 className="culture-title">Culture Islamique</h3>
        <div className="categories-filter">
          <button
            className={`category-button ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory("all")
              setSelectedArticle(null)
            }}
          >
            Tous
          </button>
          <button
            className={`category-button ${selectedCategory === "histoire" ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory("histoire")
              setSelectedArticle(null)
            }}
          >
            Histoire
          </button>
          <button
            className={`category-button ${selectedCategory === "pratiques" ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory("pratiques")
              setSelectedArticle(null)
            }}
          >
            Pratiques
          </button>
          <button
            className={`category-button ${selectedCategory === "coran" ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory("coran")
              setSelectedArticle(null)
            }}
          >
            Coran
          </button>
          <button
            className={`category-button ${selectedCategory === "fetes" ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory("fetes")
              setSelectedArticle(null)
            }}
          >
            Fêtes
          </button>
        </div>
      </div>

      <div className="culture-content">
        {selectedArticle ? (
          <div className="article-detail">
            <button className="back-button" onClick={() => setSelectedArticle(null)}>
              Retour à la liste
            </button>
            <div className="article-header">
              <h4 className="article-title">{selectedArticle.titre}</h4>
              <div className="article-meta">
                <span className="article-category">
                  {getCategoryIcon(selectedArticle.categorie)}
                  {selectedArticle.categorie.charAt(0).toUpperCase() + selectedArticle.categorie.slice(1)}
                </span>
                <span className="article-date">
                  {new Date(selectedArticle.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            {selectedArticle.image && (
              <div className="article-image">
                <img src={selectedArticle.image || "/placeholder.svg"} alt={selectedArticle.titre} />
              </div>
            )}
            <div className="article-content" dangerouslySetInnerHTML={{ __html: selectedArticle.contenu }} />
          </div>
        ) : (
          <div className="articles-list">
            {articles.length === 0 ? (
              <div className="no-articles">
                <p>Aucun article disponible dans cette catégorie.</p>
              </div>
            ) : (
              articles.map((article) => (
                <div key={article.id} className="article-card" onClick={() => loadArticle(article.id)}>
                  <div className="article-card-header">
                    <div className="article-category-icon">{getCategoryIcon(article.categorie)}</div>
                    <h4 className="article-card-title">{article.titre}</h4>
                  </div>
                  {article.image && (
                    <div className="article-card-image">
                      <img src={article.image || "/placeholder.svg"} alt={article.titre} />
                    </div>
                  )}
                  <div className="article-card-footer">
                    <span className="article-card-category">
                      {article.categorie.charAt(0).toUpperCase() + article.categorie.slice(1)}
                    </span>
                    <button className="read-more">
                      Lire <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CultureIslamique

    