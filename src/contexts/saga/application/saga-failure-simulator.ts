export type SagaFailureSimulationResult = {
  numeroOs: string;
  event: "ExecutionFailed";
  result: "processed" | "duplicate";
};

export interface SagaFailureSimulator {
  simulateExecutionFailure(numeroOs: string): Promise<SagaFailureSimulationResult>;
}
