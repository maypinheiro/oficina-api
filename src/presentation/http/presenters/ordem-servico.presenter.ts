export function apresentarOrdemServico<T>(resultado: T): T {
  return JSON.parse(JSON.stringify(resultado));
}

export function apresentarListaOrdensServico<T>(resultado: T): T {
  return JSON.parse(JSON.stringify(resultado));
}

export function apresentarHistoricoOrdemServico<T>(resultado: T): T {
  return JSON.parse(JSON.stringify(resultado));
}

export function apresentarStatusOrdemServico<T>(resultado: T): T {
  return JSON.parse(JSON.stringify(resultado));
}
