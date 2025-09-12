import { useEffect } from "react";
import { Modal, Form, Input, Space, Button, message } from "antd";
import {
  useCreateTutorMutation,
  useUpdateTutorMutation,
} from "../store/api/facultyApi";

export default function TutorModal({ open, onClose, editingTutor }) {
  const [form] = Form.useForm();
  const [createTutor, { isLoading: creating }] = useCreateTutorMutation();
  const [updateTutor, { isLoading: updating }] = useUpdateTutorMutation();

  useEffect(() => {
    if (editingTutor) {
      form.setFieldsValue({
        username: editingTutor.username,
        fullName: editingTutor.profile?.fullName,
        phone: editingTutor.profile?.phone?.replace("+998", ""),
        email: editingTutor.profile?.email,
      });
    } else {
      form.resetFields();
    }
  }, [editingTutor, form]);

  const handleSubmit = async (values) => {
    try {
      if (editingTutor) {
        const result = await updateTutor({
          id: editingTutor._id,
          ...values,
        }).unwrap();
        if (result.success) {
          message.success("Tutor ma'lumotlari yangilandi");
        }
      } else {
        const result = await createTutor(values).unwrap();
        if (result.success) {
          message.success("Tutor muvaffaqiyatli qo'shildi");
        }
      }
      onClose();
    } catch (error) {
      message.error(error.data?.message || "Xatolik yuz berdi");
    }
  };

  return (
    <Modal
      title={editingTutor ? "Tutorni tahrirlash" : "Yangi tutor"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[
            { required: true, message: "Username kiritilishi shart!" },
            { min: 3, message: "Kamida 3 ta belgi" },
          ]}
        >
          <Input placeholder="Username" disabled={editingTutor} size="large" />
        </Form.Item>

        {!editingTutor && (
          <Form.Item
            name="password"
            label="Parol"
            rules={[
              { required: true, message: "Parol kiritilishi shart!" },
              { min: 6, message: "Kamida 6 ta belgi" },
            ]}
          >
            <Input.Password placeholder="Parol" size="large" />
          </Form.Item>
        )}

        <Form.Item
          name="fullName"
          label="F.I.O"
          rules={[{ required: true, message: "F.I.O kiritilishi shart!" }]}
        >
          <Input placeholder="To'liq ism familiya" size="large" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Telefon raqam"
          rules={[
            {
              pattern: /^\d{9}$/,
              message: "Telefon raqam 9 ta raqamdan iborat bo'lishi kerak",
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

        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: "email", message: "Email formati noto'g'ri" }]}
        >
          <Input placeholder="email@example.com" size="large" />
        </Form.Item>

        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={onClose}>Bekor qilish</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={creating || updating}
              className="bg-gradient-to-r from-green-500 to-emerald-600 border-0"
            >
              {editingTutor ? "Yangilash" : "Qo'shish"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
