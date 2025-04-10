import { Progress } from "../../components/ui/progress"
import "./FinanceDashboard.css" // Importation du fichier CSS

export function SavingsGoalTracker({ goalName, targetAmount, currentAmount, deadline, currency = "€" }) {
  const percentComplete = Math.min(100, Math.round((currentAmount / targetAmount) * 100))
  const remaining = targetAmount - currentAmount

  // Calculer le temps restant si une date limite est fournie
  const getTimeRemaining = () => {
    if (!deadline) return null

    const deadlineDate = new Date(deadline)
    const today = new Date()

    // Si la date est dépassée
    if (deadlineDate < today) {
      return "Date limite dépassée"
    }

    const diffTime = Math.abs(deadlineDate.getTime() - today.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return `${diffDays} jour${diffDays > 1 ? "s" : ""} restant${diffDays > 1 ? "s" : ""}`
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-white">{goalName}</h4>
          {deadline && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
              <span className={new Date(deadline) < new Date() ? "text-red-500" : "text-blue-500"}>
                {getTimeRemaining()}
              </span>
            </div>
          )}
        </div>
        <div className="finance-badge bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm font-medium px-2.5 py-0.5 rounded-full badge-pulse">
          {percentComplete}%
        </div>
      </div>

      <div className="space-y-2">
        <div className="progress-container">
          <Progress value={percentComplete} className="h-2.5 progress-gradient bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0 {currency}</span>
          <span>
            {(targetAmount / 2).toLocaleString()} {currency}
          </span>
          <span>
            {targetAmount.toLocaleString()} {currency}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="hover-lift bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Épargné</span>
          <p className="font-semibold text-gray-800 dark:text-white text-lg">
            {currentAmount.toLocaleString()} {currency}
          </p>
        </div>
        <div className="hover-lift bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Objectif</span>
          <p className="font-semibold text-gray-800 dark:text-white text-lg">
            {targetAmount.toLocaleString()} {currency}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Restant à épargner</span>
          <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
            {remaining.toLocaleString()} {currency}
          </span>
        </div>
      </div>
    </div>
  )
}

