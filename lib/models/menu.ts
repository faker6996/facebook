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
    Object.assign(this, data);
    this.id = data.id;
    this.icon = data.icon;
    this.slug = data.slug;
    this.order_index = data.order_index;
    this.is_active = data.is_active;
    this.parent_id = data.parent_id;
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
    this.id = data.id;
    this.menu_id = data.menu_id;
    this.locale = data.locale;
    this.name = data.name;
  }
}
