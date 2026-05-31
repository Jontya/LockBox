let clipboardTimer: ReturnType<typeof setTimeout> | null = null;

export async function copyToClipboard(text: string, clearAfterMs: number): Promise<void> {
  await navigator.clipboard.writeText(text);
  if (clipboardTimer !== null) {
    clearTimeout(clipboardTimer);
  }
  clipboardTimer = setTimeout(async () => {
    try {
      await navigator.clipboard.writeText('');
    } catch {
      // ignore — clipboard may have been overwritten by user
    }
    clipboardTimer = null;
  }, clearAfterMs);
}
