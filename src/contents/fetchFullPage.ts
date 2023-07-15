import type { PlasmoContentScript } from "plasmo"

export const config: PlasmoContentScript = {
  matches: ["https://chat.openai.com/*"]
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "chatgpt-to-notion_fetchFullChat")
    sendResponse(fetchFullChat())
})

const fetchFullChat = () => {
  const matches = document.querySelectorAll(".group.w-full")
  const chat = Array.from(matches)

  const rawPrompts = chat.filter((el, index) => index % 2 === 0)
  const rawAnswers = chat.filter((el, index) => index % 2 === 1)

  const prompts = rawPrompts.map(
    (el) => el.querySelector(".whitespace-pre-wrap")?.textContent
  )
  const answers = rawAnswers.map(
    (el) =>
      (
        el.querySelector(".markdown") ??
        el.querySelector(".dark.text-orange-500")
      )?.innerHTML
  )

  const url = window.location.href
  const title = document.title

  return { prompts, answers, url, title }
}
