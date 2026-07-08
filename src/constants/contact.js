/** Public WhatsApp contact for Narang Mandi (Pakistan). */
export const CONTACT_WHATSAPP_DISPLAY = '03069761224';

// wa.me expects country code without + or leading zero.
export const CONTACT_WHATSAPP_WA = '923069761224';

export const CONTACT_WHATSAPP_URL = `https://wa.me/${CONTACT_WHATSAPP_WA}`;

export function whatsAppMessageUrl(text = '') {
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `${CONTACT_WHATSAPP_URL}${q}`;
}
