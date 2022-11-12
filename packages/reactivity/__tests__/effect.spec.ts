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
    // 该函数执行后 会再次触发fn（effect的第一个参数）
    // 返回的结果就是fn的结果
    const r = runner();
    expect(obj.foo).toBe(3);
    expect(r).toBe("haha");
  });

  it("scheduler", () => {
    // effect第二个参数 options
    // scheduler 如果配置了，在依赖性发生变化后，执行scheduler
    // 执行runner还是触发effect的第一个参数fn函数
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // should not run yet
    expect(dummy).toBe(1);
    // manually run
    run();
    // should have run
    expect(dummy).toBe(2);
  });
});
