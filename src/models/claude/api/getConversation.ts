import type { Conversation } from "~utils/types"

export const getConversation = async ({
  convId,
  headers
}: {
  convId: string
  headers: any
}) => {
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
      func: (headers, convId, orgId) =>
        fetch(
          `https://claude.ai/api/organizations/${orgId}/chat_conversations/${convId}?tree=True&rendering_mode=messages&render_all_tools=true`,
          {
            method: "GET",
            headers: headers,
            referrer: "https://claude.ai/chat/" + convId,
            referrerPolicy: "strict-origin-when-cross-origin",
            mode: "cors",
            credentials: "include"
          }
        ).then((res) => res.json()),
      args: [headers, convId, orgId]
    })

    const data = req[0].result

    console.log(data)

    return data as Conversation["claude"]
  } catch (err) {
    console.error(err)

    return null
  }
}
