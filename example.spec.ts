import * as Option from "fp-ts/lib/option";

describe("fp-ts", () => {
  describe("Option", () => {
    it("maps over the value", () => {
      expect(Option.map((x: number) => x + 1)(Option.some(1))).toEqual(
        Option.some(2)
      );
    });
  });
});
