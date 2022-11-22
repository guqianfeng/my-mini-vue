# reactive 初步实现

## 编写测试用例

一个最基础的 reactive 的测试用例

```ts
describe("reactivity/reactive", () => {
  it("reactive", () => {
    const obj = { foo: 1 };
    const observed = reactive(obj);
    expect(observed).not.toBe(obj);
    expect(observed.foo).toBe(1);
  });
});
```

## 基本实现 reactive

上面的测试用例明显有报错，接下去解决这个报错，我们知道响应式原理用到了 Proxy，所以我们先简单实现它

```ts
export const reactive = (raw) => {
  return new Proxy(raw, {
    get(target, key) {
      const res = Reflect.get(target, key);
      return res;
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value);
      return res;
    },
  });
};
```

在目前的对象没有嵌套对象例子中，Reflect 做的处理返回的是个布尔值，能代表操作是否成功，后续对象里嵌套对象，res 可能返回布尔值也有可能返回对象
