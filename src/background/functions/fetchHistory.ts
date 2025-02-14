import { getHistory } from "~api/getHistory"
import { convertHeaders } from "~utils/functions"
import type { SupportedModels } from "~utils/types"

const fetchHistory = async (
  model: SupportedModels,
  rawHeaders: { name: string; value?: string }[]
) => {
  // TODO: update le cookie probablement
  const headers = convertHeaders(rawHeaders)
  const { data, ids } = await getHistory({
    model: model as any,
    params: headers
  })

  if (["chatgpt", "claude"].includes(model)) {
    const total = model == "chatgpt" ? data.total : 80

    const offsetMap = {
      chatgpt: 50,
      claude: 8
    }
    // we model default limits and offsets to look less suspicious
    const offset = new Array(Math.ceil(total / offsetMap[model]) - 1)
      .fill(0)
      .map((_, i) => (i + 1) * offsetMap[model])

    const _history = await Promise.all(
      offset.map(async (delta) =>
        getHistory({ model: model as any, params: { headers, offset: delta } })
      )
    )

    const history = _history
      .reduce((acc, { ids }) => [...acc, ...ids], ids)
      .reverse()

    return history
  }

  return ids
}

export default fetchHistory
