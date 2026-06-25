// plugins/project-info/client.tsx
const { businessNavigationManager } = window.__PLUGIN_API__['@/business/client/navigation'];
const { ModelTabHeader } = window.__PLUGIN_API__['@/business/client/template/tab-header'];
const { useTranslations } = window.__PLUGIN_API__['next-intl'];
const { jsx, jsxs } = window.__PLUGIN_API__['react/jsx-runtime'];
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
    label: () => /* @__PURE__ */ jsx(ModelTabHeader, { modelType: "about" }),
    component: Content
  });
}
export {
  register as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiY2xpZW50LnRzeCJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXHJcbiAqIFByb2plY3QgSW5mbyBcdTYzRDJcdTRFRjZcclxuICogXHU2Nzg0XHU1RUZBOiBucG0gcnVuIGJ1aWxkLXBsdWdpbiBwcm9qZWN0LWluZm9cclxuICovXHJcbmltcG9ydCB7YnVzaW5lc3NOYXZpZ2F0aW9uTWFuYWdlcn0gZnJvbSAnQC9idXNpbmVzcy9jbGllbnQvbmF2aWdhdGlvbic7XHJcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7TW9kZWxUYWJIZWFkZXJ9IGZyb20gXCJAL2J1c2luZXNzL2NsaWVudC90ZW1wbGF0ZS90YWItaGVhZGVyXCI7XHJcbmltcG9ydCB7dXNlVHJhbnNsYXRpb25zfSBmcm9tIFwibmV4dC1pbnRsXCI7XHJcblxyXG5jb25zdCB0YWdzID0gW1widGFnMVwiLCBcInRhZzJcIiwgXCJ0YWczXCIsIFwidGFnNFwiLCBcInRhZzVcIl07XHJcblxyXG5mdW5jdGlvbiBDb250ZW50KCkge1xyXG4gICAgY29uc3QgdCA9IHVzZVRyYW5zbGF0aW9ucygpO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgaC1mdWxsIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBtaW4taC1bNjB2aF0gZ2FwLTggcC04XCI+XHJcbiAgICAgICAgICAgIHsvKiBcdTU2RkVcdTY4MDcgKi99XHJcbiAgICAgICAgICAgIDxkaXZcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInNpemUtMTYgcm91bmRlZC0yeGwgYmctbGluZWFyLXRvLWJyIGZyb20taW5kaWdvLTUwMCB0by1wdXJwbGUtNjAwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHNoYWRvdy1sZyBzaGFkb3ctaW5kaWdvLTUwMC8yMFwiPlxyXG4gICAgICAgICAgICAgICAgPGltZyBjbGFzc05hbWU9XCJzaXplLTEyIFwiIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyOiAnYnJpZ2h0bmVzcygwKSBzYXR1cmF0ZSgxMDAlKSBpbnZlcnQoMTAwJSknICAvLyBcdTUzRDhcdTYyMTBcdTc2N0RcdTgyNzJcclxuICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgICAgIHNyYz17J2Zhdmljb24uc3ZnJ30gYWx0PXsnc2VjeXVkIHRhdmVybid9PjwvaW1nPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIHsvKiBcdTY4MDdcdTk4OTggKi99XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgc3BhY2UteS0yXCI+XHJcbiAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ib2xkIHRyYWNraW5nLXRpZ2h0XCI+U2VjeXVkIFRhdmVybjwvaDE+XHJcbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBtYXgtdy1zbSBsZWFkaW5nLXJlbGF4ZWRcIj5cclxuICAgICAgICAgICAgICAgICAgICB7dCgnYWJvdXQuZGVzY3JpcHRpb24nKX1cclxuICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICB7LyogXHU3Mjc5XHU2MDI3XHU2ODA3XHU3QjdFICovfVxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC13cmFwIGp1c3RpZnktY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICAgICAgICB7dGFncy5tYXAodGFnID0+IChcclxuICAgICAgICAgICAgICAgICAgICA8c3BhblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9e3RhZ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIHJvdW5kZWQtZnVsbCBib3JkZXIgcHgtMi41IHB5LTAuNSB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBob3Zlcjpib3JkZXItZm9yZWdyb3VuZC8zMCB0cmFuc2l0aW9uLWNvbG9yc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7dChgYWJvdXQuJHt0YWd9YCl9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgey8qIFx1OTRGRVx1NjNBNSAqL31cclxuICAgICAgICAgICAgPGFcclxuICAgICAgICAgICAgICAgIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vbGFveFR1L3NlY3l1ZC10YXZlcm5cIlxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcclxuICAgICAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHJvdW5kZWQtbGcgYmctZm9yZWdyb3VuZCBweC00IHB5LTIgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWJhY2tncm91bmQgaG92ZXI6YmctZm9yZWdyb3VuZC85MCB0cmFuc2l0aW9uLWNvbG9yc1wiXHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwic2l6ZS00XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIj5cclxuICAgICAgICAgICAgICAgICAgICA8cGF0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkPVwiTTEyIDBjLTYuNjI2IDAtMTIgNS4zNzMtMTIgMTIgMCA1LjMwMiAzLjQzOCA5LjggOC4yMDcgMTEuMzg3LjU5OS4xMTEuNzkzLS4yNjEuNzkzLS41Nzd2LTIuMjM0Yy0zLjMzOC43MjYtNC4wMzMtMS40MTYtNC4wMzMtMS40MTYtLjU0Ni0xLjM4Ny0xLjMzMy0xLjc1Ni0xLjMzMy0xLjc1Ni0xLjA4OS0uNzQ1LjA4My0uNzI5LjA4My0uNzI5IDEuMjA1LjA4NCAxLjgzOSAxLjIzNyAxLjgzOSAxLjIzNyAxLjA3IDEuODM0IDIuODA3IDEuMzA0IDMuNDkyLjk5Ny4xMDctLjc3NS40MTgtMS4zMDUuNzYyLTEuNjA0LTIuNjY1LS4zMDUtNS40NjctMS4zMzQtNS40NjctNS45MzEgMC0xLjMxMS40NjktMi4zODEgMS4yMzYtMy4yMjEtLjEyNC0uMzAzLS41MzUtMS41MjQuMTE3LTMuMTc2IDAgMCAxLjAwOC0uMzIyIDMuMzAxIDEuMjMuOTU3LS4yNjYgMS45ODMtLjM5OSAzLjAwMy0uNDA0IDEuMDIuMDA1IDIuMDQ3LjEzOCAzLjAwNi40MDQgMi4yOTEtMS41NTIgMy4yOTctMS4yMyAzLjI5Ny0xLjIzLjY1MyAxLjY1My4yNDIgMi44NzQuMTE4IDMuMTc2Ljc3Ljg0IDEuMjM1IDEuOTExIDEuMjM1IDMuMjIxIDAgNC42MDktMi44MDcgNS42MjQtNS40NzkgNS45MjEuNDMuMzcyLjgyMyAxLjEwMi44MjMgMi4yMjJ2My4yOTNjMCAuMzE5LjE5Mi42OTQuODAxLjU3NiA0Ljc2NS0xLjU4OSA4LjE5OS02LjA4NiA4LjE5OS0xMS4zODYgMC02LjYyNy01LjM3My0xMi0xMi0xMnpcIi8+XHJcbiAgICAgICAgICAgICAgICA8L3N2Zz5cclxuICAgICAgICAgICAgICAgIEdpdEh1YlxyXG4gICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICApO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZWdpc3RlcigpIHtcclxuICAgIGNvbnNvbGUuaW5mbyhcIltwcm9qZWN0LWluZm9dIHNlY3l1ZC10YXZlcm46IGh0dHBzOi8vZ2l0aHViLmNvbS9sYW94VHUvc2VjeXVkLXRhdmVyblwiKTtcclxuXHJcbiAgICBidXNpbmVzc05hdmlnYXRpb25NYW5hZ2VyLnJlZ2lzdGVyKHtcclxuICAgICAgICBpZDogXCJpbmZvXCIsXHJcbiAgICAgICAgbGFiZWw6ICgpID0+IDxNb2RlbFRhYkhlYWRlciBtb2RlbFR5cGU9eydhYm91dCd9Lz4sXHJcbiAgICAgICAgY29tcG9uZW50OiBDb250ZW50LFxyXG4gICAgfSk7XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUlBLFNBQVEsaUNBQWdDO0FBRXhDLFNBQVEsc0JBQXFCO0FBQzdCLFNBQVEsdUJBQXNCO0FBV2QsY0FPSixZQVBJO0FBVGhCLElBQU0sT0FBTyxDQUFDLFFBQVEsUUFBUSxRQUFRLFFBQVEsTUFBTTtBQUVwRCxTQUFTLFVBQVU7QUFDZixRQUFNLElBQUksZ0JBQWdCO0FBQzFCLFNBQ0kscUJBQUMsU0FBSSxXQUFVLDJFQUVYO0FBQUE7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNHLFdBQVU7QUFBQSxRQUNWO0FBQUEsVUFBQztBQUFBO0FBQUEsWUFBSSxXQUFVO0FBQUEsWUFBVyxPQUFPO0FBQUEsY0FDN0IsUUFBUTtBQUFBO0FBQUEsWUFDWjtBQUFBLFlBQ0ssS0FBSztBQUFBLFlBQWUsS0FBSztBQUFBO0FBQUEsUUFBaUI7QUFBQTtBQUFBLElBQ25EO0FBQUEsSUFHQSxxQkFBQyxTQUFJLFdBQVUseUJBQ1g7QUFBQSwwQkFBQyxRQUFHLFdBQVUscUNBQW9DLDJCQUFhO0FBQUEsTUFDL0Qsb0JBQUMsT0FBRSxXQUFVLDBEQUNSLFlBQUUsbUJBQW1CLEdBQzFCO0FBQUEsT0FDSjtBQUFBLElBR0Esb0JBQUMsU0FBSSxXQUFVLHVDQUNWLGVBQUssSUFBSSxTQUNOO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFFRyxXQUFVO0FBQUEsUUFFVCxZQUFFLFNBQVMsR0FBRyxFQUFFO0FBQUE7QUFBQSxNQUhaO0FBQUEsSUFJVCxDQUNILEdBQ0w7QUFBQSxJQUdBO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDRyxNQUFLO0FBQUEsUUFDTCxRQUFPO0FBQUEsUUFDUCxLQUFJO0FBQUEsUUFDSixXQUFVO0FBQUEsUUFFVjtBQUFBLDhCQUFDLFNBQUksV0FBVSxVQUFTLFNBQVEsYUFBWSxNQUFLLGdCQUM3QztBQUFBLFlBQUM7QUFBQTtBQUFBLGNBQ0csR0FBRTtBQUFBO0FBQUEsVUFBMnNCLEdBQ3J0QjtBQUFBLFVBQU07QUFBQTtBQUFBO0FBQUEsSUFFVjtBQUFBLEtBQ0o7QUFFUjtBQUVlLFNBQVIsV0FBNEI7QUFDL0IsVUFBUSxLQUFLLHVFQUF1RTtBQUVwRiw0QkFBMEIsU0FBUztBQUFBLElBQy9CLElBQUk7QUFBQSxJQUNKLE9BQU8sTUFBTSxvQkFBQyxrQkFBZSxXQUFXLFNBQVE7QUFBQSxJQUNoRCxXQUFXO0FBQUEsRUFDZixDQUFDO0FBQ0w7IiwKICAibmFtZXMiOiBbXQp9Cg==
