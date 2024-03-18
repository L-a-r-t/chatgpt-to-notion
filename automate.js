;(() => {
  const IFRAME_TIMEOUT = 4
  const TAB_TIMEOUT = 60
  const CHECKOUT_TAB_TIMEOUT = 10

  function isJson(string) {
    try {
      JSON.parse(string)
    } catch (error) {
      return false
    }

    return true
  }

  function replaceUrlParam(e, a, t) {
    const n = new URL(e)

    n.searchParams.set(a, t || "")

    return n.toString()
  }

  const uuid = "chatgpt_to_notion"
  let merchant = window.merchant || {}

  if (isJson(merchant)) {
    merchant = JSON.parse(merchant)
  }

  chrome.runtime.sendMessage({ action: "get_tabstatus" }, (tabStatus) => {
    if (!tabStatus) {
      chrome.runtime.sendMessage(
        { action: "get_block_tab", merchantId: merchant.i },
        (tabBlock) => {
          chrome.runtime.sendMessage({
            action: "clear_block_tab",
            merchantId: merchant.i
          })

          const t =
            (new Date().getTime() - Number(localStorage.mzrimpacthero_active)) /
            6e4

          if (t > TAB_TIMEOUT) {
            delete localStorage.mzrimpacthero_active
          }

          const t2 =
            (new Date().getTime() -
              Number(localStorage.mzrimpacthero_active_checkout)) /
            6e4

          if (t2 > CHECKOUT_TAB_TIMEOUT) {
            delete localStorage.mzrimpacthero_active_checkout
          }

          const isCheckout = document.location.pathname.includes("checkout")

          if (
            !localStorage.mzrimpacthero_active ||
            (!localStorage.mzrimpacthero_active_checkout && isCheckout)
          ) {
            showPopup = true

            if (!localStorage.mzrimpacthero_active) {
              localStorage.mzrimpacthero_active = new Date().getTime()
            }

            if (!localStorage.mzrimpacthero_active_checkout && isCheckout) {
              localStorage.mzrimpacthero_active_checkout = new Date().getTime()
            }

            if (isCheckout) {
              if (!isFromSerp) {
                showPopup = false

                chrome.runtime.sendMessage({
                  action: "open_tab",
                  url: `https://impacthero.co/?title=${encodeURIComponent(
                    uuid
                  )}&fromcheckout=true&partnerurl=${encodeURIComponent(
                    replaceUrlParam(merchant.l, "uuid", uuid)
                  )}`
                })
              }
            } else {
              chrome.runtime.sendMessage({
                action: "open_tab",
                url: `https://impacthero.co/?title=${encodeURIComponent(
                  uuid
                )}&partnerurl=${encodeURIComponent(
                  replaceUrlParam(merchant.l, "uuid", uuid)
                )}`
              })
            }
          }
        }
      )
    }
  })
})()
