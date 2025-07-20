import { NextRequest } from "next/server";
import { userApp } from "@/lib/modules/user/applications/user_app";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { ApiError } from "@/lib/utils/error";
import { verifyJwt } from "@/lib/utils/jwt";
import { loadFromLocalStorage } from "@/lib/utils/local-storage";
import { User } from "@/lib/models/user";

async function getHandler(req: NextRequest) {
  // Get current user from token
  const token = req.cookies.get("access_token")?.value;
  if (!token) {
    throw new ApiError("Unauthorized", 401);
  }
  
  const decoded = verifyJwt(token);
  const currentUser = { id: decoded.userId };
  
  const { searchParams } = new URL(req.url);
  const user_name = searchParams.get("user_name");
  const name = searchParams.get("name");
  const search = searchParams.get("search");
  const query = user_name || name || search;

  if (!query || query.trim().length < 2) {
    throw new ApiError("Search query must be at least 2 characters long", 400);
  }

  const searchResults = await userApp.searchUsersForMessenger(currentUser.id, query.trim());
  return createResponse(searchResults, "Search completed successfully");
}

export const GET = withApiHandler(getHandler);
