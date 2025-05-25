export class User {
  id?: number;
  name?: string;
  user_name?: string;
  password?: string;
  email?: string;
  avatar_url?: string;
  phone_number?: string;
  address?: string;
  created_at?: string;
  is_sso?: boolean;

  static table = "users";
  static columns = {
    id: "id",
    name: "name",
    user_name: "user_name",
    password: "password",
    email: "email",
    avatar_url: "avatar_url",
    phone_number: "phone_number",
    address: "address",
    created_at: "created_at",
    is_sso: "is_sso",
  };

  constructor(data: Partial<User> = {}) {
    this.id = data.id;
    this.name = data.name;
    this.user_name = data.user_name;
    this.password = data.password;
    this.email = data.email;
    this.avatar_url = data.avatar_url;
    this.phone_number = data.phone_number;
    this.address = data.address;
    this.created_at = data.created_at;
    this.is_sso = data.is_sso;
  }
}

export interface UserInfoSso {
  id: string;
  name: string;
  email: string;
}
