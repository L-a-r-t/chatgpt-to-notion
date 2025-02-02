import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { fetchHistory, saveHistory } from "~background/functions"
import { STORAGE_KEYS } from "~utils/consts"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const storage = new Storage()
    const session = new Storage({
      area: "session",
      secretKeyList: ["token", "cacheHeaders"]
    })

    const cacheHeaders = await session.get<any>(STORAGE_KEYS.cacheHeaders)
    // const model = await storage.get<string>(STORAGE_KEYS.model)
    const model = "chatgpt"

    const fetchHistoryRes = await fetchHistory(model, cacheHeaders)

    const saveHistoryRes = await saveHistory(
      model,
      fetchHistoryRes,
      cacheHeaders
    )

    res.send(saveHistoryRes)
  } catch (err) {
    console.error(err)
    res.send({ err })
  }
}

export default handler
