import React from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {
  // defensive normalization: avoid non-string src values (objects/arrays) turning into bad URLs
  const _extractSrc = (val) => {
    try {
      if (!val && val !== 0) return '';
      if (typeof val === 'string') return val;
      if (Array.isArray(val)) return _extractSrc(val[0]);
      if (typeof val === 'object' && val !== null) {
        // common nested locations
        if (typeof val.url === 'string' && val.url) return val.url;
        if (val.file && typeof val.file === 'object') {
          if (typeof val.file.url === 'string' && val.file.url) return val.file.url;
          if (typeof val.file.filename === 'string' && val.file.filename) return val.file.filename;
        }
        if (typeof val.file_url === 'string' && val.file_url) return val.file_url;
        if (typeof val.path === 'string' && val.path) return val.path;
        if (typeof val.name === 'string' && val.name) return val.name;
      }
    } catch (err) {
      // ignore and fallback
    }
    return '';
  };

  const safeSrcInitial = _extractSrc(src) || '/assets/images/no_image.png';

  const handleError = (e) => {
    try {
      const img = e.target;
      const orig = img.getAttribute('data-orig-src') || safeSrcInitial || '';
      const attempt = parseInt(img.getAttribute('data-onerror-attempt') || '0', 10);

      // prevent infinite loops
      if (attempt >= 3) {
        img.src = '/assets/images/no_image.png';
        img.setAttribute('data-onerror-attempt', String(attempt + 1));
        return;
      }

      // try heuristics: if value is empty, use default; if it's a bare filename, try /assets/ and /assets/images/
  const value = (orig || '').trim();
      if (!value) {
        img.src = '/assets/images/no_image.png';
        img.setAttribute('data-onerror-attempt', String(attempt + 1));
        return;
      }

      // if value already looks absolute (starts with / or http), jump to final fallback
      if (value.startsWith('/') || value.startsWith('http')) {
        img.src = '/assets/images/no_image.png';
        img.setAttribute('data-onerror-attempt', String(attempt + 1));
        return;
      }

      // try candidate prefixes based on attempt count
      const candidates = [
        `/assets/${value}`,
        `/assets/images/${value}`,
        `/assets/images/no_image.png`
      ];
      const next = candidates[attempt] || '/assets/images/no_image.png';
      img.src = next;
      img.setAttribute('data-onerror-attempt', String(attempt + 1));
    } catch (err) {
      e.target.src = '/assets/images/no_image.png';
    }
  };

  return (
    <img
      src={safeSrcInitial}
      data-orig-src={safeSrcInitial}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}

export default Image;
