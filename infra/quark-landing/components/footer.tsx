"use client";

import { Github, Twitter, Mail } from "lucide-react";
import { getTranslation, DEFAULT_LANGUAGE, type Language } from "@/lib/i18n";
import { useState } from "react";

export default function Footer() {
  const [language] = useState<Language>(DEFAULT_LANGUAGE);
  const currentYear = new Date().getFullYear();

  const footerText = getTranslation(language, "footer");

  const footerSections = [
    {
      title: footerText.product,
      links: [
        { label: footerText.features, href: "#" },
        { label: footerText.pricing, href: "#" },
        { label: footerText.securityLink, href: "#" },
      ],
    },
    {
      title: footerText.company,
      links: [
        { label: footerText.about, href: "#" },
        { label: footerText.blog, href: "#" },
        { label: footerText.careers, href: "#" },
      ],
    },
    {
      title: footerText.legal,
      links: [
        { label: footerText.privacy, href: "#" },
        { label: footerText.terms, href: "#" },
        { label: footerText.contact, href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="border-t border-border bg-background/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <a href="#" className="flex items-center gap-2 mb-4 hover:opacity-80 transition">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">Q</span>
              </div>
              <span className="font-bold">Quark</span>
            </a>
            <p className="text-sm text-muted-foreground">{footerText.tagline}</p>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-foreground transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Quark. {footerText.allRightsReserved}
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-lg transition-all duration-200"
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
