import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Layout as AntLayout } from "antd";
import Sidebar from "./Sidebar";
import Header from "./Header";

const { Content } = AntLayout;

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AntLayout className="min-h-screen">
      <Sidebar collapsed={collapsed} />
      <AntLayout
        className={`transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className="p-6 bg-gray-50">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
