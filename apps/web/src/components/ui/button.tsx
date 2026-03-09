import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-[#30499B] text-white shadow-[0_14px_30px_-20px_rgba(48,73,155,0.7)] hover:-translate-y-0.5 hover:bg-[#253a7a]",
        destructive:
          "bg-[#EE4035] text-white shadow-[0_14px_30px_-20px_rgba(238,64,53,0.7)] hover:-translate-y-0.5 hover:bg-[#d7352b] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-white/80 bg-white/78 text-slate-700 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.32)] hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10",
        secondary:
          "bg-[#56B949] text-white shadow-[0_14px_30px_-20px_rgba(86,185,73,0.7)] hover:-translate-y-0.5 hover:bg-[#49a63d]",
        ghost:
          "text-slate-600 hover:bg-white/70 hover:text-[#30499B] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
        link: "text-[#30499B] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-11 px-6 has-[>svg]:px-5",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
