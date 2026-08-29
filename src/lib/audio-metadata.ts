const KEY_RE = /(?:^|[-_\s])([A-Ga-g](?:#|b|m)?(?:aj|in|ajor|inor)?)(?=$|[-_\s.])/;
const BPM_RE = /(?:^|[-_\s])([4-9]\d|1\d\d|2\d\d)(?:\s*)bpm(?:$|[-_\s.])/i;

export function inferBpm(name: string): number | null {
  const match = name.match(BPM_RE);
  return match ? Number(match[1]) : null;
}

export function inferKey(name: string): string | null {
  const match = name.match(KEY_RE);
  if (!match) return null;
  const value = match[1];
  const root = value[0].toUpperCase() + (value[1] === '#' || value[1] === 'b' ? value[1] : '');
  const suffix = value.slice(root.length).toLowerCase();
  if (suffix === 'm' || suffix === 'min' || suffix === 'minor' || suffix === 'in') return `${root}m`;
  if (suffix === 'maj' || suffix === 'major') return root;
  return root;
}

export async function analyzeWav(file: File) {
  let duration: number | null = null;
  let waveform: number[] | null = null;
  if (typeof window !== 'undefined') {
    try {
      const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Context) {
        const context = new Context();
        const bytes = await file.arrayBuffer();
        const audio = await context.decodeAudioData(bytes.slice(0));
        duration = audio.duration;
        const channel = audio.getChannelData(0);
        const count = 96;
        const block = Math.max(1, Math.floor(channel.length / count));
        waveform = Array.from({ length: count }, (_, i) => {
          const start = i * block;
          const end = Math.min(channel.length, start + block);
          let peak = 0;
          for (let j = start; j < end; j += Math.max(1, Math.floor(block / 100))) peak = Math.max(peak, Math.abs(channel[j]));
          return Math.max(4, Math.round(4 + peak * 30));
        });
        await context.close();
      }
    } catch { /* metadata can remain null; playback still works */ }
  }
  return { duration, waveform, bpm: inferBpm(file.name), key: inferKey(file.name) };
}
