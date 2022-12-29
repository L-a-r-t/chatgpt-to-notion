import type { IconResponse } from "./notion"

export type ToBeSaved =
  | {
      prompt: string
      answer: string
      title: string
    }
  | false

export type StoredDatabase = {
  id: string
  title: string
  icon: IconResponse
  properties: {
    title: string
    url: string
  }
}

export type PopupEnum = "index" | "save" | "settings" | "about" | "wrongpage"
