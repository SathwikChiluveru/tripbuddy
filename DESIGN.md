---
name: TripBuddy
description: A warm travel journal for finding your next small group adventure.
colors:
  forest-ink: "#203c32"
  forest-action: "#254d3d"
  forest-hover: "#173b2c"
  cream: "#f7f5ef"
  white: "#fff"
  muted-text: "#606c5e"
  sage-emphasis: "#758260"
  sage-band: "#e9ecdf"
  sage-panel: "#eef0e6"
  divider: "#dce0d4"
  field-border: "#cdd5c6"
  secondary-border: "#c7cebd"
  focus-copper: "#ba713e"
  error-ink: "#8b3829"
  error-surface: "#f8e8de"
  filter-selected: "#2c503f"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(3.5rem,6vw,5.8rem)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-.045em"
  headline:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2rem,3.4vw,3rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-.035em"
  title:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "1.45rem"
    fontWeight: 400
    letterSpacing: "-.025em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: ".85rem"
    lineHeight: 1.95
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: ".75rem"
    fontWeight: 650
rounded:
  control: "4px"
  photo: "5px"
  chip: "30px"
  message: "7px"
  hero: "160px 6px 6px 6px"
spacing:
  page-inline: "6%"
  form-gap: "20px"
  field-gap: "9px"
  field-bottom: "22px"
  grid-column-gap: "26px"
  grid-row-gap: "40px"
components:
  button-primary:
    backgroundColor: "{colors.forest-action}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "15px 23px"
  button-primary-hover:
    backgroundColor: "{colors.forest-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "#294b39"
    rounded: "{rounded.control}"
    padding: "15px 23px"
  field:
    backgroundColor: "{colors.white}"
    textColor: "#264333"
    rounded: "{rounded.control}"
    padding: "13px 14px"
  filter:
    backgroundColor: "transparent"
    textColor: "#59674f"
    rounded: "{rounded.chip}"
    padding: "9px 17px"
  filter-selected:
    backgroundColor: "{colors.filter-selected}"
    textColor: "{colors.white}"
  trip-card:
    backgroundColor: "transparent"
    textColor: "{colors.forest-ink}"
  navigation:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.forest-ink}"
---

# Design System: TripBuddy

## Overview

**Creative North Star: "A warm travel journal"**

Cream paper, forest ink, editorial serif headings and destination photography establish the implemented direction delegated by the user. Local Manrope gives navigation, forms and metadata a practical voice. This document records the current implementation in `client/src/style.css` and `client/src/App.jsx`, checked against `.local/ui/desktop.png` and `.local/ui/mobile.png`; it does not introduce a new visual identity.

The landing page works in Persuade mode: generous space, a large invitation, destination search and a photographic introduction. Discovery, trip details, editing, profiles and chat work in Operate mode: clear controls, visible state, compact metadata and task-oriented layouts. Keep the shared palette and typography while respecting that difference in density.

**Key Characteristics:**

- Warm cream and forest green, with restrained sage and copper accents.
- Serif editorial hierarchy paired with local Manrope controls.
- Destination photography with compact itinerary covers and clear trip availability.
- Responsive forms and explicit loading, empty, error and demo states.

## Colors

Primary forest-action fills main buttons; forest-ink carries headings and default text. Forest-hover darkens primary actions on hover. Cream is the page canvas and white is the input surface. Sage-emphasis marks italic hero words, sage-band anchors the landing manifesto, and sage-panel groups booking and conversation content. Muted-text supports descriptions; divider and field-border separate content and controls. Focus-copper is the keyboard focus outline. Error-ink on error-surface identifies actionable failures. Preserve the literal palette values in the frontmatter; the CSS contains additional contextual shades rather than a formal generated color scale.

## Typography

Display and headings use Georgia with Times New Roman/serif fallbacks, weight 400, balanced wrapping and negative tracking. Italic serif words supply emphasis. Manrope is bundled locally and is the actual body family; the root's DM Sans fallback is superseded by the body rule.

The display token belongs to the desktop hero. General h1 uses `clamp(2.7rem,5vw,4.6rem)` at 1.08; application page headings override this to 3.5rem. H2 uses the headline token; card titles use the title token. Descriptions use the body token with a 70ch maximum. Forms use .75rem semibold labels and .83rem input text; navigation uses .83rem at weight 650. Metadata is smaller (.65–.78rem depending on context), never a substitute for primary reading text.

At 1000px the hero title becomes 4.4rem. At 760px it becomes `clamp(3.4rem,11vw,5rem)` and app page titles become 2.8rem. At 430px the hero title is 3.5rem and card titles grow to 1.6rem within the single column.

## Layout

Landing header, hero, sections and footer center within 1440px, using 6% horizontal padding. Header height is 98px. The desktop hero uses .94fr/1.06fr columns, 6% gap and a 570px photograph. The trip grid uses three equal columns with 40px row and 26px column gaps. Application pages max out at 1280px with 63px top and 100px bottom padding; narrow forms and profiles use 950px.

At 1000px, spacing and visual heights compress. At 760px, the header becomes 77px, navigation becomes an expandable panel, the hero stacks, grids use two columns, auth photography hides, detail booking moves above descriptive content, and chat stacks its list above the conversation. At 430px grids become one column, section headings stack and paired form rows become sequential fields. Hosted profile trips use two columns until 430px. Detail pages pair a flexible body with a 330px booking panel (290px at 1000px). Chat pairs a 300px list with the conversation.

## Elevation & Depth

The interface is mostly flat: cream canvas, sage panels, thin borders and photographs establish hierarchy. Shadows are selective: hero search uses `0 8px 20px #28443108`; the rotated hero note uses `0 9px 26px #213d3212`; hovered buttons use `0 5px 15px #243d3214`; the open mobile menu uses `0 15px 20px #203c320a`. Image captions use `0 2px 12px #18352b66` text shadow.

## Shapes

Controls use 4px corners; trip and detail photographs use 5px corners; messages use 7px corners. Filters and tags use 30px pill corners, while avatars and photo arrows are circular. The hero photograph's distinctive upper-left curve is 160px, reduced to 120px on mobile; the other corners are 6px. Keep this signature curve specific to the hero.

## Components

Buttons pair concise text and optional line icons with 15px gaps. Primary actions use the forest fill, a matching 1px border and white text; secondary actions use a transparent background and secondary-border. The light landing CTA uses the cream canvas color. Hover transitions run for .2s; disabled buttons use .55 opacity and a not-allowed cursor.

Fields have persistent labels, white backgrounds, a 1px field-border, 13px 14px padding and 4px corners. Related fields share a row with 20px gap; textarea resize is vertical. Uploads use a dashed border and explicit image-format/size instructions. Errors sit near the relevant form and preserve the action for correction.

Navigation uses text links with an active copper-colored underline offset by 8px, plus a separate create-trip action. The mobile toggle exposes the same links. Buttons, links, inputs and textareas receive a 3px copper focus outline offset by 4px; preserve keyboard focus when composing nested search controls.

Trip cards use a restrained white itinerary surface with a full photograph, dark lower image fade, serif title, location/capacity, date, traveler count and a direct plan link. A small lift and soft shadow mark hover; the photo scales gently. Demo itineraries retain their explicit label. Filters wrap; selected filters become forest with white text.

The booking panel groups dates, capacity and membership actions on sage. Ownership and membership determine available actions; full trips disable joining. The profile's world map marks visited and planned destinations in different colors and lists every entered country under the map. Chat pairs a quiet crew list with a saturated forest/teal conversation header, textured message canvas, soft incoming bubbles and vivid right-aligned messages. Names and timestamps remain distinct; long content wraps. Google is the sole sign-in screen; first-time verified accounts receive a profile. Loading uses a .8s linear spinner. Empty states supply a next action; asynchronous operations expose busy text. Reduced-motion preference disables animation and transitions globally.

## Do's and Don'ts

- Do keep the cream canvas, forest hierarchy and serif/Manrope pairing.
- Do preserve visible labels, focus states, responsive stacking and clear asynchronous feedback.
- Do identify demonstration itineraries wherever they appear.
- Don't enclose every trip in a raised white card.
- Don't repeat the hero curve or rotated note on ordinary application controls.
- Don't trade operational clarity for landing-page decoration.
