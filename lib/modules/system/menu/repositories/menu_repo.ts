// lib/modules/menu/repositories/menu_repo.ts
import { query } from "@/lib/db";
import { Menu } from "@/lib/models/menu";

export async function getMenuList(locale: string): Promise<Menu[]> {
  // 1. Lấy menu + dịch name theo locale
  const sql = `
    SELECT
      m.id,
      m.icon,
      m.slug,
      m.order_index,
      m.is_active,
      m.parent_id,
      t.name
    FROM menu AS m
    JOIN menu_translations AS t
      ON t.menu_id = m.id
     AND t.locale = $1
    WHERE m.is_active = TRUE
    ORDER BY m.order_index
  `;
  const res = await query(sql, [locale]);
  return res.rows;
}
