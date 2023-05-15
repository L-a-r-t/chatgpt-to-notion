import type { PlasmoContentScript } from "plasmo"
import { compress } from "shrink-string"

import { Storage } from "@plasmohq/storage"

import { parseSave } from "~api/parseSave"
import { getChatConfig, updateChatConfig } from "~utils/functions"
import type { AutosaveStatus, ChatConfig } from "~utils/types"

export const config: PlasmoContentScript = {
  matches: ["https://chat.openai.com/*"]
}

let saving = false
// Redundancy is key to make this process as reliable and resilient to front-end changes as possible
// This is why we have checks for both the button and the dots, as both show up when generating text
const callback = async (mutations: MutationRecord[]) => {
  const storage = new Storage()
  const [isPremium, activeTrial] = await Promise.all([
    storage.get("isPremium"),
    storage.get("activeTrial")
  ])
  if (!(isPremium || activeTrial)) return
  const chatID = await storage.get("chatID")
  const config = await getChatConfig(chatID)
  if (!config) return
  if (saving) return
  mutations.forEach(async (mutation) => {
    try {
      const willSave = () => {
        updateChatConfig(chatID, { lastSaveStatus: "generating" })
        storage.set("autosaveStatus", "generating" as AutosaveStatus)
      }

      if (!config.enabled) return

      if (mutation.type !== "childList") return

      if (config.lastSaveStatus !== "generating") {
        mutation.addedNodes.forEach((node) => {
          const button = node.parentElement?.querySelector("button")
          if (!button) return
          if (button.textContent == "Stop generating") {
            // console.log("Found button")
            willSave()
            return
          }
          const svg = button.querySelector("rect")
          if (svg) {
            // console.log("Found svg")
            willSave()
            return
          }

          const parent = mutation.target.parentElement?.parentElement
          if (!parent) return

          const dots = parent.querySelector("button.absolute > div > span")
          if (!dots) return

          // console.log("Found dots", dots)
          willSave()
          return
        })
      } else {
        if (saving) return
        saving = true
        // console.log("Saving")
        storage.set("autosaveStatus", "saving" as AutosaveStatus)

        const matches = document.querySelectorAll(".group.w-full")
        const chat = Array.from(matches).slice(-2)

        const rawPrompt = chat[0]
        const rawAnswer = chat[1]

        const prompts = [
          await compress(
            rawPrompt.querySelector(".whitespace-pre-wrap")?.textContent ?? ""
          )
        ]
        const answers = [
          await compress(
            (
              rawAnswer.querySelector(".markdown") ??
              rawAnswer.querySelector(".dark.text-orange-500")
            )?.innerHTML
          )
        ]

        const url = window.location.href
        const title = document.title

        const database = config.database

        if (!database) {
          throw new Error("No database linked to this chat")
        }

        const generateHeadings = true

        const { conflictingPageId } = await chrome.runtime.sendMessage({
          type: "checkSaveConflict",
          body: {
            title,
            database
          }
        })

        const req = { prompts, answers, url, title, database, generateHeadings }
        const parsedReq = {
          ...(await parseSave(req)),
          saveBehavior: "append",
          conflictingPageId
        }
        const res = await chrome.runtime.sendMessage({
          type: "autoSave",
          body: parsedReq
        })
        saving = false
        updateChatConfig(chatID, {
          lastSaveStatus: res.err ? "error" : "success",
          lastError: res.err
            ? {
                message: res.err.message ?? null,
                code: res.err.code ?? res.err.status ?? null
              }
            : null
        })
      }
    } catch (err) {
      console.error(err)
      storage.set("autosaveStatus", "error" as AutosaveStatus)
      saving = false
      updateChatConfig(chatID, {
        lastSaveStatus: "error",
        lastError: {
          message: err.message ?? null,
          code: err.code ?? err.status ?? null
        }
      })
    }
  })
}

const initialize = async () => {
  const chatID = window.location.href.split("/c/").pop()
  const storage = new Storage()
  storage.set("chatID", chatID ?? null)
  if (!chatID) return

  const config = await getChatConfig(chatID)
  if (config) {
    const prevStatus = config.lastSaveStatus
    storage.set(
      "autosaveStatus",
      prevStatus === "error" ? "error" : config.enabled ? "saved" : "disabled"
    )
  }

  const [isPremium, activeTrial] = await Promise.all([
    storage.get("isPremium"),
    storage.get("activeTrial")
  ])
  if (!(isPremium || activeTrial)) return

  const element = document.querySelector(
    "form > div > div > .flex.justify-center"
  )

  if (!element) {
    console.error("Element not found")
    return
  }

  observer.observe(element, {
    childList: true
  })
}

const observer = new MutationObserver(callback)

// https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
let oldHref = document.location.href
window.onload = () => {
  initialize()
  new MutationObserver((mutations) =>
    mutations.forEach(() => {
      if (oldHref !== document.location.href) {
        oldHref = document.location.href
        initialize()
      }
    })
  ).observe(document.querySelector("body")!, { childList: true, subtree: true })
}

// This is the DOM content we're interested in

// <form class="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
// <div class="relative flex h-full flex-1 items-stretch md:flex-col">
//   <div class="">
//     <div class="h-full flex ml-1 md:w-full md:m-auto md:mb-2 gap-0 md:gap-2 justify-center">
//       <button
//         class="btn relative btn-neutral border-0 md:border"
//         as="button">
//         <div class="flex w-full gap-2 items-center justify-center">
//           <svg
//             stroke="currentColor"
//             fill="none"
//             stroke-width="1.5"
//             viewBox="0 0 24 24"
//             stroke-linecap="round"
//             stroke-linejoin="round"
//             class="h-3 w-3"
//             height="1em"
//             width="1em"
//             xmlns="http://www.w3.org/2000/svg">
//             <rect
//               x="3"
//               y="3"
//               width="18"
//               height="18"
//               rx="2"
//               ry="2"></rect>
//           </svg>
//           Stop generating
//         </div>
//       </button>
//     </div>
//   </div>
//   <div class="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
//     <textarea
//       tabindex="0"
//       data-id="request-:R1dd6:-26"
//       rows="1"
//       placeholder="Send a message."
//       class="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
//       style="max-height: 200px; height: 24px; overflow-y: hidden;"></textarea>
//     <button
//       disabled=""
//       class="absolute p-1 rounded-md text-gray-500 bottom-1.5 md:bottom-2.5 hover:bg-gray-100 enabled:dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent disabled:bottom-0.5 md:disabled:bottom-1 right-1 md:right-2">
//       <div class="text-2xl">
//         <span class="">·</span>
//         <span class="">·</span>
//         <span class="">·</span>
//       </div>
//     </button>
//   </div>
// </div>
// </form>
