import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from "./baseHandlers";

export const enum ReactiveFlag {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

export const reactive = (raw) => {
  return createReactiveObject(raw, mutableHandlers);
};

export const readonly = (raw) => {
  return createReactiveObject(raw, readonlyHandlers);
};

export const shallowReadonly = (raw) => {
  return createReactiveObject(raw, shallowReadonlyHandlers);
};

function createReactiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}

export const isReactive = (value) => {
  return !!value[ReactiveFlag.IS_REACTIVE];
};

export const isReadonly = (value) => {
  return !!value[ReactiveFlag.IS_READONLY];
};
