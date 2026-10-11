# Content source review — 10 October 2026

This is an AI-assisted evidence audit, not independent human editorial approval, an engineering sign-off, legal advice, or a publication certificate. It adds a claim/source register and records the evidence gaps. No authored page, source date, `reviewed_at`, `updated_at`, or publication state was changed by this audit.

## Scope and method

The effective content was inspected using the runtime merge order: `pages.json` → `editorial-pages.json` → `search-pages.json`, keyed by brand and path. The register records input SHA-256 hashes. All three content files and `content/authoring` JSON were searched for quantitative performance, prices, guaranteed delivery, stock, certification and safety-sensitive language. Relevant material, scanning, manufacturing, medical, automotive and local-example passages were then read for context. Primary manufacturer/software documentation, NIST research and FDA technical guidance were opened and compared with recurring claims.

| Inventory | Records |
| --- | ---: |
| Effective landing records | 796 |
| Service / solution / material | 12 / 20 / 24 |
| Guide / sector / location | 52 / 32 / 656 |
| Existing published / draft state | 144 / 652 |
| Records with any editorial source links | 676 |
| Material pages with source links | 24 |
| Draft location pages with source links | 652 |
| Published records without editorial source links | 120 |

These are repository counts, not a live database or deployed-route verification. A source link is not automatically evidence for the whole page. Conversely, an owner instruction or illustrative planning question does not automatically need an external citation.

## Findings

1. **The largest gap is claim-to-source specificity.** The 24 material pages already cite Prusa, but the eight ABS/engineering-polymer pages cite only the general material index. The index is not a particular filament’s technical data sheet. The other 120 published records have no `editorial.sources`; technical claims among them need scoped source mapping, while owner facts should remain tied to the owner record.
2. **The broad NIST link has a limited role.** It occurs 81 times in effective local records. Its summary explains AM variability and qualification concerns; much of the detailed program is metal AM. It does not verify local fixture examples, a workshop’s process, dimensional accuracy, or the suitability of a specific polymer. Keep it as general context, not a blanket verification badge.
3. **Autodesk’s mesh overview also has limited scope.** It occurs 82 times. It supports the existence of mesh operations, not measurement accuracy, recovered missing geometry, or guaranteed manufacturability. The more precise STL export documentation can support unit/refinement guidance.
4. **No affirmative numeric performance, price, lead-time, stock or certification guarantee was identified in the targeted content scan.** Four unit-pattern hits in the expanded title/FAQ/table scan were illustrative: a 300 mm question and 60/30/15 cm scale examples. The 300 mm answer explicitly says that fitting inside machine volume is insufficient; it is not a disclosed workshop build envelope. Numeric filtering must inspect context rather than suppress useful examples.
5. **High-consequence subjects remain present even though their wording is cautious.** Existing medical, automotive, pressure/sealing, machine-safety and food-contact text generally separates prototype/fit work from approved use. This is a useful boundary; it does not establish that the business has a corresponding qualification or that every requested application can be accepted.
6. **No exact filament grade, printer/scanner model, measurement uncertainty or qualification record was found in the confirmed owner facts.** A source for a material family or a particular supplier’s scanner must not be used to fill those missing business facts.

## Source-to-claim examples

`content/authoring/source-register.json` contains 15 stable source IDs, 15 claim groups, exact page selectors, excerpts, supported scope, and limitations. Selectors identify candidates for review; a suffix match never establishes support for every sentence on that page.

| Existing example / recurring claim | Source and exact section | Scope to preserve |
| --- | --- | --- |
| `3dyanimda /malzemeler/pla`, form/sun-display prototypes | [Prusa PLA](https://help.prusa3d.com/article/pla_2062), Basic info / Description | General candidate for form work; no guaranteed thermal/load rating. |
| ABS dimensional planning across the four material pages | [Prusa ABS](https://help.prusa3d.com/article/abs_2058), Tips for successful printing → Shrinkage | Warping and shrinkage warrant planning/sample checks; do not copy a broad shrinkage percentage into the workshop’s tolerances. |
| `3dyanimda /malzemeler/asa`, ASA as an outdoor candidate | [Prusa ASA](https://help.prusa3d.com/article/asa_1809), Basic info / Description | Outdoor candidacy; no service-life, color, waterproofing or complete-assembly guarantee. |
| TPU hardness and printed flexibility | [Prusa flexible materials](https://help.prusa3d.com/article/flexible-materials_2057), Description / Tips for successful printing | Hardness and construction matter; no universal Shore grade or seal/pressure claim. |
| PETG and infill/perimeter decisions | [Prusa PETG](https://help.prusa3d.com/article/petg_2059), Description / Tips for successful printing | Product/process context; no proof of exact snap fit, clarity, chemical resistance or OEM equivalence. |
| Polyamide moisture/process needs | [Prusa Polyamide](https://help.prusa3d.com/article/polyamide-nylon_167188), Description / Keep the filament dry | Polyamide-specific context; not a universal rule for all engineering polymers or evidence of stocked grades. |
| `3dsanayi /rehber/aparat-malzeme-secimi`, direction and final behavior | [NIST polycarbonate study](https://www.nist.gov/publications/amb2018-03-benchmark-physical-property-measurements-material-extrusion-additive), Abstract | Primary evidence is tested PC material extrusion. Extension to another polymer is an explicit engineering inference, not a measured strength result. |
| `3dyanimda /rehber/stl-dosya-hazirlama`, units and mesh refinement | [Autodesk STL export section](https://help.autodesk.com/cloudhelp/ENU/Fusion-Model/files/SLD-3D-PRINT.htm#export-to-a-3mf-stl-or-obj-file) | STL is unitless. This supports checking dimensions; it does not certify a mesh or physical tolerance. |
| `/3d-tarama` and scan-to-CAD guides, acquisition versus remodeling | [Artec reverse-engineering article](https://www.artec3d.com/learning-center/what-reverse-engineering), Scanning with structured light / CAD design work; [Autodesk Convert Mesh](https://help.autodesk.com/cloudhelp/ENU/Fusion-Mesh/files/MESH-MODIFY-TOOLS.htm#convert-mesh) | Scan mesh and CAD work are separate steps; creating a solid does not prove original geometry or a useful edit history. |
| Reflective/transparent surfaces and access in scanning pages | [Artec Leo guide](https://www.artec3d.com/learning-center/how-3d-scan-leo), Before you scan: object, environment, technique | General preparation context only. Leo distances, speed, calibration and accuracy are not workshop facts. |
| `/sektorler/medikal`, no assumed sterilization/biocompatibility | [FDA sterilization section](https://www.fda.gov/media/97633/download#page=29) and [biocompatibility section](https://www.fda.gov/media/97633/download#page=31) | Final-device evidence matters. This 2017 U.S. guidance is technical background, not Turkish legal compliance or approval of this business. |

Section anchors are used only where observed in the source or where a verified PDF page locator applies. Prusa and Artec entries retain the exact article URL plus the named section because no stable section fragment was verified. No guessed fragment IDs were added. PDF viewer page numbers differ from printed page labels.

The currently authored STL sentence says units may not survive every workflow. Autodesk’s more precise statement is that STL is a unitless surface format. This is a candidate for a future authorized text revision; the existing sentence is unchanged by this audit.

## Highest-consequence review queue

| Subject and concrete page example | What the current content does | Evidence still needed for any stronger claim |
| --- | --- | --- |
| Medical: all four `/sektorler/medikal` pages | Limits scope to education, development or nonclinical work; does not claim biocompatibility or sterility | Actual intended use, competent technical/clinical review, applicable Turkish requirements and final-product evidence |
| Automotive safety: `parcayanimda /malzemeler/muhendislik-polimerleri` | Separates brakes, steering and other critical duties from ordinary reverse engineering | Responsible engineering review, applicable approvals, OEM/IP permissions where relevant, tested part/process evidence |
| Pressure/sealing: `parcayanimda /malzemeler/tpu` | Says flexibility alone does not establish gasket function | Fluid, pressure, temperature, life requirements and an appropriate validated design/test plan |
| Machine safety: `3dsanayi /cozumler/bakim-yardimcilari` | Separates lifting, safety locking and hazardous-energy control from simple helpers | Qualified safety/engineering review and applicable equipment requirements |
| Food contact: `parcayanimda /bolgeler/istanbul/kucukcekmece/3d-baski` and Ümraniye examples | Does not infer food-contact suitability from plastic appearance or fit | Actual material/processing/contact conditions and competent jurisdiction-specific review |
| Aerospace: `/sektorler/savunma-havacilik` | Describes conceptual or nonoperational scope rather than airworthiness | Verified scope and relevant technical/regulatory/contractual evidence before expanding the offer |
| Scanning accuracy and CAD reconstruction | Describes reference capture and further modeling, without a numeric accuracy promise | Scanner model, procedure, calibration/uncertainty evidence and actual acceptance scope |
| Price, stock, turnaround and equipment | Uses project-specific quotation/confirmation, without a fixed numeric promise | Current owner-approved commercial and equipment records |

These entries are review priorities, not findings that the current wording claims a nonexistent certification. Negated claims and conditional examples should remain distinguishable from affirmative claims in automation.

## Confirmed business facts and unresolved identity

The only first-party facts used here are the existing owner records. Delivery is available by cargo, courier and collection, with cargo to other cities. On-site 3D scanning is offered. Workshop visits require an appointment. All four brands share the confirmed email `info@3dyanimda.com`, telephone `+905364488230`, and one workshop at Örnek Mahallesi, Bestekar Sokak No: 17, Ataşehir / İstanbul.

No source in this audit establishes another branch, opening hours, WhatsApp support, exact coordinates, postal code, price list, stock, delivery SLA, scanner model, production tolerance, registered legal operator or tax identity. Manufacturer pages cannot supply these facts. A local service page must not silently become a separate LocalBusiness location.

## Implementation recommendations

- Resolve `claimIds` to `sourceIds`, and render a short scoped source note next to the supported statement or section. A generic list of links must not be described as verification of all content.
- Replace the broad Prusa index on ABS pages with the specific ABS source where the cited claim concerns process behavior. For engineering polymers, use the PA source only for PA/moisture claims; keep grade/PC/composite claims pending actual product data.
- Add selective source mapping to STL, scan-to-CAD, direction/process and material-selection guides. Do not attach manufacturer citations to owner logistics or to unrelated local design examples.
- Validate source IDs, URLs, sections, scope and limitations. Keep research access dates in this register; preserve authored timestamps and existing publication states.
- Flag newly introduced numeric performance units, currency/price, lead-time guarantees, certification terms, clinical/food/safety claims and stock statements for contextual review. Check negation and illustrative values before escalating.
- Continue to require genuine human evidence wherever the release policy asks for independent review. This audit must never populate a human approval name or mark that gate complete.

The report and register are reviewable implementation inputs. They do not certify that every content statement is correct, that all legal obligations are met, or that the site is approved for publication.
