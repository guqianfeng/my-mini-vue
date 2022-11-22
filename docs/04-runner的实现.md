# runner 的实现

每个 effect 函数返回 runner，runner 可以再次执行，执行意味着 fn 再次执行，并且 fn 的返回值即 runner 的返回值

## 编写单元测试

```ts
it("runner", () => {
  let foo = 1;
  const runner = effect(() => {
    foo++;
    return "haha";
  });
  expect(foo).toBe(2);
  const result = runner();
  expect(foo).toBe(3);
  expect(result).toBe("haha");
});
```

## 实现

```ts
class ReactiveEffect {
  constructor(public fn) {}
  run() {
    // run的时候，产生activeEffect
    activeEffect = this;
    // 需要把fn执行结果返回
    return this.fn();
  }
}

export const effect = (fn) => {
  const effect_ = new ReactiveEffect(fn);
  // bind是因为run方法中用到了this，this指的就是effetc实例
  const runner = effect_.run.bind(effect_);
  runner(); // 方法需要执行
  return runner; // 返回runner
};
```
