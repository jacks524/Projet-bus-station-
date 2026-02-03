import React from 'react';

interface FooterLink {
  label: string;
  labelEn: string;
  href: string;
  onClick?: () => void;
}

interface FooterSection {
  title: string;
  titleEn: string;
  links: FooterLink[];
}

interface FooterProps {
  logoSrc?: string;
  logoAlt?: string;
  description?: string;
  descriptionEn?: string;
  sections?: FooterSection[];
  showDefaultSections?: boolean;
  t: (fr: string, en: string) => string;
}

const Footer: React.FC<FooterProps> = ({
  logoSrc = '/images/busstation.png',
  logoAlt = 'BusStation',
  description = "La plateforme de réservation et de gestion d'agences de transport la plus complète du Cameroun.",
  descriptionEn = 'The most complete booking and transport agency management platform in Cameroon.',
  sections = [],
  showDefaultSections = true,
  t,
}) => {
  const defaultSections: FooterSection[] = [
    {
      title: 'Produit',
      titleEn: 'Product',
      links: [
        { label: 'Fonctionnalités', labelEn: 'Features', href: '#features' },
        { label: 'Comment ça marche', labelEn: 'How it works', href: '#process' },
        { label: 'Nos chiffres', labelEn: 'Our numbers', href: '#stats' },
      ],
    },
    {
      title: 'Entreprise',
      titleEn: 'Company',
      links: [
        { label: 'À propos', labelEn: 'About', href: '#' },
        { label: 'Devenir partenaire', labelEn: 'Become a partner', href: '#' },
        { label: 'Blog', labelEn: 'Blog', href: '#' },
      ],
    },
    {
      title: 'Support',
      titleEn: 'Support',
      links: [
        { label: "Centre d'aide", labelEn: 'Help center', href: '/help' },
        { label: 'Contact', labelEn: 'Contact', href: '/contact' },
        { label: 'FAQ', labelEn: 'FAQ', href: '#faq' },
      ],
    },
  ];

  const footerSections = showDefaultSections ? defaultSections : sections;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <img src={logoSrc} alt={logoAlt} className="footer-logo" />
            <p className="footer-description">{t(description, descriptionEn)}</p>
          </div>
          
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="footer-title">{t(section.title, section.titleEn)}</h4>
              <ul className="footer-links">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="footer-link"
                      onClick={link.onClick}
                    >
                      {t(link.label, link.labelEn)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="footer-bottom">
          <div>
            {t(
              '© 2025 BusStation. Tous droits réservés.',
              '© 2025 BusStation. All rights reserved.'
            )}
          </div>
          <div className="footer-legal">
            <a href="#" className="footer-link">
              {t('Mentions légales', 'Legal notice')}
            </a>
            <a href="#" className="footer-link">
              {t('Confidentialité', 'Privacy')}
            </a>
            <a
              onClick={() =>
                window.open(
                  'https://www.termsfeed.com/live/2b6bd548-23a3-47e6-aee9-0e5dd0edb278',
                  '_blank'
                )
              }
              className="footer-link"
            >
              {t('CGU', 'Terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;