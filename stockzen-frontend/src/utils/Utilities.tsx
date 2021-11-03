export const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const percFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});
