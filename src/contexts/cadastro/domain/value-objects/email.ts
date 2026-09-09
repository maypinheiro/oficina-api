import { DomainError } from "../../../../shared/domain/domain-error";
import { ValueObject } from "../../../../shared/domain/value-object";

type EmailProps = {
  value: string;
};

export class Email extends ValueObject<EmailProps> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(rawValue: string): Email {
    const value = rawValue.trim().toLowerCase();

    if (!this.isValid(value)) {
      throw new DomainError("Email invalido");
    }

    return new Email(value);
  }

  private static isValid(value: string): boolean {
    if (value.length === 0 || value.includes(" ") || value.includes("\t") || value.includes("\n")) {
      return false;
    }

    const parts = value.split("@");

    if (parts.length !== 2) {
      return false;
    }

    const [local, domain] = parts;

    return local.length > 0 && domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".");
  }

  public get value(): string {
    return this.props.value;
  }
}
