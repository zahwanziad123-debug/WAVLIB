import { createClient } from '@supabase/supabase-js';

// WAVLIB's Supabase URL + publishable key are safe to use in browser code.
// Environment variables can override these when building elsewhere.
const DEFAULT_URL = 'https://ayzyceixwbyyzfxoksuq.supabase.co';
const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_V2pZVN8X_RiMj6F_gdESMg_EfHPRvqF';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_PUBLISHABLE_KEY;

export const supabase = createClient(url, key);
export const STORAGE_BUCKET = 'samples';
export const PREVIEW_BUCKET = 'previews';
export const ARTWORK_BUCKET = 'artwork';
