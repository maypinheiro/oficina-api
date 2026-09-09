export type PaginacaoNormalizada = {
  page: number;
  pageSize: number;
};

export function normalizarPaginacao(page?: number, pageSize?: number): PaginacaoNormalizada {
  return {
    page: Math.max(page ?? 1, 1),
    pageSize: Math.min(Math.max(pageSize ?? 10, 1), 100)
  };
}

export function paginarItens<T>(items: T[], paginacao: PaginacaoNormalizada): T[] {
  return items.slice((paginacao.page - 1) * paginacao.pageSize, paginacao.page * paginacao.pageSize);
}

export function calcularTotalPaginas(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}
