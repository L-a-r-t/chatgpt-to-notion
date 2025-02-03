import type { Conversation, Message } from "~utils/types"

export const parseConversation = (rawConv: Conversation["deepseek"]) => {
  const { chat_session, chat_messages } = rawConv.data.biz_data
  const id = chat_session.id
  const title = chat_session.title
  // Sort messages chronologically.
  const messages = [...chat_messages].sort(
    (a, b) => a.inserted_at - b.inserted_at
  )

  // Group consecutive user messages and their following assistant messages.
  const pairs: {
    prompt: Message["deepseek"]
    answers: Message["deepseek"][]
  }[] = []
  let currentPrompt: Message["deepseek"] | null = null
  let currentAnswers: Message["deepseek"][] = []
  let lastRole: "USER" | "ASSISTANT" | null = null

  messages.forEach((msg) => {
    if (msg.role === "USER") {
      if (lastRole === "USER" && currentPrompt) {
        // Merge consecutive user messages.
        currentPrompt.content += "\n" + msg.content
      } else {
        if (currentPrompt) {
          pairs.push({ prompt: currentPrompt, answers: currentAnswers })
        }
        // Start a new prompt.
        currentPrompt = { ...msg }
        currentAnswers = []
      }
      lastRole = "USER"
    } else if (msg.role === "ASSISTANT") {
      if (lastRole === "ASSISTANT" && currentAnswers.length) {
        // Merge consecutive assistant messages.
        currentAnswers[currentAnswers.length - 1].content += "\n" + msg.content
      } else {
        currentAnswers.push({ ...msg })
      }
      lastRole = "ASSISTANT"
    }
  })
  if (currentPrompt)
    pairs.push({ prompt: currentPrompt, answers: currentAnswers })

  const prompts = pairs.map((pair) => pair.prompt.content)
  const answers = pairs.map((pair) =>
    pair.answers.map(flattenMessage).join("\n\n")
  )
  const url = "https://chat.deepseek.com/a/chat/s/" + id

  return { url, title, prompts, answers, textDocs: [] }
}

export const flattenMessage = (msg: Message["deepseek"]): string => {
  // For deepseek, the message content is plain text.
  return msg.content
}
