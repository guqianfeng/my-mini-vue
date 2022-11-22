# isReactive 和 isReadonly 的实现

判断是否是 reactive 和 readonly

## 编写 isReactive 测试用例

```ts
it("happy path", () => {
  const raw = { foo: 1 };
  const observed = reactive(raw);
  expect(observed).not.toBe(raw);
  expect(observed.foo).toBe(1);
  // 判断对象是否是reactive对象
  expect(isReactive(observed)).toBe(true);
});
```

## 实现 isReactive

如何实现这个功能可以这样考虑，对象访问属性肯定是能触发 get 函数，所以我们的初步实现是这样的

```ts
// reactive.ts
export const isReactive = (value) => {
  return value["is_reactive"];
};

// baseHandlers
export const createGetter = (isReadonly = false) => {
  return function get(target, key) {
    if (key === "is_reactive") {
      // 如果key值有is_reactive
      return !isReadonly;
    }
    const res = Reflect.get(target, key);
    if (!isReadonly) {
      // 依赖收集
      track(target, key);
    }
    return res;
  };
};
```

然后发现我们测试通过了，我们在进一步写个测试用例

```ts
// reactive.spec
expect(isReactive(raw)).toBe(false);
```

此时发现测试就没通过，原因是原始对象的点操作，不会触发 get，并且返回的是 undefined，所以我们可以对我们的方法进行这么处理(加 2 个感叹号)

```ts
export const isReactive = (value) => {
  return !!value["is_reactive"];
};
```

此时我们可以再重构下，创建个枚举类型，并替换下我们的字符串`is_reactive`，那我们的 isReactive 就实现了

```ts
export const enum ReactiveFlag {
  IS_REACTIVE = "__v_isReactive",
}
```

## 编写 isReadonly 测试用例

```ts
expect(isReadonly(wrapped)).toBe(true);
expect(isReadonly(original)).toBe(false);
```

## 实现 isReadonly

有了前面的实现经历，readonly 实现就是洒洒水

```ts
// reactive.ts
export const enum ReactiveFlag {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}
export const isReadonly = (value) => {
  return !!value[ReactiveFlag.IS_READONLY];
};

// baseHandlers.ts
if (key === ReactiveFlag.IS_REACTIVE) {
  return !isReadonly;
} else if (key === ReactiveFlag.IS_READONLY) {
  return isReadonly;
}
```
