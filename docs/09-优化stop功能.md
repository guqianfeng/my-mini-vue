# 优化 stop 功能

## 测试用例改写

```ts
it("stop", () => {
  let dummy;
  const obj = reactive({ prop: 1 });
  const runner = effect(() => {
    dummy = obj.prop;
  });
  obj.prop = 2;
  expect(dummy).toBe(2);
  stop(runner);
  // 此行改成obj.prop++，测试用例就过不了了
  // obj.prop = 3;
  obj.prop++;
  expect(dummy).toBe(2);

  // stopped effect should still be manually callable
  runner();
  expect(dummy).toBe(3);
});
```

在我们改好测试用例后，发现用例过不了了，原因是 obj.prop++会先触发 get，然后在触发 set，get 的时候又重新收集依赖了，所以 fn 还是会执行，如何解决这个问题，我们可以在收集依赖的时候做些小动作！

## 实现

使用 shouldTrack 标记位，控制是否收集依赖，在 run 方法中，需要开启收集依赖，fn 执行后，关闭收集依赖

```ts
// 全局变量 是否要收集依赖
let shouldTrack;

export const track = (target, key) => {
  if (!activeEffect) return;
  // 如果不需要收集则return
  if (!shouldTrack) return;
  ...
};

class ReactiveEffect {
  ...
  run() {
    if (!this.active) {
      // stop后再次执行runner
      return this._fn();
    }
    activeEffect = this;
    // fn执行时shouldTrack需要收集
    shouldTrack = true;
    const result = this._fn();
    // 执行后重置reset，不需要收集
    shouldTrack = false;
    return result;
  }
  ...
}

```

## 重构

```ts
// 2个条件封装成方法，代表是否正在收集依赖
export const isTracking = () => activeEffect !== undefined && shouldTrack;

export const track = (target, key) => {
  if (!isTracking()) return;
  ...
  // 如果dep中已经有effect了那就不用再添加了
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}
```
