import { token } from "../controllers"
import express from "express"

const router = express.Router()

router.post("/register", token.generate)

export default router
