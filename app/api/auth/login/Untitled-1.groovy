// lib/utils/jwt.ts
import jwt, { SignOptions, Secret, JwtPayload as DecodedJwtPayload } from "jsonwebtoken";
import crypto from "crypto";

// Lấy các biến môi trường
const JWT_SECRET: Secret = process.env.JWT_SECRET!;
const JWT_ISSUER: string = process.env.JWT_ISSUER!;
const JWT_AUDIENCE: string = process.env.JWT_AUDIENCE!;

if (!JWT_SECRET || !JWT_ISSUER || !JWT_AUDIENCE) {
  throw new Error("Missing required JWT environment variables (SECRET, ISSUER, AUDIENCE)");
}

/**
 * Định nghĩa cấu trúc dữ liệu của người dùng trong ứng dụng của bạn.
 * Đây là dữ liệu bạn muốn đưa vào token.
 */
export interface AppUserPayload {
  id: number;
  email?: string;
  name?: string;
  // Bạn có thể thêm các trường khác như roles, permissions...
}

/**
 * Ký và tạo ra một chuỗi JWT từ thông tin người dùng.
 * @param appPayload Dữ liệu người dùng của ứng dụng (ví dụ: { id: 123, email: '...' }).
 * @param expiresIn Thời gian hết hạn (ví dụ: "1h", "7d").
 * @returns Chuỗi JWT đã được ký.
 */
export function signJwt(appPayload: AppUserPayload, expiresIn: SignOptions["expiresIn"] = "1h"): string {
  // Tách trường 'id' ra khỏi các thông tin khác
  const { id, ...customPayload } = appPayload;

  // Tạo payload cuối cùng để ký, với claim 'sub' theo đúng chuẩn JWT
  // và 'jti' để định danh duy nhất cho token này.
  const claimsToSign = {
    ...customPayload,
    sub: id.toString(), // FIX 1: Chuyển 'id' thành 'sub' (Subject) - BẮT BUỘC
    jti: crypto.randomUUID(), // FIX 2: Thêm JWT ID (jti) cho mỗi token - Best practice
  };

  const options: SignOptions = {
    algorithm: "HS256",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn, // Mặc định là 1 giờ nếu không có tham số expiresIn
  };

  return jwt.sign(claimsToSign, JWT_SECRET, options);
}

/**
 * Giải mã và xác thực một chuỗi JWT.
 * @param token Chuỗi JWT cần xác thực.
 * @returns Dữ liệu người dùng của ứng dụng (AppUserPayload).
 * @throws Sẽ throw Error nếu token không hợp lệ hoặc hết hạn.
 */
export function verifyJwt(token: string): AppUserPayload {
  try {
    // Giải mã token và lấy ra payload chuẩn của thư viện `jsonwebtoken`
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as DecodedJwtPayload;

    // Kiểm tra xem claim 'sub' có tồn tại không
    if (!decoded.sub) {
      throw new Error("Token is missing the 'sub' (subject) claim.");
    }

    // FIX 3: Ánh xạ ngược từ payload chuẩn của JWT về payload của ứng dụng
    // Điều này giúp code ở các nơi khác trong app chỉ cần làm việc với { id, email... }
    const appPayload: AppUserPayload = {
      id: parseInt(decoded.sub, 10), // Chuyển 'sub' (string) ngược lại thành 'id' (number)
      email: decoded.email,
      name: decoded.name,
    };

    return appPayload;
  } catch (err: any) {
    // Bắt lỗi và trả về một thông báo rõ ràng hơn
    if (err.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    if (err.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw new Error(`Token verification failed: ${err.message}`);
  }
}
