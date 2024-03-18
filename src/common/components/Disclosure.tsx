import { Disclosure as D, Transition } from "@headlessui/react"
import { Fragment, type PropsWithChildren } from "react"
import { twMerge } from "tailwind-merge"

export default function Disclosure({ children, className, title }: Props) {
  return (
    <D as={Fragment}>
      <D.Button className={twMerge("w-full", className)}>{title}</D.Button>
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform -translate-y-5 opacity-0"
        enterTo="transform translate-y-0 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform translate-y-0 opacity-100"
        leaveTo="transform -translate-y-5 opacity-0">
        <D.Panel>{children}</D.Panel>
      </Transition>
    </D>
  )
}

type Props = PropsWithChildren<{
  className?: string
  title: string
}>
