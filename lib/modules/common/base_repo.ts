// lib/db-utils/universal-repo.ts

import { safeQuery } from "@/lib/modules/common/safe_query";

export class BaseRepo {
  // #region modify methods

  // **Cách dùng**
  //
  // 1. Thêm bản ghi mới:
  //    await repo.insert({ name: "Bach", email: "a@gmail.com" } as User);
  //
  // 2. Class phải có static `table` (VD: User.table = "users")
  //
  // 3. Trả về bản ghi sau khi insert
  //
  // 4. Nếu không có field nào hợp lệ → throw lỗi

  async insert<T>(data: Partial<T>, returning: string = "*"): Promise<T> {
    // Lấy tên bảng từ static property trong class'

    const table = (data.constructor as any).table;
    if (!table) throw new Error("Missing static 'table' on model class.");

    const columns: string[] = [];
    const values: any[] = [];
    const params: string[] = [];
    let index = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        columns.push(key);
        values.push(value);
        params.push(`$${index++}`);
      }
    }

    if (columns.length === 0) {
      throw new Error("No valid data provided for insert.");
    }

    const sql = `
      INSERT INTO ${table} (${columns.join(", ")})
      VALUES (${params.join(", ")})
      RETURNING ${returning};
    `;

    const result = await safeQuery(sql, values);
    return result.rows[0];
  }

  // **Cách dùng**
  //
  // await repo.insertMany<User>([
  //   { name: "A", email: "a@gmail.com" } as User,
  //   { name: "B", email: "b@gmail.com" } as User,
  // ]);
  //
  // Class User phải có static table = "users"
  //
  // Tự động sinh câu lệnh INSERT INTO ... VALUES (...), (...)
  // Trả về mảng kết quả đã insert

  async insertMany<T>(items: Partial<T>[], returning: string = "*"): Promise<T[]> {
    if (!items || items.length === 0) {
      throw new Error("No data provided for batch insert.");
    }

    const table = (items[0].constructor as any).table;
    if (!table) throw new Error("Missing static 'table' on model class.");

    const columns: string[] = [];
    const allValues: any[] = [];
    const valueGroups: string[] = [];

    // Xác định các cột từ object đầu tiên
    for (const [key, value] of Object.entries(items[0])) {
      if (value !== undefined) columns.push(key);
    }

    if (columns.length === 0) {
      throw new Error("No valid columns found for insert.");
    }

    let paramIndex = 1;

    for (const item of items) {
      const values: string[] = [];
      for (const col of columns) {
        const val = (item as any)[col];
        allValues.push(val);
        values.push(`$${paramIndex++}`);
      }
      valueGroups.push(`(${values.join(", ")})`);
    }

    const sql = `
      INSERT INTO ${table} (${columns.join(", ")})
      VALUES ${valueGroups.join(", ")}
      RETURNING ${returning};
    `;

    // 🚀 Transaction bắt đầu
    await safeQuery("BEGIN");
    try {
      const result = await safeQuery(sql, allValues);
      await safeQuery("COMMIT");
      return result.rows;
    } catch (err) {
      await safeQuery("ROLLBACK");
      throw err;
    }
  }

  // **Cách dùng**
  //
  // await repo.update({ id: 5, name: "Updated Name" } as User);
  //
  // Yêu cầu: entity class có static `table`, và `data` được tạo từ class đó (hoặc có cùng prototype)

  async update<T extends { id?: any }>(data: Partial<T>, returning: string = "*"): Promise<T | null> {
    if (!data || !data.id) {
      throw new Error(`Missing "id" in data for update.`);
    }

    // Lấy table từ class prototype (yêu cầu entity class có static table)
    const table = (data.constructor as any).table;
    if (!table) throw new Error("Missing static 'table' on model class.");

    const values: any[] = [];
    const updates: string[] = [];
    let index = 1;

    for (const [key, value] of Object.entries(data)) {
      if (key === "id" || value === undefined) continue;
      updates.push(`${key} = $${index++}`);
      values.push(value);
    }

    if (updates.length === 0) {
      throw new Error("No fields to update.");
    }

    values.push(data.id);
    const whereIndex = `$${index}`;

    const sql = `
      UPDATE ${table}
      SET ${updates.join(", ")}
      WHERE id = ${whereIndex}
      RETURNING ${returning};
    `;

    const result = await safeQuery(sql, values);
    return result.rows[0] || null;
  }

  // #endregion

  // **Cách dùng**:
  //
  // 1. Mặc định sắp xếp theo "id DESC":
  //    await repo.getAll<User>("users");
  //
  // 2. Sắp theo 1 cột cụ thể:
  //    await repo.getAll<Message>("messages", {
  //      orderBy: ["created_at"],
  //      orderDirections: { created_at: "ASC" },
  //      allowedOrderFields: ["created_at"]
  //    });
  //
  // 3. Sắp theo nhiều cột:
  //    await repo.getAll<Message>("messages", {
  //      orderBy: ["created_at", "id"],
  //      orderDirections: { created_at: "DESC", id: "ASC" },
  //      allowedOrderFields: ["created_at", "id"]
  //    });
  //
  // 4. Nếu orderBy không hợp lệ → sẽ throw lỗi để chống SQL injection.

  async getAll<T>(
    table: string,
    options?: {
      orderBy?: string[];
      orderDirections?: Record<string, "ASC" | "DESC">;
      allowedOrderFields?: string[];
    }
  ): Promise<T[]> {
    const allowed = options?.allowedOrderFields ?? ["id", "created_at"];
    const orderBy = options?.orderBy ?? ["id"];
    const orderMap = options?.orderDirections ?? {};

    // Validate & xây dựng chuỗi ORDER BY
    const orderClauses = orderBy.map((field) => {
      if (!allowed.includes(field)) {
        throw new Error(`Invalid orderBy field: "${field}"`);
      }

      const direction = orderMap[field] ?? "DESC";
      return `${field} ${direction}`;
    });

    const sql = `SELECT * FROM ${table} ORDER BY ${orderClauses.join(", ")}`;
    const result = await safeQuery(sql);
    return result.rows;
  }

  async getById<T>(table: string, id: number): Promise<T | null> {
    const sql = `SELECT * FROM ${table} WHERE id = $1`;
    const result = await safeQuery(sql, [id]);
    return result.rows[0] || null;
  }

  // **Cách dùng**
  //
  // 1. Truy vấn theo bất kỳ field:
  //    const user = await repo.getByField<User>("users", "email", "abc@gmail.com");
  //
  // 2. Có thể sắp xếp kết quả nếu có nhiều bản ghi (ví dụ: getByField trả về nhiều rows):
  //    const messages = await repo.getByField<Message>("messages", "conversation_id", "conv_123", {
  //      orderBy: ["created_at", "id"],
  //      orderDirections: { created_at: "DESC", id: "ASC" },
  //      allowedOrderFields: ["created_at", "id"]
  //    });
  //
  // 3. Nếu không tìm thấy bản ghi → trả về null hoặc [] tùy use case xử lý.

  async getByField<T>(
    table: string,
    field: string,
    value: any,
    options?: {
      orderBy?: string[];
      orderDirections?: Record<string, "ASC" | "DESC">;
      allowedOrderFields?: string[];
    }
  ): Promise<T | null> {
    const allowed = options?.allowedOrderFields ?? ["id", "created_at"];
    const orderBy = options?.orderBy ?? [];
    const orderMap = options?.orderDirections ?? {};

    // Validate & tạo ORDER BY nếu có
    let orderClause = "";
    if (orderBy.length > 0) {
      const orderClauses = orderBy.map((field) => {
        if (!allowed.includes(field)) {
          throw new Error(`Invalid orderBy field: "${field}"`);
        }
        const direction = orderMap[field] ?? "DESC";
        return `${field} ${direction}`;
      });
      orderClause = ` ORDER BY ${orderClauses.join(", ")}`;
    }

    const sql = `SELECT * FROM ${table} WHERE ${field} = $1${orderClause}`;
    const result = await safeQuery(sql, [value]);

    return result.rows.length === 0 ? null : result.rows[0];
  }

  // **Cách dùng**
  //
  // 1. Tìm bản ghi theo nhiều điều kiện:
  //    const messages = await repo.findManyByFields<Message>("messages", {
  //      conversation_id: "conv_001",
  //      sender_id: "user_123"
  //    });
  //
  // 2. Có thể sắp xếp:
  //    const results = await repo.findManyByFields<Message>("messages", {
  //      conversation_id: "conv_001"
  //    }, {
  //      orderBy: ["created_at"],
  //      orderDirections: { created_at: "DESC" },
  //      allowedOrderFields: ["created_at", "id"]
  //    });
  //
  // 3. Nếu không có bản ghi → trả về mảng rỗng []

  async findManyByFields<T>(
    table: string,
    conditions: Record<string, any>,
    options?: {
      orderBy?: string[];
      orderDirections?: Record<string, "ASC" | "DESC">;
      allowedOrderFields?: string[];
    }
  ): Promise<T[]> {
    const allowed = options?.allowedOrderFields ?? ["id", "created_at"];
    const orderBy = options?.orderBy ?? [];
    const orderMap = options?.orderDirections ?? {};

    // Xây dựng WHERE clause
    const whereClauses: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const [key, value] of Object.entries(conditions)) {
      whereClauses.push(`${key} = $${index++}`);
      values.push(value);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Xây dựng ORDER BY
    let orderClause = "";
    if (orderBy.length > 0) {
      const orderClauses = orderBy.map((field) => {
        if (!allowed.includes(field)) {
          throw new Error(`Invalid orderBy field: "${field}"`);
        }
        const direction = orderMap[field] ?? "DESC";
        return `${field} ${direction}`;
      });
      orderClause = ` ORDER BY ${orderClauses.join(", ")}`;
    }

    const sql = `SELECT * FROM ${table} ${whereSQL}${orderClause}`;
    const result = await safeQuery(sql, values);
    return result.rows;
  }
}

export const baseRepo = new BaseRepo();
