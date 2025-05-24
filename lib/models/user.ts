export interface User {
  id?: number;
  name?: string;
  user_name?: string;
  password?: string;
  is_sso?: boolean;
  avatar_url?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  created_at?: string;
}

export interface UserInfoSso {
  id?: string;
  name?: string;
  email?: string;
}

// metadata cho bảng users
export class UserModel {
  static table = "users";
  static columns = {
    id: "id",
    name: "name",
    email: "email",
    phone_number: "phone_number",
    avatar_url: "avatar_url",
    address: "address",
    created_at: "created_at",
  };
}
