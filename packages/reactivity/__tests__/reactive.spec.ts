import { reactive } from "../src/reactive";

describe("reactive", () => {
  it("happy path", () => {
    const raw = { foo: 1 };
    const observed = reactive(raw);
    expect(observed).not.toBe(raw);
    expect(observed.foo).toBe(1);
  });
});
