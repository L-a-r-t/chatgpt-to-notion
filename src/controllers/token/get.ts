import { Request, Response } from "express"
import TokenData from "models/token"

export const get = async (req: Request, res: Response) => {
  try {
    const { workspace_id, user_id } = req.body
    const id = `${workspace_id}-${user_id}`
    const data = await TokenData.findOne({ id })
    if (!data) throw new Error("token not found")
    console.log(data)
    res.status(200).send({ token: data.access_token })
  } catch (err) {
    console.error(err)
    res.status(500).send({
      message: "Something went wrong",
      error: JSON.stringify(err),
    })
  }
}
