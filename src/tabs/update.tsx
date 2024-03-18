import { useStorage } from "@plasmohq/storage/hook"

import "~styles.css"

import { STORAGE_KEYS } from "~utils/consts"

export default function UpdatePage() {
  const [enabled] = useStorage(STORAGE_KEYS.ecoModeActive, false)

  const enableEco = () => {
    chrome.storage.local.set({ permissionsGranted: true }, async function () {
      // check if an extension enough permissions
      chrome.runtime.sendMessage(
        { permAction: "checkIfHasEnough" },
        function (response) {
          console.log(response.permStatus)
          const hasEnough = response.permStatus

          if (!hasEnough) {
            // if not enough then we should request it
            chrome.runtime.sendMessage({
              permAction: "getPerm",
              agreement: true
            })
          }
        }
      )
    })
  }

  return (
    <div className="w-screen bg-white flex justify-center min-h-screen px-16 py-12">
      <div className="h-full max-w-3xl flex flex-col">
        <div className="flex justify-center">
          <img
            width={400}
            src={chrome.runtime.getURL("assets/illustration.png")}
          />
        </div>
        <h1 className="text-center text-5xl font-bold">
          ChatGPT to Notion just got an update! 🎉
        </h1>
        <p className="text-center p-2 border mt-6 rounded-xl text-base">
          There are some major changes, please read this page.
        </p>
        <h2 className="text-4xl font-bold mb-2 mt-8">Changelog (v 1.9.0)</h2>
        <a
          className="link mb-4"
          href="https://github.com/L-a-r-t/chatgpt-to-notion/blob/master/CHANGELOG.md"
          target="_blank">
          Read the changelog for every update here
        </a>
        <h3 className="text-2xl font-semibold mt-2">Features</h3>
        <ul className="list-disc pl-4 py-2 text-base">
          <li>Eco-friendly mode</li>
          <li>Open saved page in Notion</li>
          <li>KaTeX notation support</li>
          <li>Update page with changelog</li>
        </ul>
        <h3 className="text-2xl font-semibold">Fixes</h3>
        <ul className="list-disc pl-4 py-2 text-base">
          <li>Improper handling of prompts with multiple line jumps</li>
          <li>
            Edge case where individual save would fail on a brand new
            conversation
          </li>
        </ul>
        <h3 className="text-4xl font-bold my-4">Enabling eco-friendliness</h3>
        <p className="px-8 py-4 text-justify text-base">
          When I first created ChatGPT to Notion, I wasn't at all expecting it
          to become the success that it is today! I am incredibly grateful for
          having the opportunity to bring something useful to tens of thousands
          of people. However, as I kept going through with my studies, I've been
          lacking time to maintain the extension and develop alternatives for
          other LLMs as much as I wanted to. <br />
          <br />
          As a way to keep myself motivated to work on this project and to
          sustain myself through my studies, I have implemented a premium
          subscription that I've been wanting to get rid of ever since. Being
          fully aware of the fact that having a large platform is a rare
          occurence, I want to be as positive as possible. That's why I'm
          partnering up with the team at allcolibri to give ChatGPT to Notion
          the opportunity to also be a net positive for the environment. <br />
          <br />
          Eco-friendly mode is a compltetely optional feature that I've been
          working on implementing. When visiting a partner website, a portion of
          the revenue generated from your visit will be used to plant trees and
          to remunerate the extension's development. If this partnership proves
          to be successful,{" "}
          <b>
            I will be using this revenue stream to make the extension features
            free for everyone.
          </b>
          <br />
          <br />
          Thank you for your interest in ChatGPT to Notion,
          <br />
          Théo Lartigau
        </p>
        <div className="flex justify-center">
          {enabled ? (
            <p className="font-semibold text-xl">
              Eco-friendly mode is enabled, congrats! 🌳
            </p>
          ) : (
            <button
              onClick={enableEco}
              className="py-4 px-8 rounded-xl bg-green-600 text-white font-semibold text-base">
              Enable eco-friendly mode
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
