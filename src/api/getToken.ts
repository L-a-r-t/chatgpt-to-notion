export const getToken = async ({ workspace_id, user_id }: GetTokenParams) => {
  const response = await fetch("https://chatgpt-to-notion.onrender.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      workspace_id,
      user_id
    })
  })
  const { token } = await response.json()
  return token
}

type GetTokenParams = {
  workspace_id: string
  user_id: string
}
