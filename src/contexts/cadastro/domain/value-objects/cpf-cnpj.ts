import { DomainError } from "../../../../shared/domain/domain-error";
import { ValueObject } from "../../../../shared/domain/value-object";

type CpfCnpjProps = {
  value: string;
};

export class CpfCnpj extends ValueObject<CpfCnpjProps> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(rawValue: string): CpfCnpj {
    const value = rawValue.replaceAll(/\D/g, "");

    if (![11, 14].includes(value.length) || /^(\d)\1+$/.test(value)) {
      throw new DomainError("CPF/CNPJ invalido");
    }

    if (value.length === 11 && !this.isValidCpf(value)) {
      throw new DomainError("CPF/CNPJ invalido");
    }

    if (value.length === 14 && !this.isValidCnpj(value)) {
      throw new DomainError("CPF/CNPJ invalido");
    }

    return new CpfCnpj(value);
  }

  private static isValidCpf(value: string): boolean {
    const digits = value.split("").map(Number);
    const first = this.calculateCpfDigit(digits.slice(0, 9), 10);
    const second = this.calculateCpfDigit([...digits.slice(0, 9), first], 11);

    return first === digits[9] && second === digits[10];
  }

  private static calculateCpfDigit(numbers: number[], initialWeight: number): number {
    const sum = numbers.reduce((total, number, index) => total + number * (initialWeight - index), 0);
    const rest = (sum * 10) % 11;

    return rest === 10 ? 0 : rest;
  }

  private static isValidCnpj(value: string): boolean {
    const digits = value.split("").map(Number);
    const first = this.calculateCnpjDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const second = this.calculateCnpjDigit([...digits.slice(0, 12), first], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

    return first === digits[12] && second === digits[13];
  }

  private static calculateCnpjDigit(numbers: number[], weights: number[]): number {
    const sum = numbers.reduce((total, number, index) => total + number * weights[index], 0);
    const rest = sum % 11;

    return rest < 2 ? 0 : 11 - rest;
  }

  public get value(): string {
    return this.props.value;
  }
}
