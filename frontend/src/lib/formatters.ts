export const toCurrencyNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const formatMoney = (value: unknown) =>
  toCurrencyNumber(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
