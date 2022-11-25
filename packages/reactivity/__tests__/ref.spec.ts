import { effect } from "../src/effect";
import { ref } from "../src/ref";

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
});
