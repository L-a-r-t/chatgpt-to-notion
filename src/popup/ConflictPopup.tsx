import renameHelper from "data-base64:../../assets/rename-helper.png"

import { i18n } from "~utils/functions"

function ConflictPopup({ save, pin }: ConflictPopupProps) {
  return (
    <div>
      <p className="text-center text-sm mb-2">{i18n("conflict_text")}</p>
      <div className="flex flex-col gap-2">
        <button className="button" onClick={() => save("override")}>
          {i18n("conflict_override")}
        </button>
        <button className="button" onClick={() => save("append")}>
          {i18n("conflict_append")}
        </button>
        <p className="text-xs -mt-2">{i18n("conflict_appendInfo")}</p>
      </div>
      <p className="text-center text-sm my-2">
        {pin ? i18n("conflict_renameFromPin") : i18n("conflict_rename")}
      </p>
      {!pin && <img src={renameHelper} className="w-full" />}
    </div>
  )
}

export default ConflictPopup

type ConflictPopupProps = {
  save: (saveBehavior: string) => Promise<void>
  pin?: boolean
}
