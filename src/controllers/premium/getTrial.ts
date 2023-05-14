import dayjs from "dayjs"
import TokenData from "../../models/token"
import dotenv from "dotenv"
import { Request, Response } from "express"

dotenv.config()

export const getTrial = async (req: Request, res: Response) => {
  try {
    const { workspace_id, user_id } = req.body

    const id = `${workspace_id}:${user_id}`
    const user = await TokenData.findOne({ id })
    if (!user) throw new Error("User not found")

    const { license_key, trial_end } = user
    if (license_key) {
      res.status(400).send({
        success: false,
        code: "invalid",
        message: "User already has a licence key",
      })
      return
    }
    if (trial_end) {
      res.status(400).send({
        success: false,
        code: "invalid",
        message: "User already has a trial",
      })
      return
    }

    const trialEnd = dayjs().add(7, "day").toDate()

    await TokenData.findOneAndUpdate(
      { id },
      {
        trial_end: trialEnd,
      }
    )

    res.status(200).send({ success: true, trialEnd })
  } catch (err) {
    console.error(err)
    res.status(500).send({
      message: "Something went wrong",
      error: JSON.stringify(err),
    })
  }
}
