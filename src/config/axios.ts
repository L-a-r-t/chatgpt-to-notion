import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const api = axios.create({
  baseURL: "https://api.notion.com/v1",
})

export default api
