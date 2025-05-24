import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { GoogleOAuthTokenResponse } from "@/lib/models/google_auth_token";
import { GoogleUserInfo } from "@/lib/models/google_user_info";
import { userService } from "@/lib/modules/user/applications/user_app";
import { callApi } from "@/lib/utils/api-client";

export async function GET(req: Request) {
  try {
    // 1. Lấy mã code từ query params
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      console.error("❌ Không có mã code từ Google");
      return new Response("Missing code", { status: 400 });
    }

    // 2. Đổi mã code lấy access_token
    const tokenData = await callApi<GoogleOAuthTokenResponse>(
      API_ROUTES.AUTH.SSO_GOOGLE_TOKEN,
      HTTP_METHOD_ENUM.POST,
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.AUTH_URL!}${API_ROUTES.AUTH.SSO_GOOGLE_CALLBACK}`,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    // 3. Lấy thông tin user từ access_token
    const user = await callApi<GoogleUserInfo>(API_ROUTES.AUTH.SSO_GOOGLE_INFO, HTTP_METHOD_ENUM.GET, undefined, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    // 4. Kiểm tra/tạo user trong DB
    const existingUser = await userService.findOrCreateUser(user);

    // 5. Tạo JWT
    // const jwt = createYourToken(user);

    // 6. Lưu cookie (nếu dùng JWT)
    // cookies().set("token", jwt, {
    //   httpOnly: true,
    //   path: "/",
    //   secure: true,
    // });

    console.log("Đăng nhập Google thành công:", user.email);

    // 7. Redirect về trang chủ
    return Response.redirect(process.env.AUTH_URL!);
  } catch (error: any) {
    console.error("Lỗi trong quá trình đăng nhập Google:", error.message || error);
    return new Response("Lỗi trong quá trình đăng nhập Google", { status: 500 });
  }
}
