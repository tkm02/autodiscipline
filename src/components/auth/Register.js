"use client"

import { useState } from "react"
import { authService } from "../../services/api.service"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faLock, faUser, faUserPlus, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"

const Register = ({ onRegisterSuccess }) => {
  const [userData, setUserData] = useState({
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Vérifier que les mots de passe correspondent
    if (userData.password !== userData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Envoyer uniquement les données nécessaires (sans confirmPassword)
      const { confirmPassword, ...registerData } = userData
      await authService.register(registerData)
      if (onRegisterSuccess) onRegisterSuccess()
    } catch (err) {
      setError(err.message || "Erreur d'inscription. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">Inscription</h2>

      {error && (
        <div className="auth-form-error">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="auth-form-group">
          <label className="auth-form-label">
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Nom
          </label>
          <input
            type="text"
            name="nom"
            className="auth-form-input"
            placeholder="Entrez votre nom"
            value={userData.nom}
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-form-group">
          <label className="auth-form-label">
            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
            Email
          </label>
          <input
            type="email"
            name="email"
            className="auth-form-input"
            placeholder="Entrez votre email"
            value={userData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="auth-form-group">
          <label className="auth-form-label">
            <FontAwesomeIcon icon={faLock} className="mr-2" />
            Mot de passe
          </label>
          <input
            type="password"
            name="password"
            className="auth-form-input"
            placeholder="Entrez votre mot de passe"
            value={userData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>

        <div className="auth-form-group">
          <label className="auth-form-label">
            <FontAwesomeIcon icon={faLock} className="mr-2" />
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            name="confirmPassword"
            className="auth-form-input"
            placeholder="Confirmez votre mot de passe"
            value={userData.confirmPassword}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>

        <button type="submit" className="auth-form-button" disabled={loading}>
          {loading ? (
            <>
              <div
                className="spinner"
                style={{ width: "20px", height: "20px", marginRight: "10px", borderWidth: "2px" }}
              ></div>
              Inscription en cours...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
              S'inscrire
            </>
          )}
        </button>
      </form>

      <div className="auth-form-footer">
        <p>Vous avez déjà un compte ? Connectez-vous.</p>
      </div>
    </div>
  )
}

export default Register

