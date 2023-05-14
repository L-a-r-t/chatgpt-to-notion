import { premium } from "../controllers"
import express from "express"

const router = express.Router()

router.post("/register", premium.register)
router.post("/get-trial", premium.getTrial)

export default router
