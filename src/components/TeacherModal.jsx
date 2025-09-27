import { useEffect } from "react";
import { Modal, Form, Input, Space, Button, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import {
  useCreateTutorMutation,
  useUpdateTutorMutation,
} from "../store/api/facultyApi";

export default function TeacherModal({ open, onClose, editingTeacher }) {
  const [form] = Form.useForm();
  const [createTeacher, { isLoading: creating }] = useCreateTutorMutation();
  const [updateTeacher, { isLoading: updating }] = useUpdateTutorMutation();

  useEffect(() => {
    if (editingTeacher) {
      form.setFieldsValue({
        username: editingTeacher.username,
        fullName: editingTeacher.profile?.fullName,
        phone: editingTeacher.profile?.phone?.replace("+998", "") || "",
        email: editingTeacher.profile?.email || "",
      });
    } else {
      form.resetFields();
    }
  }, [editingTeacher, form]);

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        phone: values.phone ? values.phone.replace(/\D/g, "") : "",
      };

      if (editingTeacher) {
        const result = await updateTeacher({
          id: editingTeacher._id,
          ...formattedValues,
        }).unwrap();
        if (result.success) {
          message.success("O'qituvchi ma'lumotlari yangilandi");
        }
      } else {
        const result = await createTeacher(formattedValues).unwrap();
        if (result.success) {
          message.success("O'qituvchi muvaffaqiyatli qo'shildi");
        }
      }
      onClose();
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Xatolik yuz berdi";
      message.error(errorMessage);
    }
  };

  const validatePhone = (_, value) => {
    if (!value) return Promise.resolve();
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length !== 9) {
      return Promise.reject(
        new Error("Telefon raqam 9 ta raqamdan iborat bo'lishi kerak")
      );
    }
    return Promise.resolve();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UserOutlined className="text-green-500" />
          <span>
            {editingTeacher ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi"}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        preserve={false}
      >
        <Form.Item
          name="username"
          label={
            <span className="flex items-center gap-1">
              <UserOutlined className="text-gray-500" />
              Username
            </span>
          }
          rules={[
            { required: true, message: "Username kiritilishi shart!" },
            { min: 3, message: "Kamida 3 ta belgi" },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: "Faqat harflar, raqamlar va _ belgisi ishlatish mumkin",
            },
          ]}
        >
          <Input
            placeholder="Username"
            disabled={!!editingTeacher}
            size="large"
            maxLength={20}
          />
        </Form.Item>

        {!editingTeacher && (
          <Form.Item
            name="password"
            label={
              <span className="flex items-center gap-1">
                <LockOutlined className="text-gray-500" />
                Parol
              </span>
            }
            rules={[
              { required: true, message: "Parol kiritilishi shart!" },
              { min: 6, message: "Kamida 6 ta belgi" },
              { max: 50, message: "Maksimal 50 ta belgi" },
            ]}
          >
            <Input.Password
              placeholder="Parol"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>
        )}

        <Form.Item
          name="fullName"
          label={
            <span className="flex items-center gap-1">
              <UserOutlined className="text-gray-500" />
              F.I.O
            </span>
          }
          rules={[
            { required: true, message: "F.I.O kiritilishi shart!" },
            { min: 2, message: "Kamida 2 ta belgi" },
            { max: 100, message: "Maksimal 100 ta belgi" },
          ]}
        >
          <Input
            placeholder="To'liq ism familiya"
            size="large"
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label={
            <span className="flex items-center gap-1">
              <PhoneOutlined className="text-gray-500" />
              Telefon raqam
            </span>
          }
          rules={[{ validator: validatePhone }]}
        >
          <Input
            addonBefore="+998"
            placeholder="90 123 45 67"
            maxLength={9}
            size="large"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              form.setFieldValue("phone", value);
            }}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={
            <span className="flex items-center gap-1">
              <MailOutlined className="text-gray-500" />
              Email
            </span>
          }
          rules={[
            { type: "email", message: "Email formati noto'g'ri" },
            { max: 100, message: "Maksimal 100 ta belgi" },
          ]}
        >
          <Input placeholder="email@example.com" size="large" maxLength={100} />
        </Form.Item>

        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={onClose} size="large">
              Bekor qilish
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={creating || updating}
              size="large"
              className="bg-gradient-to-r from-green-500 to-emerald-600 border-0"
            >
              {editingTeacher ? "Yangilash" : "Qo'shish"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
