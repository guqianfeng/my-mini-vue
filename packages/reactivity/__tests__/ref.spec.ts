import { reactive } from "./../src/reactive";
import { effect } from "../src/effect";
import { isRef, proxyRefs, ref, unRef } from "../src/ref";

describe("reactivity/ref", () => {
  it("happy path", () => {
    const age = ref(10);
    expect(age.value).toBe(10);
  });
  it("should be reactive", () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      calls++;
      dummy = a.value;
    });
    // effect一开始的fn就会执行所以都是1
    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    a.value = 2;
    // 因为响应式，fn再次触发，所以都改成了2
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    // same value should not trigger
    a.value = 2;
    // 一样的值没有触发所以calls还是2
    expect(calls).toBe(2);
  });

  it("should make nested properties reactive", () => {
    const a = ref({
      count: 1,
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    });
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });

  it("isRef", () => {
    const a = ref(1);
    const b = 1;
    const c = reactive({ c: "test" });
    expect(isRef(a)).toBe(true);
    expect(isRef(b)).toBe(false);
    expect(isRef(c)).toBe(false);
  });

  it("unRef", () => {
    const a = ref(1);
    const b = 2;
    expect(unRef(a)).toBe(1);
    expect(unRef(b)).toBe(2);
  });

  it("proxyRefs", () => {
    const user = {
      name: "zhangsan",
      age: ref(10),
    };
    const proxyUser = proxyRefs(user);
    expect(user.age.value).toBe(10);
    expect(proxyUser.age).toBe(10);
    expect(proxyUser.name).toBe("zhangsan");

    proxyUser.age = 20;
    expect(proxyUser.age).toBe(20);
    expect(user.age.value).toBe(20);

    proxyUser.age = ref(18);
    expect(proxyUser.age).toBe(18);
    expect(user.age.value).toBe(18);
  });
});
