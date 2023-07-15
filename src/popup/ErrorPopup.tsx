import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

// import Spinner from "~common/components/Spinner"
import { getChatConfig, i18n } from "~utils/functions"
import type { ChatConfig } from "~utils/types"

function ErrorPopup() {
  const [chatID] = useStorage("chatID")
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<ChatConfig | undefined>()
  const [errorMessage, setErrorMessage] = useState("")
  const [errorCode, setErrorCode] = useState("")

  useEffect(() => {
    if (!chatID) return
    ;(async () => {
      const _config = await getChatConfig(chatID)
      if (!_config) return
      setConfig(_config)
      setErrorCode(_config.lastError?.code ?? "400")
      setErrorMessage(
        _config.lastError?.message ??
          interpretErrorCode(_config.lastError?.code ?? "400")
      )
    })()
  }, [chatID])

  const interpretErrorCode = (code: string) => {
    switch (code) {
      case "unauthorized":
        return i18n("autosave_errmsg_unauthorized")
      case "object_not_found":
        return i18n("autosave_errmsg_object_not_found")
      case "internal_server_error":
        return i18n("autosave_errmsg_internal_server_error")
      case "service_unavailable":
        return i18n("autosave_errmsg_service_unavailable")
      default:
        return i18n("autosave_errmsg_unexpected")
    }
  }

  const handleRetry = async () => {
    try {
      if (!config) return
      setLoading(true)
      await chrome.runtime.sendMessage({
        type: "chatgpt-to-notion_triggerAutosave",
        body: {
          chatID,
          config
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p className="text-center text-sm font-bold">{i18n("autosave_error")}</p>
      <div className="border rounded p-2 my-2">
        <p className="text-sm">
          <span className="font-semibold">{i18n("autosave_error_msg")}</span>
          {errorMessage}
        </p>
        <p className="text-sm">
          <span className="font-semibold">{i18n("autosave_error_code")}</span>
          {errorCode}
        </p>
      </div>
      <p className="text-sm">
        {i18n("autosave_error_desc")}
        <a
          className="link text-sm"
          href="https://theo-lartigau.notion.site/FAQ-50befa31f01a495b9d634e3f575dd4ba"
          target="_blank">
          {i18n("autosave_error_desc_faq")}
        </a>
        {i18n("autosave_error_desc_or")}
        <a
          className="link text-sm"
          href="mailto:tlartigau.pro@gmail.com"
          target="_blank">
          {i18n("autosave_error_desc_report")}
        </a>
      </p>
    </div>
  )
}

export default ErrorPopup
