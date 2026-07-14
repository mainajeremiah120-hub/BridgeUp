self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "pages": {
    "/": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/index.js"
    ],
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/discussions": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/discussions.js"
    ],
    "/events": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/events.js"
    ],
    "/explorer": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/explorer.js"
    ],
    "/live-match": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/live-match.js"
    ],
    "/login": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/login.js"
    ],
    "/profile": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/profile.js"
    ],
    "/signup": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/signup.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];