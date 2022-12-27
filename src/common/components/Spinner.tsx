export default function Spinner({ white, small }: Props) {
  return (
    <div
      className={`animate-spin rounded-full border-b-transparent inline-block
        min-w-fit ${white ? "border-white" : "border-main"}
        ${
          small
            ? "w-4 aspect-square h-4 border-2"
            : "w-12 aspect-square h-12 border-8"
        }`}
    />
  )
}

type Props = {
  white?: boolean
  small?: boolean
}
