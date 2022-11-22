# effect 中回调函数的处理

effect 是响应式的核心，我们先从 effect 开始学习(演示 effect)

## 编写单元测试

简单来说，effect 传入的 fn 会立即执行，所以我们最开始的单元测试如下

```ts
import { reactive } from "../reactive";

describe("effect", () => {
  it("base effect", () => {
    const user = reactive({ age: 10 });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);
  });
});
```

## 简单实现 effect

那我们最简单通过测试的方式就是直接运行该方法，虽然测试过了，但并不优雅

```ts
export const effect = (fn) => {
  fn();
};
```

## 面向对象方式实现

源码中使用面向对象的思想实现了 ReactiveEffect

```ts
class ReactiveEffect {
  constructor(public fn) {}
  run() {
    this.fn();
  }
}

export const effect = (fn) => {
  const effect_ = new ReactiveEffect(fn);
  effect_.run();
};
```

测试依然通过，那为什么要用面向对象的方式，随着我们后续的学习就会发现这个好处
