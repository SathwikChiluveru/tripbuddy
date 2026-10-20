# Verification — 19 October 2026

Tested locally against MongoDB 6 on loopback 27018. No hosted data was used.

## Automated evidence

- Backend integration: **11 tests passed, 0 failed**. Real HTTP sessions and Socket.IO checks cover anonymous/outsider rejection, sender spoof protection, ownership, registration persistence, invalid inputs, capacity, duplicate joins, leave/delete cleanup, logout and session revocation.
- Capacity race: **12 contenders for 2 remaining places; exactly 2 admitted; final membership 3 including host**.
- Overlap regression: **10 concurrent leave/rejoin pairs**, with Trip, Chat and User membership checked after each pair, followed by a successful member message.
- Search/pagination: **102 fixture trips** prove personal trips remain reachable beyond the first 100 and global search finds older records. Regex punctuation is literal.
- Upload boundaries: anonymous 401; valid PNG stored and served byte-for-byte; SVG disguised as PNG rejected; files larger than 5 MB return 413. Test upload removed afterward. Concurrent membership tests alternate uppercase/lowercase trip IDs to verify queue-key normalization.
- Frontend production build and ESLint: passed.
- Headless Edge browser smoke at **1440 px and 390 px**: passed. Mobile navigation/no horizontal overflow, empty search, protected routes, registration, trip create/edit, chat message, profile save/countries, logout and fixture cleanup. No JavaScript page errors.

## Local load test

**5,416 requests in 10.020 seconds**, **16 concurrent workers**, **540.52 requests/second**. Median **14.93 ms**, p95 **121.12 ms**, maximum **296.48 ms**. **Zero unexpected failures.**

Expected statuses: 2,701 HTTP 200; 2,035 HTTP 400 for invalid inputs; 680 HTTP 409 for capacity/duplicate conflicts. Intentional rejection responses are part of the workload, not failed requests. Setup and capacity-race traffic are reported separately by the script.

These numbers describe this machine and synthetic workload, not production capacity or fault tolerance.

A repeat while the frontend build also ran handled **3,034 requests**, **302.23 requests/second**, p95 **225.30 ms**, maximum **371.37 ms**, again with **zero unexpected failures**. CPU contention and runtime state affect these local results; neither run is a production benchmark.

## Review and limits

Independent review found first-page-only personal filtering and overlapping membership updates; both received code fixes and regression tests. Browser QA corrected mobile heading spacing and profile refresh.

Not exercised: real Google credentials, external OAuth networks, multi-process/replica-set hosting, Docker execution, fresh registry downloads, or online dependency advisories (network restricted). The local API's per-process trip queue does not provide crash-atomic cross-document transactions. See README deployment notes.
