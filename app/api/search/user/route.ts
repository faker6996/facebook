import { NextRequest } from "next/server";
import { userApp } from "@/lib/modules/user/applications/user_app";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { ApiError } from "@/lib/utils/error";

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_name = searchParams.get("user_name");
  const name = searchParams.get("name");
  const search = searchParams.get("search");
  const query = user_name || name || search;

  if (!query || query.trim().length < 2) {
    throw new ApiError("Search query must be at least 2 characters long", 400);
  }

  const users = await userApp.searchUsers(query.trim());
  return createResponse(users, "Search completed successfully");
}

export const GET = withApiHandler(getHandler);
