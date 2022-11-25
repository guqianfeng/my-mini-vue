# 实现 isProxy

isProxy 本质判断的是否为 reactive 对象或是 readonly 对象

## 编写测试用例

分别在`reactive`和`readonly`测试用例中添加 isProxy 的测试

```ts
expect(isProxy(xxx)).toBe(true);
```

## 实现

```ts
export const isProxy = (value) => {
  return isReactive(value) || isReadonly(value);
};
```
