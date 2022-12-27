import { tokenRouter } from "./routes"
import bodyParser from "body-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import mongoose from "mongoose"

const app = express()

const mongoURI = process.env.MONGO_URI
if (!mongoURI) throw new Error("can't find MONGO_URI .env variable")
mongoose.connect(mongoURI, () => console.log("connected to MongoDB"))

app.use(bodyParser.json())
app.use(helmet())
app.use(cors())

app.use("/token", tokenRouter)

app.listen(5000, () => {
  console.log("Listening on port 5000")
})
