import { tokenRouter, premiumRouter } from "./routes"
import bodyParser from "body-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import helmet from "helmet"
import mongoose from "mongoose"

dotenv.config()

const app = express()

const mongoURI = process.env.MONGO_URI
if (!mongoURI) throw new Error("can't find MONGO_URI .env variable")
mongoose.connect(mongoURI, () => console.log("connected to MongoDB"))

app.use(bodyParser.json())
app.use(helmet())
app.use(cors())

app.get("/keepalive", (req, res) => {
  res.status(200).send("OK")
})
app.use("/token", tokenRouter)
app.use("/premium", premiumRouter)

app.listen(5000, () => {
  console.log("Listening on port 5000")
})
