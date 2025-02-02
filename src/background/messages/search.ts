import type { PlasmoMessaging } from "@plasmohq/messaging"

import { searchNotion } from "~api/search"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const searchResult = await searchNotion(req.body.query)
    res.send(searchResult)
  } catch (err) {
    console.error(err)
    res.send({ err })
  }
}

export default handler
