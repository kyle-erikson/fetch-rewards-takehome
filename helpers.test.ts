import { SetBalance, GetBalances, totalBalances } from "./helpers";

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

  //Need to handle max number points for overflow
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
