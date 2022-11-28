# readonly 的实现

readonly 实现上与 reactive 很接近，就是只读属性，所以不需要收集依赖等操作

## 编写测试用例

新建文件`readonly.spec.ts`, 只读，顾名思义，就是只能读(get)，不能改(set)

```ts
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
  });
});
```

## 初步实现

初步实现，其实就是 reactive 的阉割版

```ts
export const readonly = (raw) => {
  return new Proxy(raw, {
    get(target, key) {
      const res = Reflect.get(target, key);
      return res;
    },
    set(target, key, value) {
      return true;
    },
  });
};
```

## 重构代码 createGetter

有重复的代码，构建 createGetter 高阶函数，通过传入参数是否可读，来判断是否收集依赖

```ts
import { track, trigger } from "./effect";

export const createGetter = (isReadonly = false) => {
  return function get(target, key) {
    const res = Reflect.get(target, key);
    if (!isReadonly) {
      // 依赖收集
      track(target, key);
    }
    return res;
  };
};

export const reactive = (raw) => {
  return new Proxy(raw, {
    get: createGetter(),
    set(target, key, value) {
      const res = Reflect.set(target, key, value);
      // 触发依赖
      trigger(target, key);
      return res;
    },
  });
};

export const readonly = (raw) => {
  return new Proxy(raw, {
    get: createGetter(true),
    set(target, key, value) {
      return true;
    },
  });
};
```

## createSetter 的处理

为了保持代码的一致性，封装 createSetter 函数，readonly 的实现不需要动，之后给出提示即可

```ts
export const createSetter = () => {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    // 触发依赖
    trigger(target, key);
    return res;
  };
};

export const reactive = (raw) => {
  return new Proxy(raw, {
    get: createGetter(),
    set: createSetter(),
  });
};
```

## 抽离 baseHandlers 文件

将 Proxy 第二个参数抽离到一个独立的文件 baseHandlers 中

```ts
// baseHandlers
import { track, trigger } from "./effect";

export const createGetter = (isReadonly = false) => {
  return function get(target, key) {
    const res = Reflect.get(target, key);
    if (!isReadonly) {
      // 依赖收集
      track(target, key);
    }
    return res;
  };
};

export const createSetter = () => {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    // 触发依赖
    trigger(target, key);
    return res;
  };
};

export const mutableHandlers = {
  get: createGetter(),
  set: createSetter(),
};

export const readonlyHandlers = {
  get: createGetter(true),
  set(target, key, value) {
    return true;
  },
};
```

```ts
// reactive.ts
import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

export const reactive = (raw) => {
  return new Proxy(raw, mutableHandlers);
};

export const readonly = (raw) => {
  return new Proxy(raw, readonlyHandlers);
};
```

## reactive 和 readonly 再次重构封装

发现这两者都返回了 Proxy 实例，只是参数略微不同，单独抽离出一个公共的方法

```ts
import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

export const reactive = (raw) => {
  return createReactiveObject(raw, mutableHandlers);
};

export const readonly = (raw) => {
  return createReactiveObject(raw, readonlyHandlers);
};

function createReactiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}
```

## createGetter 的问题

每次创建 handlers 都需要执行 createGetter 方法，其实没有必要，可以再一开始就执行好函数

```ts
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    return true;
  },
};
```

## readonly 调用 set 需要有警告信息

先编写单元测试

```ts
it("when call set should warn", () => {
  // 模拟打印警告信息
  console.warn = jest.fn();
  const user = readonly({ age: 10 });
  user.age++;
  // 希望有警告信息
  expect(console.warn).toBeCalled();
});
```

实现警告提示(在 set 的时候 console.warn 即可)
