import { Progress } from "../../components/ui/progress"
import "./FinanceDashboard.css" // Importation du fichier CSS

export function BudgetSummary({ totalBudget, spentAmount, currency = "€" }) {
  const percentSpent = Math.min(100, Math.round((spentAmount / totalBudget) * 100))
  const remaining = totalBudget - spentAmount

  // Déterminer la couleur en fonction du pourcentage dépensé
  const getProgressColor = () => {
    if (percentSpent > 90) return "bg-red-500"
    if (percentSpent > 75) return "bg-orange-500"
    if (percentSpent > 50) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget total</span>
        <span className="font-semibold text-gray-800 dark:text-white">
          {totalBudget.toLocaleString()} {currency}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Dépensé</span>
          <span className="font-semibold text-gray-800 dark:text-white">
            {spentAmount.toLocaleString()} {currency}
          </span>
        </div>
        <div className="relative pt-1 progress-container">
          <Progress value={percentSpent} className={`h-2 progress-gradient ${getProgressColor()}`} />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Restant</span>
        <span className={`font-bold text-lg ${remaining < 0 ? "text-red-500" : "text-green-500"}`}>
          {remaining.toLocaleString()} {currency}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="stat-highlight bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Dépensé</p>
          <p className="font-semibold text-gray-800 dark:text-white">{percentSpent}%</p>
        </div>
        <div className="stat-highlight bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Restant</p>
          <p className="font-semibold text-gray-800 dark:text-white">{100 - percentSpent}%</p>
        </div>
        <div className="stat-highlight bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Jours</p>
          <p className="font-semibold text-gray-800 dark:text-white">
            {new Date().getDate()}/{new Date().getDate() + 1}
          </p>
        </div>
      </div>
    </div>
  )
}

