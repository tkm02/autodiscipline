"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import "./FinanceDashboard.css" // Importation du fichier CSS

export function FinanceCalculator() {
  // État pour le calculateur d'épargne
  const [savingsParams, setSavingsParams] = useState({
    initialAmount: 1000,
    monthlyContribution: 200,
    interestRate: 3,
    years: 5,
  })
  const [savingsResult, setSavingsResult] = useState(null)

  // État pour le calculateur de prêt
  const [loanParams, setLoanParams] = useState({
    loanAmount: 10000,
    interestRate: 5,
    years: 3,
  })
  const [loanResult, setLoanResult] = useState(null)

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

  // Gérer les changements dans les formulaires
  const handleSavingsChange = (e) => {
    const { name, value } = e.target
    setSavingsParams((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }))
  }

  const handleLoanChange = (e) => {
    const { name, value } = e.target
    setLoanParams((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }))
  }

  return (
    <Tabs defaultValue="savings" className="w-full finance-tabs">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="savings" className="text-sm finance-tab">
          Calculateur d'épargne
        </TabsTrigger>
        <TabsTrigger value="loan" className="text-sm finance-tab">
          Calculateur de prêt
        </TabsTrigger>
      </TabsList>

      <TabsContent value="savings" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="initialAmount" className="text-gray-700 dark:text-gray-300">
              Montant initial (€)
            </Label>
            <Input
              id="initialAmount"
              name="initialAmount"
              type="number"
              value={savingsParams.initialAmount}
              onChange={handleSavingsChange}
              className="border-gray-200 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500 finance-input input-focus"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyContribution" className="text-gray-700 dark:text-gray-300">
              Contribution mensuelle (€)
            </Label>
            <Input
              id="monthlyContribution"
              name="monthlyContribution"
              type="number"
              value={savingsParams.monthlyContribution}
              onChange={handleSavingsChange}
              className="border-gray-200 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500 finance-input input-focus"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate" className="text-gray-700 dark:text-gray-300">
              Taux d'intérêt annuel (%)
            </Label>
            <Input
              id="interestRate"
              name="interestRate"
              type="number"
              step="0.1"
              value={savingsParams.interestRate}
              onChange={handleSavingsChange}
              className="border-gray-200 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500 finance-input input-focus"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years" className="text-gray-700 dark:text-gray-300">
              Durée (années)
            </Label>
            <Input
              id="years"
              name="years"
              type="number"
              value={savingsParams.years}
              onChange={handleSavingsChange}
              className="border-gray-200 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500 finance-input input-focus"
            />
          </div>
        </div>

        <Button
          onClick={calculateSavings}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white finance-button calculate-button button-glow"
        >
          Calculer
        </Button>

        {savingsResult !== null && (
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30 calculator-result result-highlight">
            <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Montant futur estimé :</p>
            <div className="flex items-baseline mt-1">
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                {savingsResult.toLocaleString()}
              </p>
              <p className="ml-1 text-lg text-purple-600 dark:text-purple-500">€</p>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-500 mt-2">
              Après {savingsParams.years} ans avec un taux d'intérêt de {savingsParams.interestRate}%
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="loan" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="loanAmount" className="text-gray-700 dark:text-gray-300">
              Montant du prêt (€)
            </Label>
            <Input
              id="loanAmount"
              name="loanAmount"
              type="number"
              value={loanParams.loanAmount}
              onChange={handleLoanChange}
              className="border-gray-200 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500 finance-input input-focus"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loanInterestRate" className="text-gray-700 dark:text-gray-300">
              Taux d'intérêt annuel (%)
            </Label>
            <Input
              id="loanInterestRate"
              name="interestRate"
              type="number"
              step="0.1"
              value={loanParams.interestRate}
              onChange={handleLoanChange}
              className="border-gray-200 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500 finance-input input-focus"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loanYears" className="text-gray-700 dark:text-gray-300">
              Durée (années)
            </Label>
            <Input
              id="loanYears"
              name="years"
              type="number"
              value={loanParams.years}
              onChange={handleLoanChange}
              className="border-gray-200 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500 finance-input input-focus"
            />
          </div>
        </div>

        <Button
          onClick={calculateLoan}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white finance-button calculate-button button-glow"
        >
          Calculer
        </Button>

        {loanResult !== null && (
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30 calculator-result result-highlight">
            <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Paiement mensuel estimé :</p>
            <div className="flex items-baseline mt-1">
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">{loanResult.toLocaleString()}</p>
              <p className="ml-1 text-lg text-purple-600 dark:text-purple-500">€</p>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-500 mt-2">
              Pour un prêt de {loanParams.loanAmount.toLocaleString()}€ sur {loanParams.years} ans à{" "}
              {loanParams.interestRate}%
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

