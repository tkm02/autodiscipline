import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClock, faSpinner, faCheckDouble } from "@fortawesome/free-solid-svg-icons"

const StatutObjectif = ({ statut, onChange }) => {
  const getStatutInfo = (statut) => {
    switch (statut) {
      case "en_attente":
        return {
          label: "En attente",
          icon: faClock,
          className: "statut-en-attente",
        }
      case "en_cours":
        return {
          label: "En cours",
          icon: faSpinner,
          className: "statut-en-cours",
        }
      case "termine":
        return {
          label: "Terminé",
          icon: faCheckDouble,
          className: "statut-termine",
        }
      default:
        return {
          label: "En attente",
          icon: faClock,
          className: "statut-en-attente",
        }
    }
  }

  const statutInfo = getStatutInfo(statut)

  return (
    <div className="selecteur-statut">
      <div className={`statut-actuel ${statutInfo.className}`}>
        <FontAwesomeIcon icon={statutInfo.icon} />
        <span>{statutInfo.label}</span>
      </div>
      <select
        value={statut}
        onChange={(e) => onChange(e.target.value)}
        className="select-statut"
      >
        <option value="en_attente">En attente</option>
        <option value="en_cours">En cours</option>
        <option value="termine">Terminé</option>
      </select>
    </div>
  )
}

export default StatutObjectif
