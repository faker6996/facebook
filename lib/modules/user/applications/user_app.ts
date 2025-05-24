import { GoogleUserInfo } from "@/lib/models/google_user_info";
import { UserRepo } from "../repositories/user_repo";
import { User } from "@/lib/models/user";


const userRepo = new UserRepo();

export const userService = {
  async getAll() {
    return await userRepo.getAll();
  },

  async getAllOrGetById(id?: number) {
    return await userRepo.getAllOrGetById(id);
  },

  async findOrCreateUser(user: GoogleUserInfo) {
    const existingUser = await userRepo.getUserByEmail(user.email);
    if (existingUser) {
      return existingUser;
    }

    const userData = userRepo.mapGoogleUserToUser(user); // Nếu bạn khai báo static: UserDAO.mapGoogleUserToUser(user)
    const newUser = await userRepo.create(userData);
    return newUser;
  },
   
  
};
