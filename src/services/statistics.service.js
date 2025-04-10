import { objectifService } from "./api.service"

// Fonction pour obtenir tous les objectifs depuis l'API
// export const getObjectives = async () => {
//   try {
//     const response = await objectifService.getObjectifs()
//     return response.data || []
//   } catch (error) {
//     console.error("Erreur lors de la récupération des objectifs:", error)
//     return []
//   }
// }

// // Fonction pour obtenir la date de début du suivi
// export const getStartDate = async () => {
//   try {
//     const objectives = await getObjectives()
//     if (objectives.length === 0) return new Date().toISOString().split("T")[0]

//     // Trouver la date la plus ancienne dans les progressions
//     let earliestDate = new Date().toISOString().split("T")[0]

//     objectives.forEach((obj) => {
//       const dates = Object.keys(obj.progression || {})
//       if (dates.length > 0) {
//         const minDate = dates.reduce((a, b) => (a < b ? a : b))
//         if (minDate < earliestDate) {
//           earliestDate = minDate
//         }
//       }
//     })

//     return earliestDate
//   } catch (error) {
//     console.error("Erreur lors de la récupération de la date de début:", error)
//     return new Date().toISOString().split("T")[0]
//   }
// }

// // Fonction pour calculer le nombre de jours depuis le début du suivi
// export const getDaysSinceStart = async () => {
//   try {
//     const startDate = new Date(await getStartDate())
//     const today = new Date()
//     const diffTime = Math.abs(today - startDate)
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
//     return diffDays
//   } catch (error) {
//     console.error("Erreur lors du calcul des jours depuis le début:", error)
//     return 0
//   }
// }

// // Fonction pour obtenir les statistiques globales
// export const getGlobalStats = async () => {
//   try {
//     const objectives = await getObjectives()
//     const today = new Date().toISOString().split("T")[0]
//     const inProgressObjectives = objectives.filter((obj) => obj.statut === "en_cours").length

//     // Objectifs complétés aujourd'hui
//     let completedToday = 0
//     objectives.forEach((obj) => {
//       if (obj.progression && obj.progression[today]) {
//         if (obj.typeDeTracking === "binaire") {
//           if (obj.progression[today] === true) {
//             completedToday++
//           }
//         } else if (obj.progression[today] > 0) {
//           completedToday++
//         }
//       }
//     })

//     // Calculer le taux de complétion global
//     let totalDaysTracked = 0
//     let totalDaysCompleted = 0

//     objectives.forEach((obj) => {
//       Object.entries(obj.progression || {}).forEach(([date, value]) => {
//         totalDaysTracked++
//         if (obj.typeDeTracking === "binaire") {
//           if (value === true) {
//             totalDaysCompleted++
//           }
//         } else if (value > 0) {
//           totalDaysCompleted++
//         }
//       })
//     })

//     const completionRate = totalDaysTracked > 0 ? (totalDaysCompleted / totalDaysTracked) * 100 : 0

//     // Calculer la séquence actuelle et la meilleure séquence
//     const dates = []
//     const now = new Date()
//     for (let i = 30; i >= 0; i--) {
//       const date = new Date(now)
//       date.setDate(date.getDate() - i)
//       dates.push(date.toISOString().split("T")[0])
//     }

//     let currentStreak = 0
//     let bestStreak = 0
//     let tempStreak = 0

//     dates.forEach((date) => {
//       let hasCompletedObjective = false

//       objectives.forEach((obj) => {
//         if (obj.progression && obj.progression[date]) {
//           if (obj.typeDeTracking === "binaire") {
//             if (obj.progression[date] === true) {
//               hasCompletedObjective = true
//             }
//           } else if (obj.progression[date] > 0) {
//             hasCompletedObjective = true
//           }
//         }
//       })

//       if (hasCompletedObjective) {
//         tempStreak++
//         if (date === today) {
//           currentStreak = tempStreak
//         }
//       } else {
//         if (tempStreak > bestStreak) {
//           bestStreak = tempStreak
//         }
//         tempStreak = 0
//       }
//     })

//     if (tempStreak > bestStreak) {
//       bestStreak = tempStreak
//     }

//     // Calculer la distribution par catégorie
//     const categoriesDistribution = {
//       spiritual: objectives.filter((obj) => obj.categorie === "spirituel").length,
//       professional: objectives.filter((obj) => obj.categorie === "professionnel").length,
//       personal: objectives.filter((obj) => obj.categorie === "personnel").length,
//       finance: objectives.filter((obj) => obj.categorie === "finance").length,
//     }

//     // Calculer le taux de complétion par catégorie
//     const categoryCompletionRates = {
//       spiritual: await calculateCategoryCompletionRate("spirituel", objectives),
//       professional: await calculateCategoryCompletionRate("professionnel", objectives),
//       personal: await calculateCategoryCompletionRate("personnel", objectives),
//       finance: await calculateCategoryCompletionRate("finance", objectives),
//     }

//     return {
//       inProgressObjectives,
//       completedToday,
//       completionRate,
//       streakDays: currentStreak,
//       bestStreak,
//       categoriesDistribution,
//       categoryCompletionRates,
//     }
//   } catch (error) {
//     console.error("Erreur lors de la récupération des statistiques globales:", error)
//     return {
//       inProgressObjectives: 0,
//       completedToday: 0,
//       completionRate: 0,
//       streakDays: 0,
//       bestStreak: 0,
//       categoriesDistribution: {
//         spiritual: 0,
//         professional: 0,
//         personal: 0,
//         finance: 0,
//       },
//       categoryCompletionRates: {
//         spiritual: 0,
//         professional: 0,
//         personal: 0,
//         finance: 0,
//       },
//     }
//   }
// }

// Fonction pour calculer le taux de complétion d'une catégorie
// const calculateCategoryCompletionRate = async (category, objectives) => {
//   try {
//     const categoryObjectives = objectives.filter((obj) => obj.categorie === category)
//     if (categoryObjectives.length === 0) return 0

//     let totalDaysTracked = 0
//     let totalDaysCompleted = 0

//     categoryObjectives.forEach((obj) => {
//       Object.entries(obj.progression || {}).forEach(([date, value]) => {
//         totalDaysTracked++
//         if (obj.typeDeTracking === "binaire") {
//           if (value === true) {
//             totalDaysCompleted++
//           }
//         } else if (value > 0) {
//           totalDaysCompleted++
//         }
//       })
//     })

//     return totalDaysTracked > 0 ? (totalDaysCompleted / totalDaysTracked) * 100 : 0
//   } catch (error) {
//     console.error("Erreur lors du calcul du taux de complétion par catégorie:", error)
//     return 0
//   }
// }

// Fonction pour obtenir les statistiques par catégorie
export const getCategoriesStats = async () => {
  try {
    const objectives = await getObjectives()
    const today = new Date().toISOString().split("T")[0]

    const categories = ["spirituel", "professionnel", "personnel", "finance"]
    const stats = {}

    for (const category of categories) {
      const categoryObjectives = objectives.filter((obj) => obj.categorie === category)
      const inProgressObjectives = categoryObjectives.filter((obj) => obj.statut === "en_cours").length

      // Objectifs complétés aujourd'hui
      let completedToday = 0
      categoryObjectives.forEach((obj) => {
        if (obj.progression && obj.progression[today]) {
          if (obj.typeDeTracking === "binaire") {
            if (obj.progression[today] === true) {
              completedToday++
            }
          } else if (obj.progression[today] > 0) {
            completedToday++
          }
        }
      })

      // Calculer le taux de complétion
      let totalDaysTracked = 0
      let totalDaysCompleted = 0

      categoryObjectives.forEach((obj) => {
        Object.entries(obj.progression || {}).forEach(([date, value]) => {
          totalDaysTracked++
          if (obj.typeDeTracking === "binaire") {
            if (value === true) {
              totalDaysCompleted++
            }
          } else if (value > 0) {
            totalDaysCompleted++
          }
        })
      })

      const completionRate = totalDaysTracked > 0 ? (totalDaysCompleted / totalDaysTracked) * 100 : 0

      // Calculer la séquence actuelle et la meilleure séquence
      const dates = []
      const now = new Date()
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        dates.push(date.toISOString().split("T")[0])
      }

      let currentStreak = 0
      let bestStreak = 0
      let tempStreak = 0

      dates.forEach((date) => {
        let hasCompletedObjective = false

        categoryObjectives.forEach((obj) => {
          if (obj.progression && obj.progression[date]) {
            if (obj.typeDeTracking === "binaire") {
              if (obj.progression[date] === true) {
                hasCompletedObjective = true
              }
            } else if (obj.progression[date] > 0) {
              hasCompletedObjective = true
            }
          }
        })

        if (hasCompletedObjective) {
          tempStreak++
          if (date === today) {
            currentStreak = tempStreak
          }
        } else {
          if (tempStreak > bestStreak) {
            bestStreak = tempStreak
          }
          tempStreak = 0
        }
      })

      if (tempStreak > bestStreak) {
        bestStreak = tempStreak
      }

      // Trouver l'objectif le plus complété et le moins complété
      const objectivesCompletionRates = categoryObjectives.map((obj) => {
        let daysTracked = 0
        let daysCompleted = 0

        Object.entries(obj.progression || {}).forEach(([date, value]) => {
          daysTracked++
          if (obj.typeDeTracking === "binaire") {
            if (value === true) {
              daysCompleted++
            }
          } else if (value > 0) {
            daysCompleted++
          }
        })

        return {
          id: obj.id,
          name: obj.nom,
          completionRate: daysTracked > 0 ? (daysCompleted / daysTracked) * 100 : 0,
        }
      })

      objectivesCompletionRates.sort((a, b) => b.completionRate - a.completionRate)

      const mostCompletedObjective = objectivesCompletionRates.length > 0 ? objectivesCompletionRates[0] : null
      const leastCompletedObjective =
        objectivesCompletionRates.length > 0 ? objectivesCompletionRates[objectivesCompletionRates.length - 1] : null

      const categoryKey =
        category === "spirituel"
          ? "spiritual"
          : category === "professionnel"
            ? "professional"
            : category === "personnel"
              ? "personal"
              : "finance"

      stats[categoryKey] = {
        totalObjectives: categoryObjectives.length,
        inProgressObjectives,
        completedToday,
        completionRate,
        streakDays: currentStreak,
        bestStreak,
        totalDaysTracked,
        totalDaysCompleted,
        mostCompletedObjective,
        leastCompletedObjective,
      }
    }

    return stats
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques par catégorie:", error)
    return {
      spiritual: {
        totalObjectives: 0,
        inProgressObjectives: 0,
        completedToday: 0,
        completionRate: 0,
        streakDays: 0,
        bestStreak: 0,
        totalDaysTracked: 0,
        totalDaysCompleted: 0,
        mostCompletedObjective: null,
        leastCompletedObjective: null,
      },
      professional: {
        totalObjectives: 0,
        inProgressObjectives: 0,
        completedToday: 0,
        completionRate: 0,
        streakDays: 0,
        bestStreak: 0,
        totalDaysTracked: 0,
        totalDaysCompleted: 0,
        mostCompletedObjective: null,
        leastCompletedObjective: null,
      },
      personal: {
        totalObjectives: 0,
        inProgressObjectives: 0,
        completedToday: 0,
        completionRate: 0,
        streakDays: 0,
        bestStreak: 0,
        totalDaysTracked: 0,
        totalDaysCompleted: 0,
        mostCompletedObjective: null,
        leastCompletedObjective: null,
      },
      finance: {
        totalObjectives: 0,
        inProgressObjectives: 0,
        completedToday: 0,
        completionRate: 0,
        streakDays: 0,
        bestStreak: 0,
        totalDaysTracked: 0,
        totalDaysCompleted: 0,
        mostCompletedObjective: null,
        leastCompletedObjective: null,
      },
    }
  }
}

// Fonction pour obtenir les statistiques quotidiennes
export const getDailyStats = async (days = 30) => {
  try {
    const objectives = await getObjectives()
    const stats = []

    const now = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      let totalObjectives = 0
      let completedObjectives = 0

      objectives.forEach((obj) => {
        if (obj.progression && obj.progression[dateStr] !== undefined) {
          totalObjectives++
          if (obj.typeDeTracking === "binaire") {
            if (obj.progression[dateStr] === true) {
              completedObjectives++
            }
          } else if (obj.progression[dateStr] > 0) {
            completedObjectives++
          }
        }
      })

      const completionRate = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0

      stats.push({
        date: dateStr,
        totalObjectives,
        completedObjectives,
        completionRate,
      })
    }

    return stats
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques quotidiennes:", error)
    return []
  }
}

// Fonction pour obtenir les statistiques par objectif
export const getObjectivesStats = async () => {
  try {
    const objectives = (await getObjectives()).filter((obj) => obj.statut === "en_cours")
    const stats = []

    for (const obj of objectives) {
      let daysTracked = 0
      let daysCompleted = 0
      let currentStreak = 0
      let bestStreak = 0
      let tempStreak = 0
      let lastCompletedDate = null

      // Trier les dates de progression
      const dates = Object.keys(obj.progression || {}).sort()

      dates.forEach((date) => {
        daysTracked++
        let isCompleted = false

        if (obj.typeDeTracking === "binaire") {
          if (obj.progression[date] === true) {
            isCompleted = true
            daysCompleted++
            lastCompletedDate = date
          }
        } else if (obj.progression[date] > 0) {
          isCompleted = true
          daysCompleted++
          lastCompletedDate = date
        }

        if (isCompleted) {
          tempStreak++
        } else {
          if (tempStreak > bestStreak) {
            bestStreak = tempStreak
          }
          tempStreak = 0
        }
      })

      if (tempStreak > bestStreak) {
        bestStreak = tempStreak
      }

      // Calculer la séquence actuelle
      const today = new Date().toISOString().split("T")[0]
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]

      if (lastCompletedDate === today) {
        currentStreak = tempStreak
      } else if (lastCompletedDate === yesterdayStr) {
        currentStreak = tempStreak
      } else {
        currentStreak = 0
      }

      stats.push({
        id: obj.id,
        name: obj.nom,
        category: obj.categorie,
        daysTracked,
        daysCompleted,
        completionRate: daysTracked > 0 ? (daysCompleted / daysTracked) * 100 : 0,
        currentStreak,
        bestStreak,
        lastCompletedDate,
      })
    }

    return stats
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques par objectif:", error)
    return []
  }
}

// Fonction pour obtenir tous les objectifs depuis l'API
export const getObjectives = async () => {
    try {
      const response = await objectifService.getObjectifs()
      return response.data || []
    } catch (error) {
      console.error("Erreur lors de la récupération des objectifs:", error)
      return []
    }
  }
  
  // Fonction pour obtenir la date de début du suivi
  export const getStartDate = async () => {
    try {
      const objectives = await getObjectives()
      if (objectives.length === 0) return new Date().toISOString().split("T")[0]
  
      // Trouver la date la plus ancienne dans les progressions
      let earliestDate = new Date().toISOString().split("T")[0]
  
      objectives.forEach((obj) => {
        const dates = Object.keys(obj.progression || {})
        if (dates.length > 0) {
          const minDate = dates.reduce((a, b) => (a < b ? a : b))
          if (minDate < earliestDate) {
            earliestDate = minDate
          }
        }
  
        // Vérifier aussi la date de début de l'objectif
        if (obj.dateDebut && obj.dateDebut < earliestDate) {
          earliestDate = obj.dateDebut
        }
      })
  
      return earliestDate
    } catch (error) {
      console.error("Erreur lors de la récupération de la date de début:", error)
      return new Date().toISOString().split("T")[0]
    }
  }
  
  // Fonction pour calculer le nombre de jours depuis le début du suivi
  export const getDaysSinceStart = async () => {
    try {
      const startDate = new Date(await getStartDate())
      const today = new Date()
      const diffTime = Math.abs(today - startDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch (error) {
      console.error("Erreur lors du calcul des jours depuis le début:", error)
      return 0
    }
  }
  
  // Fonction pour obtenir les statistiques globales
  export const getGlobalStats = async () => {
    try {
      const objectives = await getObjectives()
      const today = new Date().toISOString().split("T")[0]
  
      // Objectifs en cours
      const inProgressObjectives = objectives.filter((obj) => obj.statut === "en_cours").length
  
      // Objectifs complétés aujourd'hui
      let completedToday = 0
      let totalObjectivesToday = 0
  
      objectives.forEach((obj) => {
        if (obj.statut === "en_cours") {
          // Vérifier si l'objectif est actif aujourd'hui
          const dateDebut = new Date(obj.dateDebut || obj.createdAt)
          const dateFin = new Date(dateDebut)
          dateFin.setDate(dateFin.getDate() + (obj.duree || 90))
          const currentDate = new Date(today)
  
          if (currentDate >= dateDebut && currentDate <= dateFin) {
            totalObjectivesToday++
  
            if (obj.progression && obj.progression[today] !== undefined) {
              if (obj.typeDeTracking === "binaire") {
                if (obj.progression[today] === true) {
                  completedToday++
                }
              } else if (obj.progression[today] > 0) {
                completedToday++
              }
            }
          }
        }
      })
  
      // Calculer le taux de complétion global
      let totalDaysTracked = 0
      let totalDaysCompleted = 0
  
      objectives.forEach((obj) => {
        Object.entries(obj.progression || {}).forEach(([date, value]) => {
          // Vérifier si l'objectif était actif à cette date
          const dateDebut = new Date(obj.dateDebut || obj.createdAt)
          const dateFin = new Date(dateDebut)
          dateFin.setDate(dateFin.getDate() + (obj.duree || 90))
          const currentDate = new Date(date)
  
          if (currentDate >= dateDebut && currentDate <= dateFin) {
            totalDaysTracked++
  
            if (obj.typeDeTracking === "binaire") {
              if (value === true) {
                totalDaysCompleted++
              }
            } else if (value > 0) {
              totalDaysCompleted++
            }
          }
        })
      })
  
      const completionRate = totalDaysTracked > 0 ? (totalDaysCompleted / totalDaysTracked) * 100 : 0
  
      // Calculer la séquence actuelle et la meilleure séquence
      const dates = []
      const now = new Date()
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        dates.push(date.toISOString().split("T")[0])
      }
  
      let currentStreak = 0
      let bestStreak = 0
      let tempStreak = 0
  
      dates.forEach((date) => {
        let hasCompletedObjective = false
        let totalObjectivesForDate = 0
  
        objectives.forEach((obj) => {
          // Vérifier si l'objectif était actif à cette date
          const dateDebut = new Date(obj.dateDebut || obj.createdAt)
          const dateFin = new Date(dateDebut)
          dateFin.setDate(dateFin.getDate() + (obj.duree || 90))
          const currentDate = new Date(date)
  
          if (currentDate >= dateDebut && currentDate <= dateFin && obj.statut === "en_cours") {
            totalObjectivesForDate++
  
            if (obj.progression && obj.progression[date] !== undefined) {
              if (obj.typeDeTracking === "binaire") {
                if (obj.progression[date] === true) {
                  hasCompletedObjective = true
                }
              } else if (obj.progression[date] > 0) {
                hasCompletedObjective = true
              }
            }
          }
        })
  
        // Si aucun objectif n'était actif à cette date, on ne compte pas dans la séquence
        if (totalObjectivesForDate === 0) {
          return
        }
  
        if (hasCompletedObjective) {
          tempStreak++
          if (date === today) {
            currentStreak = tempStreak
          }
        } else {
          if (tempStreak > bestStreak) {
            bestStreak = tempStreak
          }
          tempStreak = 0
        }
      })
  
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak
      }
  
      // Calculer la distribution par catégorie
      const categoriesDistribution = {
        spiritual: objectives.filter((obj) => obj.categorie === "spirituel").length,
        professional: objectives.filter((obj) => obj.categorie === "professionnel").length,
        personal: objectives.filter((obj) => obj.categorie === "personnel").length,
        finance: objectives.filter((obj) => obj.categorie === "finance").length,
      }
  
      // Calculer le taux de complétion par catégorie
      const categoryCompletionRates = {
        spiritual: await calculateCategoryCompletionRate("spirituel", objectives),
        professional: await calculateCategoryCompletionRate("professionnel", objectives),
        personal: await calculateCategoryCompletionRate("personnel", objectives),
        finance: await calculateCategoryCompletionRate("finance", objectives),
      }
  
      return {
        inProgressObjectives,
        completedToday,
        totalObjectivesToday,
        completionRate,
        streakDays: currentStreak,
        bestStreak,
        categoriesDistribution,
        categoryCompletionRates,
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques globales:", error)
      return {
        inProgressObjectives: 0,
        completedToday: 0,
        totalObjectivesToday: 0,
        completionRate: 0,
        streakDays: 0,
        bestStreak: 0,
        categoriesDistribution: {
          spiritual: 0,
          professional: 0,
          personal: 0,
          finance: 0,
        },
        categoryCompletionRates: {
          spiritual: 0,
          professional: 0,
          personal: 0,
          finance: 0,
        },
      }
    }
  }
  
  // Fonction pour calculer le taux de complétion d'une catégorie
  const calculateCategoryCompletionRate = async (category, objectives) => {
    try {
      const categoryObjectives = objectives.filter((obj) => obj.categorie === category)
      if (categoryObjectives.length === 0) return 0
  
      let totalDaysTracked = 0
      let totalDaysCompleted = 0
  
      categoryObjectives.forEach((obj) => {
        Object.entries(obj.progression || {}).forEach(([date, value]) => {
          // Vérifier si l'objectif était actif à cette date
          const dateDebut = new Date(obj.dateDebut || obj.createdAt)
          const dateFin = new Date(dateDebut)
          dateFin.setDate(dateFin.getDate() + (obj.duree || 90))
          const currentDate = new Date(date)
  
          if (currentDate >= dateDebut && currentDate <= dateFin) {
            totalDaysTracked++
  
            if (obj.typeDeTracking === "binaire") {
              if (value === true) {
                totalDaysCompleted++
              }
            } else if (value > 0) {
              totalDaysCompleted++
            }
          }
        })
      })
  
      return totalDaysTracked > 0 ? (totalDaysCompleted / totalDaysTracked) * 100 : 0
    } catch (error) {
      console.error("Erreur lors du calcul du taux de complétion par catégorie:", error)
      return 0
    }
  }
  
  // Autres fonctions du service de statistiques...
  