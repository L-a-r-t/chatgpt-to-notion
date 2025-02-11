import type {
  PlasmoCSConfig,
  PlasmoCSUIAnchor,
  PlasmoContentScript,
  PlasmoGetInlineAnchorList,
  PlasmoRender
} from "plasmo"
import { createRoot } from "react-dom/client"
import { compress } from "shrink-string"

import { useStorage } from "@plasmohq/storage/hook"

import PinIcon from "~common/pin"

import "~styles.css"

import { useCallback, useEffect, useState } from "react"

import LogoIcon from "~common/logo"
import { STORAGE_KEYS } from "~utils/consts"
import { getChatConfig, i18n } from "~utils/functions"
import type { AutosaveStatus, PopupEnum, ToBeSaved } from "~utils/types"

export const config: PlasmoCSConfig = {
  matches: ["https://chat.openai.com/*", "https://chatgpt.com/*"]
}

/**
 * Previously this was querying for the <markdown> tag.
 * The ChatGPT DOM uses a div with a "markdown" class.
 */
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll(".markdown")

export const render: PlasmoRender<Element> = async ({
  anchor, // the observed anchor, OR document.body.
  createRootContainer // Creates the default root container
}) => {
  if (!anchor || !createRootContainer) return

  const rootContainer = await createRootContainer(anchor)
  // Instead of multiple parentElement calls, use closest() to grab the container
  // that represents the whole assistant turn.
  const parent = anchor.element.closest(".agent-turn")
  parent?.classList.add("pin")
  parent?.insertBefore(rootContainer, parent.firstChild)

  const root = createRoot(rootContainer)
  rootContainer.classList.add("relative")

  root.render(
    <>
      <Content parent={parent} />
    </>
  )
}

type Props = {
  parent: Element | null
}

const Content = ({ parent }: Props) => {
  const [toBeSaved, setToBeSaved] = useStorage<ToBeSaved>(
    STORAGE_KEYS.toBeSaved
  )
  const [showPopup, setShowPopup] = useStorage<PopupEnum | false>(
    STORAGE_KEYS.showPopup,
    false
  )
  const [authenticated] = useStorage(STORAGE_KEYS.authenticated, false)
  const [isPremium] = useStorage(STORAGE_KEYS.isPremium, false)
  const [activeTrial] = useStorage(STORAGE_KEYS.activeTrial, false)
  const [chatID] = useStorage(STORAGE_KEYS.chatID, "")
  const [status] = useStorage<AutosaveStatus>(
    STORAGE_KEYS.autosaveStatus,
    "generating"
  )

  const [autosaveEnabled, setAutosave] = useState(false)
  const [isLastMessage, setIsLastMessage] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [pinIndex, setPinIndex] = useState(-1)

  useEffect(() => {
    console.log(parent)
  }, [parent])

  useEffect(() => {
    // Only show the pin if a sibling agent-turn exists
    if (parent?.parentElement?.querySelector(".agent-turn")) {
      setShowPin(true)
    } else {
      parent?.classList.remove("pin")
    }
    const index = getPinIndex(parent)
    setPinIndex(index)
  }, [parent])

  useEffect(() => {
    if (!(isPremium || activeTrial) || !chatID) return
    const checkAutosave = async () => {
      const config = await getChatConfig(chatID)
      if (!config) return
      setAutosave(config.enabled)
    }
    checkAutosave()

    setIsLastMessage(
      (() => {
        const pins = document.querySelectorAll(".pin")
        const lastPin = pins[pins.length - 1]
        if (!lastPin) return false
        // A somewhat inelegant way to compare nodes:
        const parentNode = parent?.firstChild?.parentNode
        if (!parentNode) return false
        return lastPin.firstChild?.parentNode?.isSameNode(parentNode) ?? false
      })()
    )
  }, [chatID, status, isPremium, activeTrial, parent])

  const LastMessageIcon = useCallback(() => {
    switch (status) {
      case "disabled":
        return <LogoIcon />
      case "generating":
        return <LogoIcon loading />
      case "saving":
        return <LogoIcon loading />
      case "error":
        return <LogoIcon error />
      case "saved":
        return <LogoIcon />
      default:
        return <LogoIcon />
    }
  }, [status])

  const handleClick = async () => {
    if (!authenticated) {
      alert(i18n("errConnect"))
      return
    }

    const images = Array.from(parent?.querySelectorAll("img") || [])
    const text = Array.from(parent?.querySelectorAll(".markdown") || []).map(
      (el) =>
        el.parentElement?.classList.contains("mt-3")
          ? "%%CHATGPT_TO_NOTION_WORK1%%" + el.innerHTML
          : el.innerHTML
    )

    console.log(text)

    let uncompressedAnswer = text[0]
    if (text.length > 1) {
      uncompressedAnswer = text.reduce((acc, curr, i, arr) => {
        if (i === 0) return curr

        const prev = arr[i - 1]
        const joint = (curr + prev).includes("%%CHATGPT_TO_NOTION_WORK2%%")
          ? ""
          : "%%CHATGPT_TO_NOTION_SPLIT%%"
        return [acc, curr].join(joint)
      }, "")
    }

    const preCompressionAnswer =
      images.length > 0
        ? "%%CHATGPT_TO_NOTION_IMAGE%%" + uncompressedAnswer
        : uncompressedAnswer
    const answer = await compress(preCompressionAnswer)

    // Find the prompt in the previous sibling element:
    const promptElement =
      parent?.parentElement?.previousElementSibling?.querySelector(
        ".whitespace-pre-wrap"
      )
    const promptText = promptElement ? promptElement.textContent : ""
    const prompt = await compress(promptText || "")
    const title = document.title
    const url = window.location.href

    await setToBeSaved({
      answer,
      prompt,
      title,
      url,
      pin: pinIndex
    })

    await setShowPopup("save")
  }

  if (!showPin) return null

  if (autosaveEnabled)
    return (
      <button
        className="pin"
        onClick={
          isLastMessage && status === "error"
            ? () => setShowPopup("error")
            : status === "saved"
            ? handleClick
            : undefined
        }
        style={{
          display: "flex",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          marginTop: 10,
          cursor: status !== "generating" ? "pointer" : "default"
        }}>
        {isLastMessage ? <LastMessageIcon /> : <LogoIcon />}
      </button>
    )

  return (
    <button
      onClick={handleClick}
      className="text-gray-800 dark:text-gray-100 pin"
      style={{
        background: "transparent",
        border: "none",
        marginTop: 10,
        padding: 4,
        borderRadius: 4,
        position: "absolute",
        top: 32,
        left: -42,
        cursor: "pointer"
      }}>
      <PinIcon />
    </button>
  )
}

export default Content

const getPinIndex = (parent: Element | null) => {
  const pins = document.querySelectorAll(".pin")
  return Array.from(pins).findIndex((pin) =>
    parent ? pin.isSameNode(parent) : false
  )
}
