import { useStorage } from "@plasmohq/storage/hook"

import Markdown from "~lib/react-markdown.min.js"

import "~styles.css"

import { STORAGE_KEYS } from "~utils/consts"
import { i18n } from "~utils/functions"

export default function UpdatePage() {
  return (
    <div className="w-full bg-white flex justify-center min-h-screen px-16 py-12">
      <div className="h-full max-w-3xl flex flex-col">
        <div className="flex justify-center">
          <img
            width={400}
            src={chrome.runtime.getURL("assets/illustration.png")}
          />
        </div>
        <h1 className="text-center text-5xl font-bold">
          {i18n("update_heading")}
        </h1>
        <div className="my-8 text-lg">
          <div className="flex justify-center mb-8 mt-4">
            <a
              className="button bg-yellow-500 text-lg"
              href="https://theolartigau.gumroad.com/l/chatgpt-to-notion">
              {i18n("update_button")}
            </a>
          </div>
          <Markdown
            components={{
              p: ({ children }) => (
                <p className="text-justify my-2">{children}</p>
              ),
              h1: ({ children }) => (
                <h1 className="text-4xl font-bold mt-8 mb-6">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>
              ),
              a: ({ children, href }) => (
                <a className="link text-yellow-500" href={href} target="_blank">
                  {children}
                </a>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside">{children}</ul>
              )
            }}>
            {i18n("update_desc")}
          </Markdown>
        </div>
      </div>
    </div>
  )
}
