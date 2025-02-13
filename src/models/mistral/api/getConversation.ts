import { extractConversationAndMessages } from "~models/mistral/functions"
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
      func: (headers, convId, version) =>
        fetch(
          `https://chat.mistral.ai/api/trpc/chat.byId,agent.listLegacy,message.all,canva.all,quote.all?batch=1&input=${JSON.stringify(
            {
              "0": { json: { id: convId } },
              "1": { json: null, meta: { values: ["undefined"] } },
              "2": { json: { chatId: convId } },
              "3": { json: { chatId: convId } },
              "4": { json: { chatId: convId } }
            }
          )}`,
          {
            method: "GET",
            headers: headers,
            referrer: "https://chat.mistral.ai/chat/" + convId,
            referrerPolicy: "strict-origin-when-cross-origin",
            mode: "cors",
            credentials: "include"
          }
        ).then((res) => res.text()),
      args: [headers, convId]
    })

    const data = req[0].result

    const conversation = extractConversationAndMessages(data)

    return conversation as Conversation["mistral"]
  } catch (err) {
    console.error(err)

    return null
  }
}
