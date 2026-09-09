export function apresentarCadastro<T>(resultado: T): T {
  return JSON.parse(JSON.stringify(resultado));
}
