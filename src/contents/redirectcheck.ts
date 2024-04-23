import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

export const redirectcheck = async () => {
  function gup(name: string, url: string) {
    const n = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]")
    const u = url || location.href

    const regexS = `[\\?&]${n}=([^&#]*)`
    const regex = new RegExp(regexS)
    const results = regex.exec(u)

    return results == null ? null : results[1]
  }

  window.addEventListener("load", () => {
    if (window.location.search.indexOf("partnerurl=") > -1) {
      const url = decodeURIComponent(gup("partnerurl", location.href) ?? "")
      location.href = url
      return
    }

    window.setTimeout(() => {
      chrome.runtime.sendMessage({ action: "get_tabstatus" }, (response) => {
        if (response) {
          chrome.runtime.sendMessage({ action: "close_current_tab" }, () => {})
        }
      })
    }, 3e3)
  })

  //------------------ MANAGE SETTING POPUP -----------------------
  window.addEventListener("load", () => {
    if (window.location.href == "https://impacthero.co/manage-settings") {
      console.log("redirectcheck: url manage settings detected")

      // check if an extension enough permissions
      let statusChecked = "checked"
      chrome.runtime.sendMessage(
        { permAction: "checkIfHasEnough" },
        function (response) {
          //console.log('redirectcheck: checkIfHasEnough permission answer received', response);

          let hasEnough = response.permStatus

          chrome.storage.local.get(["permissionsGranted"], function (result) {
            let hasAccepted = result.permissionsGranted

            if (!hasEnough || hasAccepted === false) {
              statusChecked = ""
              //console.log('redirectcheck: permissionsGranted',hasAccepted);
            } else if (hasEnough && hasAccepted === true) {
              statusChecked = "checked"
              //console.log('redirectcheck: permissionsGranted',hasAccepted);
            }

            // Inject HTML
            const div = document.createElement("div")
            div.innerHTML =
              `<div style="text-align:center;margin-top:50px;">
                          <p style="font-size: 20px !important;""><b>ChatGPT to Notion</b></p>
                          <p style="font-size: 16px !important;"><b>Manage eco-friendly mode:</b></p>
                          <p><label class="switch"><input type="checkbox" id="mySwitch" ` +
              statusChecked +
              `><span class="slider round"></span></label></p>
                          <p>If activated, you'll participate in planet protection for free. <a href="https://impacthero.co/ecomode/?extension_name=ChatGPT to Notion" target="_blank" style="color: #999 !important;">Learn more.</a></p>
                        </div>`
            document.body.appendChild(div)

            // Inject CSS
            const style = document.createElement("style")
            style.textContent = `.switch { position: relative; display: inline-block; width: 60px; height: 34px; } .switch input { opacity: 0; width: 0; height: 0; } .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; -webkit-transition: .4s; transition: .4s; } .slider:before { position: absolute; content: ""; height: 26px; width: 26px; left: 4px; bottom: 4px; background-color: white; -webkit-transition: .4s; transition: .4s; } input:checked + .slider { background-color: #4ed4b3; } input:focus + .slider { box-shadow: 0 0 1px #4ed4b3; } input:checked + .slider:before { -webkit-transform: translateX(26px); -ms-transform: translateX(26px); transform: translateX(26px); } .slider.round { border-radius: 34px; } .slider.round:before { border-radius: 50%; } body { font-family: 'Helvetica Neue', Helvetica, Verdana, Arial, sans-serif !important; font-size: 14px !important; }`

            document.head.appendChild(style)

            //click on toggle
            document
              .getElementById("mySwitch")
              ?.addEventListener("click", async function () {
                if (!hasEnough || hasAccepted === false) {
                  //impact hero feature set to ON
                  if (!hasEnough) {
                    chrome.runtime.sendMessage({
                      permAction: "getPerm",
                      agreement: true
                    })
                  }
                  if (hasAccepted === false) {
                    chrome.storage.local.set(
                      { permissionsGranted: true },
                      function () {}
                    )
                    console.log("redirectcheck: permissionsGranted SET TO OFF")
                    window.location.reload()
                  }
                } else if (hasEnough && hasAccepted === true) {
                  //impact hero feature set to OFF
                  //console.log('redirectcheck: permissionsGranted SET TO OFF');
                  chrome.storage.local.set(
                    { permissionsGranted: false },
                    function () {}
                  )
                  chrome.runtime.sendMessage({
                    permAction: "refusePerm",
                    agreement: true
                  })
                  window.location.reload()
                }
              })
          })
        }
      )
    }
  })
}

redirectcheck()
