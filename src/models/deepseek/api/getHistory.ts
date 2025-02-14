export const getHistory = async (headers: any, offset: number = 0) => {
  try {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    const tab = tabs[0]
    if (!tab.id) throw new Error("No active tab found")

    const historyRes = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (headers) =>
        fetch(
          "https://chat.deepseek.com/api/v0/chat_session/fetch_page?count=100",
          {
            method: "GET",
            headers: headers,
            // referrer: "https://chat.deepseek.com/a/chat/s/" + convId,
            // referrerPolicy: "strict-origin-when-cross-origin",
            mode: "cors",
            credentials: "include"
          }
        ).then((res) => res.json()),
      args: [headers]
    })

    const history = historyRes[0].result

    return {
      data: history,
      ids: history.data.biz_data.chat_sessions.map((item: any) => item.id)
    } as {
      data: any
      ids: string[]
    }
  } catch (err) {
    console.error(err)
    return { data: null, ids: [] }
  }
}
