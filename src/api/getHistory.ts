export const getHistory = async (headers: any, offset: number = 0) => {
  try {
    const res = await fetch(
      `https://chat.openai.com/backend-api/conversations?offset=${offset}&order=updated`,
      {
        method: "GET",
        headers: headers,
        credentials: "include"
      }
    )
    const data = await res.json()
    return { data, ids: data.items.map((item: any) => item.id) } as {
      data: any
      ids: string[]
    }
  } catch (err) {
    console.error(err)
    return { data: null, ids: [] }
  }
}
