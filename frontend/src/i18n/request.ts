import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

type MessageValue = string | MessageValue[] | { [key: string]: MessageValue };
type Messages = { [key: string]: MessageValue };

/**
 * The locale catalogues are shared with the console's i18next, which writes
 * placeholders as `{{name}}`. next-intl speaks ICU, where that's `{name}`.
 *
 * Rather than fork the catalogues — which would guarantee the two copies
 * drift — normalise on the way in. Verified safe against the current files:
 * no message contains a bare single-brace `{x}` that this could corrupt, and
 * no marketing message uses i18next's `_one`/`_other` plural suffixes (which
 * have no mechanical ICU equivalent and would need hand-conversion).
 */
function toIcuPlaceholders(value: MessageValue): MessageValue {
  if (typeof value === "string") return value.replace(/\{\{(\w+)\}\}/g, "{$1}");
  // Arrays must stay arrays — some messages are lists (e.g. the how-it-works
  // step bullet points), and rebuilding them from Object.entries would turn
  // them into `{0: …, 1: …}`, which `t.raw()` can't map over.
  if (Array.isArray(value)) return value.map(toIcuPlaceholders);
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, toIcuPlaceholders(child)]),
  );
}

/**
 * Server-side message loading for the localized marketing routes. Reads the
 * same `src/locales/{locale}/common.json` catalogues the console uses, so
 * there is one set of translations for the whole product.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const messages = (await import(`../locales/${locale}/common.json`)).default as Messages;

  return { locale, messages: toIcuPlaceholders(messages) as Messages };
});
