import { getHistory } from "~api/getHistory"
import { convertHeaders } from "~utils/functions"
import type { SupportedModels } from "~utils/types"

const fetchHistory = async (
  model: SupportedModels,
  rawHeaders: { name: string; value?: string }[]
) => {
  // TODO: update le cookie probablement
  const headers = convertHeaders(rawHeaders)
  const { data, ids } = await getHistory(headers)

  const { total } = data

  // Default OpenAI behavior is to return 50 conversations at a time
  // we do the same to look less suspicious
  const offset = new Array(Math.ceil(total / 50) - 1)
    .fill(0)
    .map((_, i) => (i + 1) * 50)

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

export default fetchHistory
