# stop 和 onStop 的实现

## 编写测试用例 stop

直接参考源码测试用例中的 stop

```ts
it("stop", () => {
  let dummy;
  const obj = reactive({ prop: 1 });
  const runner = effect(() => {
    dummy = obj.prop;
  });
  obj.prop = 2;
  expect(dummy).toBe(2);
  stop(runner);
  obj.prop = 3;
  expect(dummy).toBe(2);

  // stopped effect should still be manually callable
  runner();
  expect(dummy).toBe(3);
});
```

通过用例知道，stop 传入参数 runner，可以停止监听，但手动调用 runner 还是可以执行 fn

## 实现 stop

```ts
class ReactiveEffect {
  // 反向收集所有的deps
  deps = [];
  ...
  stop() {
    this.deps.forEach((dep: Set<any>) => {
      dep.delete(this);
    });
  }
}

export const effect = (fn, options: any = {}) => {
  const scheduler = options.scheduler;
  const effect_ = new ReactiveEffect(fn, scheduler);
  const runner: any = effect_.run.bind(effect_);
  // 在runner上挂effect实例，这样可以取到对应的实例，调成员方法
  runner.effect = effect_;
  runner();
  return runner;
};

export const stop = (runner) => {
  runner.effect.stop();
};
```

## 重构优化成员方法 stop

```ts
class ReactiveEffect {
  // 反向收集所有的deps
  deps = [];
  // scheduler可不传
  constructor(public fn, public scheduler?) {}
  run() {
    // run的时候，产生activeEffect
    activeEffect = this;
    return this.fn();
  }
  stop() {
    cleanupEffect(this);
  }
}

// 把cleanupEffect提到外面
function cleanupEffect(effect) {
  effect.deps.forEach((dep: Set<any>) => {
    dep.delete(effect);
  });
}
```

## 编写测试用例 onStop

继续参考源码测试用例中的 onStop

```ts
it("events: onStop", () => {
  const onStop = jest.fn();
  const runner = effect(() => {}, {
    onStop,
  });

  stop(runner);
  expect(onStop).toHaveBeenCalled();
});
```

当执行 stop 时，用户传入的 effect 第二个参数对象中属性 onStop 函数会触发

## 实现 onStop

```ts
class ReactiveEffect {
  // 反向收集所有的deps
  deps = [];
  // onStop可选
  onStop?: () => void;
  // scheduler可不传
  constructor(public fn, public scheduler?) {}
  run() {
    // run的时候，产生activeEffect
    activeEffect = this;
    return this.fn();
  }
  stop() {
    if (this.onStop) {
      // 如果传入了onStop则执行
      this.onStop();
    }
    cleanupEffect(this);
  }
}

export const effect = (fn, options: any = {}) => {
  // options可传可不传，默认给个空对象
  const scheduler = options.scheduler;
  const effect_ = new ReactiveEffect(fn, scheduler);
  // 获取onStop函数
  const onStop = options.onStop;
  // 挂在实例上
  effect_.onStop = onStop;
  const runner: any = effect_.run.bind(effect_);
  // 在runner上挂effect实例，这样可以取到对应的实例，调成员方法
  runner.effect = effect_;
  runner();
  return runner;
};
```

## 重构 onStop

我们可能每次从 option 中获取属性，然后要在挂到实例上，所以可以有更方便更语义化的方式，新建 shared 文件夹，写公共方法

```ts
// shared/index.ts
export const extend = Object.assign;
```

```ts
// 获取onStop函数
// const onStop = options.onStop;
// 挂在实例上
// effect_.onStop = onStop;
extend(effect_, options);
```

还有个优化点，用户多次 stop，其实只要 stop 一次就可以了，此时我们可以用个 active 作为标记

```ts
class ReactiveEffect {
  private _fn: any;
  deps = [];
  // 标记，active默认是true
  active = true;
  onStop?: () => void;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    return this._fn();
  }
  stop() {
    if (this.active) {
      // 当active是true的时候再处理stop逻辑
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      // 处理完改为false
      this.active = false;
    }
  }
}
```
