"use client"

import { useState, useEffect, useCallback } from "react"
import "../pages/Dashboard.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCheckCircle,
  faTimesCircle,
  faEdit,
  faTrash,
  faPlusCircle,
  faChurch,
  faBriefcase,
  faDumbbell,
  faChartLine,
  faChartPie,
  faChartBar,
  faCalendarAlt,
  faTrophy,
  faPercentage,
  faSignOutAlt,
  faUser,
  faHistory,
  faClock,
  faSpinner,
  faCheckDouble,
  faFilter,
} from "@fortawesome/free-solid-svg-icons"
import { Line, Pie, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
} from "chart.js"

// Importer les services API
import { authService, objectifService } from "../services/api.service"

// Importer les composants d'authentification
import Login from "../components/auth/Login"
import Register from "../components/auth/Register"

// Importer le composant d'exportation
import ExportOptions from "../components/export/ExportOptions"

// Importer les composants pour les objectifs
import CommentaireObjectif from "../components/CommentaireObjectif"
import HistoriqueCommentaires from "../components/HistoriqueCommentaires"
import StatutObjectif from "../components/StatutObjectif"

// Enregistrer les composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title)

const Dashboard = ({ theme }) => {
  // États pour gérer les objectifs et le formulaire
  const [objectifs, setObjectifs] = useState([])
  const [afficherFormulaire, setAfficherFormulaire] = useState(false)
  const [categorieActive, setCategorieActive] = useState("tous")
  const [statutActif, setStatutActif] = useState("tous")
  const [progressionEdition, setProgressionEdition] = useState({})
  const [vueActive, setVueActive] = useState("tableau") // 'tableau' ou 'graphiques'
  const [periodeGraphique, setPeriodeGraphique] = useState("7jours") // '7jours', '30jours', '90jours'

  // États pour l'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState("login") // 'login' ou 'register'
  const [loading, setLoading] = useState(true)

  // État pour le nouvel objectif
  const [nouvelObjectif, setNouvelObjectif] = useState({
    nom: "",
    categorie: "personnel",
    typeDeTracking: "binaire",
    frequence: "quotidien",
    cible: "",
    description: "",
    statut: "en_attente",
  })

  // État pour l'objectif en cours d'édition
  const [objectifEnEdition, setObjectifEnEdition] = useState(null)

  // État pour l'historique des commentaires
  const [objectifHistorique, setObjectifHistorique] = useState(null)

  // Vérifier l'authentification au chargement
  const checkAuth = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser()
        setUser(userData.data)
        setIsAuthenticated(true)

        // Charger les objectifs depuis l'API
        loadObjectifs()
      } else {
        // Charger les exemples d'objectifs si non authentifié
        setObjectifs(obtenirExemplesObjectifs())
      }
    } catch (error) {
      console.error("Erreur d'authentification:", error)
      authService.logout()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Charger les objectifs depuis l'API
  const loadObjectifs = async () => {
    try {
      setLoading(true)
      const response = await objectifService.getObjectifs()

      // Adapter le format des données reçues du backend
      const formattedObjectifs = response.data.map((obj) => ({
        id: obj.id,
        nom: obj.nom,
        categorie: obj.categorie,
        typeDeTracking: obj.typeDeTracking,
        frequence: obj.frequence,
        cible: obj.cible,
        description: obj.description,
        statut: obj.statut || "en_attente",
        progression: obj.progression,
        commentaires: obj.commentaires || {},
      }))

      setObjectifs(formattedObjectifs)
    } catch (error) {
      console.error("Erreur lors du chargement des objectifs:", error)
      // Charger les exemples en cas d'erreur
      setObjectifs(obtenirExemplesObjectifs())
    } finally {
      setLoading(false)
    }
  }

  // Gérer la connexion réussie
  const handleLoginSuccess = async () => {
    try {
      const userData = await authService.getCurrentUser()
      setUser(userData.data)
      setIsAuthenticated(true)
      loadObjectifs()
    } catch (error) {
      console.error("Erreur après connexion:", error)
    }
  }

  // Gérer l'inscription réussie
  const handleRegisterSuccess = () => {
    setAuthMode("login")
  }

  // Gérer la déconnexion
  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUser(null)
    // Réinitialiser le formulaire d'édition
    setObjectifEnEdition(null)
    // Charger les exemples d'objectifs
    setObjectifs(obtenirExemplesObjectifs())
  }

  // Sauvegarder les objectifs dans le localStorage quand ils changent
  useEffect(() => {
    if (objectifs.length > 0 && !isAuthenticated) {
      localStorage.setItem("objectifs", JSON.stringify(objectifs))
    }
  }, [objectifs, isAuthenticated])

  // Fonction pour générer un ID unique
  const genererID = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  // Fonction pour obtenir des exemples d'objectifs avec historique
  const obtenirExemplesObjectifs = () => {
    const aujourdhui = new Date()
    const objectifs = []

    // Générer des données historiques pour les 90 derniers jours
    for (let i = 0; i < 90; i++) {
      const date = new Date(aujourdhui)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      // Ajouter des données pour chaque jour
      if (i === 0) {
        // Jour actuel - utiliser les exemples originaux
        objectifs.push(
          {
            id: "spirituel1",
            nom: "Jeûner chaque jour pendant 3 mois",
            categorie: "spirituel",
            typeDeTracking: "binaire",
            frequence: "quotidien",
            cible: 90,
            description: "Jeûne intermittent quotidien",
            statut: "en_cours",
            progression: { [dateStr]: Math.random() > 0.3 },
            commentaires: {},
          },
          {
            id: "spirituel2",
            nom: "Se réveiller à 5h00 chaque jour",
            categorie: "spirituel",
            typeDeTracking: "binaire",
            frequence: "quotidien",
            statut: "en_attente",
            progression: { [dateStr]: Math.random() > 0.4 },
            commentaires: {},
          },
          {
            id: "spirituel3",
            nom: "Lire le Coran tous les jours",
            categorie: "spirituel",
            typeDeTracking: "compteur",
            frequence: "quotidien",
            description: "Nombre de versets lus",
            statut: "en_cours",
            progression: { [dateStr]: Math.floor(Math.random() * 20) + 5 },
            commentaires: {},
          },
          {
            id: "professionnel1",
            nom: "Suivre mes certificats sur Coursera",
            categorie: "professionnel",
            typeDeTracking: "compteur",
            frequence: "quotidien",
            description: "Modules complétés",
            statut: "termine",
            progression: { [dateStr]: Math.floor(Math.random() * 3) + 1 },
            commentaires: {},
          },
          {
            id: "professionnel2",
            nom: "Travailler sur mes projets personnels",
            categorie: "professionnel",
            typeDeTracking: "numerique",
            frequence: "quotidien",
            description: "Heures travaillées",
            statut: "en_cours",
            progression: { [dateStr]: Math.random() * 3 + 0.5 },
            commentaires: {},
          },
          {
            id: "personnel1",
            nom: "Faire du sport",
            categorie: "personnel",
            typeDeTracking: "binaire",
            frequence: "quotidien",
            statut: "en_attente",
            progression: { [dateStr]: Math.random() > 0.3 },
            commentaires: {},
          },
          {
            id: "personnel2",
            nom: "Apprendre l'anglais",
            categorie: "personnel",
            typeDeTracking: "numerique",
            frequence: "quotidien",
            description: "Heures d'étude",
            statut: "termine",
            progression: { [dateStr]: Math.random() * 2 },
            commentaires: {},
          },
        )
      } else {
        // Jours précédents - ajouter des données historiques aléatoires
        objectifs.forEach((obj) => {
          if (obj.typeDeTracking === "binaire") {
            obj.progression[dateStr] = Math.random() > 0.3
          } else if (obj.typeDeTracking === "compteur") {
            if (obj.nom.includes("Coran")) {
              obj.progression[dateStr] = Math.floor(Math.random() * 20) + 5
            } else {
              obj.progression[dateStr] = Math.floor(Math.random() * 3) + 1
            }
          } else if (obj.typeDeTracking === "numerique") {
            if (obj.nom.includes("projets")) {
              obj.progression[dateStr] = Math.random() * 3 + 0.5
            } else {
              obj.progression[dateStr] = Math.random() * 2
            }
          }
        })
      }
    }

    return objectifs
  }

  // Filtrer les objectifs par catégorie et statut
  const objectifsFiltres = objectifs.filter((obj) => {
    const filtreCategorie = categorieActive === "tous" || obj.categorie === categorieActive
    const filtreStatut = statutActif === "tous" || obj.statut === statutActif
    return filtreCategorie && filtreStatut
  })

  // Fonction pour basculer la complétion d'un objectif binaire
  const basculerCompletion = async (id) => {
    const objectif = objectifs.find((obj) => obj.id === id)
    if (!objectif || objectif.typeDeTracking !== "binaire") return

    const aujourdhui = new Date().toISOString().split("T")[0]
    const estComplete = objectif.progression[aujourdhui] === true

    // Mettre à jour localement
    const objectifsMisAJour = objectifs.map((obj) => {
      if (obj.id === id) {
        return {
          ...obj,
          progression: {
            ...obj.progression,
            [aujourdhui]: !estComplete,
          },
        }
      }
      return obj
    })

    setObjectifs(objectifsMisAJour)

    // Si authentifié, mettre à jour sur le serveur
    if (isAuthenticated) {
      try {
        await objectifService.updateProgression(id, aujourdhui, !estComplete)
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la progression:", error)
        // Revenir à l'état précédent en cas d'erreur
        setObjectifs(objectifs)
      }
    }
  }

  // Fonction pour mettre à jour la progression numérique
  const mettreAJourProgressionNumerique = async (id) => {
    const objectif = objectifs.find((obj) => obj.id === id)
    if (!objectif || !progressionEdition[id]) return

    const aujourdhui = new Date().toISOString().split("T")[0]
    const valeur = progressionEdition[id]
    const valeurNumerique = objectif.typeDeTracking === "compteur" ? Number.parseInt(valeur) : Number.parseFloat(valeur)

    // Mettre à jour localement
    const objectifsMisAJour = objectifs.map((obj) => {
      if (obj.id === id) {
        return {
          ...obj,
          progression: {
            ...obj.progression,
            [aujourdhui]: valeurNumerique,
          },
        }
      }
      return obj
    })

    setObjectifs(objectifsMisAJour)

    setProgressionEdition({
      ...progressionEdition,
      [id]: "",
    })

    // Si authentifié, mettre à jour sur le serveur
    if (isAuthenticated) {
      try {
        await objectifService.updateProgression(id, aujourdhui, valeurNumerique)
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la progression:", error)
        // Revenir à l'état précédent en cas d'erreur
        setObjectifs(objectifs)
      }
    }
  }

  // Fonction pour mettre à jour le statut d'un objectif
  const mettreAJourStatut = async (id, statut) => {
    // Mettre à jour localement
    const objectifsMisAJour = objectifs.map((obj) => {
      if (obj.id === id) {
        return {
          ...obj,
          statut,
        }
      }
      return obj
    })

    setObjectifs(objectifsMisAJour)

    // Si authentifié, mettre à jour sur le serveur
    if (isAuthenticated) {
      try {
        await objectifService.updateStatut(id, statut)
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error)
        // Revenir à l'état précédent en cas d'erreur
        setObjectifs(objectifs)
      }
    }
  }

  // Fonction pour ajouter un nouvel objectif
  const ajouterObjectif = async () => {
    if (!nouvelObjectif.nom) return

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

    // Si authentifié, ajouter sur le serveur
    if (isAuthenticated) {
      try {
        const response = await objectifService.createObjectif(objectifAjoute)

        // Adapter le format des données reçues du backend
        const formattedObjectif = {
          id: response.data.id,
          nom: response.data.nom,
          categorie: response.data.categorie,
          typeDeTracking: response.data.typeDeTracking,
          frequence: response.data.frequence,
          cible: response.data.cible,
          description: response.data.description,
          statut: response.data.statut,
          progression: response.data.progression,
          commentaires: response.data.commentaires,
        }

        setObjectifs([...objectifs, formattedObjectif])
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'objectif:", error)
        // Ajouter localement en cas d'erreur
        objectifAjoute.id = genererID()
        setObjectifs([...objectifs, objectifAjoute])
      }
    } else {
      // Ajouter localement si non authentifié
      objectifAjoute.id = genererID()
      setObjectifs([...objectifs, objectifAjoute])
    }

    // Réinitialiser le formulaire
    setNouvelObjectif({
      nom: "",
      categorie: "personnel",
      typeDeTracking: "binaire",
      frequence: "quotidien",
      cible: "",
      description: "",
      statut: "en_attente",
    })

    setAfficherFormulaire(false)
  }

  // Fonction pour mettre à jour un objectif existant
  const mettreAJourObjectif = async () => {
    if (!objectifEnEdition || !objectifEnEdition.nom) return

    const objectifMisAJour = {
      ...objectifEnEdition,
    }

    // Convertir la cible en nombre si nécessaire
    if (objectifEnEdition.cible) {
      objectifMisAJour.cible =
        objectifEnEdition.typeDeTracking === "compteur"
          ? Number.parseInt(objectifEnEdition.cible)
          : Number.parseFloat(objectifEnEdition.cible)
    }

    // Si authentifié, mettre à jour sur le serveur
    if (isAuthenticated) {
      try {
        const response = await objectifService.updateObjectif(objectifEnEdition.id, objectifMisAJour)

        // Adapter le format des données reçues du backend
        const formattedObjectif = {
          id: response.data.id,
          nom: response.data.nom,
          categorie: response.data.categorie,
          typeDeTracking: response.data.typeDeTracking,
          frequence: response.data.frequence,
          cible: response.data.cible,
          description: response.data.description,
          statut: response.data.statut,
          progression: response.data.progression,
          commentaires: response.data.commentaires,
        }

        // Mettre à jour l'objectif dans la liste
        setObjectifs(objectifs.map((obj) => (obj.id === formattedObjectif.id ? formattedObjectif : obj)))
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'objectif:", error)
        // Mettre à jour localement en cas d'erreur
        setObjectifs(
          objectifs.map((obj) =>
            obj.id === objectifEnEdition.id ? { ...obj, ...objectifMisAJour, progression: obj.progression } : obj,
          ),
        )
      }
    } else {
      // Mettre à jour localement si non authentifié
      setObjectifs(objectifs.map((obj) => (obj.id === objectifEnEdition.id ? { ...obj, ...objectifMisAJour } : obj)))
    }
    // Réinitialiser le formulaire
    setObjectifEnEdition(null)
    setAfficherFormulaire(false)
  }

  // Fonction pour supprimer un objectif
  const supprimerObjectif = async (id) => {
    // Si authentifié, supprimer sur le serveur
    if (isAuthenticated) {
      try {
        await objectifService.deleteObjectif(id)
        // Supprimer localement après confirmation du serveur
        const objectifsFiltres = objectifs.filter((obj) => obj.id !== id)
        setObjectifs(objectifsFiltres)
      } catch (error) {
        console.error("Erreur lors de la suppression de l'objectif:", error)
      }
    } else {
      // Supprimer localement si non authentifié
      const objectifsFiltres = objectifs.filter((obj) => obj.id !== id)
      setObjectifs(objectifsFiltres)
    }
  }

  // Fonction pour commencer l'édition d'un objectif
  const commencerEdition = (objectif) => {
    setObjectifEnEdition({
      id: objectif.id,
      nom: objectif.nom,
      categorie: objectif.categorie,
      typeDeTracking: objectif.typeDeTracking,
      frequence: objectif.frequence,
      cible: objectif.cible || "",
      description: objectif.description || "",
      statut: objectif.statut || "en_attente",
    })
    setAfficherFormulaire(true)
  }

  // Fonction pour obtenir l'icône de catégorie
  const obtenirIconeCategorie = (categorie) => {
    switch (categorie) {
      case "spirituel":
        return <FontAwesomeIcon icon={faChurch} className="icone-categorie spirituel" />
      case "professionnel":
        return <FontAwesomeIcon icon={faBriefcase} className="icone-categorie professionnel" />
      case "personnel":
        return <FontAwesomeIcon icon={faDumbbell} className="icone-categorie personnel" />
      default:
        return null
    }
  }

  // Fonction pour obtenir l'icône de statut
  const obtenirIconeStatut = (statut) => {
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

  // Fonction pour sauvegarder un commentaire
  const sauvegarderCommentaire = async (id, date, commentaire) => {
    const objectif = objectifs.find((obj) => obj.id === id)
    if (!objectif) return

    // Mettre à jour localement
    const objectifsMisAJour = objectifs.map((obj) => {
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

    setObjectifs(objectifsMisAJour)

    // Si authentifié, mettre à jour sur le serveur
    if (isAuthenticated) {
      try {
        await objectifService.updateCommentaire(id, date, commentaire)
      } catch (error) {
        console.error("Erreur lors de la mise à jour du commentaire:", error)
        // Revenir à l'état précédent en cas d'erreur
        setObjectifs(objectifs)
      }
    }
  }

  // Fonction pour obtenir l'affichage de la progression
  const obtenirAffichageProgression = (objectif) => {
    const aujourdhui = new Date().toISOString().split("T")[0]
    const progression = objectif.progression[aujourdhui]

    if (objectif.typeDeTracking === "binaire") {
      return (
        <button
          className={`bouton-statut ${progression ? "complete" : "non-complete"}`}
          onClick={() => basculerCompletion(objectif.id)}
        >
          <FontAwesomeIcon
            icon={progression ? faCheckCircle : faTimesCircle}
            className={progression ? "icone-check" : "icone-times"}
          />
          {progression ? "Complété" : "Non complété"}
        </button>
      )
    } else {
      return (
        <div className="progression-numerique">
          <input
            type="number"
            value={progressionEdition[objectif.id] || ""}
            onChange={(e) =>
              setProgressionEdition((prev) => ({
                ...prev,
                [objectif.id]: e.target.value,
              }))
            }
            placeholder={progression ? progression.toString() : "0"}
            className="input-progression"
          />
          <button className="bouton-enregistrer" onClick={() => mettreAJourProgressionNumerique(objectif.id)}>
            Enregistrer
          </button>
          <span className="valeur-actuelle">
            {progression ? `Actuel: ${progression}` : "Non suivi"}
            {objectif.cible ? ` / Cible: ${objectif.cible}` : ""}
          </span>
        </div>
      )
    }
  }

  // Fonction pour obtenir l'affichage du commentaire
  const obtenirAffichageCommentaire = (objectif) => {
    const aujourdhui = new Date().toISOString().split("T")[0]

    return (
      <div className="commentaire-container">
        <CommentaireObjectif
          objectif={objectif}
          date={aujourdhui}
          onSaveCommentaire={sauvegarderCommentaire}
          isAuthenticated={isAuthenticated}
        />

        {/* Bouton pour afficher l'historique des commentaires */}
        {objectif.commentaires && Object.keys(objectif.commentaires).length > 0 && (
          <button className="bouton-historique" onClick={() => setObjectifHistorique(objectif)}>
            <FontAwesomeIcon icon={faHistory} /> Historique
          </button>
        )}
      </div>
    )
  }

  // Fonction pour obtenir le libellé de fréquence
  const obtenirLibelleFrequence = (frequence) => {
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

  // Fonction pour obtenir le libellé de type de tracking
  const obtenirLibelleTypeTracking = (type) => {
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

  // Fonction pour obtenir les dates pour les graphiques
  const obtenirDatesGraphique = () => {
    const aujourdhui = new Date()
    const dates = []
    let nombreJours

    switch (periodeGraphique) {
      case "7jours":
        nombreJours = 7
        break
      case "30jours":
        nombreJours = 30
        break
      case "90jours":
        nombreJours = 90
        break
      default:
        nombreJours = 7
    }

    for (let i = nombreJours - 1; i >= 0; i--) {
      const date = new Date(aujourdhui)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split("T")[0])
    }

    return dates
  }

  // Fonction pour formater les dates pour l'affichage
  const formaterDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  // Fonction pour obtenir les données du graphique d'évolution
  const obtenirDonneesEvolution = () => {
    const dates = obtenirDatesGraphique()
    const objectifsParCategorie = {
      spirituel: objectifs.filter((obj) => obj.categorie === "spirituel"),
      professionnel: objectifs.filter((obj) => obj.categorie === "professionnel"),
      personnel: objectifs.filter((obj) => obj.categorie === "personnel"),
    }

    const donneesGraphique = {
      labels: dates.map((date) => formaterDate(date)),
      datasets: [],
    }

    // Couleurs pour les catégories
    const couleurs = {
      spirituel: "rgba(76, 175, 80, 0.7)",
      professionnel: "rgba(33, 150, 243, 0.7)",
      personnel: "rgba(255, 152, 0, 0.7)",
    }

    // Ajouter les données pour chaque catégorie
    Object.keys(objectifsParCategorie).forEach((categorie) => {
      const objectifsCategorie = objectifsParCategorie[categorie]

      if (objectifsCategorie.length === 0) return

      const tauxCompletion = dates.map((date) => {
        let objectifsCompletes = 0
        let totalObjectifs = 0

        objectifsCategorie.forEach((obj) => {
          if (obj.progression[date] !== undefined) {
            totalObjectifs++

            if (obj.typeDeTracking === "binaire") {
              if (obj.progression[date] === true) {
                objectifsCompletes++
              }
            } else {
              // Pour les objectifs numériques, on considère qu'ils sont complétés s'ils ont une valeur > 0
              if (obj.progression[date] > 0) {
                objectifsCompletes++
              }
            }
          }
        })

        return totalObjectifs > 0 ? (objectifsCompletes / totalObjectifs) * 100 : 0
      })

      donneesGraphique.datasets.push({
        label:
          categorie === "spirituel" ? "Spirituels" : categorie === "professionnel" ? "Professionnels" : "Personnels",
        data: tauxCompletion,
        borderColor: couleurs[categorie],
        backgroundColor: couleurs[categorie].replace("0.7", "0.2"),
        tension: 0.3,
        fill: true,
      })
    })

    return donneesGraphique
  }

  // Fonction pour obtenir les données du camembert de répartition
  const obtenirDonneesRepartition = () => {
    const nombreObjectifsParCategorie = {
      Spirituels: objectifs.filter((obj) => obj.categorie === "spirituel").length,
      Professionnels: objectifs.filter((obj) => obj.categorie === "professionnel").length,
      Personnels: objectifs.filter((obj) => obj.categorie === "personnel").length,
    }

    return {
      labels: Object.keys(nombreObjectifsParCategorie),
      datasets: [
        {
          data: Object.values(nombreObjectifsParCategorie),
          backgroundColor: ["rgba(76, 175, 80, 0.7)", "rgba(33, 150, 243, 0.7)", "rgba(255, 152, 0, 0.7)"],
          borderColor: ["rgba(76, 175, 80, 1)", "rgba(33, 150, 243, 1)", "rgba(255, 152, 0, 1)"],
          borderWidth: 1,
        },
      ],
    }
  }

  // Fonction pour obtenir les données du graphique de performance par objectif
  const obtenirDonneesPerformance = () => {
    const aujourdhui = new Date().toISOString().split("T")[0]
    const objectifsFiltresPerformance =
      categorieActive === "tous" ? objectifs : objectifs.filter((obj) => obj.categorie === categorieActive)

    // Calculer le taux de complétion pour chaque objectif sur la période
    const dates = obtenirDatesGraphique()
    const performanceObjectifs = objectifsFiltresPerformance.map((obj) => {
      let joursCompletes = 0
      let joursTrackes = 0

      dates.forEach((date) => {
        if (obj.progression[date] !== undefined) {
          joursTrackes++

          if (obj.typeDeTracking === "binaire") {
            if (obj.progression[date] === true) {
              joursCompletes++
            }
          } else {
            // Pour les objectifs numériques, on considère qu'ils sont complétés s'ils ont une valeur > 0
            if (obj.progression[date] > 0) {
              joursCompletes++
            }
          }
        }
      })

      return {
        nom: obj.nom,
        performance: joursTrackes > 0 ? (joursCompletes / joursTrackes) * 100 : 0,
      }
    })

    // Trier par performance décroissante et limiter à 10 objectifs
    performanceObjectifs.sort((a, b) => b.performance - a.performance)
    const top10Objectifs = performanceObjectifs.slice(0, 10)

    return {
      labels: top10Objectifs.map((obj) => obj.nom),
      datasets: [
        {
          label: "Taux de complétion (%)",
          data: top10Objectifs.map((obj) => obj.performance),
          backgroundColor:
            categorieActive === "tous"
              ? top10Objectifs.map((obj) => {
                  const objectif = objectifs.find((o) => o.nom === obj.nom)
                  return objectif.categorie === "spirituel"
                    ? "rgba(76, 175, 80, 0.7)"
                    : objectif.categorie === "professionnel"
                      ? "rgba(33, 150, 243, 0.7)"
                      : "rgba(255, 152, 0, 0.7)"
                })
              : categorieActive === "spirituel"
                ? "rgba(76, 175, 80, 0.7)"
                : categorieActive === "professionnel"
                  ? "rgba(33, 150, 243, 0.7)"
                  : "rgba(255, 152, 0, 0.7)",
          borderWidth: 1,
        },
      ],
    }
  }

  // Fonction pour calculer les statistiques globales
  const calculerStatistiques = () => {
    const aujourdhui = new Date().toISOString().split("T")[0]
    const dates = obtenirDatesGraphique()

    // Nombre total d'objectifs
    const nombreTotal = objectifs.length

    // Objectifs complétés aujourd'hui
    let completesAujourdhui = 0
    objectifs.forEach((obj) => {
      if (obj.progression[aujourdhui] !== undefined) {
        if (obj.typeDeTracking === "binaire") {
          if (obj.progression[aujourdhui] === true) {
            completesAujourdhui++
          }
        } else {
          if (obj.progression[aujourdhui] > 0) {
            completesAujourdhui++
          }
        }
      }
    })

    // Taux de complétion global sur la période
    let totalJoursCompletes = 0
    let totalJoursTrackes = 0

    objectifs.forEach((obj) => {
      dates.forEach((date) => {
        if (obj.progression[date] !== undefined) {
          totalJoursTrackes++

          if (obj.typeDeTracking === "binaire") {
            if (obj.progression[date] === true) {
              totalJoursCompletes++
            }
          } else {
            if (obj.progression[date] > 0) {
              totalJoursCompletes++
            }
          }
        }
      })
    })

    const tauxCompletionGlobal = totalJoursTrackes > 0 ? Math.round((totalJoursCompletes / totalJoursTrackes) * 100) : 0

    // Meilleure séquence (jours consécutifs avec au moins un objectif complété)
    let meilleureSequence = 0
    let sequenceActuelle = 0

    dates.forEach((date) => {
      let auMoinsUnComplete = false

      objectifs.forEach((obj) => {
        if (obj.progression[date] !== undefined) {
          if (obj.typeDeTracking === "binaire") {
            if (obj.progression[date] === true) {
              auMoinsUnComplete = true
            }
          } else {
            if (obj.progression[date] > 0) {
              auMoinsUnComplete = true
            }
          }
        }
      })

      if (auMoinsUnComplete) {
        sequenceActuelle++
        meilleureSequence = Math.max(meilleureSequence, sequenceActuelle)
      } else {
        sequenceActuelle = 0
      }
    })

    // Statistiques par statut
    const nombreEnAttente = objectifs.filter((obj) => obj.statut === "en_attente").length
    const nombreEnCours = objectifs.filter((obj) => obj.statut === "en_cours").length
    const nombreTermines = objectifs.filter((obj) => obj.statut === "termine").length

    return {
      nombreTotal,
      completesAujourdhui,
      tauxCompletionGlobal,
      meilleureSequence,
      nombreEnAttente,
      nombreEnCours,
      nombreTermines,
    }
  }

  // Obtenir les statistiques
  const statistiques = calculerStatistiques()

  // Si en cours de chargement, afficher un indicateur
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    )
  }

  // Si non authentifié, afficher le formulaire de connexion/inscription
  if (!isAuthenticated) {
    return (
      <div className={`dashboard ${theme}`}>
        <div className="entete-dashboard">
          <h1>Tableau de Suivi d'Objectifs</h1>
        </div>

        <div className="auth-container">
          <div className="auth-tabs">
            <button className={`auth-tab ${authMode === "login" ? "active" : ""}`} onClick={() => setAuthMode("login")}>
              Connexion
            </button>
            <button
              className={`auth-tab ${authMode === "register" ? "active" : ""}`}
              onClick={() => setAuthMode("register")}
            >
              Inscription
            </button>
          </div>

          {authMode === "login" ? (
            <Login onLoginSuccess={handleLoginSuccess} />
          ) : (
            <Register onRegisterSuccess={handleRegisterSuccess} />
          )}

          <div className="auth-info">
            <p>Connectez-vous pour sauvegarder vos objectifs et accéder à toutes les fonctionnalités.</p>
            <button
              className="bouton-demo"
              onClick={() => {
                setObjectifs(obtenirExemplesObjectifs())
                setIsAuthenticated(true)
                setUser({ nom: "Mode Démo" })
              }}
            >
              Continuer en mode démo
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`dashboard ${theme}`}>
      <div className="entete-dashboard">
        <h1>Tableau de Suivi d'Objectifs</h1>
        <div className="actions-entete">
          <div className="user-info">
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            <span>{user?.nom || "Utilisateur"}</span>
            <button className="bouton-logout" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
          <div className="boutons-vue">
            <button
              className={`bouton-vue ${vueActive === "tableau" ? "actif" : ""}`}
              onClick={() => setVueActive("tableau")}
            >
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
              Tableau
            </button>
            <button
              className={`bouton-vue ${vueActive === "graphiques" ? "actif" : ""}`}
              onClick={() => setVueActive("graphiques")}
            >
              <FontAwesomeIcon icon={faChartLine} className="mr-2" />
              Graphiques
            </button>
          </div>
          <button className="bouton-ajouter" onClick={() => setAfficherFormulaire(!afficherFormulaire)}>
            <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
            {afficherFormulaire ? "Fermer" : "Ajouter un objectif"}
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout/édition d'objectif */}
      {afficherFormulaire && (
        <div className="formulaire-objectif">
          <h2>{objectifEnEdition ? "Modifier l'objectif" : "Ajouter un nouvel objectif"}</h2>
          <div className="grille-formulaire">
            <div className="groupe-formulaire">
              <label>Nom de l'objectif</label>
              <input
                type="text"
                placeholder="Ex: Faire du sport"
                value={objectifEnEdition ? objectifEnEdition.nom : nouvelObjectif.nom}
                onChange={(e) =>
                  objectifEnEdition
                    ? setObjectifEnEdition({ ...objectifEnEdition, nom: e.target.value })
                    : setNouvelObjectif({ ...nouvelObjectif, nom: e.target.value })
                }
              />
            </div>

            <div className="groupe-formulaire">
              <label>Catégorie</label>
              <select
                value={objectifEnEdition ? objectifEnEdition.categorie : nouvelObjectif.categorie}
                onChange={(e) =>
                  objectifEnEdition
                    ? setObjectifEnEdition({ ...objectifEnEdition, categorie: e.target.value })
                    : setNouvelObjectif({ ...nouvelObjectif, categorie: e.target.value })
                }
              >
                <option value="spirituel">Spirituel</option>
                <option value="professionnel">Professionnel</option>
                <option value="personnel">Personnel</option>
              </select>
            </div>

            <div className="groupe-formulaire">
              <label>Type de suivi</label>
              <select
                value={objectifEnEdition ? objectifEnEdition.typeDeTracking : nouvelObjectif.typeDeTracking}
                onChange={(e) =>
                  objectifEnEdition
                    ? setObjectifEnEdition({ ...objectifEnEdition, typeDeTracking: e.target.value })
                    : setNouvelObjectif({ ...nouvelObjectif, typeDeTracking: e.target.value })
                }
              >
                <option value="binaire">Binaire (✅/❌)</option>
                <option value="compteur">Compteur</option>
                <option value="numerique">Valeur numérique</option>
              </select>
            </div>

            <div className="groupe-formulaire">
              <label>Fréquence</label>
              <select
                value={objectifEnEdition ? objectifEnEdition.frequence : nouvelObjectif.frequence}
                onChange={(e) =>
                  objectifEnEdition
                    ? setObjectifEnEdition({ ...objectifEnEdition, frequence: e.target.value })
                    : setNouvelObjectif({ ...nouvelObjectif, frequence: e.target.value })
                }
              >
                <option value="quotidien">Quotidienne</option>
                <option value="hebdomadaire">Hebdomadaire</option>
                <option value="mensuel">Mensuelle</option>
              </select>
            </div>

            <div className="groupe-formulaire">
              <label>Statut</label>
              <select
                value={objectifEnEdition ? objectifEnEdition.statut : nouvelObjectif.statut}
                onChange={(e) =>
                  objectifEnEdition
                    ? setObjectifEnEdition({ ...objectifEnEdition, statut: e.target.value })
                    : setNouvelObjectif({ ...nouvelObjectif, statut: e.target.value })
                }
              >
                <option value="en_attente">En attente</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
              </select>
            </div>

            <div className="groupe-formulaire">
              <label>Objectif cible (optionnel)</label>
              <input
                type="text"
                placeholder="Ex: 30"
                value={objectifEnEdition ? objectifEnEdition.cible : nouvelObjectif.cible}
                onChange={(e) =>
                  objectifEnEdition
                    ? setObjectifEnEdition({ ...objectifEnEdition, cible: e.target.value })
                    : setNouvelObjectif({ ...nouvelObjectif, cible: e.target.value })
                }
              />
              <small>Laissez vide si non applicable</small>
            </div>

            <div className="groupe-formulaire pleine-largeur">
              <label>Description (optionnelle)</label>
              <textarea
                placeholder="Décrivez votre objectif plus en détail..."
                value={objectifEnEdition ? objectifEnEdition.description : nouvelObjectif.description}
                onChange={(e) =>
                  objectifEnEdition
                    ? setObjectifEnEdition({ ...objectifEnEdition, description: e.target.value })
                    : setNouvelObjectif({ ...nouvelObjectif, description: e.target.value })
                }
              />
            </div>
          </div>

          <div className="actions-formulaire">
            <button
              className="bouton-annuler"
              onClick={() => {
                setAfficherFormulaire(false)
                setObjectifEnEdition(null)
              }}
            >
              Annuler
            </button>
            <button className="bouton-ajouter" onClick={objectifEnEdition ? mettreAJourObjectif : ajouterObjectif}>
              {objectifEnEdition ? "Mettre à jour" : "Ajouter l'objectif"}
            </button>
          </div>
        </div>
      )}

      {/* Onglets de catégories */}
      <div className="onglets-categories">
        <button
          className={`onglet ${categorieActive === "tous" ? "actif" : ""}`}
          onClick={() => setCategorieActive("tous")}
        >
          Tous
        </button>
        <button
          className={`onglet ${categorieActive === "spirituel" ? "actif" : ""}`}
          onClick={() => setCategorieActive("spirituel")}
        >
          Spirituels
        </button>
        <button
          className={`onglet ${categorieActive === "professionnel" ? "actif" : ""}`}
          onClick={() => setCategorieActive("professionnel")}
        >
          Professionnels
        </button>
        <button
          className={`onglet ${categorieActive === "personnel" ? "actif" : ""}`}
          onClick={() => setCategorieActive("personnel")}
        >
          Personnels
        </button>
      </div>

      {/* Filtres de statut */}
      <div className="filtres-statut">
        <button
          className={`filtre-statut filtre-statut-tous ${statutActif === "tous" ? "actif" : ""}`}
          onClick={() => setStatutActif("tous")}
        >
          <FontAwesomeIcon icon={faFilter} /> Tous les statuts
        </button>
        <button
          className={`filtre-statut filtre-statut-en-attente ${statutActif === "en_attente" ? "actif" : ""}`}
          onClick={() => setStatutActif("en_attente")}
        >
          <FontAwesomeIcon icon={faClock} /> En attente
        </button>
        <button
          className={`filtre-statut filtre-statut-en-cours ${statutActif === "en_cours" ? "actif" : ""}`}
          onClick={() => setStatutActif("en_cours")}
        >
          <FontAwesomeIcon icon={faSpinner} /> En cours
        </button>
        <button
          className={`filtre-statut filtre-statut-termine ${statutActif === "termine" ? "actif" : ""}`}
          onClick={() => setStatutActif("termine")}
        >
          <FontAwesomeIcon icon={faCheckDouble} /> Terminé
        </button>
      </div>

      {/* Options d'exportation */}
      {isAuthenticated && <ExportOptions categorieActive={categorieActive} />}

      {/* Vue Tableau ou Graphiques */}
      {vueActive === "tableau" ? (
        /* Tableau des objectifs */
        <div className="conteneur-tableau">
          <table className="tableau-objectifs">
            <thead>
              <tr>
                {categorieActive === "tous" && <th>Catégorie</th>}
                <th>Objectif</th>
                <th>Statut</th>
                <th>Fréquence</th>
                <th>Type de suivi</th>
                <th>Progression du jour</th>
                <th>Commentaires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {objectifsFiltres.length === 0 ? (
                <tr>
                  <td colSpan={categorieActive === "tous" ? 8 : 7} className="aucun-objectif">
                    Aucun objectif trouvé dans cette catégorie
                  </td>
                </tr>
              ) : (
                objectifsFiltres.map((objectif) => (
                  <tr key={objectif.id}>
                    {categorieActive === "tous" && (
                      <td className="colonne-categorie">
                        <div className="categorie-avec-icone">
                          {obtenirIconeCategorie(objectif.categorie)}
                          <span>
                            {objectif.categorie === "spirituel" && "Spirituel"}
                            {objectif.categorie === "professionnel" && "Professionnel"}
                            {objectif.categorie === "personnel" && "Personnel"}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="colonne-nom">
                      <div className="nom-objectif">
                        <div>{objectif.nom}</div>
                        {objectif.description && <div className="description-objectif">{objectif.description}</div>}
                      </div>
                    </td>
                    <td>
                      <StatutObjectif
                        statut={objectif.statut || "en_attente"}
                        onChange={(statut) => mettreAJourStatut(objectif.id, statut)}
                      />
                    </td>
                    <td>{obtenirLibelleFrequence(objectif.frequence)}</td>
                    <td>{obtenirLibelleTypeTracking(objectif.typeDeTracking)}</td>
                    <td className="colonne-progression">{obtenirAffichageProgression(objectif)}</td>
                    <td className="colonne-commentaire">{obtenirAffichageCommentaire(objectif)}</td>
                    <td className="colonne-actions">
                      <div className="boutons-actions">
                        <button className="bouton-action" onClick={() => commencerEdition(objectif)}>
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button className="bouton-action" onClick={() => supprimerObjectif(objectif.id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Vue Graphiques */
        <div className="conteneur-graphiques">
          {/* Sélecteur de période */}
          <div className="selecteur-periode">
            <span>Période :</span>
            <div className="boutons-periode">
              <button
                className={`bouton-periode ${periodeGraphique === "7jours" ? "actif" : ""}`}
                onClick={() => setPeriodeGraphique("7jours")}
              >
                7 jours
              </button>
              <button
                className={`bouton-periode ${periodeGraphique === "30jours" ? "actif" : ""}`}
                onClick={() => setPeriodeGraphique("30jours")}
              >
                30 jours
              </button>
              <button
                className={`bouton-periode ${periodeGraphique === "90jours" ? "actif" : ""}`}
                onClick={() => setPeriodeGraphique("90jours")}
              >
                90 jours
              </button>
            </div>
          </div>

          {/* Cartes de statistiques */}
          <div className="cartes-statistiques">
            <div className="carte-stat">
              <div className="icone-stat">
                <FontAwesomeIcon icon={faTrophy} />
              </div>
              <div className="contenu-stat">
                <div className="valeur-stat">{statistiques.nombreTotal}</div>
                <div className="libelle-stat">Objectifs totaux</div>
              </div>
            </div>

            <div className="carte-stat">
              <div className="icone-stat">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div className="contenu-stat">
                <div className="valeur-stat">{statistiques.completesAujourdhui}</div>
                <div className="libelle-stat">Complétés aujourd'hui</div>
              </div>
            </div>

            <div className="carte-stat">
              <div className="icone-stat">
                <FontAwesomeIcon icon={faPercentage} />
              </div>
              <div className="contenu-stat">
                <div className="valeur-stat">{statistiques.tauxCompletionGlobal}%</div>
                <div className="libelle-stat">Taux de complétion</div>
              </div>
            </div>

            <div className="carte-stat">
              <div className="icone-stat">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <div className="contenu-stat">
                <div className="valeur-stat">{statistiques.meilleureSequence}</div>
                <div className="libelle-stat">Meilleure séquence</div>
              </div>
            </div>
          </div>

          {/* Graphiques */}
          <div className="grille-graphiques">
            <div className="graphique">
              <h3>
                <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                Évolution du taux de complétion
              </h3>
              <div className="conteneur-graphique">
                <Line
                  data={obtenirDonneesEvolution()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      title: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: "Taux de complétion (%)",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="graphique">
              <h3>
                <FontAwesomeIcon icon={faChartPie} className="mr-2" />
                Répartition des objectifs
              </h3>
              <div className="conteneur-graphique">
                <Pie
                  data={obtenirDonneesRepartition()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="graphique pleine-largeur">
              <h3>
                <FontAwesomeIcon icon={faChartBar} className="mr-2" />
                Performance par objectif
              </h3>
              <div className="conteneur-graphique">
                <Bar
                  data={obtenirDonneesPerformance()}
                  options={{
                    responsive: true,
                    indexAxis: "y",
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: "Taux de complétion (%)",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {objectifHistorique && (
        <HistoriqueCommentaires objectif={objectifHistorique} onClose={() => setObjectifHistorique(null)} />
      )}
    </div>
  )
}

export default Dashboard

