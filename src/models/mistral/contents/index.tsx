import type {
  PlasmoCSConfig,
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
  matches: ["https://chat.mistral.ai/*"]
}

// Target the flex container that holds the Mistral logo and message content
// @ts-ignore
export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const messageContainers = document.querySelectorAll(
    ".group.flex.w-full.gap-3 .flex.min-w-0.flex-1.flex-col"
  )

  return Array.from(messageContainers).filter((container) =>
    container.parentElement?.querySelector('svg[class*="fill-brand-orange"]')
  )
}

export const render: PlasmoRender<Element> = async ({
  anchor,
  createRootContainer
}) => {
  if (!anchor || !createRootContainer) return
  const rootContainer = await createRootContainer(anchor)
  const anchorElement = anchor.element
  // Insert the root container as the first child of the flex container
  anchorElement.insertBefore(rootContainer, anchorElement.firstChild)
  const root = createRoot(rootContainer)
  const parent = anchorElement.parentElement
  parent?.classList.add("pin")
  parent?.classList.add("relative")
  root.render(<Content parent={parent!} />)
}

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
    const index = getPinIndex(parent)
    setPinIndex(index)
  }, [])

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
        const assistantPins = Array.from(pins).filter((pin) =>
          pin.querySelector('svg[class*="fill-brand-orange"]')
        )
        const lastPin = assistantPins[assistantPins.length - 1]
        if (!lastPin) return false
        const parentNode = parent.firstChild?.parentNode
        if (!parentNode) return false
        return (
          lastPin.firstChild?.parentNode?.isSameNode(
            parent.firstChild?.parentNode
          ) ?? false
        )
      })()
    )
  }, [chatID, status])

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
    }
  }, [chatID, status])

  const handleClick = async () => {
    if (!authenticated) {
      alert(i18n("errConnect"))
      return
    }

    const text = Array.from(
      parent.querySelectorAll(".prose.select-text") || []
    ).map((el) => el.innerHTML)

    let uncompressedAnswer = text[0]
    if (text.length > 1) {
      uncompressedAnswer = text.reduce((acc, curr, i, arr) => {
        if (i == 0) return curr
        const prev = arr[i - 1]
        const joint = (curr + prev).includes("%%CHATGPT_TO_NOTION_WORK2%%")
          ? ""
          : "%%CHATGPT_TO_NOTION_SPLIT%%"
        return [acc, curr].join(joint)
      }, "")
    }

    const answer = await compress(uncompressedAnswer)

    let promptContainer = parent.previousElementSibling
    while (
      promptContainer &&
      promptContainer.querySelector('svg[class*="fill-brand-orange"]')
    ) {
      promptContainer = promptContainer.previousElementSibling
    }
    const promptElement = promptContainer?.querySelector(
      ".whitespace-break-spaces"
    )
    const prompt = await compress(promptElement?.textContent || "")
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
      <div className="flex items-center gap-2 px-2 py-1">
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
            background: "transparent",
            border: "none",
            cursor: status !== "generating" ? "pointer" : "default"
          }}>
          {isLastMessage ? <LastMessageIcon /> : <LogoIcon />}
        </button>
      </div>
    )

  return (
    <div className="flex items-center gap-2 px-2 py-1 absolute top-10 -left-10">
      <button
        onClick={handleClick}
        className="pin text-gray-800 dark:text-gray-100"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer"
        }}>
        <PinIcon />
      </button>
    </div>
  )
}

const getPinIndex = (parent: Element) => {
  const pins = Array.from(document.querySelectorAll(".pin")).filter((pin) =>
    pin.querySelector('svg[class*="fill-brand-orange"]')
  )
  return pins.findIndex((pin) => pin.isSameNode(parent))
}

type Props = {
  parent: Element
}
