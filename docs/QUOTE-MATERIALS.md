# Quote material catalogue

Each of the four brands has 20 request options across FDM, SLA, SLS and MJF.
These are preferences for technical review, not stock availability or production commitments.

## Administration

Open **Fiyatlandırma → Malzemeler** in the selected brand admin panel.
The name, technology, description, color note, order and active state control the public form.
Deactivate an unavailable option; the public query only reads active records for the selected brand.
Set density and price from the actual product and your commercial pricing. Zero density or price keeps the option request-only.
General pricing settings must also be configured before FDM estimates are enabled.
Reçine/toz technologies, finishing requests and multicolor requests remain subject to technical quotation.

## Data and handoff

`supabase/seeds/quote-materials.sql` inserts missing name/technology pairs for the four named brands.
It does not overwrite existing prices, descriptions or visibility, and does not copy demo prices.
Run through an authorized database connection when provisioning another environment.
All current values are 0 for density and pricing until verified business values are entered.

Technology, material, purpose, color and selected finishing operations are included in the existing quote description; material preference also stays in `material_pref`.
Admin request details and CSV exports already read these fields. No new request-table schema is required.
No live test lead was submitted and no customer email was sent during validation.

Material-family terminology checked against:
- https://help.prusa3d.com/filament-material-guide
- https://formlabs.com/global/products/materials/
No manufacturer-specific performance, certification, stock or price claims are imported.
