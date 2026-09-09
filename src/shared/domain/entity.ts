export abstract class Entity<Props> {
  protected constructor(
    public readonly id: string,
    protected readonly props: Props
  ) {}
}

