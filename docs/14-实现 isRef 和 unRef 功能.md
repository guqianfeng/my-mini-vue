# 实现 isRef 和 unRef 功能

## isRef 测试用例

判断是否是 ref 对象

```ts
it("isRef", () => {
  const a = ref(1);
  const b = 1;
  const c = reactive({ c: "test" });
  expect(isRef(a)).toBe(true);
  expect(isRef(b)).toBe(false);
  expect(isRef(c)).toBe(false);
});
```

## 实现 isRef

给实例定义属性，默认为 true 即可，然后编写函数，返回该属性

```ts
// 类中定义的属性就这么写
// public __v_isRef = true;

export const isRef = (ref) => {
  return !!ref.__v_isRef;
};
```

## unRef 测试用例

unRef 的作用就是获取 ref 对象的 value 属性，如果不是 ref 对象则直接返回

```ts

```
