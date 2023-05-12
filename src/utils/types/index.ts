import type {
  PageObjectResponse,
  PartialPageObjectResponse
} from "@notionhq/client/build/src/api-endpoints"

import type { parseSave } from "~api/parseSave"

import type { IconResponse, SelectPropertyResponse } from "./notion"

export type ToBeSaved = {
  prompt: string
  answer: string
  title: string
  url: string
} | null

export type Error = {
  code?: string | null
  message?: string | null
  status?: number | null
}

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

export type SaveBehavior = "override" | "append" | "ignore"
