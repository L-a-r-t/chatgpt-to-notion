export const STORAGE_KEYS = {
  popup: "popup",
  databases: "databases",
  selectedDB: "selectedDB",
  authenticated: "authenticated",
  generateHeadings: "generateHeadings",
  openInNotion: "openInNotion",
  saveBehavior: "saveBehavior",
  saveStatus: "saveStatus",
  autosaveStatus: "autosaveStatus",
  generatingAnswer: "generatingAnswer",
  showPopup: "showPopup",
  toBeSaved: "toBeSaved",
  isPremium: "isPremium",
  activeTrial: "activeTrial",
  trialEnd: "trialEnd",
  chatID: "chatID",
  pinTitleType: "pinTitleType",
  token: "token",
  cacheHeaders: "cacheHeaders",
  hasCacheHeaders: "hasCacheHeaders", // to keep session access limited to trusted contexts
  historySaveProgress: "historySaveProgress",
  historySaveErrors: "historySaveErrors",
  historyLength: "historyLength",
  error: "error",
  errors: "errors", // lmao
  workspace_id: "workspace_id",
  user_id: "user_id",
  workspace_name: "workspace_name",
  user: "user",
  refreshed: "refreshed",
  ecoModeActive: "ecoModeActive",
  ecoModePopup: "ecoModePopup",
  ecoModeNotification: "ecoModeNotification",
  model: "model"
} as const

export const SUPPORTED_HISTORY_SAVE = ["chatgpt", "deepseek", "claude"]
