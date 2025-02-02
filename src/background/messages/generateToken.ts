import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { generateToken } from "~api/generateToken"
import { STORAGE_KEYS } from "~utils/consts"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const session = new Storage({
      area: "session",
      secretKeyList: ["token", "cacheHeaders"]
    })

    const token = await session.get<string>(STORAGE_KEYS.token)
    if (token) {
      res.send({ token })
      return
    }

    const { code } = req.body
    const generateTokenRes = await generateToken(code)

    res.send(generateTokenRes)
  } catch (err) {
    console.error(err)
    res.send({ err })
  }
}

export default handler
