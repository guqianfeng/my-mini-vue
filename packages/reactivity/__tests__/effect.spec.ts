import { effect } from "../src/effect";
import { reactive } from "../src/reactive";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({ age: 20 });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(21);
    user.age++;
    expect(nextAge).toBe(22);
  });
  it("runner", () => {
    const obj = { foo: 1 };
    const runner = effect(() => {
      obj.foo++;
      return "haha";
    });
    expect(obj.foo).toBe(2);
    // effect函数执行后 返回个函数，
    // 该函数执行后 会再次触发fn
    // 返回的结果就是fn的结果
    const r = runner();
    expect(obj.foo).toBe(3);
    expect(r).toBe("haha");
  });
});
