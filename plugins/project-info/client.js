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

// ../plugins/project-info/client.tsx
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGx1Z2luLWFwaTpAL2J1c2luZXNzL2NsaWVudC9uYXZpZ2F0aW9uIiwgInBsdWdpbi1hcGk6QC9jb21wb25lbnRzL3RlbXBsYXRlL25hdmlnYXRpb24tdGVtcGxhdGUiLCAicGx1Z2luLWFwaTpuZXh0LWludGwiLCAicGx1Z2luLWFwaTpyZWFjdC9qc3gtcnVudGltZSIsICJjbGllbnQudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgY29uc3QgeyBidXNpbmVzc05hdmlnYXRpb25NYW5hZ2VyIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ0AvYnVzaW5lc3MvY2xpZW50L25hdmlnYXRpb24nXTsiLCAiZXhwb3J0IGNvbnN0IHsgRW50cnlOYXZpZ2F0aW9uVGVtcGxhdGUgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snQC9jb21wb25lbnRzL3RlbXBsYXRlL25hdmlnYXRpb24tdGVtcGxhdGUnXTtcbmV4cG9ydCBjb25zdCB7IE1vZGVsTmF2aWdhdGlvblRlbXBsYXRlIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ0AvY29tcG9uZW50cy90ZW1wbGF0ZS9uYXZpZ2F0aW9uLXRlbXBsYXRlJ107IiwgImV4cG9ydCBjb25zdCB7IEludGxFcnJvciB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IEludGxFcnJvckNvZGUgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyBJbnRsUHJvdmlkZXIgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyBOZXh0SW50bENsaWVudFByb3ZpZGVyIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgX2NyZWF0ZUNhY2hlIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgX2NyZWF0ZUludGxGb3JtYXR0ZXJzIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgY3JlYXRlRm9ybWF0dGVyIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgY3JlYXRlVHJhbnNsYXRvciB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IGhhc0xvY2FsZSB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IGluaXRpYWxpemVDb25maWcgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyB1c2VFeHRyYWN0ZWQgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyB1c2VGb3JtYXR0ZXIgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyB1c2VMb2NhbGUgfSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfX1snbmV4dC1pbnRsJ107XG5leHBvcnQgY29uc3QgeyB1c2VNZXNzYWdlcyB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IHVzZU5vdyB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWyduZXh0LWludGwnXTtcbmV4cG9ydCBjb25zdCB7IHVzZVRpbWVab25lIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddO1xuZXhwb3J0IGNvbnN0IHsgdXNlVHJhbnNsYXRpb25zIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ25leHQtaW50bCddOyIsICJleHBvcnQgY29uc3QgeyBGcmFnbWVudCB9ID0gd2luZG93Ll9fUExVR0lOX0FQSV9fWydyZWFjdC9qc3gtcnVudGltZSddO1xuZXhwb3J0IGNvbnN0IHsganN4IH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ3JlYWN0L2pzeC1ydW50aW1lJ107XG5leHBvcnQgY29uc3QgeyBqc3hzIH0gPSB3aW5kb3cuX19QTFVHSU5fQVBJX19bJ3JlYWN0L2pzeC1ydW50aW1lJ107IiwgIi8qKlxyXG4gKiBQcm9qZWN0IEluZm8gXHU2M0QyXHU0RUY2XHJcbiAqIFx1Njc4NFx1NUVGQTogbnBtIHJ1biBidWlsZC1wbHVnaW4gcHJvamVjdC1pbmZvXHJcbiAqL1xyXG5pbXBvcnQgKiBhcyBuYXZpZ2F0aW9uIGZyb20gJ0AvYnVzaW5lc3MvY2xpZW50L25hdmlnYXRpb24nO1xyXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgKiBhcyBydW50aW1lIGZyb20gJ3JlYWN0L2pzeC1ydW50aW1lJztcclxuaW1wb3J0ICogYXMgZGV2X3J1bnRpbWUgZnJvbSAncmVhY3QvanN4LWRldi1ydW50aW1lJztcclxuaW1wb3J0ICogYXMgdGVtcGxhdGUgZnJvbSBcIkAvY29tcG9uZW50cy90ZW1wbGF0ZS9uYXZpZ2F0aW9uLXRlbXBsYXRlXCI7XHJcbmltcG9ydCAqIGFzIGludGwgZnJvbSBcIm5leHQtaW50bFwiO1xyXG5cclxuY29uc3Qge2J1c2luZXNzTmF2aWdhdGlvbk1hbmFnZXJ9ID0gbmF2aWdhdGlvbjtcclxuY29uc3Qge01vZGVsTmF2aWdhdGlvblRlbXBsYXRlfSA9IHRlbXBsYXRlO1xyXG5jb25zdCB7dXNlVHJhbnNsYXRpb25zfSA9IGludGw7XHJcblxyXG5jb25zdCB0YWdzID0gW1widGFnMVwiLCBcInRhZzJcIiwgXCJ0YWczXCIsIFwidGFnNFwiLCBcInRhZzVcIl07XHJcblxyXG5mdW5jdGlvbiBDb250ZW50KCkge1xyXG4gICAgY29uc3QgdCA9IHVzZVRyYW5zbGF0aW9ucygpO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgaC1mdWxsIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBtaW4taC1bNjB2aF0gZ2FwLTggcC04XCI+XHJcbiAgICAgICAgICAgIHsvKiBcdTU2RkVcdTY4MDcgKi99XHJcbiAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInNpemUtMTYgcm91bmRlZC0yeGwgYmctbGluZWFyLXRvLWJyIGZyb20taW5kaWdvLTUwMCB0by1wdXJwbGUtNjAwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHNoYWRvdy1sZyBzaGFkb3ctaW5kaWdvLTUwMC8yMFwiPlxyXG4gICAgICAgICAgICAgICAgPGltZyBjbGFzc05hbWU9XCJzaXplLTEyIFwiIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyOiAnYnJpZ2h0bmVzcygwKSBzYXR1cmF0ZSgxMDAlKSBpbnZlcnQoMTAwJSknICAvLyBcdTUzRDhcdTYyMTBcdTc2N0RcdTgyNzJcclxuICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgICAgIHNyYz17J2Zhdmljb24uc3ZnJ30gYWx0PXsnc2VjeXVkIHRhdmVybid9PjwvaW1nPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIHsvKiBcdTY4MDdcdTk4OTggKi99XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgc3BhY2UteS0yXCI+XHJcbiAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ib2xkIHRyYWNraW5nLXRpZ2h0XCI+U2VjeXVkIFRhdmVybjwvaDE+XHJcbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBtYXgtdy1zbSBsZWFkaW5nLXJlbGF4ZWRcIj5cclxuICAgICAgICAgICAgICAgICAgICB7dCgnYWJvdXQuZGVzY3JpcHRpb24nKX1cclxuICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICB7LyogXHU3Mjc5XHU2MDI3XHU2ODA3XHU3QjdFICovfVxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC13cmFwIGp1c3RpZnktY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICAgICAgICB7dGFncy5tYXAodGFnID0+IChcclxuICAgICAgICAgICAgICAgICAgICA8c3BhblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9e3RhZ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIHJvdW5kZWQtZnVsbCBib3JkZXIgcHgtMi41IHB5LTAuNSB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBob3Zlcjpib3JkZXItZm9yZWdyb3VuZC8zMCB0cmFuc2l0aW9uLWNvbG9yc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7dChgYWJvdXQuJHt0YWd9YCl9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgey8qIFx1OTRGRVx1NjNBNSAqL31cclxuICAgICAgICAgICAgPGFcclxuICAgICAgICAgICAgICAgIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vbGFveFR1L3NlY3l1ZC10YXZlcm5cIlxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcclxuICAgICAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHJvdW5kZWQtbGcgYmctZm9yZWdyb3VuZCBweC00IHB5LTIgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWJhY2tncm91bmQgaG92ZXI6YmctZm9yZWdyb3VuZC85MCB0cmFuc2l0aW9uLWNvbG9yc1wiXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwic2l6ZS00XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIj5cclxuICAgICAgICAgICAgICAgICAgICA8cGF0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkPVwiTTEyIDBjLTYuNjI2IDAtMTIgNS4zNzMtMTIgMTIgMCA1LjMwMiAzLjQzOCA5LjggOC4yMDcgMTEuMzg3LjU5OS4xMTEuNzkzLS4yNjEuNzkzLS41Nzd2LTIuMjM0Yy0zLjMzOC43MjYtNC4wMzMtMS40MTYtNC4wMzMtMS40MTYtLjU0Ni0xLjM4Ny0xLjMzMy0xLjc1Ni0xLjMzMy0xLjc1Ni0xLjA4OS0uNzQ1LjA4My0uNzI5LjA4My0uNzI5IDEuMjA1LjA4NCAxLjgzOSAxLjIzNyAxLjgzOSAxLjIzNyAxLjA3IDEuODM0IDIuODA3IDEuMzA0IDMuNDkyLjk5Ny4xMDctLjc3NS40MTgtMS4zMDUuNzYyLTEuNjA0LTIuNjY1LS4zMDUtNS40NjctMS4zMzQtNS40NjctNS45MzEgMC0xLjMxMS40NjktMi4zODEgMS4yMzYtMy4yMjEtLjEyNC0uMzAzLS41MzUtMS41MjQuMTE3LTMuMTc2IDAgMCAxLjAwOC0uMzIyIDMuMzAxIDEuMjMuOTU3LS4yNjYgMS45ODMtLjM5OSAzLjAwMy0uNDA0IDEuMDIuMDA1IDIuMDQ3LjEzOCAzLjAwNi40MDQgMi4yOTEtMS41NTIgMy4yOTctMS4yMyAzLjI5Ny0xLjIzLjY1MyAxLjY1My4yNDIgMi44NzQuMTE4IDMuMTc2Ljc3Ljg0IDEuMjM1IDEuOTExIDEuMjM1IDMuMjIxIDAgNC42MDktMi44MDcgNS42MjQtNS40NzkgNS45MjEuNDMuMzcyLjgyMyAxLjEwMi44MjMgMi4yMjJ2My4yOTNjMCAuMzE5LjE5Mi42OTQuODAxLjU3NiA0Ljc2NS0xLjU4OSA4LjE5OS02LjA4NiA4LjE5OS0xMS4zODYgMC02LjYyNy01LjM3My0xMi0xMi0xMnpcIi8+XHJcbiAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgIEdpdEh1YlxyXG4gICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICApO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZWdpc3RlcigpIHtcclxuICAgIGNvbnNvbGUuaW5mbyhcIltwcm9qZWN0LWluZm9dIHNlY3l1ZC10YXZlcm46IGh0dHBzOi8vZ2l0aHViLmNvbS9sYW94VHUvc2VjeXVkLXRhdmVyblwiKTtcclxuXHJcbiAgICBidXNpbmVzc05hdmlnYXRpb25NYW5hZ2VyLnJlZ2lzdGVyKHtcclxuICAgICAgICBpZDogXCJpbmZvXCIsXHJcbiAgICAgICAgbGFiZWw6ICgpID0+IDxNb2RlbE5hdmlnYXRpb25UZW1wbGF0ZSBtb2RlbFR5cGU9eydhYm91dCd9Lz4sXHJcbiAgICAgICAgY29tcG9uZW50OiBDb250ZW50LFxyXG4gICAgfSk7XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQU8sSUFBTSxFQUFFLDBCQUEwQixJQUFJLE9BQU8sZUFBZSw4QkFBOEI7OztBQ0FqRztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQU8sSUFBTSxFQUFFLHdCQUF3QixJQUFJLE9BQU8sZUFBZSwyQ0FBMkM7QUFDckcsSUFBTSxFQUFFLHdCQUF3QixJQUFJLE9BQU8sZUFBZSwyQ0FBMkM7OztBQ0Q1RztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQU8sSUFBTSxFQUFFLFVBQVUsSUFBSSxPQUFPLGVBQWUsV0FBVztBQUN2RCxJQUFNLEVBQUUsY0FBYyxJQUFJLE9BQU8sZUFBZSxXQUFXO0FBQzNE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
