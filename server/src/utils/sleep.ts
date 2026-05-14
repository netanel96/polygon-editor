export const API_REQUEST_DELAY_MS = 5000;

export function sleep(ms: number) {
  return new Promise(resolve =>
    setTimeout(resolve, ms),
  );
}
