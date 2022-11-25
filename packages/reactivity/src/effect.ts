import { extend } from "../../shared";

const targetMap = new Map();
let activeEffect;
let shouldTrack;
export class ReactiveEffect {
  deps = [];
  active = true;
  onStop?: () => void;
  constructor(public fn, public scheduler?) {}
  run() {
    if (!this.active) {
      // stop后再次执行runner
      return this.fn();
    }
    activeEffect = this;
    shouldTrack = true;
    const result = this.fn();
    shouldTrack = false;
    return result;
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}
export const effect = (fn, options: any = {}) => {
  const scheduler = options.scheduler;
  const _effect = new ReactiveEffect(fn, scheduler);
  extend(_effect, options);
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  runner();
  return runner;
};

export const isTracking = () => activeEffect !== undefined && shouldTrack;

export const track = (target, key) => {
  if (!isTracking()) return;
  // targetMap => target => depsMap
  // depsMap => key => dep
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep: Set<any> = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  trackEffects(dep);
};
export function trackEffects(dep) {
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}
export const trigger = (target, key) => {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);
  triggerEffects(dep);
};
export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export const stop = (runner) => {
  runner.effect.stop();
};
