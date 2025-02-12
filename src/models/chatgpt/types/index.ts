export type ChatGPTConversation = {
  title: string
  conversation_id: string
  mapping: Record<string, ChatGPTMessage>
}

export type ChatGPTMessage = {
  message?: {
    create_time: number
    author?: {
      role: string
      name: string
    }
    content: {
      content_type: string
      parts?: any[]
      text?: string
    }
    recipient: string
    metadata: Record<string, any>
    end_turn?: true
  }
  children?: string[]
}

export type CanvasMessageMetadata = {
  textdoc_id: string
  textdoc_type: string
  version: number
  title: string
}

export type CanvasHistoryResponse = {
  previous_doc_states: {
    id: string
    version: number
    title: string
    textdoc_type: string
    content: string
    comments: []
    updated_at: string
  }[]
}

export type CreateCanvasData = {
  name: string
  title?: string // futureproofing
  type: string
  content: string
}
