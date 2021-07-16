import { server } from ".";
import supertest from "supertest";
import {
  SetBalance,
  GetBalances,
  ValidateTransaction,
  totalBalances,
} from "./helpers";
import { heap } from "./controller";

const requestWithSupertest = supertest(server);

beforeEach(() => {
  totalBalances.clear();
});

afterAll(() => {
  totalBalances.clear();
});

describe("User Endpoints", () => {
  describe("POST /addTransaction", () => {
    test("POST /addTransaction add single transaction should return success", async () => {
      let transactionPayload = {
        payer: "DANNON",
        points: 1000,
        timestamp: "2020-11-02T14:00:00Z",
      };

      let expectedResponse = {
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
      let transactionPayload = {
        payer: "DANNON",
        points: "1000",
        timestamp: "2020-11-02T14:00:00Z",
      };
      let expectedResponse = {
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
      let transactionPayload = {
        payer: "DANNON",
        points: 1000,
        timestamp: "2020-11-02T14",
      };
      let expectedResponse = {
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
      let transactionPayload = {
        payer: "DANNON",
        points: "1000",
        timestamp: "2020-11-02T14",
      };
      let expectedResponse = {
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
      heap.push({
        payer: "DANNON",
        points: 1000,
        timestamp: new Date("2020-11-02T14:00:00Z"),
      });
      SetBalance("DANNON", 1000);

      heap.push({
        payer: "UNILEVER",
        points: 200,
        timestamp: new Date("2020-10-31T11:00:00Z"),
      });
      SetBalance("UNILEVER", 200);

      heap.push({
        payer: "DANNON",
        points: -200,
        timestamp: new Date("2020-10-31T15:00:00Z"),
      });
      SetBalance("DANNON", -200);

      heap.push({
        payer: "MILLER COORS",
        points: 10000,
        timestamp: new Date("2020-11-01T14:00:00Z"),
      });
      SetBalance("MILLER COORS", 10000);

      heap.push({
        payer: "DANNON",
        points: 300,
        timestamp: new Date("2020-10-31T10:00:00Z"),
      });
      SetBalance("DANNON", 300);

      let transactionPayload = {
        points: 5000,
      };

      let expectedResponse = {
        DANNON: -1100,
        UNILEVER: -200,
        "MILLER COORS": -3700,
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

    //Need test for not enough points
  });

  describe("GET /viewBalances", () => {
    test("GET /viewBalances no balances should exist ", async () => {
      let expectedResponse = {
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
      let expectedResponse = {
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
