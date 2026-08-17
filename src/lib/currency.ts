const formatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

export function formatNaira(amount: number): string {
  return formatter.format(amount);
}
