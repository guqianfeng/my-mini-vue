# 实现 proxyRefs 功能

## 测试用例

proxyRefs 的使用场景其实就是我们 template 中的自动解套，不需要在`.value`

```ts
it("proxyRefs", () => {
  const user = {
    name: "zhangsan",
    age: ref(10),
  };
  const proxyUser = proxyRefs(user);
  expect(user.age.value).toBe(10);
  expect(proxyUser.age).toBe(10);
  expect(proxyUser.name).toBe("zhangsan");

  // proxyUser.age = 20;
  // expect(proxyUser.age).toBe(20);
  // expect(user.age.value).toBe(20);

  // proxyUser.age = ref(18);
  // expect(proxyUser.age).toBe(18);
  // expect(user.age.value).toBe(18);
});
```

## 实现

先实现 get 的操作，本质为 ref 对象返回他的 value，其他直接返回，所以可以这么操作

```ts
export const proxyRefs = (objectWithRefs) => {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
  });
};
```

在实现 set 操作，主要看之前的值是不是一个 ref 对象且赋值的是不是一个非 ref 对象，满足此条件需要带上`.value`

```ts
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        target[key].value = value;
        return true;
      } else {
        return Reflect.set(target, key, value);
      }
    },
```
