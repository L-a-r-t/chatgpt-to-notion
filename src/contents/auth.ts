import type { PlasmoContentScript } from "plasmo"

export const config: PlasmoContentScript = {
  matches: ["https://github.com/L-a-r-t/chatgpt-to-notion"]
}

// exchange temporary notion code for access token
export const auth = async () => {
  const code = new URLSearchParams(window.location.search).get("code")
  if (!code) return
  await chrome.runtime.sendMessage({
    type: "generateToken",
    body: { code }
  })
  // const response = await fetch("/api/auth", {
  //   method: "POST",
  //   headers: {
  //     Authorization: process.env.CLIENT_SECRET,
  //     "Content-Type": "application/json"
  //   },
  //   body: JSON.stringify({
  //     code,
  //     grant_type: "authorization-code",
  //     redirect_uri: "https://github.com/L-a-r-t/chatgpt-to-notion"
  //   })
  // })
  // const { token } = await response.json()
  // return token
}

auth()
