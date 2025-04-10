"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../../services/api.service"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faLock, faSignInAlt } from "@fortawesome/free-solid-svg-icons"

const Login = () => {
  const navigate = useNavigate()

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await authService.login(credentials)
      navigate("/dashboard")
    } catch (err) {
      setError(err.message || "Identifiants invalides. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">Connexion</h2>

      {error && (
        <div className="auth-form-error">
          <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
            value={credentials.email}
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
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="auth-form-button" disabled={loading}>
          {loading ? (
            <>
              <div
                className="spinner"
                style={{ width: "20px", height: "20px", marginRight: "10px", borderWidth: "2px" }}
              ></div>
              Connexion en cours...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
              Se connecter
            </>
          )}
        </button>
      </form>

      <div className="auth-form-footer">
        <p>Vous n'avez pas de compte ? Inscrivez-vous maintenant.</p>
      </div>
    </div>
  )
}

export default Login

