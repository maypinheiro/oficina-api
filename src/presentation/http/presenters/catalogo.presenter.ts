export function apresentarCatalogo<T>(resultado: T): T {
  return JSON.parse(JSON.stringify(resultado));
}
