import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Typography,
  Row,
  Col,
  Divider,
  message,
  Space,
  Tag,
  Modal,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  SaveOutlined,
  EditOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { changePassword, getProfile } from "../store/api/authApi";
import LoadingSpinner from "../components/LoadingSpinner";

const { Title, Text } = Typography;

export default function Profile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    // Load fresh profile data
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        fullName: user.profile?.fullName,
        email: user.profile?.email,
        phone: user.profile?.phone?.replace("+998", ""),
      });
    }
  }, [user, form]);

  const handleProfileUpdate = async (values) => {
    try {
      // Here you would call an API to update profile
      // For now, just show success message
      message.success("Profil ma'lumotlari yangilandi");
      setEditMode(false);
    } catch (error) {
      message.error("Xatolik yuz berdi");
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setChangingPassword(true);
      const result = await dispatch(
        changePassword({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        })
      ).unwrap();

      if (result.success) {
        message.success("Parol muvaffaqiyatli o'zgartirildi");
        setPasswordModalOpen(false);
        passwordForm.resetFields();
      }
    } catch (error) {
      message.error(error.message || "Parol o'zgartirishda xatolik");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="border-0 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <Title level={3} className="!mb-0">
            Mening profilim
          </Title>
          {!editMode && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditMode(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 border-0"
            >
              Tahrirlash
            </Button>
          )}
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div className="text-center">
              <Avatar
                size={150}
                icon={<UserOutlined />}
                src={user?.profile?.image}
                className="bg-gradient-to-r from-green-500 to-emerald-600 mb-4"
              />
              <Title level={4}>{user?.profile?.fullName}</Title>
              <Text className="text-gray-500">@{user?.username}</Text>
              <div className="mt-4">
                <Tag color="green" className="text-base px-4 py-1">
                  Fakultet Admin
                </Tag>
              </div>

              <Divider />

              <div className="text-left space-y-3">
                <div className="flex items-center gap-3">
                  <HomeOutlined className="text-gray-400 text-lg" />
                  <div>
                    <Text className="text-gray-500 block text-xs">
                      Fakultet
                    </Text>
                    <Text className="font-medium">
                      {user?.faculty?.name || "Belgilanmagan"}
                    </Text>
                  </div>
                </div>

                {user?.profile?.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneOutlined className="text-gray-400 text-lg" />
                    <div>
                      <Text className="text-gray-500 block text-xs">
                        Telefon
                      </Text>
                      <Text className="font-medium">
                        {user.profile.phone
                          .replace("+998", "+998 ")
                          .replace(
                            /(\d{2})(\d{3})(\d{2})(\d{2})/,
                            "$1 $2-$3-$4"
                          )}
                      </Text>
                    </div>
                  </div>
                )}

                {user?.profile?.email && (
                  <div className="flex items-center gap-3">
                    <MailOutlined className="text-gray-400 text-lg" />
                    <div>
                      <Text className="text-gray-500 block text-xs">Email</Text>
                      <Text className="font-medium">{user.profile.email}</Text>
                    </div>
                  </div>
                )}
              </div>

              <Divider />

              <Button
                type="default"
                icon={<KeyOutlined />}
                onClick={() => setPasswordModalOpen(true)}
                block
              >
                Parolni o'zgartirish
              </Button>
            </div>
          </Col>

          <Col xs={24} md={16}>
            <Card className="bg-gray-50">
              <Title level={5} className="mb-4">
                Profil ma'lumotlari
              </Title>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleProfileUpdate}
                disabled={!editMode}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="username"
                      label="Username"
                      rules={[
                        {
                          required: true,
                          message: "Username kiritilishi shart!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Username"
                        disabled
                        size="large"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="fullName"
                      label="To'liq ism"
                      rules={[
                        {
                          required: true,
                          message: "To'liq ism kiritilishi shart!",
                        },
                      ]}
                    >
                      <Input placeholder="To'liq ism" size="large" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { type: "email", message: "Email formati noto'g'ri!" },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="email@example.com"
                        size="large"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phone"
                      label="Telefon raqam"
                      rules={[
                        {
                          pattern: /^\d{9}$/,
                          message:
                            "Telefon raqam 9 ta raqamdan iborat bo'lishi kerak",
                        },
                      ]}
                    >
                      <Input
                        addonBefore="+998"
                        placeholder="90 123 45 67"
                        maxLength={9}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {editMode && (
                  <Form.Item className="mb-0">
                    <Space className="w-full justify-end">
                      <Button onClick={() => setEditMode(false)} size="large">
                        Bekor qilish
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        size="large"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 border-0"
                      >
                        Saqlash
                      </Button>
                    </Space>
                  </Form.Item>
                )}
              </Form>
            </Card>

            <Card className="mt-4 bg-blue-50 border-blue-200">
              <Title level={5} className="mb-3">
                Tizim ma'lumotlari
              </Title>

              <Row gutter={[16, 16]}>
                <Col xs={12} md={6}>
                  <Text className="text-gray-500 block">Rol</Text>
                  <Text className="font-medium">Fakultet Admin</Text>
                </Col>
                <Col xs={12} md={6}>
                  <Text className="text-gray-500 block">Fakultet kodi</Text>
                  <Text className="font-medium">
                    {user?.faculty?.code || "---"}
                  </Text>
                </Col>
                <Col xs={12} md={6}>
                  <Text className="text-gray-500 block">Yaratilgan</Text>
                  <Text className="font-medium">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("uz")
                      : "---"}
                  </Text>
                </Col>
                <Col xs={12} md={6}>
                  <Text className="text-gray-500 block">Status</Text>
                  <Tag color="green">Faol</Tag>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Password Change Modal */}
      <Modal
        title="Parolni o'zgartirish"
        open={passwordModalOpen}
        onCancel={() => {
          setPasswordModalOpen(false);
          passwordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="oldPassword"
            label="Joriy parol"
            rules={[
              { required: true, message: "Joriy parol kiritilishi shart!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Joriy parolni kiriting"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Yangi parol"
            rules={[
              { required: true, message: "Yangi parol kiritilishi shart!" },
              {
                min: 6,
                message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Yangi parolni kiriting"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Yangi parolni tasdiqlang"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Parolni tasdiqlang!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Parollar mos kelmaydi!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Yangi parolni qayta kiriting"
              size="large"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setPasswordModalOpen(false);
                  passwordForm.resetFields();
                }}
              >
                Bekor qilish
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={changingPassword}
                className="bg-gradient-to-r from-green-500 to-emerald-600 border-0"
              >
                O'zgartirish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
