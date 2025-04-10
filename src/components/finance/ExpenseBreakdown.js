import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import "./FinanceDashboard.css" // Importation du fichier CSS

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(ArcElement, Tooltip, Legend)

export function ExpenseBreakdown({ categories, currency = "€" }) {
  // Calculer le total des dépenses
  const totalExpenses = categories.reduce((sum, category) => sum + category.amount, 0)

  // Préparer les données pour le graphique
  const chartData = {
    labels: categories.map((cat) => cat.name),
    datasets: [
      {
        data: categories.map((cat) => cat.amount),
        backgroundColor: categories.map((cat) => cat.color),
        borderColor: categories.map((cat) => cat.color),
        borderWidth: 1,
      },
    ],
  }

  // Options du graphique
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 12,
          },
          color: "#6B7280",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw
            const percentage = Math.round((value / totalExpenses) * 100)
            return `${value.toLocaleString()} ${currency} (${percentage}%)`
          },
        },
        backgroundColor: "rgba(17, 24, 39, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        bodySpacing: 4,
        boxPadding: 4,
      },
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 chart-zoom">
        <div className="h-64 lg:h-80">
          <Pie data={chartData} options={chartOptions} />
        </div>
      </div>
      <div className="space-y-4">
        <div className="hover-lift bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total des dépenses</h4>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {totalExpenses.toLocaleString()} {currency}
          </p>
        </div>

        <div className="hover-lift bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Détail des dépenses</h4>
          </div>
          <div className="p-3 space-y-3 max-h-60 overflow-y-auto">
            {categories.map((category, index) => (
              <div key={index} className="flex justify-between items-center table-row-highlight p-1 rounded">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                </div>
                <div className="text-sm font-medium text-gray-800 dark:text-white">
                  {category.amount.toLocaleString()} {currency}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total</span>
              <span className="font-bold text-gray-800 dark:text-white">
                {totalExpenses.toLocaleString()} {currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

