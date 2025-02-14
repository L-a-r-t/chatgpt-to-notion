export type ClaudeConversation = {
  uuid: string
  name: string
  summary: string
  created_at: string
  updated_at: string
  settings: any
  is_starred: boolean
  current_leaf_message_uuid: string
  chat_messages: ClaudeMessage[]
}

export type ClaudeMessage = {
  uuid: string
  text: string
  content: Content[]
  sender: "human" | "assistant"
  index: number
  created_at: string
  updated_at: string
  truncated: boolean
  attachments: Attachment[]
  files: FileV1[]
  files_v2: FileV2[]
  sync_ressources: any[]
  parent_message_uuid: string
} & {
  sender: "assistant"
  stop_reason: string
}

type Content = {
  start_timestamp: string
  stop_timestamp: string
  type: "text"
  text: string
  citations: any[]
}

type Attachment = {
  id: string
  file_name: string
  file_size: number
  file_type: string
  extracted_content: string
  created_at: string
}

type FileV1 = {
  file_kind: string
  file_uuid: string
  file_name: string
  created_at: string
  thumbnail_url: string
  preview_url: string
  thumbnail_asset: {
    url: string
    file_variant: string
    primary_color: string
    image_width: number
    image_height: number
  }
  preview_asset: {
    url: string
    file_variant: string
    primary_color: string
    image_width: number
    image_height: number
  }
}

type FileV2 = {
  file_kind: string
  file_uuid: string
  file_name: string
  created_at: string
  thumbnail_url: string
  preview_url: string
  thumbnail_asset: {
    url: string
    file_variant: string
    primary_color: string
    image_width: number
    image_height: number
  }
  preview_asset: {
    url: string
    file_variant: string
    primary_color: string
    image_width: number
    image_height: number
  }
}
