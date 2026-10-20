# TripBuddy interface and security critique

Review scope: landing page, Google sign-in, discovery, trip detail and composition, My Trips, profile/world map, chat, responsive behavior, route flow, API profile privacy, upload handling, CSP, and container serving. Assessment A was completed from the source and desktop/mobile browser review. Assessment B used the local browser and Impeccable detector as a separate pass.

## Heuristic assessment before fixes

Scores use a 1–5 scale, where 5 means the interface consistently supports the heuristic.

| Heuristic | Score | Evidence |
| --- | ---: | --- |
| Visibility of system status | 3 | Loading and error states existed, but Google loading/retry and join success were easy to miss. |
| Match with the traveler’s language | 4 | Independent-travel copy is distinctive; a result count read like a technical status. |
| User control and freedom | 3 | Route changes did not move keyboard focus; transient trip/profile failures lacked retry actions. |
| Consistency and standards | 4 | Cards, visual tone, and basic form patterns were consistent. |
| Error prevention | 3 | Trip form required an optional description and did not clearly group the decisions. |
| Recognition over recall | 4 | Cards show dates, destination, capacity, and members; chat entry lost the trip context. |
| Flexibility and efficiency | 3 | Reaching the intended trip conversation required another selection. |
| Aesthetic and minimalist design | 4 | Editorial photography, warm palette, and typography reinforce the traveler audience. |
| Error recovery | 2 | Sign-in and route loading failures offered weak recovery or no retry. |
| Help and documentation | 3 | The product purpose is clear, but guest trip-planning actions did not disclose the sign-in gate. |

## Findings and changes

### P1

- Trip detail chat actions opened a generic chat chooser. They now pass the trip ID, select the matching conversation on arrival, and show a link back to trip details with destination/date context.
- Joining a trip previously updated silently. Success now appears in a live status region, receives focus, and offers the group chat as the next action.
- Anonymous profile lookup returned fields beyond the public profile. The API now selects an explicit public projection; the owner still receives their own age and email. A regression test covers both views.
- The authenticated user directory also exposed age and trip history. Its response now uses the same explicit public-field projection, with a regression assertion for every directory entry.
- Uploads accumulated without a storage ceiling. New files are stored under their account ID and checked against serialized 50 MiB per-account and 5 GiB total-directory quotas, in addition to the 5 MiB per-file limit. These limits are process-local and intended for the current single-instance setup.
- The global storage ceiling now has an integration test proving one account cannot upload once another account has consumed the shared quota.
- The frontend container ran Vite on `0.0.0.0`. It now builds static assets and serves them through Nginx, with same-origin API, upload, and Socket.IO proxies plus production security headers. Docker could not be built in this environment because Docker Desktop’s engine pipe is unavailable.
- Route changes now move focus to the new main region. Google loading/recovery is visible, and trip/profile load errors have retry actions.

### P2

- Mobile hid Sign in behind the menu. A compact Sign in action remains visible and the menu button identifies its controlled navigation region.
- Discovery filter targets are at least 44 px high on mobile. Result counts now say “results.”
- Guest “Plan a trip” actions now disclose that sign-in is required.
- My Trips now separates hosted and joined trips with clear headings and counts.
- The trip composer is divided into destination/dates, group/style, and story/photo sections. The story is optional, and optional categories/interests are labeled.
- The chat picker no longer presents wrapped partial cards on mobile; it is a vertically scrollable conversation list with selected state exposed to assistive technology.
- Fixed visible encoding artifacts in traveler-facing copy.
- The CSP now permits the self-hosted/data font assets required by the app.

### Strengths preserved

- The solo independent-traveler positioning is specific and coherent.
- The landing photography and overlay composition create a clear sense of place.
- Trip cards are visually consistent and expose useful planning details without adding redundant card chrome.
- The profile keeps the visited/planned map and a text list of countries, which remains the canonical accessible representation.
- Existing authorization checks for trip ownership, chat membership, session cookies, origin validation, and image URL validation were retained.

## Evidence after fixes

- The Impeccable static detector returned `[]` for `client/src/App.jsx`.
- Browser smoke passed for desktop/mobile rendering, no mobile horizontal overflow, visible mobile Sign in, route focus, filter hit areas, discovery empty state, protected routes, optional trip story, create/edit, My Trips grouping, trip-specific chat selection, profile/map data, and logout.
- Backend integration tests passed 16/16, including public profile and directory projections, production-disabled password endpoints, per-account and global upload quotas, file signature/size handling, session and origin protections, chat membership, and concurrent trip capacity.
- The 10-second load run passed 6,650 requests at 16 concurrent workers (662.94 requests/sec, p95 99.62 ms, zero unexpected responses). The concurrent-capacity race admitted exactly the two remaining travelers.
- Frontend production build and lint passed. Local frontend and backend both returned HTTP 200 after restart; frontend CSP includes `font-src 'self' data:`.
- A fresh Chromium overlay capture was unavailable in the earlier review because the browser target closed with OS error 10054. The post-fix browser smoke did render screenshots at desktop and mobile sizes.

## Remaining deployment boundary

The API’s rate-limit buckets, upload quota queue, and filesystem quota are per process. Multi-replica production should use a shared rate-limit store and object storage with a shared quota ledger. Public hosting also needs HTTPS termination and `TRUST_PROXY_HOPS` set to the exact trusted proxy count. The Compose deployment notes document these requirements.
