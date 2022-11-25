import { extend, isObject } from "../../shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlag, readonly } from "./reactive";

export const createGetter = (isReadonly = false, shallow = false) => {
  return function get(target, key) {
    if (key === ReactiveFlag.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlag.IS_READONLY) {
      return isReadonly;
    }
    // res可能是基本数据类型，也有可能是个对象
    const res = Reflect.get(target, key);

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

export const createSetter = () => {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    // 触发依赖
    trigger(target, key);
    return res;
  };
};

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`key: ${key} 不能被设置，target为${target}`);
    return true;
  },
};

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
