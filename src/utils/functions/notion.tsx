import { isFullDatabase, isFullPage } from "@notionhq/client"
import type {
  DatabaseObjectResponse,
  PageObjectResponse,
  PartialDatabaseObjectResponse,
  PartialPageObjectResponse
} from "@notionhq/client/build/src/api-endpoints"

import type { StoredDatabase } from "~utils/types"

import { HTMLtoBlocks } from "."
import type {
  IconResponse,
  Property,
  PropertyType,
  SelectPropertyResponse
} from "../types/notion"

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

export const getDBProperty = <T extends PropertyType>(
  db: DatabaseObjectResponse,
  property: string,
  type: T
): Property<T> | null => {
  if (!db.properties) return null
  if (!db.properties[property]) return null
  const prop = db.properties[property] as any
  if (prop.type !== type) return null
  return prop[type]
}

export const getDBTagsProperties = (
  db: DatabaseObjectResponse
): (Property<"select"> | Property<"multi_select">)[] => {
  if (!db.properties) return []
  const keys = Object.keys(db.properties)
  const props = keys.map((key) => {
    const prop = db.properties[key]
    return {
      ...prop,
      name: key
    }
  })
  return props.filter(
    (prop) => prop.type === "select" || prop.type === "multi_select"
  ) as any
}

export const getIcon = (icon: IconResponse) => {
  if (!icon)
    return (
      <span className="text-2xl w-8 h-8 relative">
        <span className="absolute top-2 left-2 w-4 h-4 border-2 bg-main/25 border-main rounded" />
      </span>
    )
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

export const getTagColor = (tag: SelectPropertyResponse) => {
  if (!tag) return ""
  if (tag.color === "default") return "bg-neutral-100 text-neutral-800"
  if (tag.color === "brown") return "bg-amber-100 text-amber-800"
  return `bg-${tag.color}-100 text-${tag.color}-800`
}

export const generateBlocks = (
  prompt: string,
  answer: string,
  generateHeadings: boolean
) => {
  const answerBlocks = HTMLtoBlocks(answer)

  const promptText =
    prompt.length > 2000
      ? prompt.match(/.{1,2000}/g)?.map((subPrompt) => ({
          type: "text",
          text: {
            content: subPrompt
          }
        }))!
      : [
          {
            type: "text",
            text: {
              content: prompt
            }
          }
        ]
  const promptBlock =
    promptText.length > 100
      ? promptText.reduce(
          (acc, curr, i) => {
            if (i % 100 === 0)
              acc.push({
                object: "block",
                type: "paragraph",
                paragraph: {
                  rich_text: []
                }
              })
            acc[acc.length - 1].paragraph.rich_text.push(curr)
            return acc
          },
          [] as {
            object: "block"
            type: "paragraph"
            paragraph: {
              rich_text: any[]
            }
          }[]
        )
      : [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: promptText
            }
          }
        ]

  const promptBlocks = [
    ...(generateHeadings
      ? [
          {
            object: "block",
            type: "heading_2",
            heading_2: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content:
                      prompt.length > 80
                        ? prompt.substring(0, 80) + "..."
                        : prompt
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
          }
        ]
      : [
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
          }
        ]),
    ...promptBlock,
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

export const generateTag = (
  {
    options,
    type,
    id
  }: {
    options: SelectPropertyResponse[]
    name: string
    id: string
    type: "select" | "multi_select"
  },
  tagIndex: number
) => {
  if (tagIndex === -1) return undefined
  return type === "select"
    ? { select: { id: options[tagIndex].id } }
    : {
        multi_select: [{ id: options[tagIndex].id }]
      }
}

export const formatDB = (db: DatabaseObjectResponse): StoredDatabase | null => {
  const properties = Object.values(db.properties)
  const titleID = properties.filter((val) => val.type === "title")[0].id
  const urls = properties.filter((val) => val.type === "url")
  if (urls.length === 0) return null
  const urlID = urls[0].id
  const tags = getDBTagsProperties(db)

  const formattedDB = {
    id: db.id,
    title: db.title[0].plain_text,
    icon: db.icon,
    propertiesIds: {
      title: titleID,
      url: urlID
    },
    tags: tags.map((prop) => {
      return {
        name: prop.name,
        type: prop.type,
        id: prop.id,
        options:
          prop.type === "multi_select"
            ? prop.multi_select.options
            : prop.select.options
      }
    }),
    tagPropertyIndex: 0,
    tagIndex: -1
  }

  return formattedDB
}
