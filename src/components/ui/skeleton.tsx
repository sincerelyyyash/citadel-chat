import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-muted ring-1 ring-border/40 ring-inset",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
