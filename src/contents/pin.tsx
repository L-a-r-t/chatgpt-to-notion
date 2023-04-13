import type {
  PlasmoContentScript,
  PlasmoGetInlineAnchorList,
  PlasmoRender
} from "plasmo"
import { createRoot } from "react-dom/client"
import { compress } from "shrink-string"

import { useStorage } from "@plasmohq/storage/hook"

import PinIcon from "~common/pin"

import "~styles.css"

import { i18n } from "~utils/functions"

export const config: PlasmoContentScript = {
  matches: ["https://chat.openai.com/*"]
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll(".flex-col.items-end > .p-1")

export const render: PlasmoRender = async ({
  anchor, // the observed anchor, OR document.body.
  createRootContainer // This creates the default root container
}) => {
  // @ts-ignore
  const rootContainer = await createRootContainer(anchor)

  const root = createRoot(rootContainer) // Any root
  root.render(
    <>
      <Content
        // @ts-ignore
        parent={anchor.element.parentElement.parentElement.parentElement}
      />
    </>
  )
}

const Content = ({ parent }: Props) => {
  const [toBeSaved, setToBeSaved] = useStorage("toBeSaved")
  const [showPopup, setShowPopup] = useStorage("showPopup", false)
  const [authenticated] = useStorage("authenticated", false)

  const handleClick = async () => {
    if (!authenticated) {
      alert(i18n("errConnect"))
      return
    }
    const answer = await compress(
      // @ts-ignore
      (
        parent.querySelector(".markdown") ??
        parent.querySelector(".dark.text-orange-500")
      ).innerHTML
    )
    const prompt = await compress(
      // @ts-ignore
      parent.previousElementSibling.querySelector(".whitespace-pre-wrap")
        .textContent
    )
    const title = document.title
    const url = window.location.href

    await setToBeSaved({
      answer,
      prompt,
      title,
      url
    })

    await setShowPopup(true)
  }

  return (
    <button
      onClick={handleClick}
      className="text-gray-800 dark:text-gray-100"
      style={{
        background: "transparent",
        border: "none",
        marginTop: 10,
        padding: 4,
        borderRadius: 4,
        width: 30,
        cursor: "pointer"
      }}>
      <PinIcon />
    </button>
  )
}

export default Content

type Props = {
  parent: Element
}
