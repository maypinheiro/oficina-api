import { DomainError } from "../../../../shared/domain/domain-error";
import { ValueObject } from "../../../../shared/domain/value-object";

type TelefoneProps = {
  value: string;
};

export class Telefone extends ValueObject<TelefoneProps> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(rawValue: string): Telefone {
    const value = rawValue.replaceAll(/\D/g, "");

    if (value.length < 10 || value.length > 11) {
      throw new DomainError("Telefone invalido");
    }

    return new Telefone(value);
  }

  public get value(): string {
    return this.props.value;
  }
}
