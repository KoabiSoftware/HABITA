import { MessageCircle } from "lucide-react";

export function WhatsAppLink() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number || !/^\d{8,15}$/.test(number))
    return (
      <p className="channel-note">
        <MessageCircle size={18} />
        El canal de WhatsApp estará disponible cuando se publique el número de
        atención.
      </p>
    );

  return (
    <a
      className="button outline"
      href={`https://wa.me/${number}?text=${encodeURIComponent("Hola, quisiera conocer más sobre HÁBITA.")}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <MessageCircle size={18} />
      Conversar por WhatsApp
    </a>
  );
}
