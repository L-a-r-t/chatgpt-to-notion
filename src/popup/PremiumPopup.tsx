import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { registerKey } from "~api/registerKey"
import Spinner from "~common/components/Spinner"
import { i18n } from "~utils/functions"
import type { PopupEnum } from "~utils/types"

function PremiumPopup() {
  const [isPremium, setPremiumStatus] = useStorage("isPremium", false)

  const [licenseKey, setLicenseKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [keyStatus, setKeyStatus] = useState<"valid" | "invalid" | "unknown">(
    "unknown"
  )

  const handleActivate = async () => {
    setLoading(true)
    const res = await registerKey(licenseKey)
    setLoading(false)
    setPremiumStatus(res.success)
    setKeyStatus(res.success ? "valid" : "invalid")
  }

  if (isPremium && keyStatus === "unknown")
    return (
      <div>
        <h2 className="text-center font-bold">{i18n("premium_isPremium")}</h2>
        <p className="text-sm">{i18n("premium_isPremium_meaning")}</p>
        <ul>
          <li className="text-sm">- {i18n("premium_isPremium_autosave")}</li>
          <li className="text-sm">- {i18n("premium_isPremium_future")}</li>
          <li className="text-sm">- {i18n("premium_isPremium_noAds")}</li>
          <li className="text-sm">- {i18n("premium_isPremium_support")}</li>
          <li className="text-sm">- {i18n("premium_isPremium_gratitude")}</li>
        </ul>
      </div>
    )

  return (
    <div>
      {/* <h2 className="font-bold text-center">Premium</h2> */}
      <p className="text-sm text-center font-bold">{i18n("premium_desc")}</p>
      <a
        className="block link text-center mb-2"
        href="https://theolartigau.gumroad.com/l/chatgpt-to-notion"
        target="_blank">
        {i18n("premium_trial")}
      </a>
      <input
        className="input mb-2"
        minLength={20}
        value={licenseKey}
        onChange={(e) => setLicenseKey(e.target.value)}
        placeholder={i18n("premium_key_placeholder")}
      />
      <button onClick={handleActivate} className="button w-full">
        {keyStatus === "unknown" && i18n("premium_key_activate")}
        {keyStatus === "valid" && i18n("premium_key_activate_success")}
        {keyStatus === "invalid" && i18n("premium_key_activate_error")}
        {loading && <Spinner white small />}
      </button>
      {keyStatus === "unknown" && (
        <p className="text-sm">{i18n("premium_key_activate_desc")}</p>
      )}
      {keyStatus === "valid" && (
        <p className="text-sm">{i18n("premium_success")}</p>
      )}
      {keyStatus === "invalid" && (
        <p className="text-sm">{i18n("premium_invalid")}</p>
      )}
    </div>
  )
}

export default PremiumPopup
