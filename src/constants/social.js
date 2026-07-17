/** Default public social profiles — used when admin settings omit a URL. */
export const DEFAULT_SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/share/18m364926Z/',
  youtube: 'https://youtube.com/@sahibmeo',
  whatsapp: 'https://whatsapp.com/channel/0029VbC8lDy1CYoYV9fI8m45',
  twitter: '',
};

export function mergeSocialLinks(links = {}) {
  return { ...DEFAULT_SOCIAL_LINKS, ...links };
}
