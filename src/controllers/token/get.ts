import TokenData from "../../models/token"
import { Request, Response } from "express"
import axios from "axios"

export const get = async (req: Request, res: Response) => {
  try {
    const { workspace_id, user_id } = req.body
    const id = `${workspace_id}:${user_id}`
    const data = await TokenData.findOne({ id })
    if (!data) throw new Error("token not found")

    let isPremium = false
    const license_key = data.license_key
    if (license_key) {
      const product_id = process.env.PRODUCT_ID
      if (!product_id) throw new Error("can't find PRODUCT_ID .env variable")
      const gumroadRes = await axios.post(
        "https://api.gumroad.com/v2/licenses/verify",
        {
          product_id,
          license_key,
        }
      )
      isPremium = gumroadRes.data.success
    }

    res.status(200).send({ token: data.access_token, isPremium })
  } catch (err) {
    console.error(err)
    res.status(500).send({
      message: "Something went wrong",
      error: JSON.stringify(err),
    })
  }
}
