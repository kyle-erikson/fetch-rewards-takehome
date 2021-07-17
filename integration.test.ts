import { server } from ".";
import supertest from "supertest";
import {
  SetBalance,
  GetBalances,
  ValidateTransaction,
  totalBalances,
} from "./helpers";
import { heap } from "./controller";
import { Transaction, TransactionWithTime } from "./types";

const requestWithSupertest = supertest(server);

interface TransactionPayload extends Transaction {
  timestamp: string;
}

beforeAll(() => {
  totalBalances.clear();
  heap.empty();
})

describe("Full Integration Test", () => {
  test("Testing given example from points.pdf given example input should return correct balances at the end", async () => {
    //Add transactions with correct payer, points, and timestamp given in points.pdf
    await addTransaction({ "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" });
    await addTransaction({ "payer": "UNILEVER", "points": 200, "timestamp": "2020-10-31T11:00:00Z" });
    await addTransaction({ "payer": "DANNON", "points": -200, "timestamp": "2020-10-31T15:00:00Z" });
    await addTransaction({ "payer": "MILLER COORS", "points": 10000, "timestamp": "2020-11-01T14:00:00Z" });
    await addTransaction({ "payer": "DANNON", "points": 300, "timestamp": "2020-10-31T10:00:00Z" });

    //Spend 5000 pts, verify expected balances per points.pdf
    const spendPointsPayload = {
      points: 5000,
    };

    const pointsSpentByPayer = {
      DANNON: -100,
      UNILEVER: -200,
      "MILLER COORS": -4700,
    };

    const spendPointsResponse = await requestWithSupertest
      .post("/spendPoints")
      .send(spendPointsPayload)
      .set("Accept", "application/json");

    expect(spendPointsResponse.status).toEqual(200);
    expect(spendPointsResponse.headers["content-type"]).toEqual(
      "application/json; charset=utf-8"
    );
    expect(spendPointsResponse.body).toEqual(pointsSpentByPayer);

    const expectedBalancesPostSpend = {
      DANNON: 1000,
      UNILEVER: 0,
      "MILLER COORS": 5300,
    };

    //Verify correct balances for each payer based on points.pdf
    const viewBalancesResponse = await requestWithSupertest.get("/viewBalances");

    expect(viewBalancesResponse.status).toEqual(200);
    expect(viewBalancesResponse.headers["content-type"]).toEqual(
      "application/json; charset=utf-8"
    );
    expect(viewBalancesResponse.body).toEqual(expectedBalancesPostSpend);
  });
});

const addTransaction = async (transactionPayload: TransactionPayload) => {
  const expectedResponse = {
    message: "Transaction added successfully.",
  };

  const res = await requestWithSupertest
  .post("/addTransaction")
  .send(transactionPayload)
  .set("Accept", "application/json");

  expect(res.status).toEqual(200);
  expect(res.headers["content-type"]).toEqual(
    "application/json; charset=utf-8"
  );
  expect(res.body).toEqual(expectedResponse);
}