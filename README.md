# Wedding Invitation

Minimalist one-page wedding invitation.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Git
- GitHub
- GitHub Pages
- Google Apps Script
- Google Sheets

## Project structure

index.html
    Main website.

css/style.css
    Complete visual design and responsive layout.

js/main.js
    JavaScript entry point.

js/navigation.js
    Mobile navigation.

js/animations.js
    Scroll reveal animations.

js/rsvp.js
    RSVP form and communication with Google Apps Script.

google-apps-script/Code.gs
    Serverless RSVP backend.

google-apps-script/headers.csv
    Google Sheets header row.

assets/images/
    Website images.

assets/icons/
    SVG icons.

assets/fonts/
    Local font files if fonts are self-hosted.

## Setup

1. Create a Google Sheet.

2. Create a sheet/tab named:

   RSVP

3. Add the headers from:

   google-apps-script/headers.csv

4. Open:

   Extensions → Apps Script

5. Paste the contents of:

   google-apps-script/Code.gs

6. Deploy the Apps Script as a Web App.

7. Copy the Web App URL.

8. Open:

   js/rsvp.js

9. Replace:

   PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE

   with the Web App URL.

10. Replace the placeholder wedding information in index.html.

11. Add optimized images to:

   assets/images/

12. Push the project to GitHub.

13. Enable GitHub Pages.

## RSVP

The person submitting the RSVP is stored in the Name column.

If the person selects:

1 person

no additional guest field is shown.

If the person selects:

2 people

one additional guest field appears.

If the person selects:

3 people

two additional guest fields appear.

And so on.

The resulting Google Sheet can therefore be used directly as a guest list.

## Security

Never put:

- Google API keys
- service account credentials
- passwords
- private tokens

inside the frontend repository.

The Google Sheet itself should remain private.

## Images

Prefer:

- AVIF
- WebP

Avoid uploading large original JPEG/PNG photographs.

The goal is to keep the initial page load very small.

## Design

Design direction:

Modern Editorial Romance

Colors:

Background: #F7F4EF
Text: #292725
Muted: #716B64
Accent: #9A8068
Border: #DDD6CD

Typography:

Cormorant Garamond
Inter

Layout:

Maximum content width: 1100px

The design is mobile-first.