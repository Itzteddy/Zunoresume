import Image from "next/image";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Zuno"
      width={1254}
      height={1254}
      priority
      className={cn("block object-contain", className)}
    />
  );
}

export function Logo({
  className,
  markClassName = "h-8 w-8",
  withText = true,
}: {
  className?: string;
  markClassName?: string;
  withText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      {withText ? (
        <span className="text-lg font-bold tracking-tight">Zuno</span>
      ) : null}
    </span>
  );
}
