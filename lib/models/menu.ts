export class Menu {
  id?: number;
  icon?: string;
  slug?: string;
  order_index?: number;
  is_active?: boolean;
  parent_id?: number;

  //extend
  name?: string;

  static table = "menu";
  static columns = {
    id: "id",
    icon: "icon",
    slug: "slug",
    order_index: "order_index",
    is_active: "is_active",
    parent_id: "parent_id",
  } as const;

  constructor(data: Partial<Menu> = {}) {
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}

export class MenuTranslation {
  id?: number;
  menu_id?: number;
  locale?: string;
  name?: string;

  static table = "menu_translations";
  static columns = {
    id: "id",
    menu_id: "menu_id",
    locale: "locale",
    name: "name",
  };

  constructor(data: Partial<MenuTranslation> = {}) {
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}
