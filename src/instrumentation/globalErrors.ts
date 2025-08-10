import { logError, logWarn } from "./logger";

export function installGlobalErrorHandlers() {
  const prev = (global as any)?.ErrorUtils?.getGlobalHandler?.();
  (global as any)?.ErrorUtils?.setGlobalHandler?.(
    (error: any, isFatal?: boolean) => {
      logError("JSException", {
        message: String(error?.message || error),
        stack: String(error?.stack || ""),
        fatal: !!isFatal,
      });
      if (prev)
        try {
          prev(error, isFatal);
        } catch {}
    }
  );

  const origError = console.error;
  console.error = (...args: any[]) => {
    const msg = args
      .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
      .join(" ");
    if (
      /Unhandled\s*(Promise|rejection)|Possible Unhandled Promise/i.test(msg)
    ) {
      logError("UnhandledPromise", { message: msg });
    } else {
      logWarn("ConsoleError", { message: msg });
    }
    origError(...args);
  };

  const origWarn = console.warn;
  console.warn = (...args: any[]) => {
    const msg = args
      .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
      .join(" ");
    logWarn("ConsoleWarn", { message: msg });
    origWarn(...args);
  };
}
