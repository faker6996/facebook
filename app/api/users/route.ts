import { NextRequest } from "next/server";
import { userApp } from "@/lib/modules/user/applications/user_app";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { ApiError } from "@/lib/utils/error";

async function postHandler(req: NextRequest) {
  const body = await req.json();
  const result = await userApp.execute(body);
  return createResponse(result, "User created successfully", 201);
}

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get("id");
  const searchQuery = searchParams.get("search");
  
  if (searchQuery) {
    // Search users by name or username
    const users = await userApp.searchUsers(searchQuery);
    return createResponse(users, "Users retrieved successfully");
  }
  
  if (idParam) {
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      throw new ApiError("Invalid user ID", 400);
    }
    const user = await userApp.getById(id);
    return createResponse(user, "User retrieved successfully");
  }
  
  // Get all users (consider pagination)
  const users = await userApp.getAll();
  return createResponse(users, "Users retrieved successfully");
}

export const POST = withApiHandler(postHandler);
export const GET = withApiHandler(getHandler);
