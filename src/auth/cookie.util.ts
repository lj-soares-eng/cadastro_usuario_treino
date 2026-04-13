/** Extrai o valor de um cookie pelo nome a partir do header Cookie bruto. */
export function parseCookieValue(
  cookieHeader: string | undefined,
  name: string,
): string | null {
  if (!cookieHeader || typeof cookieHeader !== 'string') {
    return null;
  }
  /* Divide o cookie em segmentos */
  const segments = cookieHeader.split(';');
  /* Itera sobre os segmentos */
  for (const segment of segments) {
    /* Remove espacos em branco */
    const trimmed = segment.trim();
    /* Encontra o indice do igual */
    const eq = trimmed.indexOf('=');
    /* Se nao encontrar o igual, continua */
    if (eq === -1) {
      continue;
    }
    /* Obtem a chave */
    const key = trimmed.slice(0, eq).trim();
    /* Se a chave nao for o nome do cookie, continua */
    if (key !== name) {
      continue;
    }
    /* Obtem o valor do cookie */
    const raw = trimmed.slice(eq + 1).trim();
    /* Decodifica o valor do cookie */
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw.length > 0 ? raw : null;
    }
  }
  return null;
}
