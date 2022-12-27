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

export const config: PlasmoContentScript = {
  matches: ["https://chat.openai.com/chat/*"]
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () =>
  document.querySelectorAll(".flex-col.items-end > .p-1")

export const render: PlasmoRender = async ({
  anchor, // the observed anchor, OR document.body.
  createRootContainer // This creates the default root container
}) => {
  const rootContainer = await createRootContainer(anchor)

  const root = createRoot(rootContainer) // Any root
  root.render(
    <>
      <Content
        parent={anchor.element.parentElement.parentElement.parentElement}
      />
    </>
  )
}

const Content = ({ parent }: Props) => {
  const [toBeSaved, setToBeSaved] = useStorage("toBeSaved")
  const [showPopup, setShowPopup] = useStorage("showPopup", false)

  const handleClick = async () => {
    const answer = await compress(
      (
        parent.querySelector(".markdown") ??
        parent.querySelector(".dark.text-orange-500")
      ).innerHTML
    )
    const prompt = await compress(
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
      style={{
        backgroundColor: "#444654",
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
