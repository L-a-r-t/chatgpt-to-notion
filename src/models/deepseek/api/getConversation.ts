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

    const req = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (headers, convId) =>
        fetch(
          // `https://chat.deepseek.com/api/v0/chat/history_messages?cache_version=${version}&chat_session_id=${convId}`,
          `https://chat.deepseek.com/api/v0/chat/history_messages?chat_session_id=${convId}`,
          {
            method: "GET",
            headers: headers,
            referrer: "https://chat.deepseek.com/a/chat/s/" + convId,
            referrerPolicy: "strict-origin-when-cross-origin",
            mode: "cors",
            credentials: "include"
          }
        ).then((res) => res.json()),
      args: [headers, convId]
    })

    const data = req[0].result

    return data as Conversation["deepseek"]
  } catch (err) {
    console.error(err)

    return null
  }
}
