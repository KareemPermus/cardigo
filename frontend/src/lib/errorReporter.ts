export function initErrorReporter() {
  if (typeof window === 'undefined') return;

  const reportUrl = process.env.NEXT_PUBLIC_RUNTIME_ERROR_REPORT_URL;
  if (!reportUrl) return;

  const getAppId = () => {
    if (process.env.NEXT_PUBLIC_APP_ID) return process.env.NEXT_PUBLIC_APP_ID;
    const match = window.location.hostname.match(/^preview-([^.]+)/);
    return match ? match[1] : window.location.hostname;
  };

  const send = (payload: Record<string, string>) => {
    try {
      fetch(reportUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: getAppId(), user_agent: navigator.userAgent, ...payload }),
      }).catch(() => {});
    } catch {}
  };

  window.onerror = (message, url, _l, _c, error) => {
    send({ message: String(message), stack: error?.stack || '', url: String(url || '') });
  };

  window.onunhandledrejection = (e: PromiseRejectionEvent) => {
    send({ message: String(e.reason), stack: e.reason?.stack || '', url: window.location.href });
  };

  const origError = console.error;
  console.error = (...args: any[]) => {
    origError.apply(console, args);
    send({ message: args.map(String).join(' '), stack: '', url: window.location.href });
  };
}