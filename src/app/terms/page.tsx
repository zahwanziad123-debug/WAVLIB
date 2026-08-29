import LegalPage from '../legal-page';

export default function TermsPage() {
  return <LegalPage eyebrow="WAVLIB / LEGAL" title="Terms of Use" updated="August 29, 2026" sections={[
    { title: '1. Using WAVLIB', body: <p>WAVLIB provides a searchable library interface for discovering, previewing and downloading sound content. By using the site, you agree to use it lawfully and to respect the rights attached to each sound, pack, image, name and other piece of content.</p> },
    { title: '2. Sound-content rights', body: <p>WAVLIB does not grant ownership of third-party material merely by displaying it. Any license, usage restriction or attribution requirement attached to a sound or pack remains applicable. You are responsible for checking the applicable rights before using downloaded material in a project.</p> },
    { title: '3. Downloads and permitted use', body: <p>Do not use WAVLIB to redistribute, repackage, mirror, sell or publicly upload sound collections in a way that violates the rights of the original creator or license. Do not use the service to facilitate infringement or other unlawful activity.</p> },
    { title: '4. Availability', body: <p>WAVLIB is provided on an “as available” basis. Pages, metadata, previews, downloads and other features may change, become unavailable or contain errors as the site is developed.</p> },
    { title: '5. Changes', body: <p>These terms may be updated as WAVLIB evolves. Continued use of the site after an update means you accept the revised terms.</p> },
    { title: '6. Contact and reports', body: <p>If you believe content on WAVLIB infringes your rights, use the Copyright page linked below to review the reporting process.</p> },
  ]} />;
}
