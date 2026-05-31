export const BUCKET_COLORS = [
  { id: 'blue',   hex: '#3b82f6' },
  { id: 'green',  hex: '#22c55e' },
  { id: 'red',    hex: '#ef4444' },
  { id: 'amber',  hex: '#f59e0b' },
  { id: 'purple', hex: '#a855f7' },
  { id: 'teal',   hex: '#14b8a6' },
  { id: 'coral',  hex: '#f97316' },
  { id: 'pink',   hex: '#ec4899' },
  { id: 'gray',   hex: '#6b7280' },
] as const;

export function getBucketColor(colorId: string): string {
  return BUCKET_COLORS.find(c => c.id === colorId)?.hex ?? '#6b7280';
}
