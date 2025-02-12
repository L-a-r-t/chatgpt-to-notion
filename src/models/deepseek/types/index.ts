export type DeepseekConversation = {
  data: {
    biz_code: number
    biz_msg: string
    biz_data: {
      chat_session: {
        id: string
        seq_id: number
        agent: string
        character: null | string
        title: string
        title_type: string
        version: number
        current_message_id: number
        inserted_at: number
        updated_at: number
      }
      chat_messages: DeepseekMessage[]
      cache_valid: boolean
      route_id: null | string
    }
  }
}

export type DeepseekMessage = {
  message_id: number
  parent_id: number
  model: string
  role: "USER" | "ASSISTANT"
  content: string
  thinking_enabled: boolean
  thinking_content: null | string
  thinking_elapsed_secs: null | number
  ban_edit: boolean
  ban_regenerate: boolean
  status: "FINISHED" | "INCOMPLETE"
  accumulated_token_usage: number
  files: any[]
  inserted_at: number
  search_enabled: boolean
  search_status: null
  search_results: null
  tip: null
  feedback: null
}
