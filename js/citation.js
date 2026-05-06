/**
 * Ruh Al Tarikh Citation Engine
 * Supports Chicago Style, Manuscripts, and Quranic References
 */

export const CitationEngine = {
  format(data) {
    switch (data.type) {
      case 'quran':
        return this.quranic(data);
      case 'manuscript':
        return this.manuscript(data);
      default:
        return this.chicago(data);
    }
  },

  // Example: Quran 2:255 (Sahih International)
  quranic({ surah, ayah, translation }) {
    return `Quran ${surah}:${ayah} (${translation || 'Sahih International'}).`;
  },

  // Example: Ibn Khaldun. "The Muqaddimah." Manuscript, 1377.
  manuscript({ author, title, year, city }) {
    return `${author}. "${title}." Manuscript, ${year}. Archive Ref: ${city}.`;
  },

  // Default: Chicago Style Book
  chicago({ author, title, publisher, year, city }) {
    return `${author}. ${title}. ${city}: ${publisher}, ${year}.`;
  }
};

window.CitationEngine = CitationEngine;
