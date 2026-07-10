import React from 'react';

export default function Footer({ profile }) {
  const currentYear = new Date().getFullYear();

  // Use dynamic footer menu if available. The admin can add social links here as well.
  const footerLinks = profile?.navigation?.footerMenu || [];

  return (
    <footer className="w-full border-t border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface py-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
          {profile?.websiteSettings?.footer?.copyright || `© ${currentYear} ${profile?.name || 'DevPortfolio'}. All rights reserved.`}
        </p>
        <div className="flex space-x-6">
          {footerLinks.map(link => (
            link.id && (
              // Assuming 'id' can be a full URL or a section ID
              <a key={link.id} href={link.id.startsWith('http') ? link.id : `#${link.id}`} target={link.id.startsWith('http') ? '_blank' : '_self'} rel="noreferrer" className="text-sm text-light-textSecondary dark:text-dark-textSecondary hover:text-accent-blue transition-colors">
                {link.label}
              </a>
            )
          ))}
        </div>
      </div>
    </footer>
  );
}