import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://chat.openai.com/*", "https://chatgpt.com/*"]
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "chatgpt-to-notion_fetchFullChat")
    fetchFullChat().then((res) => sendResponse(res))
  return true
})

export const fetchFullChat = async () => {
  await expandChatGPTWork()

  const matches = document.querySelectorAll(".w-full.text-token-text-primary")
  const chat = Array.from(matches).filter((el: HTMLElement) =>
    el.dataset.testid?.includes("conversation-turn")
  )

  const rawPrompts = chat.filter((el, index) => index % 2 === 0)
  const rawAnswers = chat.filter((el, index) => index % 2 === 1)

  const prompts = rawPrompts.map(
    (el) => el.querySelector('[data-message-author-role="user"]')?.textContent
  )
  const preFormattedAnswers = rawAnswers.map((el) => ({
    images: Array.from(el.querySelectorAll("img") || []),
    text: Array.from(el.querySelectorAll(".markdown")).map((el) =>
      el.parentElement?.classList.contains("mt-3")
        ? "%%CHATGPT_TO_NOTION_WORK1%%" + el.innerHTML
        : el.innerHTML
    )
  }))

  const answers = preFormattedAnswers.map((ans) => {
    const { text, images } = ans
    if (images.length == 0) return formatTextAnswer(text)
    const imagesToBeSaved = images
      .map((el) => el.parentElement?.innerHTML)
      .join("")
    return (
      `%%CHATGPT_TO_NOTION_IMAGE${images.length}%%` +
      imagesToBeSaved +
      "\n" +
      formatTextAnswer(text)
    )
  })

  const url = window.location.href
  const title = document.title

  return { prompts, answers, url, title }
}

const formatTextAnswer = (text: string[]) => {
  if (text.length == 1) return text[0]
  if (text.some((el) => el.includes("%%CHATGPT_TO_NOTION_WORK2%%")))
    return text.join("")
  return text.join("%%CHATGPT_TO_NOTION_SPLIT%%")
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
