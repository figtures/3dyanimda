# Engineering Lab and page coverage

All four brands and all three environment-selected themes share these routes:

- `/araclar`: engineering workspace
- `/araclar/stl-onizle`: STL inspection
- `/araclar/kesit-analizi`: X/Y/Z clipping-plane inspection
- `/araclar/tarama-goruntuleyici`: PLY point-cloud / mesh inspection

STL and PLY are parsed in a dedicated worker. Inputs stay in the browser; they are not uploaded by the Lab. Parsing is limited to 20 MiB, 1.8 million expanded vertices and 15 seconds. The viewer uses on-demand rendering, bounded pixel density and disposable WebGL resources. Normal-bearing PLY point clouds remain points; mesh vertex display is explicitly distinguished from real scan data. Failed parsing retains the previous valid model. A valid STL can be passed into the existing quote Studio with router state; submitting a quote follows that form's existing upload and permission rules.

Clipping is visual and does not cap surfaces, slice print layers or certify printability. Dimensions use the selected source unit (mm/cm/in); file units are not inferred. No volume/mass estimate is supplied for potentially open or unverified meshes. E57/LAS are not supported. The bundled original flanged-sleeve example is illustrative, not a validated production part. Regenerate it with `node scripts/generate-inspection-sample.mjs`.

## Content inventory

The public source sitemap was retrieved from `https://3dyaninda.com/sitemap.xml` on 2026-10-03. It contained 191 URLs, including 160 district/service URLs (39 districts and Hadımköy, four services each). This is a sitemap inventory, not a claim that every source URL was checked for content quality or HTTP status.

This release provides, per brand and independently of theme:

| Coverage | Count | Search treatment |
| --- | ---: | --- |
| Published content records | 34 | Index eligible on the configured canonical production host |
| Base, hub and engineering routes | 14 | Index eligible on the configured canonical production host |
| Geographic project-planning tools | 204 | Publicly reachable, `noindex,follow`, excluded from sitemap |
| Total exported HTML routes | 252 | Not 252 indexable editorial pages |

The content expansion adds eight sectors, seven technical guides and a corporate-project solution. The separate utility routes cover 39 Istanbul districts, Örnek Mahallesi and city/service starting points. A geographic planner offers a service-specific checklist, preparation mode, downloadable local brief, engineering-tool links and a region-prefilled quote. It makes no claims about local branches or fixed delivery times. Geographic editorial records remain drafts until the existing database publication checks pass. Publishing a reviewed geographic page replaces its utility fallback and makes that specific page eligible for the sitemap. No draft text is exposed by the fallback.

The source has Hadımköy-specific routes; this release instead prioritizes the business's confirmed Örnek Mahallesi location. It does not assert one-to-one geographic coverage of every source URL. It also does not promise duplicate-content immunity or search/answer-engine rankings. The shared technical guidance should continue to acquire original sector examples and approved project evidence before growth campaigns.

## Deployment

Apply `20261003110000_engineering_content.sql` after the existing migrations. It adds the sector type and inserts defaults without overwriting administrator edits. `scripts/expand-content.mjs` regenerates this additive release. It does not modify the earlier seed migration.

Use the existing environment variables to select the three themes. Run the existing static exporter against each brand's configured Supabase API and canonical host. It writes planner HTML with `noindex` but excludes those routes from sitemap XML. The private demo intentionally has no working quote backend and stays noindex.

Verification: `npm run typecheck`, `npm test`, `npm run test:db`, `npm run test:engineering`, `npm run test:themes`, and `node scripts/test-export.mjs`. Browser tasks accept `CHROMIUM_EXECUTABLE`. The export test uses an isolated API fixture; it is not a live Supabase deployment test.

## STL orientation

The Lab starts with Z as the up axis and offers an explicit Y/Z camera-up selector because STL does not declare an up-axis convention. Changing the view does not rotate the mesh or swap measurement/clipping axes. The quote viewer also uses a Z-up camera and XY ground, with no fixed 90-degree mesh rotation. Viewer normalization works on a copy of the input positions, so changing up axis or retrying WebGL cannot mutate parsed source coordinates. Regression coverage switches Z → Y → Z, resets the view and compares the rendered canvas across all themes and brands.
