"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Church,
  Briefcase,
  Dumbbell,
  WavesIcon as MoneyBillWave,
} from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { getObjectives, updateObjectiveProgress } from "../lib/objectives-service"

export function ObjectivesTable({ category }) {
  const [objectives, setObjectives] = useState([])
  const [editingProgress, setEditingProgress] = useState({})
  const { toast } = useToast()

  useEffect(() => {
    const loadedObjectives = getObjectives()

    if (category !== "all") {
      setObjectives(loadedObjectives.filter((obj) => obj.category === category))
    } else {
      setObjectives(loadedObjectives)
    }
  }, [category])

  const handleToggleCompletion = (id) => {
    const objective = objectives.find((obj) => obj.id === id)
    if (!objective || objective.trackingType !== "binary") return

    const today = new Date().toISOString().split("T")[0]
    const isCompleted = objective.progress[today] === true

    const updatedObjectives = objectives.map((obj) => {
      if (obj.id === id) {
        return {
          ...obj,
          progress: {
            ...obj.progress,
            [today]: !isCompleted,
          },
        }
      }
      return obj
    })

    setObjectives(updatedObjectives)
    updateObjectiveProgress(id, today, !isCompleted)

    toast({
      title: isCompleted ? "Objectif marqué comme non complété" : "Objectif complété !",
      description: objective.name,
    })
  }

  const handleUpdateNumericProgress = (id) => {
    const objective = objectives.find((obj) => obj.id === id)
    if (!objective || !editingProgress[id]) return

    const today = new Date().toISOString().split("T")[0]
    const value = editingProgress[id]

    const updatedObjectives = objectives.map((obj) => {
      if (obj.id === id) {
        return {
          ...obj,
          progress: {
            ...obj.progress,
            [today]: objective.trackingType === "counter" ? Number.parseInt(value) : Number.parseFloat(value),
          },
        }
      }
      return obj
    })

    setObjectives(updatedObjectives)
    updateObjectiveProgress(
      id,
      today,
      objective.trackingType === "counter" ? Number.parseInt(value) : Number.parseFloat(value),
    )

    setEditingProgress({
      ...editingProgress,
      [id]: "",
    })

    toast({
      title: "Progression mise à jour",
      description: `${objective.name}: ${value}`,
    })
  }

  const getCategoryIcon = (objCategory) => {
    switch (objCategory) {
      case "spiritual":
        return <Church className="h-5 w-5 text-green-600" />
      case "professional":
        return <Briefcase className="h-5 w-5 text-blue-600" />
      case "personal":
        return <Dumbbell className="h-5 w-5 text-yellow-600" />
      case "finance":
        return <MoneyBillWave className="h-5 w-5 text-purple-600" />
      default:
        return null
    }
  }

  const getProgressDisplay = (objective) => {
    const today = new Date().toISOString().split("T")[0]
    const progress = objective.progress[today]

    if (objective.trackingType === "binary") {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleToggleCompletion(objective.id)}
          className="flex items-center gap-2"
        >
          {progress === true ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          {progress === true ? "Complété" : "Non complété"}
        </Button>
      )
    } else {
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={editingProgress[objective.id] || ""}
            onChange={(e) =>
              setEditingProgress({
                ...editingProgress,
                [objective.id]: e.target.value,
              })
            }
            placeholder={progress ? progress.toString() : "0"}
            className="w-24 h-8"
          />
          <Button variant="outline" size="sm" onClick={() => handleUpdateNumericProgress(objective.id)}>
            Enregistrer
          </Button>
          <span className="text-sm text-muted-foreground">
            {progress ? `Actuel: ${progress}` : "Non suivi"}
            {objective.target ? ` / Cible: ${objective.target}` : ""}
          </span>
        </div>
      )
    }
  }

  const getFrequencyLabel = (frequency) => {
    switch (frequency) {
      case "daily":
        return "Quotidien"
      case "weekly":
        return "Hebdomadaire"
      case "monthly":
        return "Mensuel"
      default:
        return frequency
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {category === "all" && <TableHead>Catégorie</TableHead>}
            <TableHead>Objectif</TableHead>
            <TableHead>Fréquence</TableHead>
            <TableHead>Type de suivi</TableHead>
            <TableHead>Progression du jour</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {objectives.length === 0 ? (
            <TableRow>
              <TableCell colSpan={category === "all" ? 6 : 5} className="text-center py-6 text-muted-foreground">
                Aucun objectif trouvé dans cette catégorie
              </TableCell>
            </TableRow>
          ) : (
            objectives.map((objective) => (
              <TableRow key={objective.id}>
                {category === "all" && (
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(objective.category)}
                      <span>
                        {objective.category === "spiritual" && "Spirituel"}
                        {objective.category === "professional" && "Professionnel"}
                        {objective.category === "personal" && "Personnel"}
                        {objective.category === "finance" && "Finance"}
                      </span>
                    </div>
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  <div>
                    <div>{objective.name}</div>
                    {objective.description && (
                      <div className="text-xs text-muted-foreground">{objective.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getFrequencyLabel(objective.frequency)}</TableCell>
                <TableCell>
                  {objective.trackingType === "binary" && "Binaire (✅/❌)"}
                  {objective.trackingType === "counter" && "Compteur"}
                  {objective.trackingType === "numeric" && "Valeur numérique"}
                </TableCell>
                <TableCell>{getProgressDisplay(objective)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

