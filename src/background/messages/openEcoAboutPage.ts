import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    chrome.tabs.create(
      {
        url: "https://impacthero.co/ecomode/?extension_name=chatgpt_to_notion",
        active: true
      },
      (createdPermanentTab) => {
        chrome.storage.local.set({
          openPermanentTab: true
        })
      }
    )

    res.send({ success: true })
  } catch (err) {
    console.error(err)
    res.send({ err })
  }
}

export default handler
