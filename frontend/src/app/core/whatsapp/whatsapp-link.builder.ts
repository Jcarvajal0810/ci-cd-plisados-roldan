/** WhatsApp click-to-chat links and messages — single source of truth (research R12). */

export function whatsappLink(number: string, message: string): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Message templates from contracts/ui-routes.md. */
export const WhatsAppMessages = {
  generic: () => 'Hola, Plisados Roldán. Quiero más información sobre sus servicios.',
  offering: (name: string) => `Hola, quiero cotizar el servicio de ${name}.`,
  successCase: (title: string) => `Hola, vi el caso "${title}" y quiero algo similar.`,
} as const;
