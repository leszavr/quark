export class JwtSecretRotatedEvent {
  constructor(
    public readonly oldSecret: string,
    public readonly newSecret: string,
    public readonly rotatedAt: Date
  ) {}
}
