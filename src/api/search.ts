import notion from "~config/notion"
import { parseSearchResponse } from "~utils/functions/notion"

// Search notion using the notion sdk
export const searchNotion = async (query: string) => {
  const response = await notion.search({
    query,
    page_size: 6,
    filter: {
      property: "object",
      value: "database"
    }
  })
  const parsed = parseSearchResponse(response.results)
  return parsed
}
