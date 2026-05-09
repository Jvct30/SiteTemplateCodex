const STORE_TIME_ZONE = "America/Sao_Paulo";

const parseApiDate = (value: string) => {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
  return new Date(hasTimezone ? normalized : `${normalized}Z`);
};

export const formatDateTime = (value: string) =>
  parseApiDate(value).toLocaleString("pt-BR", {
    timeZone: STORE_TIME_ZONE,
  });

export const formatDate = (value: string) =>
  parseApiDate(value).toLocaleDateString("pt-BR", {
    timeZone: STORE_TIME_ZONE,
  });
