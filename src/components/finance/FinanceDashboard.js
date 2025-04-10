"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../finance/FinanceDashboard.css"
import { financeService } from "../../services/api.service"

export function FinanceDashboard() {
  const navigate = useNavigate()

  // États pour les données
  const [finances, setFinances] = useState([])
  const [stats, setStats] = useState({
    revenus: 0,
    depenses: 0,
    epargne: 0,
    investissements: 0,
    depensesParCategorie: [],
    evolution: [],
  })
  const [parametres, setParametres] = useState({
    deviseParDefaut: "FCFA",
    theme: "light",
  })

  // États pour le formulaire
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState("add") // 'add' ou 'edit'
  const [currentFinance, setCurrentFinance] = useState(null)
  const [formData, setFormData] = useState({
    nom: "",
    type: "depense",
    montant: "",
    devise: "FCFA",
    date: new Date().toISOString().split("T")[0],
    categorie: "",
    description: "",
    recurrent: false,
    frequence: "mensuel",
  })

  // États pour les calculateurs
  const [activeTab, setActiveTab] = useState("savings")
  const [savingsParams, setSavingsParams] = useState({
    initialAmount: 1000,
    monthlyContribution: 200,
    interestRate: 3,
    years: 5,
  })
  const [savingsResult, setSavingsResult] = useState(null)
  const [loanParams, setLoanParams] = useState({
    loanAmount: 10000,
    interestRate: 5,
    years: 3,
  })
  const [loanResult, setLoanResult] = useState(null)

  // États pour le chargement
  const [loading, setLoading] = useState(true)

  // Charger les données au chargement du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Charger les finances
        const financesResponse = await financeService.getFinances()
        setFinances(financesResponse.data)

        // Charger les statistiques
        const statsResponse = await financeService.getFinanceStats()
        setStats(statsResponse.data)

        // Charger les paramètres
        const parametresResponse = await financeService.getParametres()
        setParametres(parametresResponse.data)

        setLoading(false)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Gérer les changements dans le formulaire
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (formMode === "add") {
        await financeService.createFinance(formData)
      } else {
        await financeService.updateFinance(currentFinance.id, formData)
      }

      // Recharger les données
      const financesResponse = await financeService.getFinances()
      setFinances(financesResponse.data)

      const statsResponse = await financeService.getFinanceStats()
      setStats(statsResponse.data)

      // Réinitialiser le formulaire
      setShowForm(false)
      setFormData({
        nom: "",
        type: "depense",
        montant: "",
        devise: parametres.deviseParDefaut,
        date: new Date().toISOString().split("T")[0],
        categorie: "",
        description: "",
        recurrent: false,
        frequence: "mensuel",
      })
      setCurrentFinance(null)
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error)
    }
  }

  // Modifier une finance
  const handleEdit = (finance) => {
    setCurrentFinance(finance)
    setFormData({
      nom: finance.nom,
      type: finance.type,
      montant: finance.montant,
      devise: finance.devise,
      date: new Date(finance.date).toISOString().split("T")[0],
      categorie: finance.categorie || "",
      description: finance.description || "",
      recurrent: finance.recurrent,
      frequence: finance.frequence || "mensuel",
    })
    setFormMode("edit")
    setShowForm(true)
  }

  // Supprimer une finance
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette finance ?")) {
      try {
        await financeService.deleteFinance(id)

        // Recharger les données
        const financesResponse = await financeService.getFinances()
        setFinances(financesResponse.data)

        const statsResponse = await financeService.getFinanceStats()
        setStats(statsResponse.data)
      } catch (error) {
        console.error("Erreur lors de la suppression de la finance:", error)
      }
    }
  }

  // Mettre à jour les paramètres
  const handleParametresChange = async (e) => {
    const { name, value } = e.target

    try {
      const updatedParametres = {
        ...parametres,
        [name]: value,
      }

      await financeService.updateParametres(updatedParametres)
      setParametres(updatedParametres)
    } catch (error) {
      console.error("Erreur lors de la mise à jour des paramètres:", error)
    }
  }

  // Calculer l'épargne future
  const calculateSavings = () => {
    const { initialAmount, monthlyContribution, interestRate, years } = savingsParams
    const monthlyRate = interestRate / 100 / 12
    const months = years * 12

    let futureValue = initialAmount

    for (let i = 0; i < months; i++) {
      futureValue = futureValue * (1 + monthlyRate) + monthlyContribution
    }

    setSavingsResult(Math.round(futureValue))
  }

  // Calculer le paiement mensuel d'un prêt
  const calculateLoan = () => {
    const { loanAmount, interestRate, years } = loanParams
    const monthlyRate = interestRate / 100 / 12
    const months = years * 12

    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)

    setLoanResult(Math.round(monthlyPayment))
  }

  // Gérer les changements dans les formulaires des calculateurs
  const handleSavingsChange = (e) => {
    const { name, value } = e.target
    setSavingsParams((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }))
  }

  const handleLoanChange = (e) => {
    const { name, value } = e.target
    setLoanParams((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }))
  }

  // Formater les montants avec la devise
  const formatMontant = (montant, devise = parametres.deviseParDefaut) => {
    return `${montant.toLocaleString()} ${devise}`
  }

  // Formater les dates
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
  }

  // Si en cours de chargement, afficher un indicateur
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Chargement du tableau de bord financier...</p>
      </div>
    )
  }

  return (
    <div className="finance-dashboard">
      {/* En-tête du tableau de bord */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span className="icon">💵</span>
          <div>
            <h2>Tableau de bord financier</h2>
            <p className="dashboard-subtitle">Gérez vos finances et suivez vos objectifs d'épargne</p>
          </div>
        </div>
        <div className="date-selector">
          <span className="icon">📅</span>
          <span>{new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>
        </div>
      </div>

      {/* Paramètres */}
      <div className="settings-container">
        <h3 className="settings-title">Paramètres</h3>
        <div className="settings-form">
          <div className="form-group">
            <label className="form-label">Devise par défaut</label>
            <select
              name="deviseParDefaut"
              value={parametres.deviseParDefaut}
              onChange={handleParametresChange}
              className="form-input"
            >
              <option value="FCFA">FCFA</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Thème</label>
            <select name="theme" value={parametres.theme} onChange={handleParametresChange} className="form-input">
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-title">Revenus</div>
              <div className="stat-value">{formatMontant(stats.revenus)}</div>
            </div>
            <div className="stat-icon">💰</div>
          </div>
          <div className="stat-footer">
            <span className="stat-change positive">+5%</span>
            <span className="stat-description">Par rapport au mois dernier</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-title">Dépenses</div>
              <div className="stat-value">{formatMontant(stats.depenses)}</div>
            </div>
            <div className="stat-icon">💳</div>
          </div>
          <div className="stat-footer">
            <span className="stat-change negative">-3%</span>
            <span className="stat-description">Par rapport au mois dernier</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-title">Épargne</div>
              <div className="stat-value">{formatMontant(stats.epargne)}</div>
            </div>
            <div className="stat-icon">🐖</div>
          </div>
          <div className="stat-footer">
            <span className="stat-change positive">+12%</span>
            <span className="stat-description">Par rapport au mois dernier</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div>
              <div className="stat-title">Investissements</div>
              <div className="stat-value">{formatMontant(stats.investissements)}</div>
            </div>
            <div className="stat-icon">📈</div>
          </div>
          <div className="stat-footer">
            <span className="stat-change positive">+8%</span>
            <span className="stat-description">Par rapport au mois dernier</span>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <div className="finance-form-container">
          <h3 className="finance-form-title">
            {formMode === "add" ? "Ajouter une nouvelle transaction" : "Modifier la transaction"}
          </h3>
          <form onSubmit={handleSubmit} className="finance-form">
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleFormChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select name="type" value={formData.type} onChange={handleFormChange} className="form-input" required>
                <option value="revenu">Revenu</option>
                <option value="depense">Dépense</option>
                <option value="epargne">Épargne</option>
                <option value="investissement">Investissement</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Montant</label>
              <input
                type="number"
                name="montant"
                value={formData.montant}
                onChange={handleFormChange}
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Devise</label>
              <select name="devise" value={formData.devise} onChange={handleFormChange} className="form-input">
                <option value="FCFA">FCFA</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Catégorie</label>
              <input
                type="text"
                name="categorie"
                value={formData.categorie}
                onChange={handleFormChange}
                className="form-input"
                placeholder="Ex: Alimentation, Transport, etc."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="form-input"
                rows="3"
              ></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">
                <input type="checkbox" name="recurrent" checked={formData.recurrent} onChange={handleFormChange} />
                Transaction récurrente
              </label>
            </div>
            {formData.recurrent && (
              <div className="form-group">
                <label className="form-label">Fréquence</label>
                <select name="frequence" value={formData.frequence} onChange={handleFormChange} className="form-input">
                  <option value="quotidien">Quotidienne</option>
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="mensuel">Mensuelle</option>
                  <option value="trimestriel">Trimestrielle</option>
                  <option value="annuel">Annuelle</option>
                </select>
              </div>
            )}
            <div className="form-buttons">
              <button
                type="button"
                className="button-cancel"
                onClick={() => {
                  setShowForm(false)
                  setCurrentFinance(null)
                  setFormData({
                    nom: "",
                    type: "depense",
                    montant: "",
                    devise: parametres.deviseParDefaut,
                    date: new Date().toISOString().split("T")[0],
                    categorie: "",
                    description: "",
                    recurrent: false,
                    frequence: "mensuel",
                  })
                }}
              >
                Annuler
              </button>
              <button type="submit" className="button-submit">
                {formMode === "add" ? "Ajouter" : "Mettre à jour"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des finances */}
      <div className="finances-list-container">
        <div className="finances-list-header">
          <h3 className="finances-list-title">Transactions récentes</h3>
          <div className="finances-list-actions">
            <button
              className="button-add"
              onClick={() => {
                setFormMode("add")
                setFormData({
                  ...formData,
                  devise: parametres.deviseParDefaut,
                })
                setShowForm(true)
              }}
            >
              + Ajouter une transaction
            </button>
          </div>
        </div>
        <table className="finances-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Montant</th>
              <th>Date</th>
              <th>Catégorie</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {finances.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  Aucune transaction trouvée. Ajoutez votre première transaction !
                </td>
              </tr>
            ) : (
              finances.map((finance) => (
                <tr key={finance.id}>
                  <td>{finance.nom}</td>
                  <td>
                    <span className={`finance-type ${finance.type}`}>
                      {finance.type === "revenu" && "Revenu"}
                      {finance.type === "depense" && "Dépense"}
                      {finance.type === "epargne" && "Épargne"}
                      {finance.type === "investissement" && "Investissement"}
                    </span>
                  </td>
                  <td>{formatMontant(finance.montant, finance.devise)}</td>
                  <td>{formatDate(finance.date)}</td>
                  <td>{finance.categorie || "-"}</td>
                  <td>
                    <div className="finance-actions">
                      <button className="action-button edit" onClick={() => handleEdit(finance)} title="Modifier">
                        ✏️
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() => handleDelete(finance.id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Finance Calculator */}
      <div className="finance-card">
        <div className="card-header">
          <span className="icon">🧮</span>
          <h3 className="card-title">Calculateurs financiers</h3>
        </div>
        <div className="card-content">
          <div className="calculator-tabs">
            <button
              className={`calculator-tab ${activeTab === "savings" ? "active" : ""}`}
              onClick={() => setActiveTab("savings")}
            >
              Calculateur d'épargne
            </button>
            <button
              className={`calculator-tab ${activeTab === "loan" ? "active" : ""}`}
              onClick={() => setActiveTab("loan")}
            >
              Calculateur de prêt
            </button>
          </div>

          <div className={`calculator-content ${activeTab === "savings" ? "active" : ""}`}>
            <div className="calculator-form">
              <div className="form-group">
                <label className="form-label">Montant initial ({parametres.deviseParDefaut})</label>
                <input
                  type="number"
                  name="initialAmount"
                  value={savingsParams.initialAmount}
                  onChange={handleSavingsChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contribution mensuelle ({parametres.deviseParDefaut})</label>
                <input
                  type="number"
                  name="monthlyContribution"
                  value={savingsParams.monthlyContribution}
                  onChange={handleSavingsChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Taux d'intérêt annuel (%)</label>
                <input
                  type="number"
                  name="interestRate"
                  step="0.1"
                  value={savingsParams.interestRate}
                  onChange={handleSavingsChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Durée (années)</label>
                <input
                  type="number"
                  name="years"
                  value={savingsParams.years}
                  onChange={handleSavingsChange}
                  className="form-input"
                />
              </div>
            </div>

            <button onClick={calculateSavings} className="calculator-button">
              Calculer
            </button>

            {savingsResult !== null && (
              <div className="calculator-result">
                <div className="result-label">Montant futur estimé :</div>
                <div className="result-value">
                  <span className="result-amount">{savingsResult.toLocaleString()}</span>
                  <span className="result-currency">{parametres.deviseParDefaut}</span>
                </div>
                <div className="result-description">
                  Après {savingsParams.years} ans avec un taux d'intérêt de {savingsParams.interestRate}%
                </div>
              </div>
            )}
          </div>

          <div className={`calculator-content ${activeTab === "loan" ? "active" : ""}`}>
            <div className="calculator-form">
              <div className="form-group">
                <label className="form-label">Montant du prêt ({parametres.deviseParDefaut})</label>
                <input
                  type="number"
                  name="loanAmount"
                  value={loanParams.loanAmount}
                  onChange={handleLoanChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Taux d'intérêt annuel (%)</label>
                <input
                  type="number"
                  name="interestRate"
                  step="0.1"
                  value={loanParams.interestRate}
                  onChange={handleLoanChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Durée (années)</label>
                <input
                  type="number"
                  name="years"
                  value={loanParams.years}
                  onChange={handleLoanChange}
                  className="form-input"
                />
              </div>
            </div>

            <button onClick={calculateLoan} className="calculator-button">
              Calculer
            </button>

            {loanResult !== null && (
              <div className="calculator-result">
                <div className="result-label">Paiement mensuel estimé :</div>
                <div className="result-value">
                  <span className="result-amount">{loanResult.toLocaleString()}</span>
                  <span className="result-currency">{parametres.deviseParDefaut}</span>
                </div>
                <div className="result-description">
                  Pour un prêt de {loanParams.loanAmount.toLocaleString()} {parametres.deviseParDefaut} sur{" "}
                  {loanParams.years} ans à {loanParams.interestRate}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Tips */}
      <div className="advice-section">
        <h3 className="advice-title">Conseils financiers</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4 className="tip-title">Règle des 50/30/20</h4>
            <p className="tip-description">
              Allouez 50% de votre budget aux besoins, 30% aux envies et 20% à l'épargne pour une gestion financière
              équilibrée.
            </p>
          </div>
          <div className="tip-card">
            <h4 className="tip-title">Fonds d'urgence</h4>
            <p className="tip-description">
              Essayez de constituer un fonds d'urgence couvrant 3 à 6 mois de dépenses pour faire face aux imprévus.
            </p>
          </div>
        </div>
      </div>

      {/* Lien vers le tableau de bord des objectifs */}
      <div className="finance-card">
        <div className="card-header">
          <span className="icon">🎯</span>
          <h3 className="card-title">Objectifs financiers</h3>
        </div>
        <div className="card-content" style={{ textAlign: "center", padding: "20px" }}>
          <p>Suivez vos objectifs financiers dans le tableau de bord des objectifs.</p>
          <button className="calculator-button" style={{ marginTop: "15px" }} onClick={() => navigate("/dashboard")}>
            Aller au tableau de bord des objectifs
          </button>
        </div>
      </div>
    </div>
  )
}

export default FinanceDashboard

