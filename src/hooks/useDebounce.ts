import { useEffect } from "react"

// https://codesandbox.io/s/react-image-crop-demo-with-react-hooks-y831o?file=/src/useDebounceEffect.ts
const useDebounce = (
  callback: (...args: any) => any,
  waitTime: number,
  deps: any[] = []
) => {
  useEffect(() => {
    const t = setTimeout(() => {
      callback(undefined, deps)
    }, waitTime)

    return () => {
      clearTimeout(t)
    }
  }, deps)
}

export default useDebounce
