'use client';

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type SelectContextValue = {
  value?: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  registerLabel: (value: string, label: React.ReactNode) => void
  getLabel: (value: string) => React.ReactNode
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

export function Select({
  children,
  value,
  onValueChange,
  defaultValue,
  className,
}: {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  className?: string
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const [open, setOpen] = React.useState(false)
  const [labels, setLabels] = React.useState<Record<string, React.ReactNode>>({})

  const currentValue = value !== undefined ? value : internalValue

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      setInternalValue(newValue)
      onValueChange?.(newValue)
      setOpen(false)
    },
    [onValueChange]
  )

  const registerLabel = React.useCallback((val: string, label: React.ReactNode) => {
    setLabels(prev => {
      if (prev[val] === label) return prev
      return { ...prev, [val]: label }
    })
  }, [])

  const getLabel = React.useCallback((val: string) => labels[val], [labels])

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        open,
        setOpen,
        registerLabel,
        getLabel,
      }}
    >
      <div className={cn("relative", className, open && "z-[60]")}>{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectTrigger must be used within Select")

  const containerRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        context.setOpen(false)
      }
    }
    if (context.open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [context])

  return (
    <button
      ref={containerRef}
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={cn(
        "flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 px-4 py-2 text-sm backdrop-blur-sm transition-all hover:border-[#30499B]/30 dark:hover:border-[#56B949]/30 hover:bg-white dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-[#30499B]/20 dark:focus:ring-[#56B949]/20 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm text-slate-800 dark:text-slate-200",
        context.open && "border-[#30499B]/50 dark:border-[#56B949]/50 ring-2 ring-[#30499B]/10 dark:ring-[#56B949]/10",
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200",
          context.open && "rotate-180 text-[#30499B] dark:text-[#56B949]"
        )}
      />
    </button>
  )
}

export function SelectValue({
  placeholder,
  children
}: {
  placeholder?: string
  children?: React.ReactNode
}) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be used within Select")

  const displayLabel = children || (context.value ? context.getLabel(context.value) : null)

  return (
    <span className={cn("truncate text-left flex-1", !displayLabel && !context.value && "text-slate-400")}>
      {displayLabel || placeholder}
    </span>
  )
}

export function SelectContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be used within Select")

  return (
    <AnimatePresence>
      {context.open && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 4, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "absolute left-0 right-0 z-50 min-w-[8rem] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800 p-1 text-slate-920 shadow-xl dark:shadow-slate-900/50 backdrop-blur-md",
            className
          )}
        >
          <div className="max-h-60 w-full overflow-y-auto custom-scrollbar p-1">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SelectItem({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within Select")

  const isSelected = context.value === value

  // Register label on mount/update
  React.useEffect(() => {
    context.registerLabel(value, children)
  }, [value, children, context.registerLabel])

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-lg py-2 pl-3 pr-9 text-sm outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700 disabled:pointer-events-none disabled:opacity-50 text-slate-700 dark:text-slate-200",
        isSelected && "bg-[#30499B]/5 dark:bg-[#56B949]/10 text-[#30499B] dark:text-[#56B949] font-medium",
        className
      )}
    >
      <span className="truncate">{children}</span>
      {isSelected && (
        <span className="absolute right-3 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
    </button>
  )
}
