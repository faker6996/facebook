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
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}
