import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export const SEOManager: React.FC = () => {
  const { schoolConfig, activeNav } = useApp();

  useEffect(() => {
    const schoolName = schoolConfig.name || 'Salem Montessori School';
    const shortName = schoolConfig.shortName || 'Salem VClass';
    const motto = schoolConfig.motto || 'Inspiring Excellence, Nurturing Curiosity & Practical Mastery';
    const websiteUrl = schoolConfig.websiteUrl || 'https://salemmontessori.edu.gh';
    const crestUrl = schoolConfig.logoUrl || '/school-crest.jpg';
    const bannerUrl = '/og-banner.jpg';

    // 1. Dynamic Page Title
    let titleContext = 'Virtual Classroom & E-Learning Platform';
    if (activeNav === 'vclass') titleContext = 'Live Virtual Classroom Studio';
    else if (activeNav === 'courses') titleContext = 'Montessori Courses & Curriculum';
    else if (activeNav === 'library') titleContext = 'Digital e-Library & Research Hub';
    else if (activeNav === 'results') titleContext = 'Student Transcripts & Academic Reports';
    else if (activeNav === 'configure_school') titleContext = 'School Configuration & Terms';

    const fullTitle = `${shortName} – ${titleContext} | ${schoolName}`;
    document.title = fullTitle;

    const descriptionText = `Official ${shortName} virtual learning portal for ${schoolName}. Join live classrooms, interact with digital Montessori apparatus, monitor attendance, and review academic performance transcripts. "${motto}"`;

    // Helper to set or update meta tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Search Engine Tags
    setMetaTag('name', 'description', descriptionText);
    setMetaTag(
      'name',
      'keywords',
      `${schoolName}, ${shortName}, VClass, virtual classroom, Montessori education, student portal, teacher portal, report cards, Accra Ghana, e-learning`
    );
    setMetaTag('name', 'author', schoolName);
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // 3. OpenGraph Social Cards
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', shortName);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', descriptionText);
    setMetaTag('property', 'og:url', window.location.href);
    setMetaTag('property', 'og:image', bannerUrl);
    setMetaTag('property', 'og:image:alt', `${schoolName} VClass Portal & Official Crest`);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');

    // 4. Twitter / X Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', descriptionText);
    setMetaTag('name', 'twitter:image', bannerUrl);
    setMetaTag('name', 'twitter:image:alt', `${schoolName} School Crest`);

    // 5. Dynamic Favicon from configured crest
    let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.setAttribute('rel', 'icon');
      document.head.appendChild(faviconLink);
    }
    faviconLink.setAttribute('href', crestUrl);

    // 6. Schema.org Structured Data (JSON-LD)
    const jsonLdId = 'salem-structured-data-jsonld';
    let scriptTag = document.getElementById(jsonLdId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = jsonLdId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'EducationalOrganization',
          '@id': `${websiteUrl}#organization`,
          name: schoolName,
          alternateName: shortName,
          url: websiteUrl,
          logo: {
            '@type': 'ImageObject',
            url: crestUrl,
            caption: `${schoolName} Official Crest`,
          },
          slogan: motto,
          address: {
            '@type': 'PostalAddress',
            streetAddress: schoolConfig.address || 'Airport Residential Area',
            addressLocality: schoolConfig.city || 'Accra',
            addressCountry: schoolConfig.country || 'Ghana',
          },
          telephone: schoolConfig.phone || '+233 24 456 7890',
          email: schoolConfig.email || 'info@salemmontessori.edu.gh',
          sameAs: [websiteUrl],
        },
        {
          '@type': 'WebApplication',
          '@id': `${window.location.origin}#vclass-app`,
          name: `${shortName} E-Learning Portal`,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'All modern web browsers (Chrome, Safari, Firefox, Edge, iOS, Android)',
          browserRequirements: 'Requires JavaScript. Requires HTML5.',
          description: descriptionText,
          url: window.location.origin,
          image: bannerUrl,
          author: {
            '@type': 'EducationalOrganization',
            name: schoolName,
          },
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          featureList: [
            'Real-Time Virtual Classroom Video Studio',
            'Interactive Montessori Sensory Apparatus Simulations',
            'Student Terminal Performance Transcripts and Continuous Assessment',
            'Teacher Attendance Log & Lesson Planner',
            'Parent Progress & Fee Tracking Portal',
          ],
        },
      ],
    };

    scriptTag.textContent = JSON.stringify(structuredData, null, 2);
  }, [schoolConfig, activeNav]);

  return null;
};
