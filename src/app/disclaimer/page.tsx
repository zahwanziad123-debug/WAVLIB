import LegalPage from '../legal-page';

export default function DisclaimerPage() {
  return <LegalPage eyebrow="WAVLIB / LEGAL" title="Disclaimer" updated="August 29, 2026" sections={[
    { title: '1. General information', body: <p>WAVLIB is a sound-library website intended to help users discover and organize audio content. Information shown on the site, including names, tags, BPM, keys, descriptions and counts, may be incomplete or inaccurate and should be independently verified where important.</p> },
    { title: '2. Third-party content', body: <p>Some sounds, packs, artwork, names or metadata may originate from third parties. Their appearance on WAVLIB does not necessarily mean WAVLIB owns those materials or endorses the associated creator or brand.</p> },
    { title: '3. No guarantee', body: <p>WAVLIB does not guarantee that every preview, download, link, metadata field or page will be available, accurate, uninterrupted or error-free. The site may be changed or taken offline without notice.</p> },
    { title: '4. User responsibility', body: <p>You are responsible for confirming that your use of any sound or other content complies with the applicable license, copyright law and the rules of the platform where you publish your work.</p> },
    { title: '5. Not legal advice', body: <p>This page is general website information and is not legal advice. If you need advice about copyright, licensing, ownership or a dispute, consult a qualified professional in the relevant jurisdiction.</p> },
  ]} />;
}
