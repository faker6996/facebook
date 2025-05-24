import { API_ROUTES } from "@/lib/constants/api-routes";

export async function GET() {
  const redirect_uri = encodeURIComponent(`${process.env.AUTH_URL}${API_ROUTES.AUTH.SSO_GOOGLE_CALLBACK}`);
  const client_id = process.env.GOOGLE_CLIENT_ID!;
  const scope = encodeURIComponent("email profile");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}`;
  return Response.redirect(url);
}
