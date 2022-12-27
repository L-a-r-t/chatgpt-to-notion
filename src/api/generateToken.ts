import { Storage } from "@plasmohq/storage"

export const generateToken = async (code: string) => {
  console.log(code)
  const storage = new Storage({
    area: "session"
  })
  const response = await fetch(
    "https://chatgpt-to-notion.onrender.com/token/new",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code,
        grant_type: "authorization-code",
        redirect_uri: "https://github.com/L-a-r-t/chatgpt-to-notion"
      })
    }
  )
  const { token } = await response.json()
  return token
}
