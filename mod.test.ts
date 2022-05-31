import { assertEquals } from "https://deno.land/std@0.141.0/testing/asserts.ts";
import { getBacktrace } from "./mod.ts";

Deno.test("backtrace creation works", () => {
  const stack = `CRITICAL Error
    at config.functions (file:///home/eric/src/test/bob.ts:154:15)
    at async Server.listen.port.port (https://deno.land/x/bob@v2.8.0/functions/mod.ts:157:14)
    at async Server.#respond (https://deno.land/std@0.121.0/http/server.ts:298:18)`;
  // @-sign does not seem to work great with AppSignal, so just replacing it
  const arr = [
    "config.functions @ file:///home/eric/src/test/bob.ts:154:15",
    "async Server.listen.port.port @ https://deno.land/x/bob_v2.8.0/functions/mod.ts:157:14",
    "async Server.#respond @ https://deno.land/std_0.121.0/http/server.ts:298:18",
  ];
  assertEquals(getBacktrace(stack), arr);
});
