import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  TimePicker,
  InputNumber,
  Space,
  Button,
  message,
} from "antd";
import {
  useCreateClubMutation,
  useUpdateClubMutation,
  useGetFacultyTutorsQuery,
} from "../store/api/facultyApi";
import dayjs from "dayjs";

const { TextArea } = Input;

export default function ClubModal({ open, onClose, editingClub }) {
  const [form] = Form.useForm();
  const [createClub, { isLoading: creating }] = useCreateClubMutation();
  const [updateClub, { isLoading: updating }] = useUpdateClubMutation();
  const { data: tutorsData } = useGetFacultyTutorsQuery();

  const tutors = tutorsData?.data || [];

  useEffect(() => {
    if (editingClub) {
      form.setFieldsValue({
        name: editingClub.name,
        description: editingClub.description,
        tutorId: editingClub.tutor?._id,
        location: editingClub.location,
        capacity: editingClub.capacity,
        telegramChannelLink: editingClub.telegramChannelLink,
        days: editingClub.schedule?.days,
        weekType: editingClub.schedule?.weekType,
        time: editingClub.schedule?.time
          ? [
              dayjs(editingClub.schedule.time.start, "HH:mm"),
              dayjs(editingClub.schedule.time.end, "HH:mm"),
            ]
          : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [editingClub, form]);

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        schedule: {
          days: values.days,
          weekType: values.weekType,
          time: {
            start: values.time[0].format("HH:mm"),
            end: values.time[1].format("HH:mm"),
          },
        },
      };

      delete formattedValues.days;
      delete formattedValues.weekType;
      delete formattedValues.time;

      if (editingClub) {
        const result = await updateClub({
          id: editingClub._id,
          ...formattedValues,
        }).unwrap();
        if (result.success) {
          message.success("To'garak yangilandi");
        }
      } else {
        const result = await createClub(formattedValues).unwrap();
        if (result.success) {
          message.success("To'garak yaratildi");
        }
      }
      onClose();
    } catch (error) {
      message.error(error.data?.message || "Xatolik yuz berdi");
    }
  };

  const weekDays = [
    { value: 1, label: "Dushanba" },
    { value: 2, label: "Seshanba" },
    { value: 3, label: "Chorshanba" },
    { value: 4, label: "Payshanba" },
    { value: 5, label: "Juma" },
    { value: 6, label: "Shanba" },
    { value: 7, label: "Yakshanba" },
  ];

  return (
    <Modal
      title={editingClub ? "To'garakni tahrirlash" : "Yangi to'garak"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="To'garak nomi"
          rules={[
            { required: true, message: "To'garak nomi kiritilishi shart!" },
          ]}
        >
          <Input placeholder="To'garak nomini kiriting" size="large" />
        </Form.Item>

        <Form.Item name="description" label="Tavsif">
          <TextArea placeholder="To'garak haqida qisqacha ma'lumot" rows={3} />
        </Form.Item>

        <Form.Item
          name="tutorId"
          label="Tutor"
          rules={[{ required: true, message: "Tutor tanlanishi shart!" }]}
        >
          <Select
            placeholder="Tutorni tanlang"
            size="large"
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            options={tutors.map((t) => ({
              value: t._id,
              label: t.profile?.fullName,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="days"
          label="Kunlar"
          rules={[{ required: true, message: "Kunlar tanlanishi shart!" }]}
        >
          <Select
            mode="multiple"
            placeholder="Dars kunlarini tanlang"
            size="large"
            options={weekDays}
          />
        </Form.Item>

        <Form.Item
          name="weekType"
          label="Hafta turi"
          rules={[{ required: true, message: "Hafta turi tanlanishi shart!" }]}
        >
          <Select
            placeholder="Hafta turini tanlang"
            size="large"
            options={[
              { value: "odd", label: "Toq haftalar" },
              { value: "even", label: "Juft haftalar" },
              { value: "both", label: "Har hafta" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="time"
          label="Vaqt"
          rules={[{ required: true, message: "Vaqt kiritilishi shart!" }]}
        >
          <TimePicker.RangePicker
            format="HH:mm"
            placeholder={["Boshlanish", "Tugash"]}
            size="large"
            className="w-full"
          />
        </Form.Item>

        <Form.Item name="location" label="Joylashuv">
          <Input placeholder="Xona raqami yoki manzil" size="large" />
        </Form.Item>

        <Form.Item name="capacity" label="Sig'im">
          <InputNumber
            placeholder="Maksimal studentlar soni"
            size="large"
            min={1}
            className="w-full"
          />
        </Form.Item>

        <Form.Item name="telegramChannelLink" label="Telegram kanal">
          <Input placeholder="https://t.me/channel" size="large" />
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
              {editingClub ? "Yangilash" : "Qo'shish"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
