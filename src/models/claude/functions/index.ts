import type { Conversation, Message } from "~utils/types"

export const parseConversation = (rawConv: Conversation["claude"]) => {
  const { uuid, name, chat_messages } = rawConv

  // Sort messages by created_at
  const sorted = [...chat_messages].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  // Group consecutive messages by sender
  type Group = { sender: "human" | "assistant"; text: string }
  const groups: Group[] = []
  sorted.forEach((msg) => {
    const text = extractMessageText(msg)
    if (!groups.length || groups[groups.length - 1].sender !== msg.sender) {
      groups.push({ sender: msg.sender, text })
    } else {
      groups[groups.length - 1].text += "\n" + text
    }
  })

  // Pair human prompts with following assistant answers
  const prompts: string[] = []
  const answers: string[] = []
  for (let i = 0; i < groups.length - 1; i++) {
    if (groups[i].sender === "human" && groups[i + 1].sender === "assistant") {
      prompts.push(groups[i].text)
      answers.push(groups[i + 1].text)
      i++
    }
  }

  const url = "https://claude.ai/chat/" + uuid
  return { url, title: name, prompts, answers, textDocs: [] }
}

const extractMessageText = (msg: Message["claude"]): string => {
  let text = msg.content
    .map((c) => c.text)
    .join("\n")
    .trim()
  const artifacts: string[] = []
  const artifactRegex = /<antArtifact\s+([^>]+)>([\s\S]*?)<\/antArtifact>/gi

  text = text.replace(artifactRegex, (match, attr, content) => {
    let language = "plaintext"
    const langMatch = /language="([^"]+)"/i.exec(attr)
    if (langMatch) language = langMatch[1]
    return `%%CHATGPT_TO_NOTION_WORK2%%\n\`\`\`${language}\n${content.trim()}\n\`\`\``
  })

  return text
}
