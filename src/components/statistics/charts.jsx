"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import "./statistics.css"
Chart.register(...registerables)

export function LineChart({ data }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Détruire le graphique existant s'il y en a un
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((day) => {
          const date = new Date(day.date)
          return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
        }),
        datasets: [
          {
            label: "Taux de complétion (%)",
            data: data.map((day) => day.completionRate),
            borderColor: "rgb(76, 175, 80)",
            backgroundColor: "rgba(76, 175, 80, 0.1)",
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => value + "%",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`,
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} />
}

export function BarChart({ data }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Détruire le graphique existant s'il y en a un
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const labels = {
      spiritual: "Spirituels",
      professional: "Professionnels",
      personal: "Personnels",
      finance: "Financiers",
    }

    const colors = {
      spiritual: "rgba(76, 175, 80, 0.7)",
      professional: "rgba(33, 150, 243, 0.7)",
      personal: "rgba(255, 152, 0, 0.7)",
      finance: "rgba(156, 39, 176, 0.7)",
    }

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(data).map((key) => labels[key]),
        datasets: [
          {
            label: "Taux de complétion (%)",
            data: Object.values(data),
            backgroundColor: Object.keys(data).map((key) => colors[key]),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => value + "%",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`,
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} />
}

export function PieChart({ data }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Détruire le graphique existant s'il y en a un
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const labels = {
      spiritual: "Spirituels",
      professional: "Professionnels",
      personal: "Personnels",
      finance: "Financiers",
    }

    const colors = {
      spiritual: "rgba(76, 175, 80, 0.7)",
      professional: "rgba(33, 150, 243, 0.7)",
      personal: "rgba(255, 152, 0, 0.7)",
      finance: "rgba(156, 39, 176, 0.7)",
    }

    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(data).map((key) => labels[key]),
        datasets: [
          {
            data: Object.values(data),
            backgroundColor: Object.keys(data).map((key) => colors[key]),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.parsed || 0
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} />
}
