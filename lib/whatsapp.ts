export function getWhatsAppLink(phone: string, context?: { title?: string; locality?: string; price?: bigint | number }) {
  const cleanPhone = phone.replace(/\D/g, "");
  const fullPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

  let message = "Hi, I found your profile on MumbaiBrokers.in. I'd like to connect.";

  if (context?.title) {
    message =
      `Hi, I saw your listing on MumbaiBrokers.in:\n` +
      `*${context.title}*${context.locality ? ` - ${context.locality}` : ""}` +
      (context.price ? `\nPrice: ₹${formatPrice(context.price)}` : "") +
      `\n\nCan we connect?`;
  }

  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(price: bigint | number): string {
  const n = typeof price === "bigint" ? Number(price) : price;
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(2)} L`;
  return n.toLocaleString("en-IN");
}
