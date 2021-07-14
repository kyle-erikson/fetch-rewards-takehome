let totalBalances = new Map<string, number>();

export const SetBalance = (payer: string, points: number) => {
  const currentBalanceForPayer = totalBalances.get(payer) ?? 0;
  totalBalances.set(payer, currentBalanceForPayer + points)
}

export const GetBalances = () => {
  return Object.fromEntries(totalBalances);
}