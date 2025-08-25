/* One source of truth for prices & images */
window.PRICE_CATALOG = {
  hardware: {
    'Yealink T31W': { onceOff: 1250, image: 'Assets/t31w.jpeg' },
    'Yealink T34W': { onceOff: 1499, image: 'Assets/t34w.png' },
    'Yealink W73P': { onceOff: 2250, image: 'Assets/cordless.png' },
    'Yealink W73H': { onceOff: 1200, image: 'Assets/cordless.png' },
    'Mobile App':   { onceOff: 0,    image: 'Assets/mobile-app.png' },
  },
  monthly: {
    virtualNumber: 25,
    platformFee: 150,   // if you need it later
    extension: 65       // if you need it later
  }
};
// scripts/prices.js
window.PRICE_CATALOG = {
  hardware: { /* ... */ },
  monthly: {
    platformFee: 150,
    extension: 65,
    virtualNumber: 90
  },
  rates: {
    localPerMin: 0.35,
    mobilePerMin: 0.55
  }
};
