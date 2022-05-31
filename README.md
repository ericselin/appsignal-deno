# AppSignal API wrapper

Minimal wrapper to send errors to [AppSignal](https://www.appsignal.com/) public [error reporting API](https://docs.appsignal.com/api/public-endpoint/errors.html).

## Usage

The client does not catch errors in any way, you need to send the errors manually.

```ts
import { createAppsignalClient } from "https://deno.land/x/appsignal@v1.0.0/mod.ts";

// Create client
const sendErrorReport = createAppsignalClient("YOUR_API_KEY", "deno");

// Send an error
try {
  throw new Error("Something bad happened");
} catch (err) {
  sendErrorReport(err);
}
```

You can specify optional parameters either in the `createAppsignalClient` call or the error sending call - see documentation for `mod.ts` for function definitions.
