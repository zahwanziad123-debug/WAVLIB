import { unzipSync } from 'fflate';

const WAV_EXT = '.wav';
const MAX_ZIP_SIZE = 500 * 1024 * 1024;

function safeName(name: string) {
  return name.split('/').pop()?.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'sample.wav';
}

export async function extractWavSamplesFromZip(zip: File, onProgress?: (completed: number, total: number) => void): Promise<File[]> {
  if (!zip.name.toLowerCase().endsWith('.zip')) throw new Error('Please choose a ZIP sample pack.');
  if (zip.size > MAX_ZIP_SIZE) throw new Error('ZIP file is too large. Maximum supported size is 500 MB.');
  const bytes = new Uint8Array(await zip.arrayBuffer());
  let files: Record<string, Uint8Array>;
  try { files = unzipSync(bytes); } catch { throw new Error('The ZIP file could not be opened. Please check that it is a valid ZIP archive.'); }
  const entries = Object.entries(files).filter(([name, data]) => {
    const lower = name.toLowerCase();
    return !lower.endsWith('/') && lower.endsWith(WAV_EXT) && data.byteLength > 0;
  });
  if (!entries.length) throw new Error('No WAV samples were found inside the ZIP file.');
  const result: File[] = [];
  for (let i = 0; i < entries.length; i++) {
    const [path, data] = entries[i];
    const buffer = new ArrayBuffer(data.byteLength);
    new Uint8Array(buffer).set(data);
    result.push(new File([buffer], safeName(path), { type: 'audio/wav' }));
    onProgress?.(i + 1, entries.length);
  }
  return result;
}
