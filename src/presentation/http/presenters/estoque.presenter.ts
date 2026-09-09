export function apresentarEstoque<T>(resultado: T): T {
  return JSON.parse(JSON.stringify(resultado));
}
