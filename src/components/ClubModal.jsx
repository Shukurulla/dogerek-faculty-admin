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
  Tag,
  Spin,
} from "antd";
import {
  BookOutlined,
  TagsOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import {
  useCreateClubMutation,
  useUpdateClubMutation,
  useGetFacultyTutorsQuery,
  useGetAllCategoriesQuery,
} from "../store/api/facultyApi";
import dayjs from "dayjs";

const { TextArea } = Input;

export default function ClubModal({ open, onClose, editingClub }) {
  const [form] = Form.useForm();
  const [createClub, { isLoading: creating }] = useCreateClubMutation();
  const [updateClub, { isLoading: updating }] = useUpdateClubMutation();

  const { data: tutorsData, isLoading: tutorsLoading } =
    useGetFacultyTutorsQuery();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAllCategoriesQuery();

  const tutors = tutorsData?.data || [];
  const categories = categoriesData?.data || [];

  useEffect(() => {
    if (editingClub) {
      const scheduleTime = editingClub.schedule?.time;
      form.setFieldsValue({
        name: editingClub.name,
        description: editingClub.description,
        categoryId: editingClub.category?._id,
        tutorId: editingClub.tutor?._id,
        location: editingClub.location,
        capacity: editingClub.capacity,
        telegramChannelLink: editingClub.telegramChannelLink,
        days: editingClub.schedule?.days || [],
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
      if (!values.time || values.time.length !== 2) {
        message.error("Vaqt oralig'ini to'liq kiriting");
        return;
      }

      const formattedValues = {
        ...values,
        schedule: {
          days: values.days,
          weekType: "both",
          time: {
            start: values.time[0].format("HH:mm"),
            end: values.time[1].format("HH:mm"),
          },
        },
      };

      delete formattedValues.days;
      delete formattedValues.time;

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

  const activeTutors = tutors.filter((t) => t.isActive);
  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <BookOutlined className="text-green-500" />
          <span>
            {editingClub ? "To'garakni tahrirlash" : "Yangi to'garak"}
          </span>
        </div>
      }
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
          label={
            <span className="flex items-center gap-1">
              <BookOutlined className="text-gray-500" />
              To'garak nomi
            </span>
          }
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
          name="categoryId"
          label={
            <span className="flex items-center gap-1">
              <TagsOutlined className="text-gray-500" />
              Kategoriya
            </span>
          }
          rules={[{ required: true, message: "Kategoriya tanlanishi shart!" }]}
        >
          <Select
            placeholder="Kategoriyani tanlang"
            size="large"
            showSearch
            loading={categoriesLoading}
            filterOption={(input, option) =>
              option?.searchValue?.toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={
              categoriesLoading ? (
                <div className="text-center py-2">
                  <Spin size="small" />
                  <div className="text-xs mt-1">Yuklanmoqda...</div>
                </div>
              ) : activeCategories.length === 0 ? (
                <div className="text-center py-2 text-gray-500">
                  Faol kategoriyalar yo'q
                </div>
              ) : (
                "Topilmadi"
              )
            }
          >
            {activeCategories.map((cat) => (
              <Select.Option
                key={cat._id}
                value={cat._id}
                searchValue={cat.name}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium">{cat.name}</span>
                  {cat.clubCount > 0 && (
                    <Tag className="ml-auto" color="default">
                      {cat.clubCount} ta to'garak
                    </Tag>
                  )}
                </div>
              </Select.Option>
            ))}
          </Select>
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
          label={
            <span className="flex items-center gap-1">
              <UserOutlined className="text-gray-500" />
              O'qituvchi
            </span>
          }
          rules={[{ required: true, message: "O'qituvchi tanlanishi shart!" }]}
        >
          <Select
            placeholder="O'qituvchini tanlang"
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
              tutorsLoading ? (
                <div className="text-center py-2">
                  <Spin size="small" />
                  <div className="text-xs mt-1">Yuklanmoqda...</div>
                </div>
              ) : activeTutors.length === 0 ? (
                <div className="text-center py-2 text-gray-500">
                  Faol o'qituvchilar yo'q
                </div>
              ) : (
                "Topilmadi"
              )
            }
          />
        </Form.Item>

        <Form.Item
          name="days"
          label={
            <span className="flex items-center gap-1">
              <ClockCircleOutlined className="text-gray-500" />
              Dars kunlari
            </span>
          }
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
          name="time"
          label={
            <span className="flex items-center gap-1">
              <ClockCircleOutlined className="text-gray-500" />
              Dars vaqti
            </span>
          }
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
          label={
            <span className="flex items-center gap-1">
              <EnvironmentOutlined className="text-gray-500" />
              Joylashuv
            </span>
          }
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
          label={
            <span className="flex items-center gap-1">
              <TeamOutlined className="text-gray-500" />
              Sig'im
            </span>
          }
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
          label={
            <span className="flex items-center gap-1">
              <LinkOutlined className="text-gray-500" />
              Telegram kanal
            </span>
          }
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
