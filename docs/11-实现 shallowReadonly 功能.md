# 实现 shallowReadonly 功能

## 测试用例

新建文件`shallowReadonly.spec.ts`，简单来说就是第一层是 readonly，里面嵌套的结果不是 readyonly

```ts
describe("reactivity/shallowReadonly", () => {
  test("should not make non-reactive properties reactive", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props.n)).toBe(false);
  });
});
```

## 实现

先搭个最简单的架子，发现我们需要实现 shallowReadonlyHandlers

```ts
export const shallowReadonly = (raw) => {
  return createReactiveObject(raw, shallowReadonlyHandlers);
};
```

紧接着，在 baseHandlers 文件中处理逻辑

```ts

// 新增参数shallow，默认值false
export const createGetter = (isReadonly = false, shallow = false) => {
  return function get(target, key) {
    if (key === ReactiveFlag.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlag.IS_READONLY) {
      return isReadonly;
    }
    // res可能是基本数据类型，也有可能是个对象
    const res = Reflect.get(target, key);

    // 如果是shallow直接返回
    if (shallow) {
      return res;
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    if (!isReadonly) {
      // 依赖收集
      track(target, key);
    }
    return res;
  };
};

const shallowReadonlyGet = createGetter(true, true);
...
// 和readonlyHandlers的get不同，所以可以这么处理
export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
```

## 完善测试用例

可以添加警告的测试，因为 shallowReadonly 不能 set
