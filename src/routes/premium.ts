import { premium } from "../controllers"
import express from "express"

const router = express.Router()

router.post("/register", premium.register)

export default router
