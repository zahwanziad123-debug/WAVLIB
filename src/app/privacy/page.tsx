import LegalPage from '../legal-page';

export default function PrivacyPage() {
  return <LegalPage eyebrow="WAVLIB / LEGAL" title="Privacy Policy" updated="August 29, 2026" sections={[
    { title: '1. What WAVLIB collects', body: <p>WAVLIB is designed as a public static website and does not require an account to browse the library. The site does not intentionally ask you to submit passwords, payment-card information or other sensitive personal information.</p> },
    { title: '2. Technical information', body: <p>Like most websites, the hosting and browser environment may process technical information needed to deliver pages, such as IP address, browser type, device information and request timestamps. This information is primarily part of normal web hosting and security operations.</p> },
    { title: '3. Cookies and local storage', body: <p>WAVLIB does not intentionally use advertising cookies to build a personal advertising profile. Browser storage may be used by the application or hosting environment when needed for site functionality.</p> },
    { title: '4. Third-party services', body: <p>WAVLIB is hosted using GitHub Pages and may rely on browser or hosting infrastructure outside WAVLIB's direct control. Third-party services can have their own privacy policies and technical logging practices.</p> },
    { title: '5. Your choices', body: <p>You can stop using the site at any time and can control cookies and site data through your browser settings. Because WAVLIB is primarily a static public site, there is no WAVLIB account dashboard for managing a personal profile.</p> },
    { title: '6. Policy changes', body: <p>This policy may be updated when the site or its services change. The date at the top of this page identifies the latest revision.</p> },
  ]} />;
}
