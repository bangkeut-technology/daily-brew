import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

type Messages = { [key: string]: string | Messages };

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
function toIcuPlaceholders(messages: Messages): Messages {
  const out: Messages = {};
  for (const [key, value] of Object.entries(messages)) {
    out[key] =
      typeof value === "string"
        ? value.replace(/\{\{(\w+)\}\}/g, "{$1}")
        : toIcuPlaceholders(value);
  }
  return out;
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

  return { locale, messages: toIcuPlaceholders(messages) };
});
