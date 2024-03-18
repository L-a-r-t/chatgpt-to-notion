import automate from "./automate"

export const MERCHANT_LIST_URL =
  "https://storage.googleapis.com/impacthero-bucket/merchants-chatgpt-to-notion.json"
export const MERCHANT_LIST_LOCAL_URL = chrome.runtime.getURL("merchants.json")
export const MERCHANT_LIST_MAX_AGE = 24 * 60 * 60 * 1000
export let merchantList = {}
export let merchantListDate = 0
export let loading = true

// open new tab for url
export function openTab(url, tabOpenerId, rcb) {
  console.log("openTab", url, tabOpenerId)
  chrome.tabs.create({ url, active: false }, (createdTab) => {
    console.log("openTab", "createdTab")
    chrome.storage.local.set(
      {
        currentTabId: createdTab.id,
        currentTabOpenerId: tabOpenerId
      },
      () => {
        rcb()
      }
    )
  })
}

// close the desired tab
export function closeTab(tabId, rcb) {
  chrome.storage.local.get(["currentTabId", "currentTabOpenerId"], (value) => {
    try {
      chrome.tabs.remove(tabId, () => {
        chrome.storage.local.remove(
          ["currentTabId", "currentTabOpenerId"],
          () => {
            rcb()
          }
        )
      })
    } catch (error) {
      rcb()
    }
  })
}

// retrieve status of current tab id whether the tab id is matching the stored tabId
export function getTabId(tabId, rcb) {
  chrome.storage.local.get(["currentTabId"], (value) => {
    if (value.currentTabId === tabId) {
      rcb(true)
    } else {
      rcb(false)
    }
  })
}

export function getTUrl(url) {
  try {
    if (!url) return ""

    const a = new URL(url)
    return a.hostname.replace(/^www\./, "")
  } catch (error) {
    return ""
  }
}

let loadingStatus = {}

const tabListenerCallback = (
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
) => {
  try {
    // console.log("tab.OnUpdated", tabId, tab.url, changeInfo.status)

    if (!tab.url) {
      return
    }

    const taburl = getTUrl(tab.url)

    if (taburl) {
      let merchant = null

      if (merchantList[taburl]) {
        merchant = merchantList[taburl]
      }

      if (merchant) {
        console.log("tab.OnUpdated", "merchant", merchant)

        Object.keys(loadingStatus).forEach((u) => {
          if ((new Date().getTime() - Number(loadingStatus[u])) / 6e4 > 60) {
            delete loadingStatus[u]
          }
        })

        // console.log("loadingStatus", loadingStatus)

        if (!loadingStatus[taburl]) {
          chrome.scripting.executeScript({
            target: { tabId },
            func: (m) => {
              // @ts-ignore
              window.merchant = JSON.stringify(m)
            },
            args: [merchant]
          })

          chrome.scripting.executeScript({
            target: { tabId },
            func: automate
          })

          loadingStatus[taburl] = new Date().getTime()
        }
      }
    }
  } catch (_error) {
    console.error(_error)
  }
}

export function addTabListener() {
  // So the tab api is weird
  // the tab script firing multiple loading events
  loadingStatus = {}

  chrome.tabs.onUpdated.addListener(tabListenerCallback)
}

export function loadMerchants(callback: null | (() => void) = null) {
  fetch(MERCHANT_LIST_URL)
    .then((res) => res.json())
    .then((data) => {
      merchantList = {}

      if (!Array.isArray(data)) {
        return
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const val of data) {
        merchantList[getTUrl(val.merchanturl)] = {
          i: val.id,
          l: val.afflink
        }
      }

      chrome.storage.local.set(
        { merchantList, merchantListDate: new Date().getTime() },
        () => {
          console.log("merchant list loaded from server")

          if (callback) {
            callback()
          }
        }
      )
    })
    .catch((error) => {
      console.log(
        "failed to load merchant list from server, trying local. Error was: ",
        error
      )

      loadLocalMerchants(callback)
    })
}

function loadLocalMerchants(callback) {
  const localFilePath = "merchants.json"
  fetch(chrome.runtime.getURL(localFilePath))
    .then((response) => response.json())
    .then((data) => {
      merchantList = {}
      for (const val of data) {
        merchantList[getTUrl(val.merchanturl)] = {
          i: val.id,
          l: val.afflink
        }
      }

      chrome.storage.local.set(
        { merchantList, merchantListDate: new Date().getTime() },
        () => {
          console.log("Merchant list loaded from local file")
          if (callback) callback()
        }
      )
    })
    .catch((error) => {
      console.error("Failed to load merchant list from LOCAL file", error)
      if (callback) callback()
    })
}

function displayPermissions() {
  chrome.permissions.contains(
    { permissions: ["scripting"], origins: ["*://*/*"] },
    (result) => {
      if (result) {
        console.log("scripting permissions ON ")
      } else {
        console.log("scripting permissions OFF ")
      }
    }
  )
  chrome.permissions.contains(
    { permissions: ["alarms"], origins: ["*://*/*"] },
    (result) => {
      if (result) {
        console.log("alarms permissions ON ")
      } else {
        console.log("alarms permissions OFF ")
      }
    }
  )
  chrome.permissions.contains(
    {
      permissions: ["alarms", "scripting"],
      origins: ["*://*/*"]
    },
    (result) => {
      if (result) {
        console.log("all permissions ON ")
      } else {
        console.log("all permissions OFF ")
      }
    }
  )
}

function onAlarmCallback(alarm: chrome.alarms.Alarm) {
  if (alarm.name === "loadMerchants") {
    if (merchantListDate < new Date().getTime() - MERCHANT_LIST_MAX_AGE) {
      console.log("loading merchant list...")

      loadMerchants()
    }
  }
}

function onMessageWithPermCallback(req: any, sender: any, rcb: any) {
  if (req.action === "merchant_list") {
    if (loading) {
      rcb({ status: "loading" })
    } else {
      rcb({ status: "loaded", merchantList })
    }
  } else if (req.action === "open_tab") {
    openTab(req.url, sender.tab?.id, rcb)
  } else if (req.action === "get_tabstatus") {
    getTabId(sender.tab?.id, rcb)
  } else if (req.action === "close_current_tab") {
    closeTab(sender.tab?.id, rcb)
  } else if (req.action === "set_block_tab") {
    chrome.storage.local.set(
      {
        [`block_tab_${req.merchantId}`]: new Date().getTime()
      },
      () => {
        rcb()
      }
    )
  } else if (req.action === "get_block_tab") {
    chrome.storage.local.get(`block_tab_${req.merchantId}`, (value) => {
      rcb(value[`block_tab_${req.merchantId}`] || 0)
    })
  } else if (req.action === "clear_block_tab") {
    chrome.storage.local.remove(`block_tab_${req.merchantId}`, () => {
      rcb()
    })
  } else if (req.action === "disable") {
    chrome.permissions.remove({
      permissions: ["alarms"]
    })
    chrome.tabs.onUpdated.removeListener(tabListenerCallback)
    chrome.storage.sync.set({ ecoModeActive: false }, () => {
      displayPermissions()
      initialize()
    })
  }

  return true
}

function onMessageWithoutPermCallback(
  request: any,
  sender: any,
  sendResponse: any
) {
  if (request.permAction === "checkIfHasEnough") {
    chrome.permissions.contains(
      {
        permissions: ["tabs", "storage", "alarms", "scripting"],
        origins: ["*://*/*"]
      },
      (result) => {
        if (result) {
          // The extension has the permissions.
          sendResponse({ permStatus: true })
          console.log("redirectcheck:hasEnough permissions")
        } else {
          // The extension doesn't have the permissions.
          sendResponse({ permStatus: false })
          console.log("redirectcheck:hasNotEnough permissions")
        }
      }
    )
  } else if (request.permAction === "getPerm") {
    chrome.permissions.request(
      {
        permissions: ["tabs", "storage", "alarms", "scripting"],
        origins: ["*://*/*"]
      },
      (granted) => {
        if (granted) {
          console.log("redirectcheck:permissions granted")
          displayPermissions()
          chrome.storage.sync.set({ ecoModeActive: true }, () => {
            initialize()
          })
        }
      }
    )
  } else if (request.permAction === "refusePerm") {
    displayPermissions()
  }

  return true
}

export function initialize() {
  if (typeof chrome.action === "undefined") {
    chrome.action = chrome.browserAction
  }

  // memory management
  if (chrome.runtime.onMessage.hasListener(onAlarmCallback))
    chrome.runtime.onMessage.removeListener(onAlarmCallback)

  if (chrome.runtime.onMessage.hasListener(onMessageWithPermCallback))
    chrome.runtime.onMessage.removeListener(onMessageWithPermCallback)

  if (chrome.runtime.onMessage.hasListener(onMessageWithoutPermCallback))
    chrome.runtime.onMessage.removeListener(onMessageWithoutPermCallback)

  //get permissions
  var hasEnoughPermissionsToInit = false
  chrome.permissions.contains(
    {
      permissions: ["tabs", "storage", "alarms", "scripting"],
      origins: ["*://*/*"]
    },
    (result) => {
      chrome.storage.sync.get("ecoModeActive", (value) => {
        console.log("ecoModeActive", value)
      })
      if (result) {
        hasEnoughPermissionsToInit = true
        console.log("bg:hasEnough permissions")

        chrome.storage.sync.set({ ecoModeActive: true })
        console.log("eco-friendly mode initialized")

        chrome.storage.local.get(
          ["merchantList", "merchantListDate"],
          (value) => {
            merchantList = value.merchantList || {}
            merchantListDate = value.merchantListDate || 0

            if (
              merchantListDate <
              new Date().getTime() - MERCHANT_LIST_MAX_AGE
            ) {
              console.log("loading merchant list...")

              loadMerchants(() => {
                loading = false
              })
            } else {
              console.log("merchant list loaded from cache")

              loading = false
            }
          }
        )

        addTabListener()

        chrome.alarms.create("loadMerchants", {
          periodInMinutes: 60
        })

        chrome.alarms.onAlarm.addListener(onAlarmCallback)

        chrome.runtime.onMessage.addListener(onMessageWithPermCallback)
      } else {
        hasEnoughPermissionsToInit = false
        console.log("bg:hasNotEnough permissions")
        chrome.storage.sync.set({ ecoModeActive: false })

        chrome.runtime.onMessage.addListener(onMessageWithoutPermCallback)
      }
    }
  )

  return true
}
