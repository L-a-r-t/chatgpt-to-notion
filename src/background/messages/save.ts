import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { save } from "~background/functions"
import { STORAGE_KEYS } from "~utils/consts"
import type { ModelHeaders, SupportedModels } from "~utils/types"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const storage = new Storage()
    const session = new Storage({
      area: "session",
      secretKeyList: ["token", "cacheHeaders"]
    })

    const cacheHeaders = await session.get<ModelHeaders>(
      STORAGE_KEYS.cacheHeaders
    )
    const model = await storage.get<SupportedModels>(STORAGE_KEYS.model)

    if (model != cacheHeaders.model) {
      throw new Error("Model mismatch, please refresh this conversation's tab")
    }

    const { convId, turn, saveBehavior, conflictingPageId, autoSave } = req.body

    const saveRes = await save(convId, model, {
      rawHeaders: cacheHeaders.headers,
      turn,
      saveBehavior,
      conflictingPageId,
      autoSave
    })

    res.send(saveRes)
  } catch (err) {
    console.error(err)
    res.send({ err })
  }
}

export default handler
