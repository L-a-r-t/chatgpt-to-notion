import dayjs from "dayjs"
import localizedFormat from "dayjs/plugin/localizedFormat"
import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { activateTrial } from "~api/activateTrial"
import { registerKey } from "~api/registerKey"
import Spinner from "~common/components/Spinner"
import { STORAGE_KEYS } from "~utils/consts"
import { i18n } from "~utils/functions"
import type { PopupEnum } from "~utils/types"

dayjs.extend(localizedFormat)

function PremiumPopup() {
  const [isPremium, setPremiumStatus] = useStorage(
    STORAGE_KEYS.isPremium,
    false
  )
  const [activeTrial, setactiveTrial] = useStorage(
    STORAGE_KEYS.activeTrial,
    false
  )
  const [trialEnd, setTrialEnd] = useStorage(STORAGE_KEYS.trialEnd, 0)

  const [licenseKey, setLicenseKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [keyStatus, setKeyStatus] = useState<"valid" | "invalid" | "unknown">(
    "unknown"
  )
  const [trialStatus, setTrialStatus] = useState<
    "valid" | "invalid" | "unknown" | "over" | "active"
  >("unknown")

  useEffect(() => {
    if (!trialEnd) return
    if (trialStatus === "unknown")
      setTrialStatus(dayjs(trialEnd).isAfter(dayjs()) ? "active" : "over")
  }, [trialEnd])

  const handleActivate = async () => {
    try {
      setLoading(true)
      const res = await registerKey(licenseKey)
      setPremiumStatus(res.success)
      setKeyStatus(res.success ? "valid" : "invalid")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTrial = async () => {
    try {
      setLoading(true)
      const res = await activateTrial()
      setTrialStatus(res.success ? "valid" : "invalid")
      setTrialEnd(res.trialEnd)
      setactiveTrial(res.success)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // TODO: get rid of duplicate code
  if (
    (isPremium || activeTrial) &&
    keyStatus === "unknown" &&
    trialStatus !== "valid"
  )
    return (
      <div>
        <h2 className="text-center font-bold">{i18n("premium_isPremium")}</h2>
        <p className="text-sm">{i18n("premium_isPremium_meaning")}</p>
        <ul>
          <li className="text-sm">- {i18n("premium_isPremium_autosave")}</li>
          <li className="text-sm">- {i18n("premium_isPremium_historySave")}</li>
          <li className="text-sm">- {i18n("premium_isPremium_future")}</li>
          <li className="text-sm">- {i18n("premium_isPremium_noAds")}</li>
          <li className="text-sm">- {i18n("premium_isPremium_support")}</li>
          <li className="text-sm">- {i18n("premium_isPremium_gratitude")}</li>
        </ul>
        {!isPremium && (
          <>
            <p className="text-sm font-bold">
              {i18n("premium_trial_endDate")} {dayjs(trialEnd).format("LL")}
            </p>
            <a
              className="block link text-center mb-2"
              href="https://theolartigau.gumroad.com/l/chatgpt-to-notion"
              target="_blank">
              {i18n("premium_cta")}
            </a>
            <input
              className="input mb-2"
              minLength={20}
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder={i18n("premium_key_placeholder")}
            />
            <button
              disabled={loading}
              onClick={handleActivate}
              className="button w-full">
              {i18n("premium_key_activate")}
              {loading && <Spinner white small />}
            </button>
          </>
        )}
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
        {i18n("premium_cta")}
      </a>
      <input
        className="input mb-2"
        minLength={20}
        value={licenseKey}
        onChange={(e) => setLicenseKey(e.target.value)}
        placeholder={i18n("premium_key_placeholder")}
      />
      <button
        disabled={loading || keyStatus === "valid"}
        onClick={handleActivate}
        className="button w-full">
        {keyStatus === "unknown" && i18n("premium_key_activate")}
        {keyStatus === "valid" && i18n("premium_key_activate_success")}
        {keyStatus === "invalid" && i18n("premium_key_activate_error")}
        {loading && <Spinner white small />}
      </button>
      {keyStatus === "unknown" && (
        <>
          {/* <p className="text-sm">{i18n("premium_key_activate_desc")}</p> */}
          <div className="my-2 relative w-full">
            <div className="absolute top-1/2 left-0 border w-full -z-10" />
            <p className="text-center">
              <span className="text-sm bg-white text-gray-700 px-1">
                {i18n("premium_trial_or")}
              </span>
            </p>
          </div>
          {trialStatus !== "over" && (
            <button
              disabled={loading || trialStatus === "valid"}
              onClick={handleTrial}
              className="button-outline w-full text-sm">
              {trialStatus === "unknown" && (
                <p className="text-sm">{i18n("premium_trial_cta")}</p>
              )}
              {trialStatus === "valid" && (
                <p className="text-sm">{i18n("premium_trial_success")}</p>
              )}
              {trialStatus === "invalid" && (
                <p className="text-sm">{i18n("premium_trial_error")}</p>
              )}
            </button>
          )}
          {trialStatus === "unknown" && (
            <p className="text-sm">{i18n("premium_trial_noInfo")}</p>
          )}
          {trialStatus === "valid" && (
            <p className="text-sm">
              {i18n("premium_trial_endDate")} {dayjs(trialEnd).format("LL")}
            </p>
          )}
          {trialStatus === "over" && (
            <p className="text-sm">{i18n("premium_trial_over")}</p>
          )}
        </>
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
