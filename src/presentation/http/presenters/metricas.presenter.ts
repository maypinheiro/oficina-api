export function apresentarMetricas<T>(resultado: T): T {
  return JSON.parse(JSON.stringify(resultado));
}
