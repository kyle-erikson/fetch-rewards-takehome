import {Request, Response } from "express";
import {Spend, TransactionWithTime} from "./types";
import { GetBalances, SetBalance } from "./helpers";
import Heap from "heap";

//This is functioning as a min-heap, earliest timestamp will always be the first item on the heap.
let heap = new Heap((a: TransactionWithTime,b: TransactionWithTime) => {
  return a.timestamp > b.timestamp ? 1 : -1;
});

const AddTransaction = async (req: Request, res: Response) => {
  try {
    let newTransactionPayload: TransactionWithTime[] = [];
    Array.isArray(req.body) ? newTransactionPayload = req.body : newTransactionPayload.push(req.body as TransactionWithTime)

    newTransactionPayload.forEach(transaction => {
      SetBalance(transaction.payer, transaction.points);
      heap.push(transaction);  
    });

    return res.status(200).send("Transaction added successfully!")
  } catch (error) {
    return res.status(500).render("An error has occurred.", error)
  }
  
};

const SpendPoints = async (req: Request, res: Response) => {
  let {points} = req.body as Spend;
  let spentTransactions = new Map<string, number>();

  while (points > 0) {    
    let earliestTransaction = heap.peek() as TransactionWithTime;

    if (earliestTransaction.points >= points) {
      spentTransactions.set(earliestTransaction.payer, points);
      
      const spentPoints = earliestTransaction.points - points;
      spentPoints > 0 ? heap.replace({...earliestTransaction, points: earliestTransaction.points - points}) : heap.pop();
      break;
    } else if (earliestTransaction.points < points) {
      points = points - earliestTransaction.points;
  
      const spentPointsForPayer = spentTransactions.get(earliestTransaction.payer) ?? 0;
      spentTransactions.set(earliestTransaction.payer, earliestTransaction.points + spentPointsForPayer)
  
      heap.pop();
    } else {
      return res.status(500).send("Not enough points to cover this spend.");
    }
  }
  
  spentTransactions.forEach((value, key, map) => {
    SetBalance(key, value * -1);
    map.set(key, value * -1)
  });
  return res.status(200).json(Object.fromEntries(spentTransactions));
};

const ViewBalances = async (req: Request, res: Response) => {
  return res.status(200).json(GetBalances());
};

export {AddTransaction, SpendPoints, ViewBalances}; 