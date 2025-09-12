import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Button, Card, message, Typography } from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { login, clearError } from "../store/api/authApi";

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (values) => {
    try {
      const result = await dispatch(login(values)).unwrap();
      if (result.success) {
        if (result.data.user.role !== "faculty_admin") {
          message.error("Faqat fakultet administratorlari kirishi mumkin");
          return;
        }
        message.success("Muvaffaqiyatli kirish!");
        navigate("/");
      } else {
        message.error(result.message || "Login yoki parol xato");
      }
    } catch (err) {
      message.error("Login yoki parol xato");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BookOutlined className="text-3xl text-green-500" />
            </div>
            <Title level={2} className="!text-white !mb-2">
              Fakultet Admin
            </Title>
            <Text className="text-white/90">
              Fakultet administratori paneli
            </Text>
          </div>

          <div className="p-8">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Username kiritilishi shart!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Username"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Parol kiritilishi shart!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Parol"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  icon={<LoginOutlined />}
                  className="h-12 text-base font-medium rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 border-0 hover:shadow-lg transition-all duration-300"
                >
                  Kirish
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
}
