import { useState } from "react";
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Badge,
  Typography,
  Progress,
  Popconfirm,
  message,
  Empty,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  useGetFacultyClubsQuery,
  useDeleteClubMutation,
} from "../store/api/facultyApi";
import ClubModal from "../components/ClubModal";
import LoadingSpinner from "../components/LoadingSpinner";

const { Title, Text } = Typography;

export default function Clubs() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, error } = useGetFacultyClubsQuery({ page, limit });
  const [deleteClub] = useDeleteClubMutation();

  const clubs = data?.data?.clubs || [];
  const pagination = data?.data?.pagination || {};

  const weekDays = {
    1: "Du",
    2: "Se",
    3: "Ch",
    4: "Pa",
    5: "Ju",
    6: "Sh",
    7: "Ya",
  };

  const handleEdit = (record) => {
    setEditingClub(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteClub(id).unwrap();
      if (result.success) {
        message.success("To'garak o'chirildi");
      }
    } catch (error) {
      message.error(error.data?.message || "Xatolik yuz berdi");
    }
  };

  const columns = [
    {
      title: "To'garak",
      key: "club",
      render: (_, record) => (
        <div>
          <div className="font-medium flex items-center gap-2">
            <BookOutlined className="text-green-500" />
            {record.name}
          </div>
          {record.category && (
            <Tag
              color={record.category.color}
              icon={<TagsOutlined />}
              className="mt-1"
              style={{
                backgroundColor: `${record.category.color}20`,
                borderColor: record.category.color,
              }}
            >
              {record.category.name}
            </Tag>
          )}
          {record.description && (
            <Text className="text-gray-500 text-xs block mt-1">
              {record.description}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "O'qituvchi",
      key: "tutor",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <UserOutlined className="text-gray-400" />
          <div>
            <div className="font-medium">
              {record.tutor?.profile?.fullName || "Belgilanmagan"}
            </div>
            {record.tutor?.profile?.phone && (
              <Text className="text-xs text-gray-500">
                {record.tutor.profile.phone
                  .replace("+998", "+998 ")
                  .replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2-$3-$4")}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Jadval",
      key: "schedule",
      render: (_, record) => {
        if (!record.schedule) {
          return <Text className="text-gray-400">Belgilanmagan</Text>;
        }

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <ClockCircleOutlined className="text-gray-400" />
              <Text className="text-sm">
                {record.schedule?.time?.start} - {record.schedule?.time?.end}
              </Text>
            </div>
            <div className="flex gap-1">
              {record.schedule?.days?.map((day) => (
                <Tag key={day} color="green" className="m-0">
                  {weekDays[day]}
                </Tag>
              ))}
            </div>
          </div>
        );
      },
    },
    {
      title: "Joylashuv",
      dataIndex: "location",
      key: "location",
      render: (text) => (
        <div className="flex items-center gap-1">
          <EnvironmentOutlined className="text-gray-400" />
          <Text className="text-sm">{text || "Belgilanmagan"}</Text>
        </div>
      ),
    },
    {
      title: "Studentlar",
      key: "students",
      render: (_, record) => {
        const current = record.currentStudents || 0;
        const capacity = record.capacity || 0;
        const percentage = capacity > 0 ? (current / capacity) * 100 : 0;

        return (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Text className="text-sm font-medium">
                {current} / {capacity || "∞"}
              </Text>
            </div>
            {capacity > 0 && (
              <Progress
                percent={percentage}
                size="small"
                strokeColor={
                  percentage > 90
                    ? "#ff4d4f"
                    : percentage > 70
                    ? "#faad14"
                    : "#52c41a"
                }
                showInfo={false}
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Telegram",
      key: "telegram",
      render: (_, record) =>
        record.telegramChannelLink ? (
          <Tooltip title={record.telegramChannelLink}>
            <a
              href={record.telegramChannelLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Tag color="blue" className="cursor-pointer">
                Kanal
              </Tag>
            </a>
          </Tooltip>
        ) : (
          <Tag color="default">Yo'q</Tag>
        ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (isActive) => (
        <Badge
          status={isActive ? "success" : "default"}
          text={isActive ? "Faol" : "Nofaol"}
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
            onConfirm={() => handleDelete(record._id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner size="large" />;

  if (error) {
    return (
      <div className="text-center py-12">
        <Text className="text-red-500">
          Ma'lumotlarni yuklashda xatolik yuz berdi
        </Text>
      </div>
    );
  }

  // Real statistics from data
  const totalClubs = pagination.total || 0;
  const activeClubs = clubs.filter((c) => c.isActive).length;
  const totalStudents = clubs.reduce(
    (sum, c) => sum + (c.currentStudents || 0),
    0
  );
  const totalCapacity = clubs.reduce((sum, c) => sum + (c.capacity || 0), 0);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <Title level={3} className="!mb-0">
            To'garaklar
          </Title>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingClub(null);
              setIsModalOpen(true);
            }}
            size="large"
            className="bg-gradient-to-r from-green-500 to-emerald-600 border-0"
          >
            Yangi to'garak
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border border-green-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Jami to'garaklar</Text>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {totalClubs}
                </div>
              </div>
              <BookOutlined className="text-3xl text-green-400" />
            </div>
          </Card>

          <Card className="border border-blue-200 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Faol to'garaklar</Text>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {activeClubs}
                </div>
              </div>
              <CheckCircleOutlined className="text-3xl text-blue-400" />
            </div>
          </Card>

          <Card className="border border-purple-200 bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Jami o'quvchilar</Text>
                <div className="text-2xl font-bold text-purple-600 mt-1">
                  {totalStudents}
                </div>
              </div>
              <TeamOutlined className="text-3xl text-purple-400" />
            </div>
          </Card>

          <Card className="border border-orange-200 bg-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">To'liqlik</Text>
                <div className="text-2xl font-bold text-orange-600 mt-1">
                  {totalCapacity > 0
                    ? `${((totalStudents / totalCapacity) * 100).toFixed(0)}%`
                    : "0%"}
                </div>
              </div>
              <Progress
                type="circle"
                percent={
                  totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0
                }
                width={50}
                strokeColor="#fb923c"
                format={() => ""}
              />
            </div>
          </Card>
        </div>

        {clubs.length > 0 ? (
          <Table
            columns={columns}
            dataSource={clubs}
            rowKey="_id"
            pagination={{
              current: page,
              pageSize: limit,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Jami: ${total} ta`,
              onChange: (page, pageSize) => {
                setPage(page);
                setLimit(pageSize);
              },
            }}
            className="shadow-sm"
            scroll={{ x: 1200 }}
          />
        ) : (
          <div className="text-center py-12">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Hozircha to'garaklar yo'q"
              style={{ marginBottom: 16 }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingClub(null);
                  setIsModalOpen(true);
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 border-0"
              >
                Birinchi to'garakni yarating
              </Button>
            </Empty>
          </div>
        )}
      </Card>

      <ClubModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClub(null);
        }}
        editingClub={editingClub}
      />
    </div>
  );
}
