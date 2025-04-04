"use client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilePdf, faFileExcel, faFileAlt, faDownload } from "@fortawesome/free-solid-svg-icons"
import { exportService } from "../../services/api.service"

const ExportOptions = ({ categorieActive }) => {
  return (
    <div className="options-export">
      <h3>Exporter les données</h3>
      <div className="boutons-export">
        <button
          className="bouton-export"
          onClick={() => exportService.downloadPdf()}
          title="Télécharger un rapport PDF"
        >
          <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
          Rapport PDF
        </button>

        <button
          className="bouton-export"
          onClick={() => exportService.downloadExcel()}
          title="Télécharger un rapport Excel"
        >
          <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
          Rapport Excel
        </button>

        <button
          className="bouton-export"
          onClick={() => exportService.downloadTemplate(categorieActive)}
          title="Télécharger un template à remplir au crayon"
        >
          <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
          Template à imprimer
        </button>
      </div>

      <div className="info-export">
        <FontAwesomeIcon icon={faDownload} className="mr-2" />
        <small>Les templates peuvent être imprimés et remplis au crayon pour un suivi hors ligne.</small>
      </div>
    </div>
  )
}

export default ExportOptions

