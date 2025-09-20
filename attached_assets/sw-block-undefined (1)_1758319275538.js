// sw-block-undefined.js
// Bloqueia QUALQUER requisição para /mondial/undefined (ou variações com query/hash)
self.addEventListener('fetch', (event) => {
  const url = event.request.url || '';
  if (url.includes('/mondial/undefined')) {
    // responde localmente e não toca no servidor
    event.respondWith(
      new Response('', {
        status: 410, // Gone (pode usar 204 se preferir)
        statusText: 'Blocked by sw-block-undefined',
        headers: { 'Content-Type': 'text/plain' }
      })
    );
  }
});
