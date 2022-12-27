import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import helmet from "helmet"
import { tokenRouter } from "routes"

const app = express()

// mongoose
import mongoose from "mongoose"
const mongoURI = process.env.MONGO_URI
if (!mongoURI) throw new Error("can't find MONGO_URI .env variable")
mongoose.connect(mongoURI, () => console.log("connected to MongoDB"))

// middleware
app.use(bodyParser.json())
app.use(helmet())
app.use(cors())

// routes
app.get("/", (req, res) => {
  res.send("Hello World")
})
app.use("/token", tokenRouter)

app.listen(5000, () => {
  console.log("Listening on port 5000")
})
