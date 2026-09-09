import { calcularTotalPaginas, normalizarPaginacao, paginarItens } from "./paginacao";

describe("Paginacao", () => {
  it("normaliza pagina e tamanho dentro dos limites", () => {
    expect(normalizarPaginacao(0, 200)).toEqual({ page: 1, pageSize: 100 });
    expect(normalizarPaginacao(undefined, undefined)).toEqual({ page: 1, pageSize: 10 });
  });

  it("pagina itens", () => {
    expect(paginarItens([1, 2, 3, 4, 5], { page: 2, pageSize: 2 })).toEqual([3, 4]);
  });

  it("calcula total de paginas", () => {
    expect(calcularTotalPaginas(21, 10)).toBe(3);
  });
});
