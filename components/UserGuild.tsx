"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/utils/api-client";
import { User } from "@/lib/models/user";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { API_ROUTES } from "@/lib/constants/api-routes";
import Input from "./ui/Input";
import Alert from "./ui/Alert";
import Avatar from "./ui/Avatar";
import Breadcrumb from "./ui/Breadcrumb";
import Card from "./ui/Card";
import { Carousel } from "./ui/Carousel";
import Button from "./ui/Button";
import { Checkbox } from "./ui/CheckBox";
import { Combobox } from "./ui/Combobox";
import { MultiCombobox } from "./ui/MultiCombobox";
import { Popover } from "./ui/Popover";
import { DatePicker } from "./ui/DatePicker";
import { Pagination } from "./ui/Pagination";

export default function UserGuild() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selected_a, setSelected_a] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | undefined>("SvelteKit");
  const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Đã gửi!");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Hướng dẫn sử dụng component 🏡</h1>
      <div>
        <p>Đang tải dữ liệu...</p>
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4 mt-10">
          <Input name="username" label="Tên người dùng" placeholder="Nhập tên..." required />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Gửi
          </button>
        </form>

        <Alert variant="success" title="Đăng nhập thất bại" description="Sai tên đăng nhập hoặc mật khẩu." />

        <Avatar src="https://i.pravatar.cc/150" fallback="AB" size="md" />

        <Avatar fallback="TVB" size="lg" className="bg-blue-200 text-blue-800" />

        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Tài khoản", href: "/account" },
            { label: "Thông tin cá nhân" }, // không có href = đang ở đây
          ]}
        />

        <Card
          title="Thông báo"
          description="Đây là mô tả phụ"
          content={<p>Nội dung chính bên trong card</p>}
          footer={<Button className="ml-auto text-sm text-blue-500 hover:underline">Đóng</Button>}
        />

        <br></br>

        <Carousel>
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              title={`Slide ${i}`}
              description="This is a custom card component"
              content={<div className="h-40 flex items-center justify-center text-2xl font-bold">Content {i}</div>}
            />
          ))}
        </Carousel>

        <Checkbox label="Accept terms and conditions" defaultChecked />
        <Combobox options={frameworks} value={selected} onChange={setSelected} placeholder="Search framework..." />

        <MultiCombobox
          options={frameworks}
          value={selected_a}
          onChange={setSelected_a}
          placeholder="Select frameworks"
          maxSelected={3}
          disabledOptions={["Angular"]}
          showTags={true}
          showClear={true}
        />

        <Popover trigger={<Button>Open</Button>}>
          <div className="p-4 text-sm">This is popover content</div>
        </Popover>

        <DatePicker value={selectedDate} onChange={(date) => setSelectedDate(date)} placeholder="Pick a date" />

        <Pagination page={currentPage} totalPages={10} onChange={(p) => setCurrentPage(p)} size="sm" variant="ghost" />
      </div>
    </div>
  );
}
