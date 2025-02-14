import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchorList,
  PlasmoRender
} from "plasmo"
import { useCallback, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { compress } from "shrink-string"

import { useStorage } from "@plasmohq/storage/hook"

import LogoIcon from "~common/logo"
import PinIcon from "~common/pin"

// import ClaudeLogoIcon from "~common/claudeLogo"
import "~styles.css"

import { STORAGE_KEYS } from "~utils/consts"
import { getChatConfig, i18n } from "~utils/functions"
import type { AutosaveStatus, PopupEnum, ToBeSaved } from "~utils/types"

// Run on Claude conversation pages
export const config: PlasmoCSConfig = {
  matches: ["https://claude.ai/*"]
}

// Select each Claude message container (adjust selector as needed)
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll(".font-claude-message")

export const render: PlasmoRender<Element> = async ({
  anchor,
  createRootContainer
}) => {
  if (!anchor || !createRootContainer) return

  const rootContainer = await createRootContainer(anchor)
  const root = createRoot(rootContainer)
  const parent = anchor.element

  // Mark this element for pin indexing
  parent?.classList.add("pin")

  root.render(<Content parent={parent} />)
}

type Props = { parent: Element }

export const Content = ({ parent }: Props) => {
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
  const [showPin, setShowPin] = useState(true)
  const [pinIndex, setPinIndex] = useState(-1)

  useEffect(() => {
    setPinIndex(getPinIndex(parent))
  }, [parent])

  useEffect(() => {
    if (!(isPremium || activeTrial) || !chatID) return
    const checkAutosave = async () => {
      const config = await getChatConfig(chatID)
      if (config) setAutosave(config.enabled)
    }
    checkAutosave()

    setIsLastMessage(() => {
      const pins = document.querySelectorAll(".pin")
      const lastPin = pins[pins.length - 1]
      if (!lastPin) return false
      const parentNode = parent.firstChild?.parentNode
      return parentNode
        ? lastPin.firstChild?.parentNode?.isSameNode(
            parent.firstChild?.parentNode
          ) ?? false
        : false
    })
  }, [chatID, status, parent, isPremium, activeTrial])

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

    const container = parent.parentElement
    console.log({ parent, container })

    // For Claude, assume message text is in <p> elements
    const text = Array.from(parent!.querySelectorAll(".grid")).map(
      (el) => el.innerHTML
    )

    let uncompressedAnswer = text[0]

    const answer = await compress(uncompressedAnswer)

    // Assume prompt text is in a <p> within the previous sibling container
    const promptElement =
      container?.parentElement?.parentElement?.previousElementSibling?.querySelector(
        "p.whitespace-pre-wrap"
      )
    const prompt = promptElement
      ? await compress(promptElement.textContent || "")
      : ""
    const title = document.title
    const url = window.location.href

    await setToBeSaved({ answer, prompt, title, url, pin: pinIndex })
    await setShowPopup("save")
  }

  if (!showPin) return null

  // If autosave is enabled, render with adjusted styling
  if (autosaveEnabled)
    return (
      <div style={{ position: "relative", width: "100%", height: 33 }}>
        <button
          className="flex items-center ml-2 mt-1"
          onClick={
            isLastMessage && status === "error"
              ? () => setShowPopup("error")
              : status === "saved"
              ? handleClick
              : undefined
          }
          style={{
            position: "absolute",
            right: 0,
            background: "transparent",
            border: "none",
            marginTop: 10,
            cursor: status !== "generating" ? "pointer" : "default"
          }}>
          {isLastMessage ? <LastMessageIcon /> : <LogoIcon />}
        </button>
      </div>
    )

  return (
    <div style={{ position: "relative", width: "100%", height: 33 }}>
      <button
        onClick={handleClick}
        className="text-gray-800 dark:text-gray-100 flex items-center ml-2 mt-1"
        style={{
          position: "absolute",
          right: 0,
          background: "transparent",
          border: "none",
          marginTop: 10,
          padding: 4,
          borderRadius: 4,
          cursor: "pointer"
        }}>
        <PinIcon />
      </button>
    </div>
  )
}

const getPinIndex = (parent: Element) => {
  const pins = document.querySelectorAll(".pin")
  return Array.from(pins).findIndex((pin) => pin.isSameNode(parent))
}
