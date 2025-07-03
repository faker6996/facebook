export class ResetPasswordToken {
  id?: number;
  user_id?: number;
  token?: string;
  expires_at?: Date;

  static table = "password_reset_token";
  static columns = {
    id: "id",
    user_id: "user_id",
    token: "token",
    expires_at: "expires_at",
  } as const;

  constructor(data: Partial<ResetPasswordToken> = {}) {
    Object.assign(this, data);
    this.id = data.id;
    this.user_id = data.user_id;
    this.token = data.token;
    this.expires_at = data.expires_at;
  }
}
