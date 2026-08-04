const CACHE = "orange-finance-v1";

const FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./chat.html",
    "./chat.css",
    "./chat.js"
];

self.addEventListener("install", e=>{

    e.waitUntil(

        caches.open(CACHE)

        .then(cache=>cache.addAll(FILES))

    );

});

self.addEventListener("fetch",e=>{

    e.respondWith(

        caches.match(e.request)

        .then(res=>res || fetch(e.request))

    );

});
