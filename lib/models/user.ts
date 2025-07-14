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
  updated_at?: string;
  is_sso?: boolean;
  is_active?: boolean;
  sub?: string;
  last_seen?: string;

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
    updated_at: "updated_at",
    is_sso: "is_sso",
    is_active: "is_active",
    sub: "sub",
    last_seen: "last_seen",
  } as const;

  constructor(data: Partial<User> = {}) {
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}

export interface UserInfoSso {
  sub: string;
  name: string;
  email: string;
  verified_email: boolean;
  given_name: string;
  family_name: string;
  picture: picture;
  locale: string;
  id: number;
}
export interface UserInfoSsoGg {
  sub: string;
  name: string;
  email: string;
  verified_email: boolean;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}
export interface picture {
  data: pictureData;
}
export interface pictureData {
  is_silhouette: boolean;
  height: number;
  width: number;
  url: string;
}
