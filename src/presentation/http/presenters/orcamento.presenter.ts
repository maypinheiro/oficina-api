export function apresentarOrcamento<T>(resultado: T): T {
  return JSON.parse(JSON.stringify(resultado));
}

export function apresentarDecisaoOrcamento<T>(resultado: T): T {
  return JSON.parse(JSON.stringify(resultado));
}
