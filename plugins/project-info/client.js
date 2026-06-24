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

// plugin-api:@/components/template/navigation-template
var navigation_template_exports = {};
__export(navigation_template_exports, {
  EntryNavigationTemplate: () => EntryNavigationTemplate,
  ModelNavigationTemplate: () => ModelNavigationTemplate
});
var { EntryNavigationTemplate } = window.__PLUGIN_API__["@/components/template/navigation-template"];
var { ModelNavigationTemplate } = window.__PLUGIN_API__["@/components/template/navigation-template"];

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
var { ModelNavigationTemplate: ModelNavigationTemplate2 } = navigation_template_exports;
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
    label: () => /* @__PURE__ */ jsx(ModelNavigationTemplate2, { modelType: "about" }),
    component: Content
  });
}
export {
  register as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGx1Z2luLWFwaTpAL2J1c2luZXNzL2NsaWVudC9uYXZpZ2F0aW9uIiwgInBsdWdpbi1hcGk6QC9jb21wb25lbnRzL3RlbXBsYXRlL25hdmlnYXRpb24tdGVtcGxhdGUiLCAicGx1Z2luLWFwaTpuZXh0LWludGwiLCAicGx1Z2luLWFwaTpyZWFjdC9qc3gtcnVudGltZSIsICJjbGllbnQudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgY29uc3QgeyBidXNpbmVzc05hdmlnYXRpb25NYW5hZ2VyIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ0AvYnVzaW5lc3MvY2xpZW50L25hdmlnYXRpb24nXTsiLCAiZXhwb3J0IGNvbnN0IHsgRW50cnlOYXZpZ2F0aW9uVGVtcGxhdGUgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snQC9jb21wb25lbnRzL3RlbXBsYXRlL25hdmlnYXRpb24tdGVtcGxhdGUnXTtcbmV4cG9ydCBjb25zdCB7IE1vZGVsTmF2aWdhdGlvblRlbXBsYXRlIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ0AvY29tcG9uZW50cy90ZW1wbGF0ZS9uYXZpZ2F0aW9uLXRlbXBsYXRlJ107IiwgImV4cG9ydCBjb25zdCB7IEludGxFcnJvciB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IEludGxFcnJvckNvZGUgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyBJbnRsUHJvdmlkZXIgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyBOZXh0SW50bENsaWVudFByb3ZpZGVyIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgX2NyZWF0ZUNhY2hlIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgX2NyZWF0ZUludGxGb3JtYXR0ZXJzIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgY3JlYXRlRm9ybWF0dGVyIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgY3JlYXRlVHJhbnNsYXRvciB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IGhhc0xvY2FsZSB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IGluaXRpYWxpemVDb25maWcgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyB1c2VFeHRyYWN0ZWQgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyB1c2VGb3JtYXR0ZXIgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyB1c2VMb2NhbGUgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyB1c2VNZXNzYWdlcyB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IHVzZU5vdyB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IHVzZVRpbWVab25lIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgdXNlVHJhbnNsYXRpb25zIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddOyIsICJleHBvcnQgY29uc3QgeyBGcmFnbWVudCB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWydyZWFjdC9qc3gtcnVudGltZSddO1xuZXhwb3J0IGNvbnN0IHsganN4IH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ3JlYWN0L2pzeC1ydW50aW1lJ107XG5leHBvcnQgY29uc3QgeyBqc3hzIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ3JlYWN0L2pzeC1ydW50aW1lJ107IiwgIi8qKlxyXG4gKiBQcm9qZWN0IEluZm8gXHU2M0QyXHU0RUY2XHJcbiAqIFx1Njc4NFx1NUVGQTogbnBtIHJ1biBidWlsZC1wbHVnaW4gcHJvamVjdC1pbmZvXHJcbiAqL1xyXG5pbXBvcnQgKiBhcyBuYXZpZ2F0aW9uIGZyb20gJ0AvYnVzaW5lc3MvY2xpZW50L25hdmlnYXRpb24nO1xyXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgKiBhcyB0ZW1wbGF0ZSBmcm9tIFwiQC9jb21wb25lbnRzL3RlbXBsYXRlL25hdmlnYXRpb24tdGVtcGxhdGVcIjtcclxuaW1wb3J0ICogYXMgaW50bCBmcm9tIFwibmV4dC1pbnRsXCI7XHJcblxyXG5jb25zdCB7YnVzaW5lc3NOYXZpZ2F0aW9uTWFuYWdlcn0gPSBuYXZpZ2F0aW9uO1xyXG5jb25zdCB7TW9kZWxOYXZpZ2F0aW9uVGVtcGxhdGV9ID0gdGVtcGxhdGU7XHJcbmNvbnN0IHt1c2VUcmFuc2xhdGlvbnN9ID0gaW50bDtcclxuXHJcbmNvbnN0IHRhZ3MgPSBbXCJ0YWcxXCIsIFwidGFnMlwiLCBcInRhZzNcIiwgXCJ0YWc0XCIsIFwidGFnNVwiXTtcclxuXHJcbmZ1bmN0aW9uIENvbnRlbnQoKSB7XHJcbiAgICBjb25zdCB0ID0gdXNlVHJhbnNsYXRpb25zKCk7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBoLWZ1bGwgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIG1pbi1oLVs2MHZoXSBnYXAtOCBwLThcIj5cclxuICAgICAgICAgICAgey8qIFx1NTZGRVx1NjgwNyAqL31cclxuICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic2l6ZS0xNiByb3VuZGVkLTJ4bCBiZy1saW5lYXItdG8tYnIgZnJvbS1pbmRpZ28tNTAwIHRvLXB1cnBsZS02MDAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgc2hhZG93LWxnIHNoYWRvdy1pbmRpZ28tNTAwLzIwXCI+XHJcbiAgICAgICAgICAgICAgICA8aW1nIGNsYXNzTmFtZT1cInNpemUtMTIgXCIgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXI6ICdicmlnaHRuZXNzKDApIHNhdHVyYXRlKDEwMCUpIGludmVydCgxMDAlKScgIC8vIFx1NTNEOFx1NjIxMFx1NzY3RFx1ODI3MlxyXG4gICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgICAgICAgc3JjPXsnZmF2aWNvbi5zdmcnfSBhbHQ9eydzZWN5dWQgdGF2ZXJuJ30+PC9pbWc+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgey8qIFx1NjgwN1x1OTg5OCAqL31cclxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBzcGFjZS15LTJcIj5cclxuICAgICAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWJvbGQgdHJhY2tpbmctdGlnaHRcIj5TZWN5dWQgVGF2ZXJuPC9oMT5cclxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG1heC13LXNtIGxlYWRpbmctcmVsYXhlZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIHt0KCdhYm91dC5kZXNjcmlwdGlvbicpfVxyXG4gICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIHsvKiBcdTcyNzlcdTYwMjdcdTY4MDdcdTdCN0UgKi99XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LXdyYXAganVzdGlmeS1jZW50ZXIgZ2FwLTJcIj5cclxuICAgICAgICAgICAgICAgIHt0YWdzLm1hcCh0YWcgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17dGFnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgcm91bmRlZC1mdWxsIGJvcmRlciBweC0yLjUgcHktMC41IHRleHQteHMgZm9udC1tZWRpdW0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGhvdmVyOmJvcmRlci1mb3JlZ3JvdW5kLzMwIHRyYW5zaXRpb24tY29sb3JzXCJcclxuICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KGBhYm91dC4ke3RhZ31gKX1cclxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICB7LyogXHU5NEZFXHU2M0E1ICovfVxyXG4gICAgICAgICAgICA8YVxyXG4gICAgICAgICAgICAgICAgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9sYW94VHUvc2VjeXVkLXRhdmVyblwiXHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxyXG4gICAgICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcm91bmRlZC1sZyBiZy1mb3JlZ3JvdW5kIHB4LTQgcHktMiB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtYmFja2dyb3VuZCBob3ZlcjpiZy1mb3JlZ3JvdW5kLzkwIHRyYW5zaXRpb24tY29sb3JzXCJcclxuICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJzaXplLTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwYXRoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGQ9XCJNMTIgMGMtNi42MjYgMC0xMiA1LjM3My0xMiAxMiAwIDUuMzAyIDMuNDM4IDkuOCA4LjIwNyAxMS4zODcuNTk5LjExMS43OTMtLjI2MS43OTMtLjU3N3YtMi4yMzRjLTMuMzM4LjcyNi00LjAzMy0xLjQxNi00LjAzMy0xLjQxNi0uNTQ2LTEuMzg3LTEuMzMzLTEuNzU2LTEuMzMzLTEuNzU2LTEuMDg5LS43NDUuMDgzLS43MjkuMDgzLS43MjkgMS4yMDUuMDg0IDEuODM5IDEuMjM3IDEuODM5IDEuMjM3IDEuMDcgMS44MzQgMi44MDcgMS4zMDQgMy40OTIuOTk3LjEwNy0uNzc1LjQxOC0xLjMwNS43NjItMS42MDQtMi42NjUtLjMwNS01LjQ2Ny0xLjMzNC01LjQ2Ny01LjkzMSAwLTEuMzExLjQ2OS0yLjM4MSAxLjIzNi0zLjIyMS0uMTI0LS4zMDMtLjUzNS0xLjUyNC4xMTctMy4xNzYgMCAwIDEuMDA4LS4zMjIgMy4zMDEgMS4yMy45NTctLjI2NiAxLjk4My0uMzk5IDMuMDAzLS40MDQgMS4wMi4wMDUgMi4wNDcuMTM4IDMuMDA2LjQwNCAyLjI5MS0xLjU1MiAzLjI5Ny0xLjIzIDMuMjk3LTEuMjMuNjUzIDEuNjUzLjI0MiAyLjg3NC4xMTggMy4xNzYuNzcuODQgMS4yMzUgMS45MTEgMS4yMzUgMy4yMjEgMCA0LjYwOS0yLjgwNyA1LjYyNC01LjQ3OSA1LjkyMS40My4zNzIuODIzIDEuMTAyLjgyMyAyLjIyMnYzLjI5M2MwIC4zMTkuMTkyLjY5NC44MDEuNTc2IDQuNzY1LTEuNTg5IDguMTk5LTYuMDg2IDguMTk5LTExLjM4NiAwLTYuNjI3LTUuMzczLTEyLTEyLTEyelwiLz5cclxuICAgICAgICAgICAgICAgIDwvc3ZnPlxyXG4gICAgICAgICAgICAgICAgR2l0SHViXHJcbiAgICAgICAgICAgIDwvYT5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlZ2lzdGVyKCkge1xyXG4gICAgY29uc29sZS5pbmZvKFwiW3Byb2plY3QtaW5mb10gc2VjeXVkLXRhdmVybjogaHR0cHM6Ly9naXRodWIuY29tL2xhb3hUdS9zZWN5dWQtdGF2ZXJuXCIpO1xyXG5cclxuICAgIGJ1c2luZXNzTmF2aWdhdGlvbk1hbmFnZXIucmVnaXN0ZXIoe1xyXG4gICAgICAgIGlkOiBcImluZm9cIixcclxuICAgICAgICBsYWJlbDogKCkgPT4gPE1vZGVsTmF2aWdhdGlvblRlbXBsYXRlIG1vZGVsVHlwZT17J2Fib3V0J30vPixcclxuICAgICAgICBjb21wb25lbnQ6IENvbnRlbnQsXHJcbiAgICB9KTtcclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBTyxJQUFNLEVBQUUsMEJBQTBCLElBQUksT0FBTyxlQUFlLDhCQUE4Qjs7O0FDQWpHO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBTyxJQUFNLEVBQUUsd0JBQXdCLElBQUksT0FBTyxlQUFlLDJDQUEyQztBQUNyRyxJQUFNLEVBQUUsd0JBQXdCLElBQUksT0FBTyxlQUFlLDJDQUEyQzs7O0FDRDVHO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBTyxJQUFNLEVBQUUsVUFBVSxJQUFJLE9BQU8sZUFBZSxXQUFXO0FBQ3ZELElBQU0sRUFBRSxjQUFjLElBQUksT0FBTyxlQUFlLFdBQVc7QUFDM0QsSUFBTSxFQUFFLGFBQWEsSUFBSSxPQUFPLGVBQWUsV0FBVztBQUMxRCxJQUFNLEVBQUUsdUJBQXVCLElBQUksT0FBTyxlQUFlLFdBQVc7QUFDcEUsSUFBTSxFQUFFLGFBQWEsSUFBSSxP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
