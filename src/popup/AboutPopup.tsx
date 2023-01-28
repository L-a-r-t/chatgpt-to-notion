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
      <ol className="my-4">
        <li>
          <a
            className="link text-sm"
            href="https://theo-lartigau.notion.site/FAQ-50befa31f01a495b9d634e3f575dd4ba"
            target="_blank">
            {i18n("about_FAQ")}
          </a>
        </li>
        <li>
          <a
            className="link text-sm"
            href="https://github.com/L-a-r-t/ChatGPT-to-Notion"
            target="_blank">
            {i18n("about_github")}
          </a>
        </li>
      </ol>
      <div className="text-center text-xs text-gray-500">
        {i18n("about_pinIcon") + " "}
        <a href="http://www.onlinewebfonts.com/icon">Icon Fonts</a>
        {" " + i18n("about_pinLicense")}
      </div>
    </>
  )
}

export default AboutPopup
