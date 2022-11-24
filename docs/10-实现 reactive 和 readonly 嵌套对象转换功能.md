# 实现 reactive 和 readonly 嵌套对象转换功能

## reactive 测试用例

实现嵌套的对象， 测试用例直接用 vue3 源码的测试用例

```ts
test("nested reactives", () => {
  const original = {
    nested: {
      foo: 1,
    },
    array: [{ bar: 2 }],
  };
  const observed = reactive(original);
  expect(isReactive(observed.nested)).toBe(true);
  expect(isReactive(observed.array)).toBe(true);
  expect(isReactive(observed.array[0])).toBe(true);
});
```

测试用例没通过，其实是因为我们之前的 get 处理，没有考虑嵌套的逻辑，嵌套的逻辑实际上只要递归就可以了

## 实现 reactive 嵌套

```ts
export const createGetter = (isReadonly = false) => {
  return function get(target, key) {
    ...
    // res可能是基本数据类型，也有可能是个对象
    const res = Reflect.get(target, key);

    if (isObject(res)) {
      return reactive(res);
    }

    ...
  };
};

// shared/index.ts
export const isObject = (val) => {
  return val !== null && typeof val === "object";
};
```

## readonly 测试用例

```ts
it("readonly", () => {
  const original = { foo: 1, bar: { baz: 2 } };
  const wrapped = readonly(original);
  // get
  expect(wrapped.foo).toBe(1);
  // has
  expect("foo" in wrapped).toBe(true);
  // ownKeys
  expect(Object.keys(wrapped)).toEqual(["foo", "bar"]);
  expect(isReadonly(wrapped)).toBe(true);
  expect(isReadonly(original)).toBe(false);
  // 以下两行新增
  expect(isReadonly(wrapped.bar)).toBe(true);
  expect(isReadonly(original.bar)).toBe(false);
});
```

## 实现 readonly 嵌套

其实在前面的递归逻辑用上三目运算就可以了

```ts
if (isObject(res)) {
  return isReadonly ? readonly(res) : reactive(res);
}
```
