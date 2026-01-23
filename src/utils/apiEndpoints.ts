// Simplified - logic moved to UnifiedApiRequest
export const isPublicEndpoint = (url: string): boolean => {
  const PUBLIC = ['/product/', '/branch/', '/ratings/product/', '/auth/'];
  return PUBLIC.some(p => url.startsWith(p));
};
