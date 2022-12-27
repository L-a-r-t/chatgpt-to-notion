import GitHubIcon from "~common/github"

import "~styles.css"

function AboutPopup() {
  return (
    <>
      <p className="text-sm">
        <span className="italic">ChatGPT to Notion</span> is a chrome extension
        developped by{" "}
        <a className="link" href="https://github.com/L-a-r-t" target="_blank">
          Théo Lartigau
        </a>
        . Got any suggestion/issue to report? Check out the extension's GitHub.
      </p>
      <div className="flex justify-center">
        <a href="https://github.com/L-a-r-t/ChatGPT-to-Notion" target="_blank">
          <GitHubIcon />
        </a>
      </div>
      <div className="text-center text-xs text-gray-500">
        Pin icon made from{" "}
        <a href="http://www.onlinewebfonts.com/icon">Icon Fonts</a> is licensed
        by CC BY 3.0
      </div>
    </>
  )
}

export default AboutPopup
