import type {
  PartialUserObjectResponse,
  RichTextItemResponse,
  UserObjectResponse
} from "@notionhq/client/build/src/api-endpoints"

// Note that rollout isn't supported by my implementation because if my lazyness
export type PropertyType =
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "people"
  | "files"
  | "checkbox"
  | "url"
  | "email"
  | "phone_number"
  | "formula"
  | "relation"
  | "created_time"
  | "created_by"
  | "last_edited_time"
  | "last_edited_by"

export type Property<T extends PropertyType> = BaseProperty<T> & Properties[T]

export type BaseProperty<T extends PropertyType> = {
  type: T
  name: string
  id: string
}

export type Properties = {
  title: { title: RichTextItemResponse[] }
  rich_text: { rich_text: RichTextItemResponse[] }
  number: { number: number }
  select: { select: { options: SelectPropertyResponse[] } }
  multi_select: { multi_select: { options: SelectPropertyResponse[] } }
  date: { date: DateResponse }
  people: { people: (PartialUserObjectResponse | UserObjectResponse)[] }
  files: { files: FileResponse[] }
  checkbox: { checkbox: boolean }
  url: { url: string }
  email: { email: string }
  phone_number: { phone_number: string }
  formula: { formula: FormulaPropertyResponse }
  relation: { relation: { id: string }[] }
  created_time: { created_time: string }
  created_by: { created_by: PartialUserObjectResponse | UserObjectResponse }
  last_edited_time: { last_edited_time: string }
  last_edited_by: {
    last_edited_by: PartialUserObjectResponse | UserObjectResponse
  }
}

export type SelectPropertyResponse = {
  id: string
  name: string
  color:
    | "blue"
    | "brown"
    | "gray"
    | "green"
    | "orange"
    | "pink"
    | "purple"
    | "red"
    | "yellow"
    | "default"
}

export type DateResponse = {
  start: string
  end: string
  time_zone: string
}

export type FileResponse =
  | {
      file: {
        url: string
        expiry_time: string
      }
      name: string
      type?: "file"
    }
  | {
      external: {
        url: string
      }
      name: string
      type?: "external"
    }

export type FormulaPropertyResponse =
  | {
      type: "date"
      date: DateResponse
    }
  | {
      type: "number"
      number: number
    }
  | {
      type: "boolean"
      boolean: boolean
    }
  | {
      type: "string"
      string: string
    }

export type IconResponse =
  | {
      type: "emoji"
      emoji: string
    }
  | {
      type: "external"
      external: {
        url: string
      }
    }
  | {
      type: "file"
      file: {
        url: string
        expiry_time: string
      }
    }
  | null
