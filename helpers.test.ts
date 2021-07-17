import { SetBalance, GetBalances, totalBalances, GetTotalBalance, ValidateTransaction } from "./helpers";
import { TransactionWithTime } from "./types";

afterEach(() => {
  totalBalances.clear();
});

describe("SetBalance", () => {
  test("SetBalance with no existing payer", () => {
    SetBalance("testPayer", 2);

    expect(totalBalances.get("testPayer")).toBe(2);
  });

  test("SetBalance with existing payer", () => {
    totalBalances.set("testPayer", 1);

    SetBalance("testPayer", 2);

    expect(totalBalances.get("testPayer")).toBe(3);
  });
});

describe("GetBalances", () => {
  test("GetBalances with no payers", () => {
    expect(GetBalances()).toEqual({});
  });

  test("GetBalances multiple payers", () => {
    totalBalances.set("payer1", 1);
    totalBalances.set("payer2", 2);

    const expectedBalances = {
      payer1: 1,
      payer2: 2,
    };

    expect(GetBalances()).toEqual(expectedBalances);
  });
});

describe("GetTotalBalance", () => {
  test('GetTotalBalance no current balance should return 0', () => {
    expect(GetTotalBalance()).toEqual(0);
  });

  test('GetTotalBalance multiple payers should return result > 0', () => {
    SetBalance("PAYER1", 100);
    SetBalance("PAYER2", 500);

    expect(GetTotalBalance()).toEqual(600);
  });
});

describe("ValidateTransaction", () => {
  test('ValidateTransaction proper points and timestamp format no error should be thrown', () => {
    const transaction: any = {
      payer: "DANNON",
      points: 1000,
      timestamp: "2020-11-02T14:00:00Z",
    };

    expect(() => {
      ValidateTransaction(transaction);
    }).not.toThrow();
  });

  test('ValidateTransaction improper points format correct timestamp format error should throw', () => {
    const transaction: any = {
      payer: "DANNON",
      points: "asdf",
      timestamp: "2020-11-02T14:00:00Z",
    };

    expect(() => {
      ValidateTransaction(transaction);
    }).toThrow();
  });

  test('ValidateTransaction proper points format incorrect timestamp format error should throw', () => {
    const transaction: any = {
      payer: "DANNON",
      points: 100,
      timestamp: "2020-11-02",
    };

    expect(() => {
      ValidateTransaction(transaction);
    }).toThrow();
  });
  
});