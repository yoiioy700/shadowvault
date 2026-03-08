if (!self.define) {
    let s,
        e = {};
    const a = (a, n) => (
        (a = new URL(a + ".js", n).href),
        e[a] ||
            new Promise((e) => {
                if ("document" in self) {
                    const s = document.createElement("script");
                    ((s.src = a), (s.onload = e), document.head.appendChild(s));
                } else ((s = a), importScripts(a), e());
            }).then(() => {
                let s = e[a];
                if (!s) throw new Error(`Module ${a} didn’t register its module`);
                return s;
            })
    );
    self.define = (n, c) => {
        const i = s || ("document" in self ? document.currentScript.src : "") || location.href;
        if (e[i]) return;
        let t = {};
        const r = (s) => a(s, i),
            o = { module: { uri: i }, exports: t, require: r };
        e[i] = Promise.all(n.map((s) => o[s] || r(s))).then((s) => (c(...s), t));
    };
}
define(["./workbox-4754cb34"], function (s) {
    "use strict";
    (importScripts(),
        self.skipWaiting(),
        s.clientsClaim(),
        s.precacheAndRoute(
            [
                { url: "/_next/app-build-manifest.json", revision: "d62a4361ce78ad65797bb1d7550c987b" },
                { url: "/_next/static/chunks/163-52bb1c8c45b5a44d.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/195.a84c511f3a7acacf.js", revision: "a84c511f3a7acacf" },
                { url: "/_next/static/chunks/1f46b9a0-c1ada8765b480274.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/230-42bd31cb166c08cd.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/264-c3f7d6c94d671f09.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/265.230b5a8c76ce0c32.js", revision: "230b5a8c76ce0c32" },
                { url: "/_next/static/chunks/2f0b94e8-d066c7492321239d.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/346.c84adf88089ce95b.js", revision: "c84adf88089ce95b" },
                { url: "/_next/static/chunks/423-785650b6ded5b78a.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/473f56c0.1f074281c688a82a.js", revision: "1f074281c688a82a" },
                { url: "/_next/static/chunks/4bd1b696-7c7af02a738afe1b.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/574-d102377dfd45705c.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/610-0583f295612e6000.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/634-6117b8c33702b5d0.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/661.e9d74e61a2d22a1d.js", revision: "e9d74e61a2d22a1d" },
                { url: "/_next/static/chunks/673-08e97396dba2f4bc.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/684-646672ff890f8dfc.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/70646a03.d10f200f90667cc9.js", revision: "d10f200f90667cc9" },
                { url: "/_next/static/chunks/746-f5cc38a0c8e1cfb0.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/750.cd0d2c13f06e8a44.js", revision: "cd0d2c13f06e8a44" },
                { url: "/_next/static/chunks/816-371d0ae1266f4c0c.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/818.e6ccec96a0668623.js", revision: "e6ccec96a0668623" },
                { url: "/_next/static/chunks/874-2cd5c2f386b67a19.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/959.7a28e4b5d476c649.js", revision: "7a28e4b5d476c649" },
                { url: "/_next/static/chunks/985-65f25d38e8c325ff.js", revision: "s8jvU5241fw7V3Us1K328" },
                {
                    url: "/_next/static/chunks/app/(scaffold)/api/price/route-41ed782cc8f814a7.js",
                    revision: "s8jvU5241fw7V3Us1K328",
                },
                {
                    url: "/_next/static/chunks/app/(scaffold)/blockexplorer/address/%5Baddress%5D/page-43013e755dfdee2e.js",
                    revision: "s8jvU5241fw7V3Us1K328",
                },
                {
                    url: "/_next/static/chunks/app/(scaffold)/blockexplorer/page-1b2341f7f39ee14e.js",
                    revision: "s8jvU5241fw7V3Us1K328",
                },
                {
                    url: "/_next/static/chunks/app/(scaffold)/blockexplorer/tx/%5Bhash%5D/page-4949e9fa1894433b.js",
                    revision: "s8jvU5241fw7V3Us1K328",
                },
                {
                    url: "/_next/static/chunks/app/(scaffold)/configure/page-c65129007ab8ef65.js",
                    revision: "s8jvU5241fw7V3Us1K328",
                },
                {
                    url: "/_next/static/chunks/app/(scaffold)/debug/page-5c9c1c00e3c43c8d.js",
                    revision: "s8jvU5241fw7V3Us1K328",
                },
                {
                    url: "/_next/static/chunks/app/(scaffold)/layout-57ca2f89320a3e31.js",
                    revision: "s8jvU5241fw7V3Us1K328",
                },
                {
                    url: "/_next/static/chunks/app/_not-found/page-f16db1538eb3bb16.js",
                    revision: "s8jvU5241fw7V3Us1K328",
                },
                {
                    url: "/_next/static/chunks/app/landing/layout-7bb851d298b07c19.js",
                    revision: "s8jvU5241fw7V3Us1K328",
                },
                { url: "/_next/static/chunks/app/landing/page-eccdd1b52c9dc9d6.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/app/layout-0bdd6ea27b8ad39a.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/app/page-4d10baeb1c0dc59a.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/e6909d18-54e764abf16851a6.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/framework-6ca16ee5dcd3578c.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/main-app-a16b9de35bf2e876.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/main-f279af393ef96187.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/pages/_app-8e94039938385921.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/chunks/pages/_error-7b2d139042a6a5ab.js", revision: "s8jvU5241fw7V3Us1K328" },
                {
                    url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
                    revision: "846118c33b2c0e922d7b3a7676f81f6f",
                },
                { url: "/_next/static/chunks/webpack-b8f0d01854e39c1d.js", revision: "s8jvU5241fw7V3Us1K328" },
                { url: "/_next/static/css/29a3ad0a83f6a4f8.css", revision: "29a3ad0a83f6a4f8" },
                {
                    url: "/_next/static/s8jvU5241fw7V3Us1K328/_buildManifest.js",
                    revision: "7853fbbb8e72748505679e236d222774",
                },
                {
                    url: "/_next/static/s8jvU5241fw7V3Us1K328/_ssgManifest.js",
                    revision: "b6652df95db52feb4daf4eca35380933",
                },
                { url: "/batch_ops.txt", revision: "620c38a88a547e4e365eaf4485ff8dd5" },
                { url: "/blast-icon-color.svg", revision: "f455c22475a343be9fcd764de7e7147e" },
                { url: "/debug-icon.svg", revision: "25aadc709736507034d14ca7aabcd29d" },
                { url: "/debug-image.png", revision: "34c4ca2676dd59ff24d6338faa1af371" },
                { url: "/explorer-icon.svg", revision: "84507da0e8989bb5b7616a3f66d31f48" },
                { url: "/fail-icon.svg", revision: "904a7a4ac93a7f2ada236152f5adc736" },
                { url: "/feature-vault.png", revision: "2eddef409e95015e42216956f46256a4" },
                { url: "/gradient-s.svg", revision: "c003f595a6d30b1b476115f64476e2cf" },
                { url: "/hero-vault.png", revision: "f0894aaa4da3ab425fa90e3d9d164b67" },
                { url: "/logo.ico", revision: "0359e607e29a3d3b08095d84a9d25c39" },
                { url: "/logo.svg", revision: "962a8546ade641ef7ad4e1b669f0548c" },
                { url: "/logos/openzeppelin.png", revision: "54028c08b6052a01228a362373baf270" },
                { url: "/logos/starknet-foundation.png", revision: "ed210c1adb8eca5c8a2049077fd9741c" },
                { url: "/logos/starknet.png", revision: "908b60a4f6b92155b8ea38a009fa7081" },
                { url: "/logos/starkware.png", revision: "32b654945972f46e389e218b345c50a6" },
                { url: "/logos/xverse.png", revision: "4ec2718ea9af6496e0158c6461c44661" },
                { url: "/manifest.json", revision: "781788f3e2bc4b2b176b5d8c425d7475" },
                { url: "/rpc-version.png", revision: "cf97fd668cfa1221bec0210824978027" },
                { url: "/scaffold-config.png", revision: "1ebfc244c31732dc4273fe292bd07596" },
                { url: "/sn-symbol-gradient.png", revision: "908b60a4f6b92155b8ea38a009fa7081" },
                { url: "/success-icon.svg", revision: "19391e78cec3583762ab80dbbba7d288" },
                { url: "/voyager-icon.svg", revision: "06663dd5ba2c49423225a8e3893b45fe" },
            ],
            { ignoreURLParametersMatching: [] },
        ),
        s.cleanupOutdatedCaches(),
        s.registerRoute(
            "/",
            new s.NetworkFirst({
                cacheName: "start-url",
                plugins: [
                    {
                        cacheWillUpdate: async ({ request: s, response: e, event: a, state: n }) =>
                            e && "opaqueredirect" === e.type
                                ? new Response(e.body, { status: 200, statusText: "OK", headers: e.headers })
                                : e,
                    },
                ],
            }),
            "GET",
        ),
        s.registerRoute(
            /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
            new s.CacheFirst({
                cacheName: "google-fonts-webfonts",
                plugins: [new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
            }),
            "GET",
        ),
        s.registerRoute(
            /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
            new s.StaleWhileRevalidate({
                cacheName: "google-fonts-stylesheets",
                plugins: [new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
            }),
            "GET",
        ),
        s.registerRoute(
            /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
            new s.StaleWhileRevalidate({
                cacheName: "static-font-assets",
                plugins: [new s.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
            }),
            "GET",
        ),
        s.registerRoute(
            /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
            new s.StaleWhileRevalidate({
                cacheName: "static-image-assets",
                plugins: [new s.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
            }),
            "GET",
        ),
        s.registerRoute(
            /\/_next\/image\?url=.+$/i,
            new s.StaleWhileRevalidate({
                cacheName: "next-image",
                plugins: [new s.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
            }),
            "GET",
        ),
        s.registerRoute(
            /\.(?:mp3|wav|ogg)$/i,
            new s.CacheFirst({
                cacheName: "static-audio-assets",
                plugins: [
                    new s.RangeRequestsPlugin(),
                    new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
                ],
            }),
            "GET",
        ),
        s.registerRoute(
            /\.(?:mp4)$/i,
            new s.CacheFirst({
                cacheName: "static-video-assets",
                plugins: [
                    new s.RangeRequestsPlugin(),
                    new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
                ],
            }),
            "GET",
        ),
        s.registerRoute(
            /\.(?:js)$/i,
            new s.StaleWhileRevalidate({
                cacheName: "static-js-assets",
                plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
            }),
            "GET",
        ),
        s.registerRoute(
            /\.(?:css|less)$/i,
            new s.StaleWhileRevalidate({
                cacheName: "static-style-assets",
                plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
            }),
            "GET",
        ),
        s.registerRoute(
            /\/_next\/data\/.+\/.+\.json$/i,
            new s.StaleWhileRevalidate({
                cacheName: "next-data",
                plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
            }),
            "GET",
        ),
        s.registerRoute(
            /\.(?:json|xml|csv)$/i,
            new s.NetworkFirst({
                cacheName: "static-data-assets",
                plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
            }),
            "GET",
        ),
        s.registerRoute(
            ({ url: s }) => {
                if (!(self.origin === s.origin)) return !1;
                const e = s.pathname;
                return !e.startsWith("/api/auth/") && !!e.startsWith("/api/");
            },
            new s.NetworkFirst({
                cacheName: "apis",
                networkTimeoutSeconds: 10,
                plugins: [new s.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
            }),
            "GET",
        ),
        s.registerRoute(
            ({ url: s }) => {
                if (!(self.origin === s.origin)) return !1;
                return !s.pathname.startsWith("/api/");
            },
            new s.NetworkFirst({
                cacheName: "others",
                networkTimeoutSeconds: 10,
                plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
            }),
            "GET",
        ),
        s.registerRoute(
            ({ url: s }) => !(self.origin === s.origin),
            new s.NetworkFirst({
                cacheName: "cross-origin",
                networkTimeoutSeconds: 10,
                plugins: [new s.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
            }),
            "GET",
        ));
});
