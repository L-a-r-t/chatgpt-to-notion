import { i18n } from "~utils/functions"

export default function NoTagButton({ selectTag }) {
  return (
    <button
      key={"notag"}
      className="italic font-bold"
      onClick={() => selectTag(-1)}>
      {i18n("save_noTag")}
    </button>
  )
}
