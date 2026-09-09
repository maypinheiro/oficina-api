export function gerarNumeroOs(data: Date = new Date()): string {
  return `OS-${data.getTime()}`;
}
