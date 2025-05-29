import HomeContainer from "@/components/home/HomeContainer";
import { Menu } from "@/lib/models/menu";
import { getMenuList } from "@/lib/modules/system/menu/repositories/menu_repo";

const locale = "vi";

export default async function HomePage() {
  const menus: Menu[] = await getMenuList(locale);
  return <HomeContainer menus={menus}></HomeContainer>;
}
