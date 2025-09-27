import { useState } from "react";
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Avatar,
  Popconfirm,
  message,
  Input,
  Badge,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  BookOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  useGetFacultyTutorsQuery,
  useDeleteTutorMutation,
} from "../store/api/facultyApi";
import TeacherModal from "../components/TeacherModal";
import LoadingSpinner from "../components/LoadingSpinner";

const { Title, Text } = Typography;

export default function Teachers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchText, setSearchText] = useState("");

  const { data, isLoading } = useGetFacultyTutorsQuery();
  const [deleteTeacher] = useDeleteTutorMutation();

  const teachers = data?.data || [];

  // Filter teachers based on search
  const filteredTeachers = teachers.filter((teacher) =>
    teacher.profile?.fullName?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleEdit = (record) => {
    setEditingTeacher(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteTeacher(id).unwrap();
      if (result.success) {
        message.success("O'qituvchi o'chirildi");
      }
    } catch (error) {
      message.error(error.data?.message || "Xatolik yuz berdi");
    }
  };

  const columns = [
    {
      title: "O'qituvchi",
      key: "teacher",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.profile?.image}
            icon={!record.profile?.image && <UserOutlined />}
            size="large"
            className="bg-gradient-to-r from-green-500 to-emerald-600"
          />
          <div>
            <div className="font-medium text-base">
              {record.profile?.fullName}
            </div>
            <Text className="text-xs text-gray-500">@{record.username}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Kontakt",
      key: "contact",
      render: (_, record) => (
        <div className="space-y-1">
          {record.profile?.phone && (
            <div className="flex items-center gap-2">
              <PhoneOutlined className="text-gray-400" />
              <Text className="text-sm">
                {record.profile.phone
                  .replace("+998", "+998 ")
                  .replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2-$3-$4")}
              </Text>
            </div>
          )}
          {record.profile?.email && (
            <div className="flex items-center gap-2">
              <MailOutlined className="text-gray-400" />
              <Text className="text-sm">{record.profile.email}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "To'garaklar",
      key: "clubs",
      render: (_, record) => {
        const clubCount = record.assignedClubs?.length || 0;
        if (clubCount === 0) {
          return <Tag color="default">Biriktirilmagan</Tag>;
        }
        return (
          <Tooltip
            title={
              <div>
                {record.assignedClubs?.map((club, index) => (
                  <div key={index}>{club.name}</div>
                ))}
              </div>
            }
          >
            <Tag
              color="purple"
              icon={<BookOutlined />}
              className="cursor-pointer"
            >
              {clubCount} ta to'garak
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Yaratilgan",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <Text className="text-sm text-gray-500">
          {new Date(date).toLocaleDateString("uz")}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (isActive) => (
        <Badge
          status={isActive ? "success" : "default"}
          text={
            <span className="flex items-center gap-1">
              {isActive ? (
                <>
                  <CheckCircleOutlined className="text-green-500" />
                  Faol
                </>
              ) : (
                <>
                  <CloseCircleOutlined className="text-gray-400" />
                  Nofaol
                </>
              )}
            </span>
          }
        />
      ),
    },
    {
      title: "Amallar",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-blue-500 hover:text-blue-600"
          />
          <Popconfirm
            title="O'chirishni tasdiqlaysizmi?"
            description={
              record.assignedClubs?.length > 0
                ? "Bu o'qituvchiga biriktirilgan to'garaklar mavjud!"
                : "Bu amalni bekor qilib bo'lmaydi"
            }
            onConfirm={() => handleDelete(record._id)}
            okText="Ha"
            cancelText="Yo'q"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner size="large" />;

  // Statistics
  const stats = {
    total: teachers.length,
    active: teachers.filter((t) => t.isActive).length,
    withClubs: teachers.filter((t) => t.assignedClubs?.length > 0).length,
    totalClubs: teachers.reduce(
      (sum, t) => sum + (t.assignedClubs?.length || 0),
      0
    ),
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <Title level={3} className="!mb-0">
            O'qituvchilar
          </Title>

          <div className="flex gap-3">
            <Input
              placeholder="Qidirish..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTeacher(null);
                setIsModalOpen(true);
              }}
              size="large"
              className="bg-gradient-to-r from-green-500 to-emerald-600 border-0"
            >
              Yangi o'qituvchi
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border border-blue-200 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Jami o'qituvchilar</Text>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {stats.total}
                </div>
              </div>
              <UserOutlined className="text-3xl text-blue-400" />
            </div>
          </Card>

          <Card className="border border-green-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Faol o'qituvchilar</Text>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {stats.active}
                </div>
              </div>
              <CheckCircleOutlined className="text-3xl text-green-400" />
            </div>
          </Card>

          <Card className="border border-purple-200 bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">To'garak bilan</Text>
                <div className="text-2xl font-bold text-purple-600 mt-1">
                  {stats.withClubs}
                </div>
              </div>
              <BookOutlined className="text-3xl text-purple-400" />
            </div>
          </Card>

          <Card className="border border-orange-200 bg-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Jami to'garaklar</Text>
                <div className="text-2xl font-bold text-orange-600 mt-1">
                  {stats.totalClubs}
                </div>
              </div>
              <BookOutlined className="text-3xl text-orange-400" />
            </div>
          </Card>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTeachers}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Jami: ${total} ta`,
          }}
          className="shadow-sm"
        />
      </Card>

      <TeacherModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTeacher(null);
        }}
        editingTeacher={editingTeacher}
      />
    </div>
  );
}
