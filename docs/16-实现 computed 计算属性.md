# 实现 computed 计算属性

## 基础测试用例

新建文件`computed.spec.ts`，我们先不考虑缓存的特性(之后会实现)，先写个最简单的用例，用法上和 ref 有点像，也是通过.value 去访问值

```ts
describe("reactivity/computed", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });
    const nextAge = computed(() => user.age + 1);
    expect(nextAge.value).toBe(11);
  });
});
```

## 实现雏形（不考虑缓存）

新建 computed.ts 文件

```ts
class ComputedRefImpl {
  private _getter;
  constructor(getter) {
    this._getter = getter;
  }
  get value() {
    // 返回的值就是执行该函数
    return this._getter();
  }
}
export const computed = (getter) => {
  return new ComputedRefImpl(getter);
};
```

## 缓存的测试用例

根据源码的测试用例处理

```ts
it("should compute lazily", () => {
  const value = reactive<{ foo?: number }>({});
  const getter = jest.fn(() => value.foo);
  const cValue = computed(getter);

  // lazy
  // cValue.value不调用，getter不会执行
  expect(getter).not.toHaveBeenCalled();

  expect(cValue.value).toBe(undefined);
  expect(getter).toHaveBeenCalledTimes(1);

  // should not compute again
  cValue.value;
  expect(getter).toHaveBeenCalledTimes(1);

  // should not compute until needed
  value.foo = 1;
  expect(getter).toHaveBeenCalledTimes(1);

  // now it should compute
  expect(cValue.value).toBe(1);
  expect(getter).toHaveBeenCalledTimes(2);

  // should not compute again
  cValue.value;
  expect(getter).toHaveBeenCalledTimes(2);
});
```

## 实现

首先我们先处理 getter 调用了 2 次的问题，因为我们 cValue.value 会触发 get，所以第二次点操作，getter 就触发了 2 次，我们可以再类的实例中声明变量去控制

```ts
class ComputedRefImpl {
  private _getter;
  // 初始值为true
  private _dirty: boolean = true;
  private _value: any;
  constructor(getter) {
    this._getter = getter;
  }
  get value() {
    if (this._dirty) {
      // 第一次执行后就切换，这样下次get操作就不会执行了
      this._dirty = false;
      // 用_value保存数据
      this._value = this._getter();
    }
    return this._value;
  }
}
```

在接着打开后面的测试用例，接着调试，注意下个操作的是 value，value 是我们的 reactive 对象，所以会触发 trigger；然后我们因为依赖属性的改变，get 应该再次触发，但 dirty 已经被改成 false 了，此时该如何处理？

```ts
class ComputedRefImpl {
  private _dirty: boolean = true;
  private _value: any;
  private _effect: ReactiveEffect;
  constructor(getter) {
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }
  get value() {
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}
```
