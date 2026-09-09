import { ApplicationError } from "../../../shared/application/application-error";
import {
  validarEntrega,
  validarFinalizacao,
  validarInicioDiagnostico,
  validarInicioExecucao,
  validarRegistroProblema
} from "./fluxo-ordem-servico";

describe("Fluxo da ordem de servico", () => {
  it("permite transicoes validas", () => {
    expect(() => validarInicioDiagnostico("RECEBIDA")).not.toThrow();
    expect(() => validarRegistroProblema("EM_DIAGNOSTICO")).not.toThrow();
    expect(() => validarInicioExecucao("APROVADA", "APROVADO")).not.toThrow();
    expect(() => validarFinalizacao("EM_EXECUCAO")).not.toThrow();
    expect(() => validarEntrega("FINALIZADA")).not.toThrow();
  });

  it("rejeita transicoes invalidas", () => {
    expect(() => validarInicioDiagnostico("EM_DIAGNOSTICO")).toThrow(ApplicationError);
    expect(() => validarRegistroProblema("RECEBIDA")).toThrow(ApplicationError);
    expect(() => validarInicioExecucao("AGUARDANDO_APROVACAO", "PENDENTE")).toThrow(ApplicationError);
    expect(() => validarFinalizacao("APROVADA")).toThrow(ApplicationError);
    expect(() => validarEntrega("EM_EXECUCAO")).toThrow(ApplicationError);
  });
});
