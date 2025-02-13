export type MistralConversation = {
  metadata: {
    id: string
    title: string
    generatedTitle: string
    updatedAt: string
    organizationId: string
    permission: string
    features: string[]
    integrations: any[]
    pinned: boolean
    visibility: string
    createdById: string
    copies: any[]
  }
  conversation: {
    items: MistralMessage[]
  }
}

export type MistralMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  contentChunks: any
  version: number
  status: string
  reaction: string
  createdAt: string
  createdById: string
  chatId: string
  model: any
  moderationCategory: string
  references: any
  turn: number
  parentId: string
  parentVersion: number
  prevVersion: any
  nextVersion: any
  versionCount: number
  visibility: string
  toolCalls: number
  isAcceleratedAnswer: boolean
  files: any[]
}
