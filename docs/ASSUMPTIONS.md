# Assumptions

- **Layout & Routing**: Maintained original routes. Admin panel is an entirely separate layout.
- **Backend Stack**: Standard Spring Boot 3 on Java 21. No Lombok to avoid IDE plugin issues during automated tests. Records used for DTOs.
- **Payments**: Purely simulated. Every financial action simply creates an entry in `transactions`. The frontend computes nothing related to money; all formulas run server-side in `PricingService`.
- **Time/Clock**: `ClockConfig` bean is used for all timestamp creations (`Instant.now(clock)`) to allow `/admin/clock` to push time forward and demo late fees seamlessly without editing database rows manually.
- **Photos**: Stored directly to `./data/uploads`. Magic bytes validation ensures basic security.
- **AI Matching**: Falls back to simple keyword matching if Anthropic key is missing or request times out.
- **Legacy Files**: `src/db/` completely removed. `fuse.js` and `idb` uninstalled.
