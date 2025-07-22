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
  const mode = searchParams.get("mode"); // Add mode parameter to differentiate
  const query = user_name || name || search;

  if (!query || query.trim().length < 2) {
    throw new ApiError("Search query must be at least 2 characters long", 400);
  }

  // If mode is 'group', use simple user search for group creation
  // If mode is 'group-invite', use search that excludes existing group members
  // Otherwise use messenger search with conversation info
  let searchResults;
  if (mode === 'group') {
    searchResults = await userApp.searchUsers(query.trim());
    // Filter out current user
    searchResults = searchResults.filter(user => user.id !== currentUser.id);
  } else if (mode === 'group-invite') {
    const groupId = searchParams.get("groupId");
    if (!groupId) {
      throw new ApiError("Group ID is required for group invite search", 400);
    }
    searchResults = await userApp.searchUsersForGroupInvite(currentUser.id, query.trim(), parseInt(groupId));
  } else {
    searchResults = await userApp.searchUsersForMessenger(currentUser.id, query.trim());
  }
  
  return createResponse(searchResults, "Search completed successfully");
}

export const GET = withApiHandler(getHandler);
