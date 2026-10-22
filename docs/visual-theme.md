# Neon Arcade visual theme

The selected concept uses a near-black navy background, cyan primary actions,
restrained magenta details, and sharp cards. The catalog and homepage ratings
come from existing game and review records.

## Homepage banner

The active banner is `public/images/nightreign-banner-no-logo.webp`, a logo-free
copy of the Elden Ring Nightreign image selected by the user:
https://image.api.playstation.com/vulcan/ap/rnd/202501/3008/4b8274d023372e065669b663015c6f23b8df2d0ce2d3c500.jpg

Its artwork is positioned on the right on desktop, with a dark gradient behind
the homepage text. Mobile uses a centered crop with a stronger overlay.
The banner is decorative: the headline and controls remain real HTML.
No external font or animation package is required.

## Interaction and responsive details

- Navigation collapses below 1051 px. The toggle exposes its expanded state,
  Escape closes it and returns focus, and choosing a link closes it.
- Cards and forms stack on narrow screens. Inputs and buttons retain touch
  targets and keyboard focus indicators.
- Motion is reduced when the browser requests reduced motion.
- Each review appears once; an author's controls remain available when their
  review is outside the current page of results.

## Logo removal

The built-in image generation tool removed the Elden Ring and Nightreign
lettering and reconstructed the surrounding rainy sky. The result was optimized
to WebP for the site.

Prompt: Remove only the upper-center Elden Ring and Nightreign logo lettering
and trademark marks; reconstruct the surrounding dark rainy sky and clouds;
preserve the warrior, raised sword, light effects, ruins, blue-purple palette,
framing, and remaining artwork.
