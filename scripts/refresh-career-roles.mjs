import {readFileSync,writeFileSync} from 'node:fs';
const roles=JSON.parse(readFileSync(new URL('../src/content/career-roles.json',import.meta.url),'utf8'));
const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
const columns=['slug','title_tr','department','location','employment_type','level','summary_tr','description_tr','requirements_tr'];
const values=Object.entries(roles).flatMap(([brand,jobs])=>jobs.map(job=>`(${[quote(brand),...columns.map(key=>quote(job[key])),job.sort_order].join(',')})`));
const sql=`-- Original position content requested by the owner for the four brands.
-- No salary, benefits, hiring quota or employment terms have been invented.
-- Explicitly run against the intended project; reruns preserve existing CMS edits.
BEGIN;
INSERT INTO public.job_postings (tenant_id,${columns.join(',')},sort_order,active)
SELECT t.id,${columns.map(key=>'v.'+key).join(',')},v.sort_order,true
FROM (VALUES
${values.join(',\n')}
) AS v(brand,${columns.join(',')},sort_order)
JOIN public.tenants t ON t.slug=v.brand
ON CONFLICT (tenant_id,slug) DO NOTHING;
COMMIT;
`;
writeFileSync(new URL('../supabase/seeds/career-roles.sql',import.meta.url),sql);
console.log(`Prepared ${values.length} positions for ${Object.keys(roles).length} brands.`);
