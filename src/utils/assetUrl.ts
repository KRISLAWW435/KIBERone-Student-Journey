export function resolveAssetUrl(url?: string): string {
  if (!url) return '';
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  if (url.startsWith('/assets/')) {
    return `${normalizedBase}${url.slice(1)}`;
  }
  if (url.startsWith('assets/')) {
    return `${normalizedBase}${url}`;
  }
  if (url.startsWith('/') && !url.startsWith('//') && normalizedBase !== '/') {
    const baseWithoutTrailing = normalizedBase.slice(0, -1);
    if (!url.startsWith(`${baseWithoutTrailing}/`)) {
      return `${normalizedBase}${url.slice(1)}`;
    }
  }
  return url;
}
