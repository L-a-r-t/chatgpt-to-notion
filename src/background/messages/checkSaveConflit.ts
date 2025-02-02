import type { PlasmoMessaging } from "@plasmohq/messaging"

import { checkSaveConflict } from "~api/checkSaveConflict"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const saveConflictRes = await checkSaveConflict(req.body)
    res.send(saveConflictRes)
  } catch (err) {
    console.error(err)
    res.send({ err })
  }
}

export default handler
