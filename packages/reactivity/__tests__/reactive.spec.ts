import { isReactive, reactive } from "../src/reactive";

describe("reactive", () => {
  it("happy path", () => {
    const raw = { foo: 1 };
    const observed = reactive(raw);
    expect(observed).not.toBe(raw);
    expect(observed.foo).toBe(1);
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(raw)).toBe(false);
  });
});
