# track 和 trigger 的初步实现

这一节算是我们目前源码课的第一个难点，我们要实现一个真正的响应式

## 编写测试用例

当 user 的年龄增加时，会自动触发 effect 传入的 fn，此时 nextAge 就会再次赋值

```ts
import { effect } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("base effect", () => {
    const user = reactive({ age: 10 });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);

    // 以下代码为新增
    user.age++;
    expect(nextAge).toBe(12);
  });
});
```

## 实现

说到实现，我们可以先去看下[Vue3 响应式的进阶学习](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#how-reactivity-works-in-vue)，简单说要有**收集依赖**并且要有**触发依赖**的逻辑，并且有这样的对应关系

- effect 可以监听多个对象，每个对象(target)当成 key，targetMap 可以通过 target 找到对应的 depMap，需要考虑初始化的时候找不到需要处理下映射
- 监听的每个对象里有不同的属性，对象的每个属性(key)当成 key，depMap 可以通过 key 找到对应的 dep, 需要考虑初始化的时候找不到需要处理下映射
- dep 就是个 set 集合用来收集当前 effect 传入的 fn
- 当前激活的 fn，可以作为全局的 activeEffect 处理
- track 和 trigger 的实现在 effect 文件中实现，如果调用则在数据劫持 proxy 里处理(官方文档里也能看到)

```ts
// reactive.ts
import { track, trigger } from "./effect";

export const reactive = (raw) => {
  return new Proxy(raw, {
    get(target, key) {
      const res = Reflect.get(target, key);
      // 收集依赖
      track(target, key);
      return res;
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value);
      // 触发依赖
      trigger(target, key);
      return res;
    },
  });
};
```

```ts
// effect.ts
let activeEffect;
class ReactiveEffect {
  constructor(public fn) {}
  run() {
    // run的时候，产生activeEffect
    activeEffect = this;
    this.fn();
  }
}

export const effect = (fn) => {
  const effect_ = new ReactiveEffect(fn);
  effect_.run();
};

const targetMap = new Map();

// 收集依赖
export const track = (target, key) => {
  let depMap = targetMap.get(target);
  if (!depMap) {
    depMap = new Map();
    targetMap.set(target, depMap);
  }
  let dep = depMap.get(key);
  if (!dep) {
    dep = new Set();
    depMap.set(key, dep);
  }
  if (!activeEffect) return;
  dep.add(activeEffect);
};

// 触发依赖
export const trigger = (target, key) => {
  const depMap = targetMap.get(target);
  const dep = depMap.get(key);
  for (const effect of dep) {
    effect.run();
  }
};
```

## 调试

可以通过安装插件`Jest Runner`debug 调试下
