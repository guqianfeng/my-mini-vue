import { computed } from "../src/computed";
import { reactive } from "./../src/reactive";
describe("reactivity/computed", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });
    const nextAge = computed(() => user.age + 1);
    expect(nextAge.value).toBe(11);
  });

  it("should compute lazily", () => {
    const value = reactive({});
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
});
