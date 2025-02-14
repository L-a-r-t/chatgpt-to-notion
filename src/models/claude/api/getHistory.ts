export const getHistory = async (headers: any, offset: number = 0) => {
  try {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    const tab = tabs[0]
    if (!tab.id) throw new Error("No active tab found")

    const pattern = /(?<=lastActiveOrg=)([^;]+)/

    const match = headers["Cookie"].match(pattern)

    const orgId = match[0]

    const req = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (headers, offset, orgId) =>
        fetch(
          `https://claude.ai/api/organizations/${orgId}/chat_conversations?offset=${offset}&limit=8`,
          {
            method: "GET",
            headers: headers,
            // referrer: "https://claude.ai/chat/" + convId,
            // referrerPolicy: "strict-origin-when-cross-origin",
            mode: "cors",
            credentials: "include"
          }
        ).then((res) => res.json()),
      args: [headers, offset, orgId]
    })

    const data = req[0].result

    return { data, ids: data.map((item: any) => item.uuid) } as {
      data: any
      ids: string[]
    }
  } catch (err) {
    console.error(err)

    return { data: null, ids: [] }
  }
}
