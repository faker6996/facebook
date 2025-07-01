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
  is_active?: boolean;
  sub?: string;

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
    is_active: "is_active",
    sub: "sub",
  } as const;

  constructor(data: Partial<User> = {}) {
    Object.assign(this, data);
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
    this.is_active = data.is_active;
    this.sub = data.sub;
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
export interface picture {
  data: pictureData;
}
export interface pictureData {
  is_silhouette: boolean;
  height: number;
  width: number;
  url: string;
}
