'use client';

import { useEffect, useState } from 'react';
import { Check, ImagePlus, Loader2, LogIn, ShieldCheck, UploadCloud, Archive } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createPackWithFiles } from '@/lib/pack-storage';
import { extractWavSamplesFromZip } from '@/lib/zip-samples';

const BASE_PATH = '/WAVLIB';
const ADMIN_EMAIL = 'wavlib.support@gmail.com';

export default function UploadPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creator, setCreator] = useState('WAVLIB Sound Library');
  const [tags, setTags] = useState('');
  const [artwork, setArtwork] = useState<File | null>(null);
  const [zip, setZip] = useState<File | null>(null);
  const [samples, setSamples] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email?.toLowerCase() ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user?.email?.toLowerCase() ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function login() {
    setBusy(true); setError(''); setMessage('');
    const { data, error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
    if (error) setError(error.message);
    else if (data.user?.email?.toLowerCase() !== ADMIN_EMAIL) { await supabase.auth.signOut(); setError('This account is not authorized for WAVLIB administration.'); }
    else { setUserEmail(ADMIN_EMAIL); setPassword(''); setMessage('Admin login successful.'); }
    setBusy(false);
  }

  async function logout() { await supabase.auth.signOut(); setUserEmail(null); setMessage(''); }

  async function selectZip(file: File | null) {
    setZip(file); setSamples([]); setError(''); setMessage(''); setProgress(0);
    if (!file) return;
    setBusy(true);
    try {
      setMessage('Extracting WAV samples from ZIP…');
      const extracted = await extractWavSamplesFromZip(file, (done, total) => setProgress(Math.round((done / total) * 40)));
      setSamples(extracted); setProgress(40); setMessage(`ZIP extracted — ${extracted.length} WAV samples found.`);
    } catch (err) { setZip(null); setError(err instanceof Error ? err.message : 'Could not extract ZIP.'); }
    finally { setBusy(false); }
  }

  async function upload() {
    setBusy(true); setError(''); setMessage(''); setProgress(40);
    try {
      if (userEmail !== ADMIN_EMAIL) throw new Error('This upload area is restricted to the WAVLIB administrator.');
      if (!samples.length) throw new Error('Choose a ZIP containing at least one WAV sample.');
      const pack = await createPackWithFiles({ name, description, creator, tags: tags.split(',').map((x) => x.trim()).filter(Boolean), artwork, samples }, (done, total) => setProgress(40 + Math.round((done / total) * 60)));
      setMessage(`Pack “${pack.name}” stored successfully — ${samples.length} samples uploaded individually.`);
      setName(''); setDescription(''); setTags(''); setArtwork(null); setZip(null); setSamples([]); setProgress(100);
    } catch (err) { setError(err instanceof Error ? err.message : 'Upload failed.'); }
    finally { setBusy(false); }
  }

  const isAdmin = userEmail === ADMIN_EMAIL;
  if (!isAdmin) return <main className="site"><div className="upload-shell"><a className="upload-back" href={`${BASE_PATH}/`}>← Back to WAVLIB</a><div className="upload-card"><div className="eyebrow"><ShieldCheck size={13}/> WAVLIB ADMIN STORAGE</div><h1>Admin sign in</h1><p>This upload area is private. Sign in with the WAVLIB administrator email and password.</p><div className="admin-email-lock"><ShieldCheck size={18}/><div><strong>{ADMIN_EMAIL}</strong><small>Administrator email — locked</small></div></div><label className="admin-password-field">Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && password) login(); }} placeholder="Enter admin password" autoComplete="current-password" /></label><button className="upload-primary" onClick={login} disabled={busy || !password}><LogIn size={18}/>{busy ? 'Signing in…' : 'Sign in as administrator'}</button>{message && <div className="upload-success"><Check size={16}/>{message}</div>}{error && <div className="upload-error">{error}</div>}<div className="upload-note"><ShieldCheck size={14}/> Normal WAVLIB accounts cannot upload packs.</div></div></div></main>;

  return <main className="site"><div className="upload-shell"><a className="upload-back" href={`${BASE_PATH}/`}>← Back to WAVLIB</a><div className="upload-card upload-wide"><div className="eyebrow"><ShieldCheck size={13}/> WAVLIB ADMIN STORAGE</div><div className="upload-title-row"><div><h1>Upload a sound pack</h1><p>Upload one ZIP and WAVLIB automatically extracts every WAV and stores the samples individually in Supabase.</p></div><div className="signed-in"><ShieldCheck size={13}/> {ADMIN_EMAIL}<button type="button" onClick={logout}>Log out</button></div></div><div className="upload-grid"><label>Pack name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cobalt Garage Essentials Vol.2" /></label><label>Creator<input value={creator} onChange={(e) => setCreator(e.target.value)} /></label><label className="full">Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the pack…" /></label><label className="full">Tags<input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="garage, house, drums" /></label><label className="file-box"><ImagePlus size={20}/><span>Pack artwork</span><small>{artwork?.name || 'Choose JPG, PNG or WebP'}</small><input type="file" accept="image/*" onChange={(e) => setArtwork(e.target.files?.[0] ?? null)} /></label><label className="file-box"><Archive size={20}/><span>Sample pack ZIP</span><small>{zip ? `${zip.name} — ${samples.length} WAV samples extracted` : 'Choose a ZIP sample pack'}</small><input type="file" accept=".zip,application/zip" onChange={(e) => selectZip(e.target.files?.[0] ?? null)} /></label></div><button className="upload-primary upload-submit" onClick={upload} disabled={busy || !name.trim() || !samples.length}><UploadCloud size={18}/>{busy ? `Processing… ${progress}%` : 'Extract & store pack automatically'}</button>{(busy || progress > 0) && <div className="upload-progress"><i style={{ width: `${progress}%` }}/></div>}{message && <div className="upload-success"><Check size={16}/>{message}</div>}{error && <div className="upload-error">{error}</div>}<div className="upload-note"><Loader2 size={14}/> ZIP extraction happens in your browser; individual WAV files are then uploaded to Supabase Storage and recorded in the WAVLIB database.</div></div></div></main>;
}
