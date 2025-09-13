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
      // Real tutor ma'lumotlarini formaga yuklaymiz
      form.setFieldsValue({
        username: editingTutor.username,
        fullName: editingTutor.profile?.fullName,
        phone: editingTutor.profile?.phone?.replace("+998", "") || "",
        email: editingTutor.profile?.email || "",
      });
    } else {
      form.resetFields();
    }
  }, [editingTutor, form]);

  const handleSubmit = async (values) => {
    try {
      // Telefon raqamni formatlash
      const formattedValues = {
        ...values,
        phone: values.phone ? values.phone.replace(/\D/g, "") : "",
      };

      if (editingTutor) {
        const result = await updateTutor({
          id: editingTutor._id,
          ...formattedValues,
        }).unwrap();
        if (result.success) {
          message.success("Tutor ma'lumotlari yangilandi");
        }
      } else {
        const result = await createTutor(formattedValues).unwrap();
        if (result.success) {
          message.success("Tutor muvaffaqiyatli qo'shildi");
        }
      }
      onClose();
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Xatolik yuz berdi";
      message.error(errorMessage);
    }
  };

  // Telefon raqam validatsiyasi
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
      title={editingTutor ? "Tutorni tahrirlash" : "Yangi tutor"}
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
          label="Username"
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
            disabled={!!editingTutor}
            size="large"
            maxLength={20}
          />
        </Form.Item>

        {!editingTutor && (
          <Form.Item
            name="password"
            label="Parol"
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
          label="F.I.O"
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
          label="Telefon raqam"
          rules={[{ validator: validatePhone }]}
        >
          <Input
            addonBefore="+998"
            placeholder="90 123 45 67"
            maxLength={9}
            size="large"
            onChange={(e) => {
              // Faqat raqamlarni qoldirish
              const value = e.target.value.replace(/\D/g, "");
              form.setFieldValue("phone", value);
            }}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
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
              {editingTutor ? "Yangilash" : "Qo'shish"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
