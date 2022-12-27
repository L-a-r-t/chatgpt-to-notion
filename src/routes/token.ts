import { token } from "../controllers"
import express from "express"

const router = express.Router()

router.get("/", token.get)
router.post("/new", token.generate)

export default router
