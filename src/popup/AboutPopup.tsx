import GitHubIcon from "~common/github"

import "~styles.css"

import { i18n } from "~utils/functions"

function AboutPopup() {
  return (
    <>
      <p className="text-sm">
        <span className="italic">{i18n("extensionName")}</span>
        {" " + i18n("about_extensionBy") + " "}
        <a className="link" href="https://github.com/L-a-r-t" target="_blank">
          Théo Lartigau
        </a>
        {". " + i18n("about_suggestionsIssues")}
      </p>
      <div className="flex justify-center">
        <a href="https://github.com/L-a-r-t/ChatGPT-to-Notion" target="_blank">
          <GitHubIcon />
        </a>
      </div>
      <div className="text-center text-xs text-gray-500">
        {i18n("about_pinIcon") + " "}
        <a href="http://www.onlinewebfonts.com/icon">Icon Fonts</a>
        {" " + i18n("about_pinLicense")}
      </div>
    </>
  )
}

export default AboutPopup
