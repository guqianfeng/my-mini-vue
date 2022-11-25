import { isReadonly, shallowReadonly } from "./../src/reactive";
describe("reactivity/shallowReadonly", () => {
  it("should not make non-reactive properties reactive", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props.n)).toBe(false);
  });

  it("set will warn", () => {
    console.warn = jest.fn();
    const obj = shallowReadonly({ haha: "haha" });
    obj.haha = "heihei";
    expect(console.warn).toBeCalled();
  });
});
