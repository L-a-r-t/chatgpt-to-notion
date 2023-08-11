import type { PlasmoContentScript } from "plasmo"

export const config: PlasmoContentScript = {
  matches: ["https://chat.openai.com/*"]
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "chatgpt-to-notion_fetchFullChat")
    fetchFullChat().then((res) => sendResponse(res))
  return true
})

const fetchFullChat = async () => {
  await expandChatGPTWork()

  const matches = document.querySelectorAll(".group.w-full")
  const chat = Array.from(matches)

  const rawPrompts = chat.filter((el, index) => index % 2 === 0)
  const rawAnswers = chat.filter((el, index) => index % 2 === 1)

  const prompts = rawPrompts.map(
    (el) => el.querySelector(".whitespace-pre-wrap")?.textContent
  )
  const preJoinedAnswers = rawAnswers.map((el) =>
    Array.from(el.querySelectorAll(".markdown")).map((el) =>
      el.parentElement?.classList.contains("mt-3")
        ? "%%CHATGPT_TO_NOTION_WORK%%" + el.innerHTML
        : el.innerHTML
    )
  )
  const answers = preJoinedAnswers.map((arr) => {
    if (arr.length == 1) return arr[0]
    if (arr.some((el) => el.includes("%%CHATGPT_TO_NOTION_WORK%%")))
      return arr.join("")
    return arr.join("%%CHATGPT_TO_NOTION_SPLIT%%")
  })

  const url = window.location.href
  const title = document.title

  return { prompts, answers, url, title }
}

const expandChatGPTWork = async () => {
  const workButtonMatches = document.querySelectorAll(".gap-2 > .text-xs")
  const workButtons = Array.from(workButtonMatches)

  let waitExpansion = false

  for (let i = 0; i < workButtons.length; i++) {
    const el = workButtons[i]
    if (
      el.parentElement?.parentElement?.nextElementSibling?.querySelector(
        ".markdown"
      )
    )
      continue
    waitExpansion = true
    el.parentElement?.click()
  }

  // wait for new content to load
  if (waitExpansion) await new Promise((resolve) => setTimeout(resolve, 1000))
}
