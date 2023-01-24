import type { IconResponse, SelectPropertyResponse } from "./notion"

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
  propertiesIds: {
    title: string
    url: string
  }
  tags: {
    options: SelectPropertyResponse[]
    name: string
    id: string
    type: "select" | "multi_select"
  }[]
  tagIndex: number
  tagPropertyIndex: number
}

export type PopupEnum =
  | "index"
  | "save"
  | "settings"
  | "about"
  | "wrongpage"
  | "dbsettings"
