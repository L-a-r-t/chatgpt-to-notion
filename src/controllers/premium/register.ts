import axios from "axios"
import TokenData from "../../models/token"
import dotenv from "dotenv"
import { Request, Response } from "express"

dotenv.config()

export const register = async (req: Request, res: Response) => {
  try {
    const { license_key, workspace_id, user_id } = req.body

    let gumroadRes: any

    try {
      const product_id = process.env.PRODUCT_ID
      if (!product_id) throw new Error("can't find PRODUCT_ID .env variable")

      gumroadRes = await axios.post(
        "https://api.gumroad.com/v2/licenses/verify",
        {
          product_id,
          license_key,
        }
      )
    } catch (err) {
      const bard_product_id = process.env.BARD_PRODUCT_ID
      if (!bard_product_id)
        throw new Error("can't find BARD_PRODUCT_ID .env variable")

      gumroadRes = await axios.post(
        "https://api.gumroad.com/v2/licenses/verify",
        {
          product_id: bard_product_id,
          license_key,
        }
      )
    }

    const id = `${workspace_id}:${user_id}`
    if (gumroadRes.data.success) {
      await TokenData.findOneAndUpdate(
        { id },
        {
          license_key: license_key,
        }
      )
    }
    res.status(200).send({ success: gumroadRes.data.success })
  } catch (err) {
    console.error(err)
    res.status(500).send({
      message: "Something went wrong",
      error: JSON.stringify(err),
    })
  }
}
