# Kaspersky identity — implementation audit

Date: 22 October 2026. Scope: Factory 2040 interactive proof of concept.

## Evidence hierarchy

1. **Kaspersky Brand Portal** — https://brand.kaspersky.com/wiki/ — official brand resources and sections for logos, type, colour, illustrations, UI, 3D. Some Visual Identity Guide files are behind sign-in. Access to a summary/category page does **not** confirm full access to the current normative manual.
2. **ONY, Kaspersky brand evolution** — https://en.ony.ru/work/Kaspersky-evolution — public case description of the refreshed identity, incl. B2B calm professionalism and Kaspersky Display Medium as editorial headline weight.
3. **User-owned approved logo package on authorised Mac** — True to business horizontal white and black original SVG lockups. Assets are copied unchanged to public/brand.
4. **Installed Kaspersky Sans Display and KasperskySansMono fonts** on the authorised Mac — available locally to review artwork. The web repo does not redistribute fonts.
5. **2025 Kaspersky executive report aesthetic audit** from user's previous client workspace — useful supplementary visual context, NOT a normative brandbook for this particular initiative.

## Implementation and status

| Element | Status | Evidence/decision |
|---|---|---|
| Kaspersky official logo asset | Implemented | public/brand/kaspersky-brandline-white.svg, original lockup provided in user workspace. No hand-drawn fake Kaspersky glyphs |
| Kaspersky project designation | Concept only | “Завод 2040” shown beside—not inside—Kaspersky lockup, separated by neutral thin stroke |
| Typeface | Local implementation | CSS uses local Kaspersky Sans Display Medium, Regular, and Light, with system fallback on other devices. **Not full production webfont compliance until corporate font license and webfont distribution are confirmed** |
| Primary dark base | Visual alignment | #1B1C19 (near-black), #29CCB1 mint; cool emerald structural accents. Colours checked against accessible public examples and report palette, not private 2024 VI tokens |
| B2B art direction | Aligned qualitatively | editorial whitespace, precise scale, moderate font weights, reduced HUD, quiet illustrations, animated internal light |
| 3D | Material upgrade | actual Blender-authored blast furnace, accessible CC0 industrial GLBs, Poly Haven PBR. Realtime model is *not* an actual factory digital twin and not offline-CGI photorealism |
| Illustration | Conceptual | five independent Adobe Firefly concept renders. Not photographs of existing equipment and do not accurately reconstruct any real facilities |
| Mobile and motion | Verified by browser tests | lightweight model variant for mobile, reduced-motion support, meaningful navigation, contextual hotspots |
| Logo safe area, minimum size, official versions | **Not externally certified** | complete customer VI manual not available. Do not claim exact compliance |

## Decisions deliberately avoided

- No proprietary Kaspersky fonts committed or supplied as downloadable assets.
- No counterfeit Kaspersky logo, fake cyber-shields, padlocks or neon sci-fi grids.
- No assertions that conceptual security scenarios are official Kaspersky industry forecasts.
- No misleading visual equivalence of a Firefly render and a continuous photorealistic 3D factory.
- No unlicensed standalone redistribution of the external 1DesignTool industrial robot GLB.

## Before customer production sign-off

1. Access to the current approved *Visual Identity Guidelines* from Kaspersky Brand Portal and/or client's marketing team.
2. Corporate webfont distribution authorization and proper WOFF2 package.
3. Correct Kaspersky project lockup and placement / logo safe area approval, including whether co-branding is permissible.
4. Final exact RGB/HEX, background and UI colors with VI palette reference, visual QA for contrast.
5. Approval of industrial plant concept renders and validated industrial geometry.
6. Industrial engineering and ICS/OT review of all 42 hypothetical predictions.
7. Real-device and accessibility performance sign-off.

Until these, this is a **brand-aligned demonstration using confirmed public assets**, NOT a certified brandbook-compliant site.
