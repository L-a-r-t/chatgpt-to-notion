import TokenData from "../models/token"
import api from "config/axios"
import { Request, Response } from "express"

export const generate = async (req: Request, res: Response) => {
  try {
    const { code, redirect_uri, grant_type } = req.body

    const client_token = process.env.NOTION_TOKEN
    if (!client_token) throw new Error("can't find NOTION_TOKEN .env variable")

    const notionRes = await api.post(
      "/oauth/token",
      {
        code,
        redirect_uri,
        grant_type,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(client_token, "base64")}`,
        },
      }
    )
    console.log(notionRes.status, notionRes.data)
    const id = `${notionRes.data.workspace_id}-${
      notionRes.data.owner.workspace ? "x" : notionRes.data.owner.id
    }`
    await TokenData.create({
      ...notionRes.data,
      id,
    })
    res.status(200).send(notionRes.data)
  } catch (err) {
    console.error(err)
    res.status(500).send({
      message: "Something went wrong",
      error: JSON.stringify(err),
    })
  }
}
