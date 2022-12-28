import { isFullDatabase } from "@notionhq/client"

import getNotion from "~config/notion"

export const getDatabase = async (id: string) => {
  try {
    const notion = await getNotion()
    const response = await notion.databases.retrieve({
      database_id: id
    })
    if (!isFullDatabase(response)) return
    return response
  } catch (err) {
    console.error(err)
  }
}
