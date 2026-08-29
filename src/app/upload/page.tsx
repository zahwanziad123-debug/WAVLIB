'use client';

import { useEffect, useState } from 'react';
import { Check, ImagePlus, Loader2, LogIn, Music2, UploadCloud } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createPackWithFiles } from '@/lib/pack-storage';

const BASE_PATH = '/WAVLIB';

export default function UploadPage() {
  const [email, setEmail] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creator, setCreator] = useState('WAVLIB Sound Library');
  const [tags, setTags] = useState('');
  const [artwork, setArtwork] = useState<File | null>(null);
  const [samples, setSamples] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user?.email ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function sendLogin() {
    setBusy(true); setError(''); setMessage('');
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}${BASE_PATH}/upload/` } });
    if (error) setError(error.message); else setMessage('Check your email for the WAVLIB sign-in link.');
    setBusy(false);
  }

  async function upload() {
    setBusy(true); setError(''); setMessage(''); setProgress(0);
    try {
      const pack = await createPackWithFiles({
        name, description, creator, tags: tags.split(',').map((x) => x.trim()).filter(Boolean), artwork, samples,
      }, (done, total) => setProgress(Math.round((done / total) * 100)));
      setMessage(`Pack “${pack.name}” is stored successfully.`);
      setName(''); setDescription(''); setTags(''); setArtwork(null); setSamples([]); setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally { setBusy(false); }
  }

  if (!userEmail) return <main className="site"><div className="upload-shell"><a className="upload-back" href={`${BASE_PATH}/`}>← Back to WAVLIB</a><div className="upload-card"><div className="eyebrow">WAVLIB STORAGE</div><h1>Sign in to upload</h1><p>Use your email to receive a secure sign-in link. Pack files will be stored in Supabase automatically.</p><label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" /></label><button className="upload-primary" onClick={sendLogin} disabled={busy || !email}><LogIn size={18}/>{busy ? 'Sending…' : 'Send sign-in link'}</button>{message && <div className="upload-success"><Check size={16}/>{message}</div>}{error && <div className="upload-error">{error}</div>}</div></div></main>;

  return <main className="site"><div className="upload-shell"><a className="upload-back" href={`${BASE_PATH}/`}>← Back to WAVLIB</a><div className="upload-card upload-wide"><div className="eyebrow">WAVLIB STORAGE</div><div className="upload-title-row"><div><h1>Upload a sound pack</h1><p>One upload creates the pack, stores the artwork and WAV files, and connects the samples and tags.</p></div><span className="signed-in">{userEmail}</span></div><div className="upload-grid"><label>Pack name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cobalt Garage Essentials Vol.2" /></label><label>Creator<input value={creator} onChange={(e) => setCreator(e.target.value)} /></label><label className="full">Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the pack…" /></label><label className="full">Tags<input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="garage, house, drums" /></label><label className="file-box"><ImagePlus size={20}/><span>Pack artwork</span><small>{artwork?.name || 'Choose JPG, PNG or WebP'}</small><input type="file" accept="image/*" onChange={(e) => setArtwork(e.target.files?.[0] ?? null)} /></label><label className="file-box"><Music2 size={20}/><span>WAV samples</span><small>{samples.length ? `${samples.length} files selected` : 'Choose one or more WAV files'}</small><input type="file" accept="audio/wav,audio/x-wav,audio/wave,.wav" multiple onChange={(e) => setSamples(Array.from(e.target.files ?? []))} /></label></div><button className="upload-primary upload-submit" onClick={upload} disabled={busy || !name.trim() || !samples.length}><UploadCloud size={18}/>{busy ? `Uploading… ${progress}%` : 'Store pack automatically'}</button>{busy && <div className="upload-progress"><i style={{ width: `${progress}%` }}/></div>}{message && <div className="upload-success"><Check size={16}/>{message}</div>}{error && <div className="upload-error">{error}</div>}<div className="upload-note"><Loader2 size={14}/> Audio files stay in Supabase Storage; metadata stays in the WAVLIB database.</div></div></div></main>;
}
