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

  // Real tutorlarni olish
  const { data: tutorsData, isLoading: tutorsLoading } =
    useGetFacultyTutorsQuery();
  const tutors = tutorsData?.data || [];

  useEffect(() => {
    if (editingClub) {
      // Real club ma'lumotlarini formaga yuklaymiz
      const scheduleTime = editingClub.schedule?.time;
      form.setFieldsValue({
        name: editingClub.name,
        description: editingClub.description,
        tutorId: editingClub.tutor?._id,
        location: editingClub.location,
        capacity: editingClub.capacity,
        telegramChannelLink: editingClub.telegramChannelLink,
        days: editingClub.schedule?.days || [],
        weekType: editingClub.schedule?.weekType || "both",
        time:
          scheduleTime?.start && scheduleTime?.end
            ? [
                dayjs(scheduleTime.start, "HH:mm"),
                dayjs(scheduleTime.end, "HH:mm"),
              ]
            : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [editingClub, form]);

  const handleSubmit = async (values) => {
    try {
      // Validate time
      if (!values.time || values.time.length !== 2) {
        message.error("Vaqt oralig'ini to'liq kiriting");
        return;
      }

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

      // Remove fields that are now in schedule
      delete formattedValues.days;
      delete formattedValues.weekType;
      delete formattedValues.time;

      // Validate telegram link format
      if (
        formattedValues.telegramChannelLink &&
        !formattedValues.telegramChannelLink.startsWith("https://t.me/")
      ) {
        message.error(
          "Telegram kanal linki https://t.me/ bilan boshlanishi kerak"
        );
        return;
      }

      if (editingClub) {
        const result = await updateClub({
          id: editingClub._id,
          ...formattedValues,
        }).unwrap();
        if (result.success) {
          message.success("To'garak muvaffaqiyatli yangilandi");
        }
      } else {
        const result = await createClub(formattedValues).unwrap();
        if (result.success) {
          message.success("To'garak muvaffaqiyatli yaratildi");
        }
      }
      onClose();
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Xatolik yuz berdi";
      message.error(errorMessage);
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

  const weekTypes = [
    { value: "odd", label: "Toq haftalar" },
    { value: "even", label: "Juft haftalar" },
    { value: "both", label: "Har hafta" },
  ];

  // Active tutorlarni filterlash
  const activeTutors = tutors.filter((t) => t.isActive);

  return (
    <Modal
      title={editingClub ? "To'garakni tahrirlash" : "Yangi to'garak"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        preserve={false}
      >
        <Form.Item
          name="name"
          label="To'garak nomi"
          rules={[
            { required: true, message: "To'garak nomi kiritilishi shart!" },
            { min: 2, message: "Kamida 2 ta belgi" },
            { max: 100, message: "Maksimal 100 ta belgi" },
          ]}
        >
          <Input
            placeholder="To'garak nomini kiriting"
            size="large"
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Tavsif"
          rules={[{ max: 500, message: "Maksimal 500 ta belgi" }]}
        >
          <TextArea
            placeholder="To'garak haqida qisqacha ma'lumot"
            rows={3}
            maxLength={500}
            showCount
          />
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
            loading={tutorsLoading}
            filterOption={(input, option) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
            options={activeTutors.map((t) => ({
              value: t._id,
              label: t.profile?.fullName || t.username,
            }))}
            notFoundContent={
              tutorsLoading
                ? "Yuklanmoqda..."
                : activeTutors.length === 0
                ? "Faol tutorlar yo'q"
                : "Topilmadi"
            }
          />
        </Form.Item>

        <Form.Item
          name="days"
          label="Kunlar"
          rules={[
            { required: true, message: "Kunlar tanlanishi shart!" },
            {
              type: "array",
              min: 1,
              message: "Kamida bitta kun tanlash kerak!",
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Dars kunlarini tanlang"
            size="large"
            options={weekDays}
            maxTagCount="responsive"
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
            options={weekTypes}
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
            minuteStep={15}
          />
        </Form.Item>

        <Form.Item
          name="location"
          label="Joylashuv"
          rules={[{ max: 100, message: "Maksimal 100 ta belgi" }]}
        >
          <Input
            placeholder="Xona raqami yoki manzil"
            size="large"
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          name="capacity"
          label="Sig'im"
          rules={[
            { type: "number", min: 1, max: 1000, message: "1 dan 1000 gacha" },
          ]}
        >
          <InputNumber
            placeholder="Maksimal studentlar soni"
            size="large"
            min={1}
            max={1000}
            className="w-full"
          />
        </Form.Item>

        <Form.Item
          name="telegramChannelLink"
          label="Telegram kanal"
          rules={[
            { type: "url", message: "Link formati noto'g'ri" },
            { max: 200, message: "Maksimal 200 ta belgi" },
          ]}
        >
          <Input
            placeholder="https://t.me/channel"
            size="large"
            maxLength={200}
          />
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
              {editingClub ? "Yangilash" : "Qo'shish"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
