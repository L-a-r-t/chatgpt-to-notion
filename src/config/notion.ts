// initialize notion sdk
import { Client } from "@notionhq/client"
import dotenv from "dotenv"

import { Storage } from "@plasmohq/storage"

dotenv.config()

const storage = new Storage({
  secretKeyList: ["token"]
})

const token = await storage.get("token")

const notion = new Client({
  auth: token ?? ""
})

export default notion
