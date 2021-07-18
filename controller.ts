import { Request, Response } from "express";
import { Spend, TransactionWithTime } from "./types";
import {
  SetBalance,
  GetBalances,
  ValidateTransaction,
  GetTotalBalance,
} from "./helpers";
import Heap from "heap";

//This is functioning as a min-heap, earliest timestamp will always be the first item on the heap.
let heap = new Heap((a: TransactionWithTime, b: TransactionWithTime) => {
  return a.timestamp > b.timestamp ? 1 : -1;
});

const AddTransaction = async (req: Request, res: Response) => {
  try {
    let transaction = req.body as TransactionWithTime;

    try {
      ValidateTransaction(transaction);
    } catch (error) {
      return res.status(400).json({
        message: "Please correct request body.",
        error: error,
      });
    }

    PushTransaction(transaction);

    return res.status(200).json({
      message: "Transaction added successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error has occurred.",
      error: error,
    });
  }
};

const SpendPoints = async (req: Request, res: Response) => {
  let { points } = req.body as Spend;
  let spentTransactions = new Map<string, number>();

  if (points < 0) {
    return res
      .status(400)
      .json({
        message:
          "Points must be greater than zero.",
      });
  }
  else if (GetTotalBalance() < points) {
    return res
      .status(500)
      .json({
        message:
          "Not enough total points across all payers to cover this spend.",
      });
  }

  while (points > 0) {
    let earliestTransaction = heap.peek() as TransactionWithTime;

    if (earliestTransaction.points >= points) {
      spentTransactions.set(earliestTransaction.payer, points);

      const spentPoints = earliestTransaction.points - points;
      spentPoints > 0
        ? heap.replace({
            ...earliestTransaction,
            points: earliestTransaction.points - points,
          })
        : heap.pop();
      break;
    } else {
      points = points - earliestTransaction.points;

      const spentPointsForPayer =
        spentTransactions.get(earliestTransaction.payer) ?? 0;
      spentTransactions.set(
        earliestTransaction.payer,
        earliestTransaction.points + spentPointsForPayer
      );

      heap.pop();
    }
  }

  spentTransactions.forEach((value, key, map) => {
    SetBalance(key, value * -1);
    map.set(key, value * -1);
  });
  return res.status(200).json(Object.fromEntries(spentTransactions));
};

const ViewBalances = async (req: Request, res: Response) => {
  const currentBalances = GetBalances();

  if (Object.entries(currentBalances).length === 0)
    return res.status(200).json({
      message: "No balances on record.",
    });
  else return res.status(200).json(currentBalances);
};

const PushTransaction = (transaction: TransactionWithTime) => {
  SetBalance(transaction.payer, transaction.points);
  heap.push(transaction);
};

export { AddTransaction, SpendPoints, ViewBalances, PushTransaction, heap };
