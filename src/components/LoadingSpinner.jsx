import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function LoadingSpinner({
  size = "default",
  fullScreen = false,
}) {
  const antIcon = (
    <LoadingOutlined style={{ fontSize: size === "large" ? 48 : 24 }} spin />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <Spin indicator={antIcon} size="large" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Spin indicator={antIcon} size={size} />
    </div>
  );
}
