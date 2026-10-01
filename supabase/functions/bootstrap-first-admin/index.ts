// Initial ownership is established explicitly in the new project's SQL console.
// Never grant owner access to the first public visitor or arbitrary authenticated users.
Deno.serve(() => new Response(JSON.stringify({ error: 'Bootstrap disabled. Use the documented SQL owner setup.' }), {
 status: 410, headers: { 'Content-Type': 'application/json' },
}));
