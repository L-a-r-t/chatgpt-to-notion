import { useEffect, useMemo, useRef, useState } from "react"

import type { SaveStatus } from "~utils/types"

export default function useSavePercentage(
  saveStatus: SaveStatus,
  duration: number = 7000
) {
  const [start, end] = useMemo(() => {
    if (saveStatus && saveStatus.startsWith("saving:")) {
      const [_, saved, total] = saveStatus.split(":")
      return [
        Math.round((parseInt(saved) / parseInt(total)) * 100),
        Math.min(Math.round((parseInt(saved + 1) / parseInt(total)) * 100), 90)
      ]
    }
    return [0, 0]
  }, [saveStatus])

  const [percentage, setPercentage] = useState(start)

  useEffect(() => {
    if (start < end) {
      const range = end - start
      const increment = range / (duration / 100)
      let currentPercentage = start

      const intervalId = setInterval(() => {
        currentPercentage += increment
        if (currentPercentage >= end) {
          currentPercentage = end
          clearInterval(intervalId)
        }
        setPercentage((_) => Math.round(currentPercentage))
      }, 100)

      return () => clearInterval(intervalId)
    }
  }, [start, end, duration])

  return percentage
}
