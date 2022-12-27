import { isFullDatabase, isFullPage } from "@notionhq/client"
import type {
  DatabaseObjectResponse,
  PageObjectResponse,
  PartialDatabaseObjectResponse,
  PartialPageObjectResponse
} from "@notionhq/client/build/src/api-endpoints"

import { HTMLtoBlocks } from "."
import type { IconResponse, Property, PropertyType } from "../types/notion"

export const parseSearchResponse = (
  res: (
    | PageObjectResponse
    | DatabaseObjectResponse
    | PartialPageObjectResponse
    | PartialDatabaseObjectResponse
  )[]
) => {
  const pages: PageObjectResponse[] = []
  const partialPages: PartialPageObjectResponse[] = []
  const databases: DatabaseObjectResponse[] = []
  const partialDatabses: PartialDatabaseObjectResponse[] = []
  res.forEach((pageOrDB) => {
    if (pageOrDB.object === "page") {
      if (isFullPage(pageOrDB)) pages.push(pageOrDB)
      else partialPages.push(pageOrDB)
    } else {
      if (isFullDatabase(pageOrDB)) databases.push(pageOrDB)
      else partialDatabses.push(pageOrDB)
    }
  })
  return {
    pages,
    partialPages,
    databases,
    partialDatabses
  }
}

export const getProperty = <T extends PropertyType>(
  page: PageObjectResponse,
  property: string,
  type: T
): Property<T> | null => {
  if (!page.properties) return null
  if (!page.properties[property]) return null
  const prop = page.properties[property] as any
  if (prop.type !== type) return null
  return prop[type]
}

export const getIcon = (icon: IconResponse, mirror?: IconResponse) => {
  if (!icon) return <span className="text-2xl w-8 h-8">📚</span>
  switch (icon.type) {
    case "emoji":
      return <span className="text-2xl w-8 h-8">{icon.emoji}</span>
    case "file":
      return <img width={32} height={32} src={icon.file.url} alt="" />
    case "external":
      return <img width={32} height={32} src={icon.external.url} alt="" />
    default:
      return null
  }
}

export const generateBlocks = (prompt: string, answer: string) => {
  const answerBlocks = HTMLtoBlocks(answer)
  const promptBlocks = [
    {
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            type: "text",
            text: {
              content:
                prompt.length > 80 ? prompt.substring(0, 80) + "..." : prompt
            }
          }
        ]
      }
    },
    {
      object: "block",
      type: "heading_3",
      heading_3: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "❓ Prompt"
            }
          }
        ]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content: prompt
            }
          }
        ]
      }
    },
    {
      object: "block",
      type: "heading_3",
      heading_3: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "💬 Answer"
            }
          }
        ]
      }
    }
  ]

  return { promptBlocks, answerBlocks }
}
