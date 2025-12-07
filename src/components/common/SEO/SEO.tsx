import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

/**
 * Component SEO để quản lý meta tags cho từng trang
 * Giúp tối ưu hóa SEO với title, description, keywords và Open Graph tags
 */
const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  canonical,
}) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | SE347 Coffee Chain`;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    if (description) {
      updateMetaTag('description', description);
    }

    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Open Graph tags
    if (ogTitle) {
      updateMetaTag('og:title', ogTitle, true);
    } else if (title) {
      updateMetaTag('og:title', `${title} | SE347 Coffee Chain`, true);
    }

    if (ogDescription) {
      updateMetaTag('og:description', ogDescription, true);
    } else if (description) {
      updateMetaTag('og:description', description, true);
    }

    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
    }

    // Canonical URL
    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        document.head.appendChild(linkElement);
      }
      
      linkElement.setAttribute('href', canonical);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical]);

  return null;
};

export default SEO;
