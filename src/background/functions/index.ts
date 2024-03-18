import authenticate from "./authenticate"
import { initialize as ecoFriendlyMode } from "./ecoFriendlyMode"
import fetchHistory from "./fetchHistory"
import refreshContentScripts from "./refreshContentScripts"
import refreshDatabases from "./refreshDatabases"
import refreshIcons from "./refreshIcons"
import save from "./save"
import saveHistory from "./saveHistory"

export {
  authenticate,
  refreshContentScripts,
  refreshDatabases,
  refreshIcons,
  fetchHistory,
  ecoFriendlyMode,
  saveHistory,
  save
}
