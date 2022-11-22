# scheduler 的实现

这次的 scheduler 感觉非常的陌生，我们可以先拷贝源码中的 effect 里的 scheduler 单元测试来了解他是干嘛用的

## 单元测试

```ts
it("scheduler", () => {
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
```

从测试中发现，scheduler 是 effect 函数的第二个参数对象中的一个属性，同时他也是个方法，effect 一开始就会执行 fn，然后响应式，监听数据变化后会再次触发，如果用 scheduler，第一次不会触发，之后才会触发，但手动执行 run，fn 还是会执行

## 实现

```ts
class ReactiveEffect {
  // scheduler可不传
  constructor(public fn, public scheduler?) {}
  ...
}

export const effect = (fn, options: any = {}) => {
  // options可传可不传，默认给个空对象
  const scheduler = options.scheduler;
  const effect_ = new ReactiveEffect(fn, scheduler);
  ...
};


...

// 触发依赖
export const trigger = (target, key) => {
  const depMap = targetMap.get(target);
  const dep = depMap.get(key);
  for (const effect of dep) {
    // 有scheduler执行scheduler，否则执行run
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
};
```
