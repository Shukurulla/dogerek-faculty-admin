import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Layout,
  Button,
  Dropdown,
  Avatar,
  Space,
  Badge,
  Typography,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { logout } from "../store/api/authApi";
import { message } from "antd";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export default function Header({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    message.success("Tizimdan chiqdingiz");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profil",
      onClick: () => navigate("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Chiqish",
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader className="bg-white px-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="text-lg"
        />

        <div className="flex items-center gap-2">
          <HomeOutlined className="text-green-600" />
          <Text className="font-medium text-gray-700">
            {user?.faculty?.name || "Fakultet"}
          </Text>
        </div>
      </div>

      <Space size="large">
        <Badge count={3} size="small">
          <Button
            type="text"
            shape="circle"
            icon={<BellOutlined className="text-lg" />}
          />
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <Space className="cursor-pointer hover:bg-gray-50 px-3 py-1 rounded-lg transition-colors">
            <Avatar icon={<UserOutlined />} className="bg-green-500" />
            <div className="text-left">
              <div className="font-medium">
                {user?.profile?.fullName || user?.username}
              </div>
              <div className="text-xs text-gray-500">Fakultet Admin</div>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
