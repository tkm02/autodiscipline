"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import "./Dashboard.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faEye,
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
  faClock,
  faSpinner,
  faCheckDouble,
  faFilter,
  faCheckCircle,
  faTimesCircle,
  faMoneyBillWave, // Ajout de l'icône pour la finance
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

// Enregistrer les composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title)

const Dashboard = ({ theme }) => {
  const navigate = useNavigate()

  // États pour gérer les objectifs et le formulaire
  const [objectifs, setObjectifs] = useState([])
  const [categorieActive, setCategorieActive] = useState("tous")
  const [statutActif, setStatutActif] = useState("tous")
  const [vueActive, setVueActive] = useState("tableau") // 'tableau' ou 'graphiques'
  const [periodeGraphique, setPeriodeGraphique] = useState("7jours") // '7jours', '30jours', '90jours'

  // États pour l'authentification
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState("login") // 'login' ou 'register'
  const [loading, setLoading] = useState(true)

  // Vérifier l'authentification au chargement
  const checkAuth = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser()
        console.log("userData", userData);
        
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
    // Charger les exemples d'objectifs
    setObjectifs(obtenirExemplesObjectifs())
  }

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
          {
            id: "finance1",
            nom: "Économiser pour les vacances",
            categorie: "finance",
            typeDeTracking: "numerique",
            frequence: "mensuel",
            cible: 1200,
            description: "Montant économisé pour les vacances d'été",
            statut: "en_cours",
            progression: { [dateStr]: Math.random() * 200 + 50 },
            commentaires: {},
          },
          {
            id: "finance2",
            nom: "Réduire les dépenses alimentaires",
            categorie: "finance",
            typeDeTracking: "numerique",
            frequence: "hebdomadaire",
            cible: 80,
            description: "Budget courses hebdomadaire",
            statut: "en_cours",
            progression: { [dateStr]: Math.random() * 30 + 60 },
            commentaires: {},
          },
          {
            id: "finance3",
            nom: "Investissement mensuel",
            categorie: "finance",
            typeDeTracking: "numerique",
            frequence: "mensuel",
            cible: 300,
            description: "Montant investi chaque mois",
            statut: "en_cours",
            progression: { [dateStr]: Math.random() * 100 + 200 },
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
            } else if (obj.categorie === "finance") {
              if (obj.nom.includes("Économiser")) {
                obj.progression[dateStr] = Math.random() * 200 + 50
              } else if (obj.nom.includes("dépenses")) {
                obj.progression[dateStr] = Math.random() * 30 + 60
              } else if (obj.nom.includes("Investissement")) {
                obj.progression[dateStr] = Math.random() * 100 + 200
              } else {
                obj.progression[dateStr] = Math.random() * 50 + 50
              }
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

  // Fonction pour supprimer un objectif
  const supprimerObjectif = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet objectif ?")) {
      try {
        if (isAuthenticated) {
          await objectifService.deleteObjectif(id)
        }
        // Supprimer localement
        const objectifsFiltres = objectifs.filter((obj) => obj.id !== id)
        setObjectifs(objectifsFiltres)
      } catch (error) {
        console.error("Erreur lors de la suppression de l'objectif:", error)
      }
    }
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
      case "finance":
        return <FontAwesomeIcon icon={faMoneyBillWave} className="icone-categorie finance" />
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

  // Fonction pour obtenir le libellé de statut
  const obtenirLibelleStatut = (statut) => {
    switch (statut) {
      case "en_attente":
        return "En attente"
      case "en_cours":
        return "En cours"
      case "termine":
        return "Terminé"
      default:
        return "En attente"
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
      finance: objectifs.filter((obj) => obj.categorie === "finance"),
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
      finance: "rgba(103, 58, 183, 0.7)",
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
          categorie === "spirituel"
            ? "Spirituels"
            : categorie === "professionnel"
              ? "Professionnels"
              : categorie === "personnel"
                ? "Personnels"
                : "Finances",
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
      Finances: objectifs.filter((obj) => obj.categorie === "finance").length,
    }

    return {
      labels: Object.keys(nombreObjectifsParCategorie),
      datasets: [
        {
          data: Object.values(nombreObjectifsParCategorie),
          backgroundColor: [
            "rgba(76, 175, 80, 0.7)",
            "rgba(33, 150, 243, 0.7)",
            "rgba(255, 152, 0, 0.7)",
            "rgba(103, 58, 183, 0.7)", // Couleur pour la finance
          ],
          borderColor: [
            "rgba(76, 175, 80, 1)",
            "rgba(33, 150, 243, 1)",
            "rgba(255, 152, 0, 1)",
            "rgba(103, 58, 183, 1)", // Couleur pour la finance
          ],
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
                      : objectif.categorie === "personnel"
                        ? "rgba(255, 152, 0, 0.7)"
                        : "rgba(103, 58, 183, 0.7)" // Couleur pour la finance
                })
              : categorieActive === "spirituel"
                ? "rgba(76, 175, 80, 0.7)"
                : categorieActive === "professionnel"
                  ? "rgba(33, 150, 243, 0.7)"
                  : categorieActive === "personnel"
                    ? "rgba(255, 152, 0, 0.7)"
                    : "rgba(103, 58, 183, 0.7)", // Couleur pour la finance
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
    // console.log(objectifs);

    const objectifEnCours = objectifs.filter((obj) => obj.statut === "en_cours");
    console.log(objectifEnCours);
    
    
    const nombreTotal = objectifEnCours.length

    // Objectifs complétés aujourd'hui
    let completesAujourdhui = 0
    objectifEnCours.forEach((obj) => {
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
    // je dois revvoir la logique de calcul du taux de complétion global
    // console.log(objectifs);
    objectifEnCours.forEach((obj) => {
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
      <div className="dashboard">
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
    <div className="dashboard">
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
  <button
    className="bouton-vue"
    onClick={() => navigate("/statistics")}
  >
    <FontAwesomeIcon icon={faChartBar} className="mr-2" />
    Statistiques avancées
  </button>
</div>
          <button className="bouton-ajouter" onClick={() => navigate("/objectif/ajouter")}>
            <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
            Ajouter un objectif
          </button>
        </div>
      </div>

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
        <button
          className={`onglet ${categorieActive === "finance" ? "actif" : ""}`}
          onClick={() => setCategorieActive("finance")}
        >
          Finances
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
        /* Tableau des objectifs simplifié */
        <div className="conteneur-tableau">
          <table className="tableau-objectifs">
            <thead>
              <tr>
                {categorieActive === "tous" && <th>Catégorie</th>}
                <th>Objectif</th>
                <th>Fréquence</th>
                <th>Type de suivi</th>
                <th>Progression du jour</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {objectifsFiltres.length === 0 ? (
                <tr>
                  <td colSpan={categorieActive === "tous" ? 7 : 6} className="aucun-objectif">
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
                            {objectif.categorie === "finance" && "Finance"}
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
                      {objectif.frequence === "quotidien" && "Quotidien"}
                      {objectif.frequence === "hebdomadaire" && "Hebdomadaire"}
                      {objectif.frequence === "mensuel" && "Mensuel"}
                    </td>
                    <td>
                      {objectif.typeDeTracking === "binaire" && "Binaire (✅/❌)"}
                      {objectif.typeDeTracking === "compteur" && "Compteur"}
                      {objectif.typeDeTracking === "numerique" && "Valeur numérique"}
                    </td>
                    <td className="colonne-progression">
                      {objectif.statut === "en_cours" && (
                        <>
                          {objectif.typeDeTracking === "binaire" ? (
                            <button
                              className="bouton-statut"
                              onClick={() => {
                                // Logique pour basculer la complétion
                                const aujourdhui = new Date().toISOString().split("T")[0]
                                const isCompleted = objectif.progression[aujourdhui] === true

                                // Mettre à jour localement
                                const updatedObjectifs = [...objectifs]
                                const index = updatedObjectifs.findIndex((obj) => obj.id === objectif.id)
                                if (index !== -1) {
                                  updatedObjectifs[index] = {
                                    ...updatedObjectifs[index],
                                    progression: {
                                      ...updatedObjectifs[index].progression,
                                      [aujourdhui]: !isCompleted,
                                    },
                                  }
                                  setObjectifs(updatedObjectifs)

                                  // Si authentifié, mettre à jour via l'API
                                  if (isAuthenticated) {
                                    objectifService.updateProgression(objectif.id, aujourdhui, !isCompleted)
                                  } else {
                                    // En mode démo, mettre à jour dans le localStorage
                                    localStorage.setItem("objectifs", JSON.stringify(updatedObjectifs))
                                  }
                                }
                              }}
                            >
                              {objectif.progression[new Date().toISOString().split("T")[0]] === true ? (
                                <FontAwesomeIcon icon={faCheckCircle} className="icone-check" />
                              ) : (
                                <FontAwesomeIcon icon={faTimesCircle} className="icone-times" />
                              )}
                              {objectif.progression[new Date().toISOString().split("T")[0]] === true
                                ? "Complété"
                                : "Non complété"}
                            </button>
                          ) : (
                            <div className="progression-numerique">
                              <input
                                type="number"
                                className="input-progression"
                                placeholder={objectif.progression[new Date().toISOString().split("T")[0]] || "0"}
                                id={`progression-${objectif.id}`}
                              />
                              <button
                                className="bouton-enregistrer"
                                onClick={() => {
                                  const aujourdhui = new Date().toISOString().split("T")[0]
                                  const input = document.getElementById(`progression-${objectif.id}`)
                                  const value = input.value

                                  if (!value) return

                                  const numericValue =
                                    objectif.typeDeTracking === "compteur"
                                      ? Number.parseInt(value, 10)
                                      : Number.parseFloat(value)

                                  // Mettre à jour localement
                                  const updatedObjectifs = [...objectifs]
                                  const index = updatedObjectifs.findIndex((obj) => obj.id === objectif.id)
                                  if (index !== -1) {
                                    updatedObjectifs[index] = {
                                      ...updatedObjectifs[index],
                                      progression: {
                                        ...updatedObjectifs[index].progression,
                                        [aujourdhui]: numericValue,
                                      },
                                    }
                                    setObjectifs(updatedObjectifs)

                                    // Si authentifié, mettre à jour via l'API
                                    if (isAuthenticated) {
                                      objectifService.updateProgression(objectif.id, aujourdhui, numericValue)
                                    } else {
                                      // En mode démo, mettre à jour dans le localStorage
                                      localStorage.setItem("objectifs", JSON.stringify(updatedObjectifs))
                                    }

                                    // Vider l'input
                                    input.value = ""
                                  }
                                }}
                              >
                                Enregistrer
                              </button>
                              <span className="valeur-actuelle">
                                {objectif.progression[new Date().toISOString().split("T")[0]]
                                  ? `Actuel: ${objectif.progression[new Date().toISOString().split("T")[0]]}`
                                  : "Non suivi"}
                                {objectif.cible ? ` / Cible: ${objectif.cible}` : ""}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {objectif.statut !== "en_cours" && <span className="text-muted-foreground">Non disponible</span>}
                    </td>
                    <td className="colonne-statut">
                      <div className={`badge-statut statut-${objectif.statut || "en_attente"}`}>
                        {obtenirIconeStatut(objectif.statut || "en_attente")}
                        <span>{obtenirLibelleStatut(objectif.statut || "en_attente")}</span>
                      </div>
                    </td>
                    <td className="colonne-actions">
                      <div className="boutons-actions">
                        <button
                          className="bouton-action"
                          onClick={() => navigate(`/objectif/${objectif.id}`)}
                          title="Voir les détails"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          className="bouton-action"
                          onClick={() => navigate(`/objectif/${objectif.id}/modifier`)}
                          title="Modifier"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="bouton-action"
                          onClick={() => supprimerObjectif(objectif.id)}
                          title="Supprimer"
                        >
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
    </div>
  )
}

export default Dashboard

