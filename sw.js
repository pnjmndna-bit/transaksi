const CACHE = "orange-finance-v5";

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

    self.skipWaiting();

    e.waitUntil(

        caches.open(CACHE)
        .then(cache=>cache.addAll(FILES))

    );

});

self.addEventListener("activate", e=>{

    e.waitUntil(

        caches.keys().then(keys=>{

            return Promise.all(

                keys.map(key=>{

                    if(key!==CACHE){

                        return caches.delete(key);

                    }

                })

            );

        }).then(()=>{

            return self.clients.claim();

        })

    );

});

self.addEventListener("fetch",e=>{

    e.respondWith(

        caches.match(e.request)
        .then(res=>res || fetch(e.request))

    );

});

self.addEventListener("message",e=>{

    if(e.data.type==="SKIP_WAITING"){

        self.skipWaiting();

    }

});
