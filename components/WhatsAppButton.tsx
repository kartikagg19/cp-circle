import { getWhatsAppLink } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  phone: string;
  context?: { title?: string; locality?: string; price?: bigint | number };
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function WhatsAppButton({ phone, context, size = "md", className, label }: WhatsAppButtonProps) {
  const href = getWhatsAppLink(phone, context);

  const sizeClasses = {
    sm: "px-2 py-1.5 text-xs gap-1",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors",
        sizeClasses[size],
        className
      )}
    >
      <MessageCircle className={size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"} />
      {label ?? (size === "sm" ? "WhatsApp" : "WhatsApp Now")}
    </a>
  );
}
