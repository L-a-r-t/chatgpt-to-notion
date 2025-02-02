import type { PlasmoMessaging } from "@plasmohq/messaging"

import { getDatabase } from "~api/getDatabase"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const getDatabaseRes = await getDatabase(req.body.id)

    res.send(getDatabaseRes)
  } catch (err) {
    console.error(err)
    res.send({ err })
  }
}

export default handler
