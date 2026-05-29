import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ja', 'en'],
  defaultLocale: 'ja',
  localePrefix: 'never'
});

export const config = {
  matcher: ['/((?!login|dashboard|shot|qc|routine|exit_report|messages|goodbye|reference|cross|index|indexhub|api|_next|.*\\..*)(?!$).+)']
};
