export const formatBRL = (n: number | string) => {
  const val = typeof n === "string" ? Number(n) : n;
  if (isNaN(val as number)) return String(n);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val as number);
};
