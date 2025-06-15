export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 400, // 4xx mặc định
    public data: unknown = null // optional: gửi thêm chi tiết cho FE
  ) {
    super(message);
    this.name = "ApiError";
  }
}
