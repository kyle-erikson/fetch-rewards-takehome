import { TransactionWithTime } from "./types";

let totalBalances = new Map<string, number>();

const SetBalance = (payer: string, points: number) => {
  const currentBalanceForPayer = totalBalances.get(payer) ?? 0;
  totalBalances.set(payer, currentBalanceForPayer + points);
};

const GetBalances = () => {
  return Object.fromEntries(totalBalances);
};

const GetTotalBalance = () => {
  let sum = 0;
  totalBalances.forEach((v) => {
    sum += v;
  });
  return sum;
};

const ValidateTransaction = (transaction: TransactionWithTime) => {
  let valiationErrors: string[] = [];

  if (typeof transaction.points !== "number")
    valiationErrors.push(
      `Points value: '${transaction.points}' needs to be a number.`
    );

  const iso8061Regex = new RegExp(
    "^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)$"
  );

  if (!transaction.timestamp.toString().match(iso8061Regex))
    valiationErrors.push(
      `Timestamp: '${transaction.timestamp}' does not match a valid ISO-8061 DateTime string with Timezone designator.`
    );

  if (valiationErrors.length > 0) throw valiationErrors;
};

export {
  totalBalances,
  SetBalance,
  GetBalances,
  GetTotalBalance,
  ValidateTransaction,
};
