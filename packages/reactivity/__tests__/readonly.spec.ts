import { isProxy, isReadonly, readonly } from "../src/reactive";

describe("readonly", () => {
  it("readonly", () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    // get
    expect(wrapped.foo).toBe(1);
    // has
    expect("foo" in wrapped).toBe(true);
    // ownKeys
    expect(Object.keys(wrapped)).toEqual(["foo", "bar"]);
    expect(isReadonly(wrapped)).toBe(true);
    expect(isReadonly(original)).toBe(false);
    expect(isReadonly(wrapped.bar)).toBe(true);
    expect(isReadonly(original.bar)).toBe(false);
    expect(isProxy(wrapped)).toBe(true);
  });
  it("when call set should warn", () => {
    // 模拟打印警告信息
    console.warn = jest.fn();
    const user = readonly({ age: 10 });
    user.age++;
    // 希望有警告信息
    expect(console.warn).toBeCalled();
  });
});
