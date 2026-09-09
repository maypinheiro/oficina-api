import { DomainError } from "../../../../shared/domain/domain-error";
import { ValueObject } from "../../../../shared/domain/value-object";

type PlacaProps = {
  value: string;
};

export class Placa extends ValueObject<PlacaProps> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(rawValue: string): Placa {
    const value = rawValue.trim().toUpperCase();

    if (!/^[A-Z]{3}\d[A-Z\d]\d{2}$/.test(value)) {
      throw new DomainError("Placa invalida");
    }

    return new Placa(value);
  }

  public get value(): string {
    return this.props.value;
  }
}
