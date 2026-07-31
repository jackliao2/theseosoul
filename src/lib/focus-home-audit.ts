export const HOME_AUDIT_HASH = "home-audit-url";
export const HOME_AUDIT_INPUT_ID = "home-audit-url-input";

/** Scroll to the homepage audit field and focus it (sticky-header safe). */
export function focusHomeAudit(behavior: ScrollBehavior = "smooth") {
  if (typeof document === "undefined") return;

  const root = document.getElementById(HOME_AUDIT_HASH);
  if (!root) return;

  root.scrollIntoView({ behavior, block: "center" });

  const input = document.getElementById(
    HOME_AUDIT_INPUT_ID
  ) as HTMLInputElement | null;

  window.setTimeout(
    () => {
      input?.focus({ preventScroll: true });
    },
    behavior === "smooth" ? 280 : 0
  );

  if (window.location.hash !== `#${HOME_AUDIT_HASH}`) {
    history.replaceState(null, "", `#${HOME_AUDIT_HASH}`);
  }
}
