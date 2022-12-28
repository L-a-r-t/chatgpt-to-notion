// initialize notion sdk
import { Client } from "@notionhq/client"

import { Storage } from "@plasmohq/storage"

const getNotion = async () => {
  const storage = new Storage({
    area: "session",
    secretKeyList: ["token"]
  })
  const token = await storage.get("token")
  const notion = new Client({
    auth: token ?? ""
  })
  return notion
}

export default getNotion
