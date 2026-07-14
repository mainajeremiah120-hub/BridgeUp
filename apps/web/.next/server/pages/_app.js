/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./src/context/auth-context.tsx":
/*!**************************************!*\
  !*** ./src/context/auth-context.tsx ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AuthProvider: () => (/* binding */ AuthProvider),\n/* harmony export */   useAuth: () => (/* binding */ useAuth)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)(undefined);\nconst AuthProvider = ({ children })=>{\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [token, setToken] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        // Load auth info from localstorage on startup\n        const storedToken = localStorage.getItem(\"bridgeup_token\");\n        const storedUser = localStorage.getItem(\"bridgeup_user\");\n        if (storedToken && storedUser) {\n            setToken(storedToken);\n            setUser(JSON.parse(storedUser));\n        }\n        setIsLoading(false);\n    }, []);\n    const login = (jwtToken, userData)=>{\n        setToken(jwtToken);\n        setUser(userData);\n        localStorage.setItem(\"bridgeup_token\", jwtToken);\n        localStorage.setItem(\"bridgeup_user\", JSON.stringify(userData));\n    };\n    const logout = ()=>{\n        setToken(null);\n        setUser(null);\n        localStorage.removeItem(\"bridgeup_token\");\n        localStorage.removeItem(\"bridgeup_user\");\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: {\n            user,\n            token,\n            isAuthenticated: !!token,\n            isLoading,\n            login,\n            logout\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\digit\\\\Documents\\\\BridgeUp\\\\apps\\\\web\\\\src\\\\context\\\\auth-context.tsx\",\n        lineNumber: 54,\n        columnNumber: 5\n    }, undefined);\n};\nconst useAuth = ()=>{\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\n    if (context === undefined) {\n        throw new Error(\"useAuth must be used within an AuthProvider\");\n    }\n    return context;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29udGV4dC9hdXRoLWNvbnRleHQudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBOEU7QUFtQjlFLE1BQU1LLDRCQUFjSixvREFBYUEsQ0FBOEJLO0FBRXhELE1BQU1DLGVBQXdELENBQUMsRUFBRUMsUUFBUSxFQUFFO0lBQ2hGLE1BQU0sQ0FBQ0MsTUFBTUMsUUFBUSxHQUFHUCwrQ0FBUUEsQ0FBYztJQUM5QyxNQUFNLENBQUNRLE9BQU9DLFNBQVMsR0FBR1QsK0NBQVFBLENBQWdCO0lBQ2xELE1BQU0sQ0FBQ1UsV0FBV0MsYUFBYSxHQUFHWCwrQ0FBUUEsQ0FBQztJQUUzQ0MsZ0RBQVNBLENBQUM7UUFDUiw4Q0FBOEM7UUFDOUMsTUFBTVcsY0FBY0MsYUFBYUMsT0FBTyxDQUFDO1FBQ3pDLE1BQU1DLGFBQWFGLGFBQWFDLE9BQU8sQ0FBQztRQUV4QyxJQUFJRixlQUFlRyxZQUFZO1lBQzdCTixTQUFTRztZQUNUTCxRQUFRUyxLQUFLQyxLQUFLLENBQUNGO1FBQ3JCO1FBQ0FKLGFBQWE7SUFDZixHQUFHLEVBQUU7SUFFTCxNQUFNTyxRQUFRLENBQUNDLFVBQWtCQztRQUMvQlgsU0FBU1U7UUFDVFosUUFBUWE7UUFDUlAsYUFBYVEsT0FBTyxDQUFDLGtCQUFrQkY7UUFDdkNOLGFBQWFRLE9BQU8sQ0FBQyxpQkFBaUJMLEtBQUtNLFNBQVMsQ0FBQ0Y7SUFDdkQ7SUFFQSxNQUFNRyxTQUFTO1FBQ2JkLFNBQVM7UUFDVEYsUUFBUTtRQUNSTSxhQUFhVyxVQUFVLENBQUM7UUFDeEJYLGFBQWFXLFVBQVUsQ0FBQztJQUMxQjtJQUVBLHFCQUNFLDhEQUFDdEIsWUFBWXVCLFFBQVE7UUFBQ0MsT0FBTztZQUMzQnBCO1lBQ0FFO1lBQ0FtQixpQkFBaUIsQ0FBQyxDQUFDbkI7WUFDbkJFO1lBQ0FRO1lBQ0FLO1FBQ0Y7a0JBQ0dsQjs7Ozs7O0FBR1AsRUFBRTtBQUVLLE1BQU11QixVQUFVO0lBQ3JCLE1BQU1DLFVBQVU5QixpREFBVUEsQ0FBQ0c7SUFDM0IsSUFBSTJCLFlBQVkxQixXQUFXO1FBQ3pCLE1BQU0sSUFBSTJCLE1BQU07SUFDbEI7SUFDQSxPQUFPRDtBQUNULEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AYnJpZGdldXAvd2ViLy4vc3JjL2NvbnRleHQvYXV0aC1jb250ZXh0LnRzeD82NWU1Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBjcmVhdGVDb250ZXh0LCB1c2VDb250ZXh0LCB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xyXG5cclxuaW50ZXJmYWNlIFVzZXIge1xyXG4gIGlkOiBzdHJpbmc7XHJcbiAgZW1haWw6IHN0cmluZztcclxuICBmdWxsTmFtZTogc3RyaW5nO1xyXG4gIGNvdW50cnlDb2RlOiBzdHJpbmc7XHJcbiAgY2l0eT86IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIEF1dGhDb250ZXh0VHlwZSB7XHJcbiAgdXNlcjogVXNlciB8IG51bGw7XHJcbiAgdG9rZW46IHN0cmluZyB8IG51bGw7XHJcbiAgaXNBdXRoZW50aWNhdGVkOiBib29sZWFuO1xyXG4gIGlzTG9hZGluZzogYm9vbGVhbjtcclxuICBsb2dpbjogKHRva2VuOiBzdHJpbmcsIHVzZXI6IFVzZXIpID0+IHZvaWQ7XHJcbiAgbG9nb3V0OiAoKSA9PiB2b2lkO1xyXG59XHJcblxyXG5jb25zdCBBdXRoQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8QXV0aENvbnRleHRUeXBlIHwgdW5kZWZpbmVkPih1bmRlZmluZWQpO1xyXG5cclxuZXhwb3J0IGNvbnN0IEF1dGhQcm92aWRlcjogUmVhY3QuRkM8eyBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlIH0+ID0gKHsgY2hpbGRyZW4gfSkgPT4ge1xyXG4gIGNvbnN0IFt1c2VyLCBzZXRVc2VyXSA9IHVzZVN0YXRlPFVzZXIgfCBudWxsPihudWxsKTtcclxuICBjb25zdCBbdG9rZW4sIHNldFRva2VuXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xyXG4gIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIC8vIExvYWQgYXV0aCBpbmZvIGZyb20gbG9jYWxzdG9yYWdlIG9uIHN0YXJ0dXBcclxuICAgIGNvbnN0IHN0b3JlZFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2JyaWRnZXVwX3Rva2VuJyk7XHJcbiAgICBjb25zdCBzdG9yZWRVc2VyID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2JyaWRnZXVwX3VzZXInKTtcclxuXHJcbiAgICBpZiAoc3RvcmVkVG9rZW4gJiYgc3RvcmVkVXNlcikge1xyXG4gICAgICBzZXRUb2tlbihzdG9yZWRUb2tlbik7XHJcbiAgICAgIHNldFVzZXIoSlNPTi5wYXJzZShzdG9yZWRVc2VyKSk7XHJcbiAgICB9XHJcbiAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgY29uc3QgbG9naW4gPSAoand0VG9rZW46IHN0cmluZywgdXNlckRhdGE6IFVzZXIpID0+IHtcclxuICAgIHNldFRva2VuKGp3dFRva2VuKTtcclxuICAgIHNldFVzZXIodXNlckRhdGEpO1xyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2JyaWRnZXVwX3Rva2VuJywgand0VG9rZW4pO1xyXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2JyaWRnZXVwX3VzZXInLCBKU09OLnN0cmluZ2lmeSh1c2VyRGF0YSkpO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ291dCA9ICgpID0+IHtcclxuICAgIHNldFRva2VuKG51bGwpO1xyXG4gICAgc2V0VXNlcihudWxsKTtcclxuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdicmlkZ2V1cF90b2tlbicpO1xyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2JyaWRnZXVwX3VzZXInKTtcclxuICB9O1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPEF1dGhDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt7XHJcbiAgICAgIHVzZXIsXHJcbiAgICAgIHRva2VuLFxyXG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6ICEhdG9rZW4sXHJcbiAgICAgIGlzTG9hZGluZyxcclxuICAgICAgbG9naW4sXHJcbiAgICAgIGxvZ291dFxyXG4gICAgfX0+XHJcbiAgICAgIHtjaGlsZHJlbn1cclxuICAgIDwvQXV0aENvbnRleHQuUHJvdmlkZXI+XHJcbiAgKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCB1c2VBdXRoID0gKCkgPT4ge1xyXG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KEF1dGhDb250ZXh0KTtcclxuICBpZiAoY29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VzZUF1dGggbXVzdCBiZSB1c2VkIHdpdGhpbiBhbiBBdXRoUHJvdmlkZXInKTtcclxuICB9XHJcbiAgcmV0dXJuIGNvbnRleHQ7XHJcbn07XHJcbiJdLCJuYW1lcyI6WyJSZWFjdCIsImNyZWF0ZUNvbnRleHQiLCJ1c2VDb250ZXh0IiwidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJBdXRoQ29udGV4dCIsInVuZGVmaW5lZCIsIkF1dGhQcm92aWRlciIsImNoaWxkcmVuIiwidXNlciIsInNldFVzZXIiLCJ0b2tlbiIsInNldFRva2VuIiwiaXNMb2FkaW5nIiwic2V0SXNMb2FkaW5nIiwic3RvcmVkVG9rZW4iLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwic3RvcmVkVXNlciIsIkpTT04iLCJwYXJzZSIsImxvZ2luIiwiand0VG9rZW4iLCJ1c2VyRGF0YSIsInNldEl0ZW0iLCJzdHJpbmdpZnkiLCJsb2dvdXQiLCJyZW1vdmVJdGVtIiwiUHJvdmlkZXIiLCJ2YWx1ZSIsImlzQXV0aGVudGljYXRlZCIsInVzZUF1dGgiLCJjb250ZXh0IiwiRXJyb3IiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/context/auth-context.tsx\n");

/***/ }),

/***/ "./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/styles/globals.css */ \"./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tanstack/react-query */ \"@tanstack/react-query\");\n/* harmony import */ var _context_auth_context__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/context/auth-context */ \"./src/context/auth-context.tsx\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__]);\n_tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\n\nfunction App({ Component, pageProps }) {\n    // QueryClient initialized in state to prevent caching issues across page renders\n    const [queryClient] = (0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(()=>new _tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__.QueryClient({\n            defaultOptions: {\n                queries: {\n                    refetchOnWindowFocus: false,\n                    retry: false\n                }\n            }\n        }));\n    (0,react__WEBPACK_IMPORTED_MODULE_4__.useEffect)(()=>{\n        if (\"serviceWorker\" in navigator) {\n            navigator.serviceWorker.register(\"/sw.js\").catch(()=>{});\n        }\n    }, []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__.QueryClientProvider, {\n        client: queryClient,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_context_auth_context__WEBPACK_IMPORTED_MODULE_3__.AuthProvider, {\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\digit\\\\Documents\\\\BridgeUp\\\\apps\\\\web\\\\src\\\\pages\\\\_app.tsx\",\n                lineNumber: 27,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\digit\\\\Documents\\\\BridgeUp\\\\apps\\\\web\\\\src\\\\pages\\\\_app.tsx\",\n            lineNumber: 26,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\digit\\\\Documents\\\\BridgeUp\\\\apps\\\\web\\\\src\\\\pages\\\\_app.tsx\",\n        lineNumber: 25,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvX2FwcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUE4QjtBQUUyQztBQUNuQjtBQUNWO0FBRTdCLFNBQVNLLElBQUksRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQVk7SUFDNUQsaUZBQWlGO0lBQ2pGLE1BQU0sQ0FBQ0MsWUFBWSxHQUFHSiwrQ0FBUUEsQ0FBQyxJQUFNLElBQUlKLDhEQUFXQSxDQUFDO1lBQ25EUyxnQkFBZ0I7Z0JBQ2RDLFNBQVM7b0JBQ1BDLHNCQUFzQjtvQkFDdEJDLE9BQU87Z0JBQ1Q7WUFDRjtRQUNGO0lBRUFULGdEQUFTQSxDQUFDO1FBQ1IsSUFBSSxtQkFBbUJVLFdBQVc7WUFDaENBLFVBQVVDLGFBQWEsQ0FBQ0MsUUFBUSxDQUFDLFVBQVVDLEtBQUssQ0FBQyxLQUFPO1FBQzFEO0lBQ0YsR0FBRyxFQUFFO0lBRUwscUJBQ0UsOERBQUNmLHNFQUFtQkE7UUFBQ2dCLFFBQVFUO2tCQUMzQiw0RUFBQ04sK0RBQVlBO3NCQUNYLDRFQUFDSTtnQkFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7O0FBSWhDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQGJyaWRnZXVwL3dlYi8uL3NyYy9wYWdlcy9fYXBwLnRzeD9mOWQ2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnQC9zdHlsZXMvZ2xvYmFscy5jc3MnO1xyXG5pbXBvcnQgdHlwZSB7IEFwcFByb3BzIH0gZnJvbSAnbmV4dC9hcHAnO1xyXG5pbXBvcnQgeyBRdWVyeUNsaWVudCwgUXVlcnlDbGllbnRQcm92aWRlciB9IGZyb20gJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSc7XHJcbmltcG9ydCB7IEF1dGhQcm92aWRlciB9IGZyb20gJ0AvY29udGV4dC9hdXRoLWNvbnRleHQnO1xyXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQXBwKHsgQ29tcG9uZW50LCBwYWdlUHJvcHMgfTogQXBwUHJvcHMpIHtcclxuICAvLyBRdWVyeUNsaWVudCBpbml0aWFsaXplZCBpbiBzdGF0ZSB0byBwcmV2ZW50IGNhY2hpbmcgaXNzdWVzIGFjcm9zcyBwYWdlIHJlbmRlcnNcclxuICBjb25zdCBbcXVlcnlDbGllbnRdID0gdXNlU3RhdGUoKCkgPT4gbmV3IFF1ZXJ5Q2xpZW50KHtcclxuICAgIGRlZmF1bHRPcHRpb25zOiB7XHJcbiAgICAgIHF1ZXJpZXM6IHtcclxuICAgICAgICByZWZldGNoT25XaW5kb3dGb2N1czogZmFsc2UsXHJcbiAgICAgICAgcmV0cnk6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9KSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xyXG4gICAgICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5yZWdpc3RlcignL3N3LmpzJykuY2F0Y2goKCkgPT4ge30pO1xyXG4gICAgfVxyXG4gIH0sIFtdKTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxRdWVyeUNsaWVudFByb3ZpZGVyIGNsaWVudD17cXVlcnlDbGllbnR9PlxyXG4gICAgICA8QXV0aFByb3ZpZGVyPlxyXG4gICAgICAgIDxDb21wb25lbnQgey4uLnBhZ2VQcm9wc30gLz5cclxuICAgICAgPC9BdXRoUHJvdmlkZXI+XHJcbiAgICA8L1F1ZXJ5Q2xpZW50UHJvdmlkZXI+XHJcbiAgKTtcclxufVxyXG4iXSwibmFtZXMiOlsiUXVlcnlDbGllbnQiLCJRdWVyeUNsaWVudFByb3ZpZGVyIiwiQXV0aFByb3ZpZGVyIiwidXNlRWZmZWN0IiwidXNlU3RhdGUiLCJBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJxdWVyeUNsaWVudCIsImRlZmF1bHRPcHRpb25zIiwicXVlcmllcyIsInJlZmV0Y2hPbldpbmRvd0ZvY3VzIiwicmV0cnkiLCJuYXZpZ2F0b3IiLCJzZXJ2aWNlV29ya2VyIiwicmVnaXN0ZXIiLCJjYXRjaCIsImNsaWVudCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/pages/_app.tsx\n");

/***/ }),

/***/ "./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "@tanstack/react-query":
/*!****************************************!*\
  !*** external "@tanstack/react-query" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@tanstack/react-query");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./src/pages/_app.tsx"));
module.exports = __webpack_exports__;

})();