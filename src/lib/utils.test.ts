import { describe, it, expect } from "vitest";
import { getErrorMessage } from "@/lib/utils";

describe("getErrorMessage", () => {
  it("returns the error field when present", () => {
    expect(getErrorMessage({ error: "bad" }, "fallback")).toBe("bad");
  });

  it("returns the message field when error is absent", () => {
    expect(getErrorMessage({ message: "msg" }, "fallback")).toBe("msg");
  });

  it("prefers error over message", () => {
    expect(getErrorMessage({ error: "e", message: "m" }, "fallback")).toBe("e");
  });

  it("returns fallback for non-objects", () => {
    expect(getErrorMessage(null, "fallback")).toBe("fallback");
    expect(getErrorMessage("string", "fallback")).toBe("fallback");
    expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
  });

  it("returns fallback when neither error nor message is a string", () => {
    expect(getErrorMessage({ error: 123 }, "fallback")).toBe("fallback");
    expect(getErrorMessage({}, "fallback")).toBe("fallback");
  });
});
