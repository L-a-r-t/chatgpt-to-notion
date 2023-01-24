import { Menu, Transition } from "@headlessui/react"
import { PropsWithChildren, ReactNode, useId } from "react"

export default function DropdownPopup({
  children,
  items,
  className,
  position = "down"
}: DropdownProps) {
  const keysBase = useId()
  const pos = { up: "bottom-2", down: "top-2" }

  return (
    <span className="w-fit">
      <Menu>
        <Menu.Button className={`relative ${className}`}>
          {children}
        </Menu.Button>
        <Transition
          className="relative"
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0">
          <Menu.Items
            className={`absolute flex flex-col bg-white border border-gray-400 
            rounded shadow ${pos[position]} -right-2 z-10 max-h-36 overflow-auto`}>
            {items.map((item, idx) => (
              <Menu.Item key={`${keysBase}${idx}`}>
                {({ active }) => (
                  <div
                    className={`py-1 px-3 min-w-max ${
                      active && "bg-gray-200"
                    }`}>
                    {item}
                  </div>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </Menu>
    </span>
  )
}

type DropdownProps = PropsWithChildren & {
  items: any[]
  position?: "up" | "down"
  className?: string
}
