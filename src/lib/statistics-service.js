import { getObjectives } from "./objectives-service"

// Fonction pour obtenir les statistiques globales
export const getGlobalStats = () => {
  const objectives = getObjectives().filter((obj) => obj.status === "en_cours")
  const today = new Date().toISOString().split("T")[0]

  // Nombre total d'objectifs
  const totalObjectives = objectives.length

  // Objectifs complétés aujourd'hui
  const completedToday = objectives.filter((obj) => {
    const todayProgress = obj.progress[today]
    return obj.trackingType === "binary"
      ? todayProgress === true
      : typeof todayProgress === "number" && todayProgress > 0
  }).length

  // Objectifs en cours
  const inProgressObjectives = objectives.length

  // Taux de complétion global
  let totalDaysTracked = 0
  let totalDaysCompleted = 0

  objectives.forEach((obj) => {
    Object.entries(obj.progress).forEach(([_, value]) => {
      totalDaysTracked++
      if (obj.trackingType === "binary") {
        if (value === true) totalDaysCompleted++
      } else if (typeof value === "number" && value > 0) {
        totalDaysCompleted++
      }
    })
  })

  const completionRate = totalDaysTracked > 0 ? (totalDaysCompleted / totalDaysTracked) * 100 : 0

  // Séquence actuelle et meilleure séquence
  const { currentStreak, bestStreak } = calculateStreaks(objectives)

  // Distribution par catégorie
  const categoriesDistribution = {
    spiritual: 0,
    professional: 0,
    personal: 0,
    finance: 0,
  }

  objectives.forEach((obj) => {
    categoriesDistribution[obj.category]++
  })

  // Taux de complétion par catégorie
  const categoryCompletionRates = {
    spiritual: 0,
    professional: 0,
    personal: 0,
    finance: 0,
  }

  const categoriesStats = getCategoriesStats()
  Object.entries(categoriesStats).forEach(([category, stats]) => {
    categoryCompletionRates[category] = stats.completionRate
  })

  return {
    totalObjectives,
    completedToday,
    inProgressObjectives,
    completionRate,
    streakDays: currentStreak,
    bestStreak,
    categoriesDistribution,
    categoryCompletionRates,
  }
}

// Fonction pour obtenir les statistiques par catégorie
export const getCategoriesStats = () => {
  const categories = ["spiritual", "professional", "personal", "finance"]
  const result = {}

  categories.forEach((category) => {
    result[category] = getCategoryStats(category)
  })

  return result
}

// Fonction pour obtenir les statistiques d'une catégorie spécifique
export const getCategoryStats = (category) => {
  const objectives = getObjectives().filter((obj) => obj.category === category && obj.status === "en_cours")
  const today = new Date().toISOString().split("T")[0]

  // Nombre total d'objectifs dans la catégorie
  const totalObjectives = objectives.length

  // Objectifs complétés aujourd'hui
  const completedToday = objectives.filter((obj) => {
    const todayProgress = obj.progress[today]
    return obj.trackingType === "binary"
      ? todayProgress === true
      : typeof todayProgress === "number" && todayProgress > 0
  }).length

  // Objectifs en cours
  const inProgressObjectives = objectives.length

  // Taux de complétion
  let totalDaysTracked = 0
  let totalDaysCompleted = 0

  objectives.forEach((obj) => {
    Object.entries(obj.progress).forEach(([_, value]) => {
      totalDaysTracked++
      if (obj.trackingType === "binary") {
        if (value === true) totalDaysCompleted++
      } else if (typeof value === "number" && value > 0) {
        totalDaysCompleted++
      }
    })
  })

  const completionRate = totalDaysTracked > 0 ? (totalDaysCompleted / totalDaysTracked) * 100 : 0

  // Séquence actuelle et meilleure séquence
  const { currentStreak, bestStreak } = calculateStreaks(objectives)

  // Objectif le plus complété
  const objectivesStats = objectives.map((obj) => {
    let daysTracked = 0
    let daysCompleted = 0

    Object.entries(obj.progress).forEach(([_, value]) => {
      daysTracked++
      if (obj.trackingType === "binary") {
        if (value === true) daysCompleted++
      } else if (typeof value === "number" && value > 0) {
        daysCompleted++
      }
    })

    return {
      name: obj.name,
      completionRate: daysTracked > 0 ? (daysCompleted / daysTracked) * 100 : 0,
    }
  })

  objectivesStats.sort((a, b) => b.completionRate - a.completionRate)

  const mostCompletedObjective = objectivesStats.length > 0 ? objectivesStats[0] : null
  const leastCompletedObjective = objectivesStats.length > 0 ? objectivesStats[objectivesStats.length - 1] : null

  return {
    totalObjectives,
    completedToday,
    inProgressObjectives,
    completionRate,
    streakDays: currentStreak,
    bestStreak,
    totalDaysTracked,
    totalDaysCompleted,
    mostCompletedObjective,
    leastCompletedObjective,
  }
}

// Fonction pour obtenir les statistiques quotidiennes sur une période
export const getDailyStats = (days = 30) => {
  const objectives = getObjectives().filter((obj) => obj.status === "en_cours")
  const result = []

  // Générer les dates pour la période demandée
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    let completedObjectives = 0
    let totalTrackedObjectives = 0

    objectives.forEach((obj) => {
      if (obj.progress[dateStr] !== undefined) {
        totalTrackedObjectives++
        if (obj.trackingType === "binary") {
          if (obj.progress[dateStr] === true) completedObjectives++
        } else if (typeof obj.progress[dateStr] === "number" && obj.progress[dateStr] > 0) {
          completedObjectives++
        }
      }
    })

    result.push({
      date: dateStr,
      completionRate: totalTrackedObjectives > 0 ? (completedObjectives / totalTrackedObjectives) * 100 : 0,
      completedObjectives,
      totalObjectives: totalTrackedObjectives,
    })
  }

  return result
}

// Fonction pour obtenir les statistiques détaillées par objectif
export const getObjectivesStats = () => {
  const objectives = getObjectives().filter((obj) => obj.status === "en_cours")
  const result = []

  objectives.forEach((obj) => {
    let daysTracked = 0
    let daysCompleted = 0
    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0
    let lastCompletedDate = null

    // Trier les dates de progression
    const sortedDates = Object.keys(obj.progress).sort()

    sortedDates.forEach((date) => {
      const value = obj.progress[date]
      daysTracked++

      const isCompleted = obj.trackingType === "binary" ? value === true : typeof value === "number" && value > 0

      if (isCompleted) {
        daysCompleted++
        tempStreak++
        lastCompletedDate = date
        bestStreak = Math.max(bestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    })

    // Vérifier si la séquence actuelle est toujours active
    const today = new Date().toISOString().split("T")[0]
    const lastDate = sortedDates[sortedDates.length - 1]

    if (lastDate === today) {
      currentStreak = tempStreak
    } else {
      // Vérifier si la dernière date est hier
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]

      if (lastDate === yesterdayStr && tempStreak > 0) {
        currentStreak = tempStreak
      } else {
        currentStreak = 0
      }
    }

    result.push({
      id: obj.id,
      name: obj.name,
      category: obj.category,
      daysTracked,
      daysCompleted,
      completionRate: daysTracked > 0 ? (daysCompleted / daysTracked) * 100 : 0,
      currentStreak,
      bestStreak,
      lastCompletedDate,
    })
  })

  return result
}

// Fonction pour calculer les séquences (streaks)
const calculateStreaks = (objectives) => {
  if (objectives.length === 0) return { currentStreak: 0, bestStreak: 0 }

  // Obtenir toutes les dates uniques où au moins un objectif a été suivi
  const allDates = new Set()
  objectives.forEach((obj) => {
    Object.keys(obj.progress).forEach((date) => allDates.add(date))
  })

  // Trier les dates
  const sortedDates = Array.from(allDates).sort()
  if (sortedDates.length === 0) return { currentStreak: 0, bestStreak: 0 }

  let currentStreak = 0
  let bestStreak = 0
  let tempStreak = 0

  // Parcourir les dates pour calculer les séquences
  sortedDates.forEach((date) => {
    let atLeastOneCompleted = false

    objectives.forEach((obj) => {
      if (obj.progress[date] !== undefined) {
        const isCompleted =
          obj.trackingType === "binary"
            ? obj.progress[date] === true
            : typeof obj.progress[date] === "number" && obj.progress[date] > 0

        if (isCompleted) {
          atLeastOneCompleted = true
        }
      }
    })

    if (atLeastOneCompleted) {
      tempStreak++
      bestStreak = Math.max(bestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  })

  // Vérifier si la séquence actuelle est toujours active
  const today = new Date().toISOString().split("T")[0]
  const lastDate = sortedDates[sortedDates.length - 1]

  if (lastDate === today) {
    currentStreak = tempStreak
  } else {
    // Vérifier si la dernière date est hier
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    if (lastDate === yesterdayStr && tempStreak > 0) {
      currentStreak = tempStreak
    } else {
      currentStreak = 0
    }
  }

  return { currentStreak, bestStreak }
}

// Fonction pour obtenir la date de début du suivi
export const getStartDate = () => {
  const objectives = getObjectives().filter((obj) => obj.status === "en_cours")
  const allDates = new Set()

  objectives.forEach((obj) => {
    Object.keys(obj.progress).forEach((date) => allDates.add(date))
  })

  const sortedDates = Array.from(allDates).sort()
  return sortedDates.length > 0 ? sortedDates[0] : new Date().toISOString().split("T")[0]
}

// Fonction pour calculer le nombre de jours depuis le début du suivi
export const getDaysSinceStart = () => {
  const startDate = new Date(getStartDate())
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Fonction pour obtenir les statistiques d'évolution
export const getEvolutionStats = (days = 30) => {
  const categories = ["spiritual", "professional", "personal", "finance"]
  const result = {
    spiritual: [],
    professional: [],
    personal: [],
    finance: [],
  }

  // Générer les dates pour la période demandée
  const today = new Date()
  const dates = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split("T")[0])
  }

  // Calculer le taux de complétion pour chaque catégorie et chaque jour
  categories.forEach((category) => {
    const objectives = getObjectives().filter((obj) => obj.category === category && obj.status === "en_cours")

    dates.forEach((date) => {
      let completedObjectives = 0
      let totalTrackedObjectives = 0

      objectives.forEach((obj) => {
        if (obj.progress[date] !== undefined) {
          totalTrackedObjectives++
          if (obj.trackingType === "binary") {
            if (obj.progress[date] === true) completedObjectives++
          } else if (typeof obj.progress[date] === "number" && obj.progress[date] > 0) {
            completedObjectives++
          }
        }
      })

      result[category].push(totalTrackedObjectives > 0 ? (completedObjectives / totalTrackedObjectives) * 100 : 0)
    })
  })

  return result
}
