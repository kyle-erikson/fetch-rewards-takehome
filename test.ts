import { server } from ".";
import supertest from "supertest";
import {
  SetBalance,
  GetBalances,
  ValidateTransaction,
  totalBalances,
} from "./helpers";
import { heap, PushTransaction } from "./controller";

const requestWithSupertest = supertest(server);

beforeEach(() => {
  totalBalances.clear();
  emptyTheHeap();
});

afterAll(() => {
  totalBalances.clear();
});

describe("User Endpoints", () => {
  describe("POST /addTransaction", () => {
    test("POST /addTransaction add single transaction should return success", async () => {
      const transactionPayload = {
        payer: "DANNON",
        points: 1000,
        timestamp: "2020-11-02T14:00:00Z",
      };

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
    });

    test("POST /addTransaction add malformed transaction points invalid should return error", async () => {
      const transactionPayload = {
        payer: "DANNON",
        points: "1000",
        timestamp: "2020-11-02T14:00:00Z",
      };
      const expectedResponse = {
        message: "Please correct request body.",
        error: ["Points value: '1000' needs to be a number."],
      };

      const res = await requestWithSupertest
        .post("/addTransaction")
        .send(transactionPayload)
        .set("Accept", "application/json");

      expect(res.status).toEqual(400);
      expect(res.headers["content-type"]).toEqual(
        "application/json; charset=utf-8"
      );
      expect(res.body).toEqual(expectedResponse);
    });

    test("POST /addTransaction add malformed transaction timestamp invalid should return error", async () => {
      const transactionPayload = {
        payer: "DANNON",
        points: 1000,
        timestamp: "2020-11-02T14",
      };
      const expectedResponse = {
        message: "Please correct request body.",
        error: [
          "Timestamp: '2020-11-02T14' does not match a valid ISO-8061 DateTime string with Timezone designator.",
        ],
      };

      const res = await requestWithSupertest
        .post("/addTransaction")
        .send(transactionPayload)
        .set("Accept", "application/json");

      expect(res.status).toEqual(400);
      expect(res.headers["content-type"]).toEqual(
        "application/json; charset=utf-8"
      );
      expect(res.body).toEqual(expectedResponse);
    });

    test("POST /addTransaction add malformed transaction points and timestamp invalid should return error", async () => {
      const transactionPayload = {
        payer: "DANNON",
        points: "1000",
        timestamp: "2020-11-02T14",
      };
      const expectedResponse = {
        message: "Please correct request body.",
        error: [
          "Points value: '1000' needs to be a number.",
          "Timestamp: '2020-11-02T14' does not match a valid ISO-8061 DateTime string with Timezone designator.",
        ],
      };

      const res = await requestWithSupertest
        .post("/addTransaction")
        .send(transactionPayload)
        .set("Accept", "application/json");

      expect(res.status).toEqual(400);
      expect(res.headers["content-type"]).toEqual(
        "application/json; charset=utf-8"
      );
      expect(res.body).toEqual(expectedResponse);
    });
  });

  describe("POST /spendPoints", () => {
    test("POST /spendPoints spend 5000 points should return accounts that paid", async () => {
      PushTransaction({
        payer: "DANNON",
        points: 1000,
        timestamp: new Date("2020-11-02T14:00:00Z"),
      });
      PushTransaction({
        payer: "UNILEVER",
        points: 200,
        timestamp: new Date("2020-10-31T11:00:00Z"),
      });
      PushTransaction({
        payer: "DANNON",
        points: -200,
        timestamp: new Date("2020-10-31T15:00:00Z"),
      });
      PushTransaction({
        payer: "MILLER COORS",
        points: 10000,
        timestamp: new Date("2020-11-01T14:00:00Z"),
      });
      PushTransaction({
        payer: "DANNON",
        points: 300,
        timestamp: new Date("2020-10-31T10:00:00Z"),
      });

      const transactionPayload = {
        points: 5000,
      };

      const expectedResponse = {
        DANNON: -100,
        UNILEVER: -200,
        "MILLER COORS": -4700,
      };

      const res = await requestWithSupertest
        .post("/spendPoints")
        .send(transactionPayload)
        .set("Accept", "application/json");

      expect(res.status).toEqual(200);
      expect(res.headers["content-type"]).toEqual(
        "application/json; charset=utf-8"
      );
      expect(res.body).toEqual(expectedResponse);
    });

    test("POST /spendPoints not enough points to cover transaction should return error", async () => {
      const transactionPayload = {
        points: 5000,
      };

      const expectedResponse = {
        message:
          "Not enough total points across all payers to cover this spend."
      };

      const res = await requestWithSupertest
        .post("/spendPoints")
        .send(transactionPayload)
        .set("Accept", "application/json");

      expect(res.status).toEqual(500);
      expect(res.headers["content-type"]).toEqual(
        "application/json; charset=utf-8"
      );
      expect(res.body).toEqual(expectedResponse);
    });
  });

  describe("GET /viewBalances", () => {
    test("GET /viewBalances no balances should exist ", async () => {
      const expectedResponse = {
        message: "No balances on record.",
      };

      const res = await requestWithSupertest.get("/viewBalances");

      expect(res.status).toEqual(200);
      expect(res.headers["content-type"]).toEqual(
        "application/json; charset=utf-8"
      );
      expect(res.body).toEqual(expectedResponse);
    });

    test("GET /viewBalances should return current balances in json ", async () => {
      const expectedResponse = {
        DANNON: 1000,
        UNILEVER: 0,
        "MILLER COORS": 5300,
      };

      SetBalance("DANNON", 1000);
      SetBalance("UNILEVER", 0);
      SetBalance("MILLER COORS", 5300);

      const res = await requestWithSupertest.get("/viewBalances");

      expect(res.status).toEqual(200);
      expect(res.headers["content-type"]).toEqual(
        "application/json; charset=utf-8"
      );
      expect(res.body).toEqual(expectedResponse);
    });
  });
});

const emptyTheHeap = () => {
  while (!heap.empty()) {
    heap.pop();
  }
};