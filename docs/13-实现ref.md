# 实现 ref

## 测试用例

新建`ref.spec.ts`

### 测试用例一

```ts
it("happy path", () => {
  const age = ref(10);
  expect(age.value).toBe(10);
});
```

### 测试用例一实现

还是比较容易的，这里用面向对象，get/set 操作，因为 set 用例还没写，先完成 get 的实现

```ts
class RefImpl {
  private _value;
  constructor(value) {
    this._value = value;
  }
  get value() {
    return this._value;
  }
}
export const ref = (value) => {
  return new RefImpl(value);
};
```

### 测试用例二

复制 vue3 源码的测试用例

```ts
it("should be reactive", () => {
  const a = ref(1);
  let dummy;
  let calls = 0;
  effect(() => {
    calls++;
    dummy = a.value;
  });
  // effect一开始的fn就会执行所以都是1
  expect(calls).toBe(1);
  expect(dummy).toBe(1);
  a.value = 2;
  // 因为响应式，fn再次触发，所以都改成了2
  expect(calls).toBe(2);
  expect(dummy).toBe(2);
  // 边缘case实现好上面后解开在接着实现
  // same value should not trigger
  //   a.value = 2;
  //   // 一样的值没有触发所以calls还是2
  //   expect(calls).toBe(2);
});
```

### 实现测试用例二

收集依赖触发依赖考虑到复用，所以我们先重构下 effect 的代码

```ts
export const track = (target, key) => {
  if (!isTracking()) return;
  // targetMap => target => depsMap
  // depsMap => key => dep
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep: Set<any> = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  trackEffects(dep);
};
export function trackEffects(dep) {
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}
export const trigger = (target, key) => {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  triggerEffects(dep);
};
export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}
```

然后在 ref 实现中，get/set，收集依赖，触发依赖

```ts
import { isTracking, trackEffects, triggerEffects } from "./effect";

class RefImpl {
  private _value;
  // 依赖
  public dep;
  constructor(value) {
    this._value = value;
    this.dep = new Set();
  }
  get value() {
    if (isTracking()) {
      // 一定要在可收集依赖的条件下再去收集
      trackEffects(this.dep);
    }
    return this._value;
  }
  set value(newValue) {
    // 此行if是在测试用例通过后，完成边缘case
    if (Object.is(newValue, this._value)) return;
    this._value = newValue;
    // 在设置值以后再去触发effects
    triggerEffects(this.dep);
  }
}
export const ref = (value) => {
  return new RefImpl(value);
};
```

### 实现测试用例二后的重构

判断是否改变可以抽离方法

```ts
// shared/index.ts
export const hasChanged = (value, oldValue) => {
  // 别忘记这里是取反的判断2个值是否相当，我们的函数名为是否改变了
  return !Object.is(value, oldValue);
};

// ref.ts RefImp中set方法
  set value(newValue) {
    if (hasChanged(newValue, this._value)) {
      this._value = newValue;
      triggerEffects(this.dep);
    }
  }
```

track 这里的逻辑可以再抽出方法

```ts
// ref.ts
function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}

// RefImp的get方法
  get value() {
    trackRefValue(this);
    return this._value;
  }
```

### 测试用例三

ref 还可以接收对象

```ts
it("should make nested properties reactive", () => {
  const a = ref({
    count: 1,
  });
  let dummy;
  effect(() => {
    dummy = a.value.count;
  });
  expect(dummy).toBe(1);
  a.value.count = 2;
  expect(dummy).toBe(2);
});
```

### 实现测试用例三

当传入的值是对象的时候，我们用 reactive 包裹

```ts
class RefImpl {
  private _value;
  // 比较值的时候用原始值比较，否则对象的话是被包了一层reactive的
  private _rawValue;
  public dep;
  constructor(value) {
    this._rawValue = value;
    this._value = isObject(value) ? reactive(value) : value;
    this.dep = new Set();
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      // 有变化的时候 原始值需要重新赋值
      this._rawValue = newValue;
      // _value的操作一样 判断是否是对象
      this._value = isObject(newValue) ? reactive(newValue) : newValue;
      triggerEffects(this.dep);
    }
  }
}
```

### 实现测试用例三后的重构

发现有重复的代码，就是判断是否为对象，如果是则用 reactive，可以抽离逻辑

```ts
export const convert = (value) => {
  return isObject(value) ? reactive(value) : value;
};
```
