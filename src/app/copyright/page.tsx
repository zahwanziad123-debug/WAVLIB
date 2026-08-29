import LegalPage from '../legal-page';

export default function CopyrightPage() {
  return <LegalPage eyebrow="WAVLIB / RIGHTS" title="Copyright & Content Policy" updated="August 29, 2026" sections={[
    { title: '1. Respect for creators', body: <p>WAVLIB respects copyright and other intellectual-property rights. Content displayed through the library may belong to WAVLIB, independent creators, publishers or other rights holders.</p> },
    { title: '2. Do not redistribute protected collections', body: <p>Unless the applicable license expressly allows it, do not mirror, upload, sell, trade, share or repackage complete sound collections or other protected material obtained through WAVLIB.</p> },
    { title: '3. Copyright reports', body: <p>If you are a rights holder and believe a WAVLIB page makes unauthorized material available, provide enough information to identify the work, identify the material at issue, explain your ownership or authorization, and provide a reliable way to contact you. WAVLIB may remove or restrict disputed material while a report is reviewed.</p> },
    { title: '4. False reports', body: <p>Please only submit a copyright complaint when you have a genuine rights-based reason to do so. Misleading or knowingly false claims can harm creators and users.</p> },
    { title: '5. Third-party licenses', body: <p>Some content may be governed by licenses supplied by its original creator. A copyright report does not automatically mean that material is infringing; the applicable license and ownership information may need to be reviewed.</p> },
    { title: '6. Site materials', body: <p>WAVLIB's own branding, interface design, original text and original graphics are protected to the extent provided by applicable law. Do not copy or present the WAVLIB brand or original site materials as your own.</p> },
  ]} />;
}
