"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[100] flex max-h-screen flex-col gap-2 pointer-events-none md:max-w-[420px] w-auto">
      {toasts.map(function ({ id, title, description, variant, onOpenChange, ...props }) {
        return (
          <div
            key={id}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-10 shadow-lg transition-all animate-in slide-in-from-top-full min-w-[300px]",
              "bg-background text-foreground",
              variant === "destructive" && "border-destructive bg-destructive text-destructive-foreground"
            )}
          >
            <div className="grid gap-1 flex-1">
              {title && <div className="text-sm font-semibold">{title}</div>}
              {description && (
                <div className="text-sm opacity-90">{description}</div>
              )}
            </div>
            <button
              onClick={() => dismiss(id)}
              className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
