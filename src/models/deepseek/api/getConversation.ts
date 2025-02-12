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

    const historyRes = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (headers, convId, historyCallback) =>
        fetch(
          "https://chat.deepseek.com/api/v0/chat_session/fetch_page?count=100",
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

    const history = historyRes[0].result

    const version = history.data.biz_data.chat_sessions.filter(
      (c) => c.id == convId
    )[0].version

    const req = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (headers, convId, version) =>
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
      args: [headers, convId, version]
    })

    const data = req[0].result

    return data as Conversation["deepseek"]
  } catch (err) {
    console.error(err)

    return null
  }
}
