var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// plugin-api:@/business/client/navigation
var navigation_exports = {};
__export(navigation_exports, {
  businessNavigationManager: () => businessNavigationManager
});
var { businessNavigationManager } = window.__PLUGIN_API__["@/business/client/navigation"];

// plugin-api:@/business/client/template/tab-header
var tab_header_exports = {};
__export(tab_header_exports, {
  EntryTabHeader: () => EntryTabHeader,
  ModelTabHeader: () => ModelTabHeader
});
var { EntryTabHeader } = window.__PLUGIN_API__["@/business/client/template/tab-header"];
var { ModelTabHeader } = window.__PLUGIN_API__["@/business/client/template/tab-header"];

// plugin-api:next-intl
var next_intl_exports = {};
__export(next_intl_exports, {
  IntlError: () => IntlError,
  IntlErrorCode: () => IntlErrorCode,
  IntlProvider: () => IntlProvider,
  NextIntlClientProvider: () => NextIntlClientProvider,
  _createCache: () => _createCache,
  _createIntlFormatters: () => _createIntlFormatters,
  createFormatter: () => createFormatter,
  createTranslator: () => createTranslator,
  hasLocale: () => hasLocale,
  initializeConfig: () => initializeConfig,
  useExtracted: () => useExtracted,
  useFormatter: () => useFormatter,
  useLocale: () => useLocale,
  useMessages: () => useMessages,
  useNow: () => useNow,
  useTimeZone: () => useTimeZone,
  useTranslations: () => useTranslations
});
var { IntlError } = window.__PLUGIN_API__["next-intl"];
var { IntlErrorCode } = window.__PLUGIN_API__["next-intl"];
var { IntlProvider } = window.__PLUGIN_API__["next-intl"];
var { NextIntlClientProvider } = window.__PLUGIN_API__["next-intl"];
var { _createCache } = window.__PLUGIN_API__["next-intl"];
var { _createIntlFormatters } = window.__PLUGIN_API__["next-intl"];
var { createFormatter } = window.__PLUGIN_API__["next-intl"];
var { createTranslator } = window.__PLUGIN_API__["next-intl"];
var { hasLocale } = window.__PLUGIN_API__["next-intl"];
var { initializeConfig } = window.__PLUGIN_API__["next-intl"];
var { useExtracted } = window.__PLUGIN_API__["next-intl"];
var { useFormatter } = window.__PLUGIN_API__["next-intl"];
var { useLocale } = window.__PLUGIN_API__["next-intl"];
var { useMessages } = window.__PLUGIN_API__["next-intl"];
var { useNow } = window.__PLUGIN_API__["next-intl"];
var { useTimeZone } = window.__PLUGIN_API__["next-intl"];
var { useTranslations } = window.__PLUGIN_API__["next-intl"];

// plugin-api:react/jsx-runtime
var { Fragment } = window.__PLUGIN_API__["react/jsx-runtime"];
var { jsx } = window.__PLUGIN_API__["react/jsx-runtime"];
var { jsxs } = window.__PLUGIN_API__["react/jsx-runtime"];

// plugins/project-info/client.tsx
var { businessNavigationManager: businessNavigationManager2 } = navigation_exports;
var { ModelTabHeader: ModelTabHeader2 } = tab_header_exports;
var { useTranslations: useTranslations2 } = next_intl_exports;
var tags = ["tag1", "tag2", "tag3", "tag4", "tag5"];
function Content() {
  const t = useTranslations2();
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full items-center justify-center min-h-[60vh] gap-8 p-8", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "size-16 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20",
        children: /* @__PURE__ */ jsx(
          "img",
          {
            className: "size-12 ",
            style: {
              filter: "brightness(0) saturate(100%) invert(100%)"
              // 变成白色
            },
            src: "favicon.svg",
            alt: "secyud tavern"
          }
        )
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Secyud Tavern" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-sm leading-relaxed", children: t("about.description") })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-2", children: tags.map((tag) => /* @__PURE__ */ jsx(
      "span",
      {
        className: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:border-foreground/30 transition-colors",
        children: t(`about.${tag}`)
      },
      tag
    )) }),
    /* @__PURE__ */ jsxs(
      "a",
      {
        href: "https://github.com/laoxTu/secyud-tavern",
        target: "_blank",
        rel: "noopener noreferrer",
        className: "inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 transition-colors",
        children: [
          /* @__PURE__ */ jsx("svg", { className: "size-4", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx(
            "path",
            {
              d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            }
          ) }),
          "GitHub"
        ]
      }
    )
  ] });
}
function register() {
  console.info("[project-info] secyud-tavern: https://github.com/laoxTu/secyud-tavern");
  businessNavigationManager2.register({
    id: "info",
    label: () => /* @__PURE__ */ jsx(ModelTabHeader2, { modelType: "about" }),
    component: Content
  });
}
export {
  register as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGx1Z2luLWFwaTpAL2J1c2luZXNzL2NsaWVudC9uYXZpZ2F0aW9uIiwgInBsdWdpbi1hcGk6QC9idXNpbmVzcy9jbGllbnQvdGVtcGxhdGUvdGFiLWhlYWRlciIsICJwbHVnaW4tYXBpOm5leHQtaW50bCIsICJwbHVnaW4tYXBpOnJlYWN0L2pzeC1ydW50aW1lIiwgImNsaWVudC50c3giXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBjb25zdCB7IGJ1c2luZXNzTmF2aWdhdGlvbk1hbmFnZXIgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snQC9idXNpbmVzcy9jbGllbnQvbmF2aWdhdGlvbiddOyIsICJleHBvcnQgY29uc3QgeyBFbnRyeVRhYkhlYWRlciB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWydAL2J1c2luZXNzL2NsaWVudC90ZW1wbGF0ZS90YWItaGVhZGVyJ107XG5leHBvcnQgY29uc3QgeyBNb2RlbFRhYkhlYWRlciB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWydAL2J1c2luZXNzL2NsaWVudC90ZW1wbGF0ZS90YWItaGVhZGVyJ107IiwgImV4cG9ydCBjb25zdCB7IEludGxFcnJvciB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IEludGxFcnJvckNvZGUgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyBJbnRsUHJvdmlkZXIgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyBOZXh0SW50bENsaWVudFByb3ZpZGVyIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgX2NyZWF0ZUNhY2hlIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgX2NyZWF0ZUludGxGb3JtYXR0ZXJzIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgY3JlYXRlRm9ybWF0dGVyIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgY3JlYXRlVHJhbnNsYXRvciB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IGhhc0xvY2FsZSB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IGluaXRpYWxpemVDb25maWcgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyB1c2VFeHRyYWN0ZWQgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyB1c2VGb3JtYXR0ZXIgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyB1c2VMb2NhbGUgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyB1c2VNZXNzYWdlcyB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IHVzZU5vdyB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IHVzZVRpbWVab25lIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgdXNlVHJhbnNsYXRpb25zIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddOyIsICJleHBvcnQgY29uc3QgeyBGcmFnbWVudCB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWydyZWFjdC9qc3gtcnVudGltZSddO1xuZXhwb3J0IGNvbnN0IHsganN4IH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ3JlYWN0L2pzeC1ydW50aW1lJ107XG5leHBvcnQgY29uc3QgeyBqc3hzIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ3JlYWN0L2pzeC1ydW50aW1lJ107IiwgIi8qKlxyXG4gKiBQcm9qZWN0IEluZm8gXHU2M0QyXHU0RUY2XHJcbiAqIFx1Njc4NFx1NUVGQTogbnBtIHJ1biBidWlsZC1wbHVnaW4gcHJvamVjdC1pbmZvXHJcbiAqL1xyXG5pbXBvcnQgKiBhcyBuYXZpZ2F0aW9uIGZyb20gJ0AvYnVzaW5lc3MvY2xpZW50L25hdmlnYXRpb24nO1xyXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgKiBhcyB0ZW1wbGF0ZSBmcm9tIFwiQC9idXNpbmVzcy9jbGllbnQvdGVtcGxhdGUvdGFiLWhlYWRlclwiO1xyXG5pbXBvcnQgKiBhcyBpbnRsIGZyb20gXCJuZXh0LWludGxcIjtcclxuXHJcbmNvbnN0IHtidXNpbmVzc05hdmlnYXRpb25NYW5hZ2VyfSA9IG5hdmlnYXRpb247XHJcbmNvbnN0IHtNb2RlbFRhYkhlYWRlcn0gPSB0ZW1wbGF0ZTtcclxuY29uc3Qge3VzZVRyYW5zbGF0aW9uc30gPSBpbnRsO1xyXG5cclxuY29uc3QgdGFncyA9IFtcInRhZzFcIiwgXCJ0YWcyXCIsIFwidGFnM1wiLCBcInRhZzRcIiwgXCJ0YWc1XCJdO1xyXG5cclxuZnVuY3Rpb24gQ29udGVudCgpIHtcclxuICAgIGNvbnN0IHQgPSB1c2VUcmFuc2xhdGlvbnMoKTtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGgtZnVsbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbWluLWgtWzYwdmhdIGdhcC04IHAtOFwiPlxyXG4gICAgICAgICAgICB7LyogXHU1NkZFXHU2ODA3ICovfVxyXG4gICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJzaXplLTE2IHJvdW5kZWQtMnhsIGJnLWxpbmVhci10by1iciBmcm9tLWluZGlnby01MDAgdG8tcHVycGxlLTYwMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBzaGFkb3ctbGcgc2hhZG93LWluZGlnby01MDAvMjBcIj5cclxuICAgICAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPVwic2l6ZS0xMiBcIiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcjogJ2JyaWdodG5lc3MoMCkgc2F0dXJhdGUoMTAwJSkgaW52ZXJ0KDEwMCUpJyAgLy8gXHU1M0Q4XHU2MjEwXHU3NjdEXHU4MjcyXHJcbiAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgICAgICAgICBzcmM9eydmYXZpY29uLnN2Zyd9IGFsdD17J3NlY3l1ZCB0YXZlcm4nfT48L2ltZz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICB7LyogXHU2ODA3XHU5ODk4ICovfVxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyIHNwYWNlLXktMlwiPlxyXG4gICAgICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYm9sZCB0cmFja2luZy10aWdodFwiPlNlY3l1ZCBUYXZlcm48L2gxPlxyXG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmQgbWF4LXctc20gbGVhZGluZy1yZWxheGVkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAge3QoJ2Fib3V0LmRlc2NyaXB0aW9uJyl9XHJcbiAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgey8qIFx1NzI3OVx1NjAyN1x1NjgwN1x1N0I3RSAqL31cclxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtd3JhcCBqdXN0aWZ5LWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgICAgICAge3RhZ3MubWFwKHRhZyA9PiAoXHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXt0YWd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciByb3VuZGVkLWZ1bGwgYm9yZGVyIHB4LTIuNSBweS0wLjUgdGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LW11dGVkLWZvcmVncm91bmQgaG92ZXI6Ym9yZGVyLWZvcmVncm91bmQvMzAgdHJhbnNpdGlvbi1jb2xvcnNcIlxyXG4gICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAge3QoYGFib3V0LiR7dGFnfWApfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIHsvKiBcdTk0RkVcdTYzQTUgKi99XHJcbiAgICAgICAgICAgIDxhXHJcbiAgICAgICAgICAgICAgICBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL2xhb3hUdS9zZWN5dWQtdGF2ZXJuXCJcclxuICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXHJcbiAgICAgICAgICAgICAgICByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiByb3VuZGVkLWxnIGJnLWZvcmVncm91bmQgcHgtNCBweS0yIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1iYWNrZ3JvdW5kIGhvdmVyOmJnLWZvcmVncm91bmQvOTAgdHJhbnNpdGlvbi1jb2xvcnNcIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cInNpemUtNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwiY3VycmVudENvbG9yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHBhdGhcclxuICAgICAgICAgICAgICAgICAgICAgICAgZD1cIk0xMiAwYy02LjYyNiAwLTEyIDUuMzczLTEyIDEyIDAgNS4zMDIgMy40MzggOS44IDguMjA3IDExLjM4Ny41OTkuMTExLjc5My0uMjYxLjc5My0uNTc3di0yLjIzNGMtMy4zMzguNzI2LTQuMDMzLTEuNDE2LTQuMDMzLTEuNDE2LS41NDYtMS4zODctMS4zMzMtMS43NTYtMS4zMzMtMS43NTYtMS4wODktLjc0NS4wODMtLjcyOS4wODMtLjcyOSAxLjIwNS4wODQgMS44MzkgMS4yMzcgMS44MzkgMS4yMzcgMS4wNyAxLjgzNCAyLjgwNyAxLjMwNCAzLjQ5Mi45OTcuMTA3LS43NzUuNDE4LTEuMzA1Ljc2Mi0xLjYwNC0yLjY2NS0uMzA1LTUuNDY3LTEuMzM0LTUuNDY3LTUuOTMxIDAtMS4zMTEuNDY5LTIuMzgxIDEuMjM2LTMuMjIxLS4xMjQtLjMwMy0uNTM1LTEuNTI0LjExNy0zLjE3NiAwIDAgMS4wMDgtLjMyMiAzLjMwMSAxLjIzLjk1Ny0uMjY2IDEuOTgzLS4zOTkgMy4wMDMtLjQwNCAxLjAyLjAwNSAyLjA0Ny4xMzggMy4wMDYuNDA0IDIuMjkxLTEuNTUyIDMuMjk3LTEuMjMgMy4yOTctMS4yMy42NTMgMS42NTMuMjQyIDIuODc0LjExOCAzLjE3Ni43Ny44NCAxLjIzNSAxLjkxMSAxLjIzNSAzLjIyMSAwIDQuNjA5LTIuODA3IDUuNjI0LTUuNDc5IDUuOTIxLjQzLjM3Mi44MjMgMS4xMDIuODIzIDIuMjIydjMuMjkzYzAgLjMxOS4xOTIuNjk0LjgwMS41NzYgNC43NjUtMS41ODkgOC4xOTktNi4wODYgOC4xOTktMTEuMzg2IDAtNi42MjctNS4zNzMtMTItMTItMTJ6XCIvPlxyXG4gICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICBHaXRIdWJcclxuICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVnaXN0ZXIoKSB7XHJcbiAgICBjb25zb2xlLmluZm8oXCJbcHJvamVjdC1pbmZvXSBzZWN5dWQtdGF2ZXJuOiBodHRwczovL2dpdGh1Yi5jb20vbGFveFR1L3NlY3l1ZC10YXZlcm5cIik7XHJcblxyXG4gICAgYnVzaW5lc3NOYXZpZ2F0aW9uTWFuYWdlci5yZWdpc3Rlcih7XHJcbiAgICAgICAgaWQ6IFwiaW5mb1wiLFxyXG4gICAgICAgIGxhYmVsOiAoKSA9PiA8TW9kZWxUYWJIZWFkZXIgbW9kZWxUeXBlPXsnYWJvdXQnfS8+LFxyXG4gICAgICAgIGNvbXBvbmVudDogQ29udGVudCxcclxuICAgIH0pO1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFPLElBQU0sRUFBRSwwQkFBMEIsSUFBSSxPQUFPLGVBQWUsOEJBQThCOzs7QUNBakc7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFPLElBQU0sRUFBRSxlQUFlLElBQUksT0FBTyxlQUFlLHVDQUF1QztBQUN4RixJQUFNLEVBQUUsZUFBZSxJQUFJLE9BQU8sZUFBZSx1Q0FBdUM7OztBQ0QvRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQU8sSUFBTSxFQUFFLFVBQVUsSUFBSSxPQUFPLGVBQWUsV0FBVztBQUN2RCxJQUFNLEVBQUUsY0FBYyxJQUFJLE9BQU8sZUFBZSxXQUFXO0FBQzNELElBQU0sRUFBRSxhQUFhLElBQUksT0FBTyxlQUFlLFdBQVc7QUFDMUQsSUFBTSxFQUFFLHVCQUF1QixJQUFJLE9BQU8sZUFBZSxXQUFXO0FBQ3BFLElBQU0sRUFBRSxhQUFhLElBQUksT0FBTyxlQUFlLFdBQVc7QUFDMUQsSUFBTSxFQUFFLHNCQUFzQixJQUFJLE9BQU8sZUFBZSxXQUFXO0FBQ25FLElBQU0sRUFBRSxnQkFBZ0IsSUFBSSxPQUFPLGVBQWUsV0FBVztBQUM3RCxJQUFNLEVBQUUsaUJBQWlCLElBQUksT0FBTyxlQUFlLFdBQVc7QUFDOUQsSUFBTSxFQUFFLFVBQVUsSUFBSSxPQUFPLGVBQWUsV0FBVztBQUN2RCxJQUFNLEVBQUUsaUJBQWlCLElBQUksT0FBTyxlQUFlLFdBQVc7QUFDOUQsSUFBTSxFQUFFLGFBQWEsSUFBSSxPQUFPLGVBQWUsV0FBVztBQUMxRCxJQUFNLEVBQUUsYUFBYSxJQUFJLE9BQU8sZUFBZSxXQUFXO0FBQzFELElBQU0sRUFBRSxVQUFVLElBQUksT0FBTyxlQUFlLFdBQVc7QUFDdkQsSUFBTSxFQUFFLFlBQVksSUFBSSxPQUFPLGVBQWUsV0FBVztBQUN6RCxJQUFNLEVBQUUsT0FBTyxJQUFJLE9BQU8sZUFBZSxXQUFXO0FBQ3BELElBQU0sRUFBRSxZQUFZLElBQUksT0FBTyxlQUFlLFdBQVc7QUFDekQsSUFBTSxFQUFFLGdCQUFnQixJQUFJLE9BQU8sZUFBZSxXQUFXOzs7QUNoQjdELElBQU0sRUFBRSxTQUFTLElBQUksT0FBTyxlQUFlLG1CQUFtQjtBQUM5RCxJQUFNLEVBQUUsSUFBSSxJQUFJLE9BQU8sZUFBZSxtQkFBbUI7QUFDekQsSUFBTSxFQUFFLEtBQUssSUFBSSxPQUFPLGVBQWUsbUJBQW1COzs7QUNPakUsSUFBTSxFQUFDLDJCQUFBQSwyQkFBeUIsSUFBSTtBQUNwQyxJQUFNLEVBQUMsZ0JBQUFDLGdCQUFjLElBQUk7QUFDekIsSUFBTSxFQUFDLGlCQUFBQyxpQkFBZSxJQUFJO0FBRTFCLElBQU0sT0FBTyxDQUFDLFFBQVEsUUFBUSxRQUFRLFFBQVEsTUFBTTtBQUVwRCxTQUFTLFVBQVU7QUFDZixRQUFNLElBQUlBLGlCQUFnQjtBQUMxQixTQUNJLHFCQUFDLFNBQUksV0FBVSwyRUFFWDtBQUFBO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDRyxXQUFVO0FBQUEsUUFDVjtBQUFBLFVBQUM7QUFBQTtBQUFBLFlBQUksV0FBVTtBQUFBLFlBQVcsT0FBTztBQUFBLGNBQzdCLFFBQVE7QUFBQTtBQUFBLFlBQ1o7QUFBQSxZQUNLLEtBQUs7QUFBQSxZQUFlLEtBQUs7QUFBQTtBQUFBLFFBQWlCO0FBQUE7QUFBQSxJQUNuRDtBQUFBLElBR0EscUJBQUMsU0FBSSxXQUFVLHlCQUNYO0FBQUEsMEJBQUMsUUFBRyxXQUFVLHFDQUFvQywyQkFBYTtBQUFBLE1BQy9ELG9CQUFDLE9BQUUsV0FBVSwwREFDUixZQUFFLG1CQUFtQixHQUMxQjtBQUFBLE9BQ0o7QUFBQSxJQUdBLG9CQUFDLFNBQUksV0FBVSx1Q0FDVixlQUFLLElBQUksU0FDTjtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBRUcsV0FBVTtBQUFBLFFBRVQsWUFBRSxTQUFTLEdBQUcsRUFBRTtBQUFBO0FBQUEsTUFIWjtBQUFBLElBSVQsQ0FDSCxHQUNMO0FBQUEsSUFHQTtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0csTUFBSztBQUFBLFFBQ0wsUUFBTztBQUFBLFFBQ1AsS0FBSTtBQUFBLFFBQ0osV0FBVTtBQUFBLFFBRVY7QUFBQSw4QkFBQyxTQUFJLFdBQVUsVUFBUyxTQUFRLGFBQVksTUFBSyxnQkFDN0M7QUFBQSxZQUFDO0FBQUE7QUFBQSxjQUNHLEdBQUU7QUFBQTtBQUFBLFVBQTJzQixHQUNydEI7QUFBQSxVQUFNO0FBQUE7QUFBQTtBQUFBLElBRVY7QUFBQSxLQUNKO0FBRVI7QUFFZSxTQUFSLFdBQTRCO0FBQy9CLFVBQVEsS0FBSyx1RUFBdUU7QUFFcEYsRUFBQUYsMkJBQTBCLFNBQVM7QUFBQSxJQUMvQixJQUFJO0FBQUEsSUFDSixPQUFPLE1BQU0sb0JBQUNDLGlCQUFBLEVBQWUsV0FBVyxTQUFRO0FBQUEsSUFDaEQsV0FBVztBQUFBLEVBQ2YsQ0FBQztBQUNMOyIsCiAgIm5hbWVzIjogWyJidXNpbmVzc05hdmlnYXRpb25NYW5hZ2VyIiwgIk1vZGVsVGFiSGVhZGVyIiwgInVzZVRyYW5zbGF0aW9ucyJdCn0K
