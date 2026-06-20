// plugins/_shared/stubs/@-business-client-navigation.js
var api = window.__PLUGIN_API__;
var { businessNavigationManager } = api["@"]["business"]["client"]["navigation"];

// plugins/_shared/stubs/@-components-template-navigation-template.js
var api2 = window.__PLUGIN_API__;
var { EntryNavigationTemplate } = api2["@"]["components"]["template"]["navigation-template"];
var { ModelNavigationTemplate } = api2["@"]["components"]["template"]["navigation-template"];

// plugins/_shared/stubs/next-intl.js
var api3 = window.__PLUGIN_API__;
var { IntlError } = api3["next-intl"];
var { IntlErrorCode } = api3["next-intl"];
var { IntlProvider } = api3["next-intl"];
var { NextIntlClientProvider } = api3["next-intl"];
var { _createCache } = api3["next-intl"];
var { _createIntlFormatters } = api3["next-intl"];
var { createFormatter } = api3["next-intl"];
var { createTranslator } = api3["next-intl"];
var { hasLocale } = api3["next-intl"];
var { initializeConfig } = api3["next-intl"];
var { useExtracted } = api3["next-intl"];
var { useFormatter } = api3["next-intl"];
var { useLocale } = api3["next-intl"];
var { useMessages } = api3["next-intl"];
var { useNow } = api3["next-intl"];
var { useTimeZone } = api3["next-intl"];
var { useTranslations } = api3["next-intl"];

// plugins/_shared/react-jsx-runtime.js
var React = window.__PLUGIN_REACT__;
var Fragment = React.Fragment;
var _k = 0;
function autoKey(props) {
  if (!props || "key" in props) return props;
  return Object.assign({}, props, { key: `_${_k++}` });
}
function jsx(type, props) {
  return React.createElement(type, autoKey(props));
}
function jsxs(type, props) {
  return React.createElement(type, autoKey(props));
}

// plugins/project-info/client.tsx
var tags = ["tag1", "tag2", "tag3", "tag4", "tag5"];
function Content() {
  const t = useTranslations();
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
  businessNavigationManager.register({
    id: "info",
    label: () => /* @__PURE__ */ jsx(ModelNavigationTemplate, { modelType: "about" }),
    component: Content
  });
}
export {
  register as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vX3NoYXJlZC9zdHVicy9ALWJ1c2luZXNzLWNsaWVudC1uYXZpZ2F0aW9uLmpzIiwgIi4uL19zaGFyZWQvc3R1YnMvQC1jb21wb25lbnRzLXRlbXBsYXRlLW5hdmlnYXRpb24tdGVtcGxhdGUuanMiLCAiLi4vX3NoYXJlZC9zdHVicy9uZXh0LWludGwuanMiLCAiLi4vX3NoYXJlZC9yZWFjdC1qc3gtcnVudGltZS5qcyIsICJjbGllbnQudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBhcGkgPSB3aW5kb3cuX19QTFVHSU5fQVBJX187XG5leHBvcnQgY29uc3QgeyBidXNpbmVzc05hdmlnYXRpb25NYW5hZ2VyIH0gPSBhcGlbXCJAXCJdW1wiYnVzaW5lc3NcIl1bXCJjbGllbnRcIl1bXCJuYXZpZ2F0aW9uXCJdO1xuIiwgImNvbnN0IGFwaSA9IHdpbmRvdy5fX1BMVUdJTl9BUElfXztcbmV4cG9ydCBjb25zdCB7IEVudHJ5TmF2aWdhdGlvblRlbXBsYXRlIH0gPSBhcGlbXCJAXCJdW1wiY29tcG9uZW50c1wiXVtcInRlbXBsYXRlXCJdW1wibmF2aWdhdGlvbi10ZW1wbGF0ZVwiXTtcbmV4cG9ydCBjb25zdCB7IE1vZGVsTmF2aWdhdGlvblRlbXBsYXRlIH0gPSBhcGlbXCJAXCJdW1wiY29tcG9uZW50c1wiXVtcInRlbXBsYXRlXCJdW1wibmF2aWdhdGlvbi10ZW1wbGF0ZVwiXTtcbiIsICJjb25zdCBhcGkgPSB3aW5kb3cuX19QTFVHSU5fQVBJX187XG5leHBvcnQgY29uc3QgeyBJbnRsRXJyb3IgfSA9IGFwaVtcIm5leHQtaW50bFwiXTtcbmV4cG9ydCBjb25zdCB7IEludGxFcnJvckNvZGUgfSA9IGFwaVtcIm5leHQtaW50bFwiXTtcbmV4cG9ydCBjb25zdCB7IEludGxQcm92aWRlciB9ID0gYXBpW1wibmV4dC1pbnRsXCJdO1xuZXhwb3J0IGNvbnN0IHsgTmV4dEludGxDbGllbnRQcm92aWRlciB9ID0gYXBpW1wibmV4dC1pbnRsXCJdO1xuZXhwb3J0IGNvbnN0IHsgX2NyZWF0ZUNhY2hlIH0gPSBhcGlbXCJuZXh0LWludGxcIl07XG5leHBvcnQgY29uc3QgeyBfY3JlYXRlSW50bEZvcm1hdHRlcnMgfSA9IGFwaVtcIm5leHQtaW50bFwiXTtcbmV4cG9ydCBjb25zdCB7IGNyZWF0ZUZvcm1hdHRlciB9ID0gYXBpW1wibmV4dC1pbnRsXCJdO1xuZXhwb3J0IGNvbnN0IHsgY3JlYXRlVHJhbnNsYXRvciB9ID0gYXBpW1wibmV4dC1pbnRsXCJdO1xuZXhwb3J0IGNvbnN0IHsgaGFzTG9jYWxlIH0gPSBhcGlbXCJuZXh0LWludGxcIl07XG5leHBvcnQgY29uc3QgeyBpbml0aWFsaXplQ29uZmlnIH0gPSBhcGlbXCJuZXh0LWludGxcIl07XG5leHBvcnQgY29uc3QgeyB1c2VFeHRyYWN0ZWQgfSA9IGFwaVtcIm5leHQtaW50bFwiXTtcbmV4cG9ydCBjb25zdCB7IHVzZUZvcm1hdHRlciB9ID0gYXBpW1wibmV4dC1pbnRsXCJdO1xuZXhwb3J0IGNvbnN0IHsgdXNlTG9jYWxlIH0gPSBhcGlbXCJuZXh0LWludGxcIl07XG5leHBvcnQgY29uc3QgeyB1c2VNZXNzYWdlcyB9ID0gYXBpW1wibmV4dC1pbnRsXCJdO1xuZXhwb3J0IGNvbnN0IHsgdXNlTm93IH0gPSBhcGlbXCJuZXh0LWludGxcIl07XG5leHBvcnQgY29uc3QgeyB1c2VUaW1lWm9uZSB9ID0gYXBpW1wibmV4dC1pbnRsXCJdO1xuZXhwb3J0IGNvbnN0IHsgdXNlVHJhbnNsYXRpb25zIH0gPSBhcGlbXCJuZXh0LWludGxcIl07XG4iLCAiLy8gaW1wb3J0ICdyZWFjdC9qc3gtcnVudGltZScgXHUyMTkyIFx1NEVDRVx1NUJCRlx1NEUzQlx1ODNCN1x1NTNENiArIFx1ODFFQVx1NTJBOFx1ODg2NSBrZXlcclxuY29uc3QgUmVhY3QgPSB3aW5kb3cuX19QTFVHSU5fUkVBQ1RfXztcclxuY29uc3QgRnJhZ21lbnQgPSBSZWFjdC5GcmFnbWVudDtcclxuXHJcbmxldCBfayA9IDA7XHJcbmZ1bmN0aW9uIGF1dG9LZXkocHJvcHMpIHtcclxuICAgIGlmICghcHJvcHMgfHwgXCJrZXlcIiBpbiBwcm9wcykgcmV0dXJuIHByb3BzO1xyXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHByb3BzLCB7IGtleTogYF8ke19rKyt9YCB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGpzeCh0eXBlLCBwcm9wcykge1xyXG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQodHlwZSwgYXV0b0tleShwcm9wcykpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24ganN4cyh0eXBlLCBwcm9wcykge1xyXG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQodHlwZSwgYXV0b0tleShwcm9wcykpO1xyXG59XHJcblxyXG5leHBvcnQgeyBGcmFnbWVudCB9O1xyXG4iLCAiLyoqXHJcbiAqIFByb2plY3QgSW5mbyBcdTYzRDJcdTRFRjZcclxuICogXHU2Nzg0XHU1RUZBOiBucG0gcnVuIGJ1aWxkLXBsdWdpbiBwcm9qZWN0LWluZm9cclxuICovXHJcbmltcG9ydCB7YnVzaW5lc3NOYXZpZ2F0aW9uTWFuYWdlcn0gZnJvbSAnQC9idXNpbmVzcy9jbGllbnQvbmF2aWdhdGlvbic7XHJcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7TW9kZWxOYXZpZ2F0aW9uVGVtcGxhdGV9IGZyb20gXCJAL2NvbXBvbmVudHMvdGVtcGxhdGUvbmF2aWdhdGlvbi10ZW1wbGF0ZVwiO1xyXG5pbXBvcnQge3VzZVRyYW5zbGF0aW9uc30gZnJvbSBcIm5leHQtaW50bFwiO1xyXG5cclxuY29uc3QgdGFncyA9IFtcInRhZzFcIiwgXCJ0YWcyXCIsIFwidGFnM1wiLCBcInRhZzRcIiwgXCJ0YWc1XCJdO1xyXG5cclxuZnVuY3Rpb24gQ29udGVudCgpIHtcclxuICAgIGNvbnN0IHQgPSB1c2VUcmFuc2xhdGlvbnMoKTtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGgtZnVsbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbWluLWgtWzYwdmhdIGdhcC04IHAtOFwiPlxyXG4gICAgICAgICAgICB7LyogXHU1NkZFXHU2ODA3ICovfVxyXG4gICAgICAgICAgICA8ZGl2XHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJzaXplLTE2IHJvdW5kZWQtMnhsIGJnLWxpbmVhci10by1iciBmcm9tLWluZGlnby01MDAgdG8tcHVycGxlLTYwMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBzaGFkb3ctbGcgc2hhZG93LWluZGlnby01MDAvMjBcIj5cclxuICAgICAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPVwic2l6ZS0xMiBcIiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcjogJ2JyaWdodG5lc3MoMCkgc2F0dXJhdGUoMTAwJSkgaW52ZXJ0KDEwMCUpJyAgLy8gXHU1M0Q4XHU2MjEwXHU3NjdEXHU4MjcyXHJcbiAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgICAgICAgICBzcmM9eydmYXZpY29uLnN2Zyd9IGFsdD17J3NlY3l1ZCB0YXZlcm4nfT48L2ltZz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICB7LyogXHU2ODA3XHU5ODk4ICovfVxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyIHNwYWNlLXktMlwiPlxyXG4gICAgICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYm9sZCB0cmFja2luZy10aWdodFwiPlNlY3l1ZCBUYXZlcm48L2gxPlxyXG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmQgbWF4LXctc20gbGVhZGluZy1yZWxheGVkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAge3QoJ2Fib3V0LmRlc2NyaXB0aW9uJyl9XHJcbiAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgey8qIFx1NzI3OVx1NjAyN1x1NjgwN1x1N0I3RSAqL31cclxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtd3JhcCBqdXN0aWZ5LWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgICAgICAge3RhZ3MubWFwKHRhZyA9PiAoXHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW5cclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXt0YWd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciByb3VuZGVkLWZ1bGwgYm9yZGVyIHB4LTIuNSBweS0wLjUgdGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LW11dGVkLWZvcmVncm91bmQgaG92ZXI6Ym9yZGVyLWZvcmVncm91bmQvMzAgdHJhbnNpdGlvbi1jb2xvcnNcIlxyXG4gICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAge3QoYGFib3V0LiR7dGFnfWApfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIHsvKiBcdTk0RkVcdTYzQTUgKi99XHJcbiAgICAgICAgICAgIDxhXHJcbiAgICAgICAgICAgICAgICBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL2xhb3hUdS9zZWN5dWQtdGF2ZXJuXCJcclxuICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXHJcbiAgICAgICAgICAgICAgICByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCJcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiByb3VuZGVkLWxnIGJnLWZvcmVncm91bmQgcHgtNCBweS0yIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1iYWNrZ3JvdW5kIGhvdmVyOmJnLWZvcmVncm91bmQvOTAgdHJhbnNpdGlvbi1jb2xvcnNcIlxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cInNpemUtNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwiY3VycmVudENvbG9yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHBhdGhcclxuICAgICAgICAgICAgICAgICAgICAgICAgZD1cIk0xMiAwYy02LjYyNiAwLTEyIDUuMzczLTEyIDEyIDAgNS4zMDIgMy40MzggOS44IDguMjA3IDExLjM4Ny41OTkuMTExLjc5My0uMjYxLjc5My0uNTc3di0yLjIzNGMtMy4zMzguNzI2LTQuMDMzLTEuNDE2LTQuMDMzLTEuNDE2LS41NDYtMS4zODctMS4zMzMtMS43NTYtMS4zMzMtMS43NTYtMS4wODktLjc0NS4wODMtLjcyOS4wODMtLjcyOSAxLjIwNS4wODQgMS44MzkgMS4yMzcgMS44MzkgMS4yMzcgMS4wNyAxLjgzNCAyLjgwNyAxLjMwNCAzLjQ5Mi45OTcuMTA3LS43NzUuNDE4LTEuMzA1Ljc2Mi0xLjYwNC0yLjY2NS0uMzA1LTUuNDY3LTEuMzM0LTUuNDY3LTUuOTMxIDAtMS4zMTEuNDY5LTIuMzgxIDEuMjM2LTMuMjIxLS4xMjQtLjMwMy0uNTM1LTEuNTI0LjExNy0zLjE3NiAwIDAgMS4wMDgtLjMyMiAzLjMwMSAxLjIzLjk1Ny0uMjY2IDEuOTgzLS4zOTkgMy4wMDMtLjQwNCAxLjAyLjAwNSAyLjA0Ny4xMzggMy4wMDYuNDA0IDIuMjkxLTEuNTUyIDMuMjk3LTEuMjMgMy4yOTctMS4yMy42NTMgMS42NTMuMjQyIDIuODc0LjExOCAzLjE3Ni43Ny44NCAxLjIzNSAxLjkxMSAxLjIzNSAzLjIyMSAwIDQuNjA5LTIuODA3IDUuNjI0LTUuNDc5IDUuOTIxLjQzLjM3Mi44MjMgMS4xMDIuODIzIDIuMjIydjMuMjkzYzAgLjMxOS4xOTIuNjk0LjgwMS41NzYgNC43NjUtMS41ODkgOC4xOTktNi4wODYgOC4xOTktMTEuMzg2IDAtNi42MjctNS4zNzMtMTItMTItMTJ6XCIvPlxyXG4gICAgICAgICAgICAgICAgPC9zdmc+XHJcbiAgICAgICAgICAgICAgICBHaXRIdWJcclxuICAgICAgICAgICAgPC9hPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVnaXN0ZXIoKSB7XHJcbiAgICBjb25zb2xlLmluZm8oXCJbcHJvamVjdC1pbmZvXSBzZWN5dWQtdGF2ZXJuOiBodHRwczovL2dpdGh1Yi5jb20vbGFveFR1L3NlY3l1ZC10YXZlcm5cIik7XHJcblxyXG4gICAgYnVzaW5lc3NOYXZpZ2F0aW9uTWFuYWdlci5yZWdpc3Rlcih7XHJcbiAgICAgICAgaWQ6IFwiaW5mb1wiLFxyXG4gICAgICAgIGxhYmVsOiAoKSA9PiA8TW9kZWxOYXZpZ2F0aW9uVGVtcGxhdGUgbW9kZWxUeXBlPXsnYWJvdXQnfS8+LFxyXG4gICAgICAgIGNvbXBvbmVudDogQ29udGVudCxcclxuICAgIH0pO1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxJQUFNLE1BQU0sT0FBTztBQUNaLElBQU0sRUFBRSwwQkFBMEIsSUFBSSxJQUFJLEdBQUcsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFlBQVk7OztBQ0R4RixJQUFNQSxPQUFNLE9BQU87QUFDWixJQUFNLEVBQUUsd0JBQXdCLElBQUlBLEtBQUksR0FBRyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUscUJBQXFCO0FBQzVGLElBQU0sRUFBRSx3QkFBd0IsSUFBSUEsS0FBSSxHQUFHLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxxQkFBcUI7OztBQ0ZuRyxJQUFNQyxPQUFNLE9BQU87QUFDWixJQUFNLEVBQUUsVUFBVSxJQUFJQSxLQUFJLFdBQVc7QUFDckMsSUFBTSxFQUFFLGNBQWMsSUFBSUEsS0FBSSxXQUFX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
