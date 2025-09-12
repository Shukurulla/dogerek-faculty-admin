import { useState } from "react";
import {
  Table,
  Card,
  Select,
  Input,
  Tag,
  Avatar,
  Typography,
  Tabs,
  Badge,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  BookOutlined,
  GlobalOutlined,
  WarningOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useGetFacultyStudentsQuery } from "../store/api/facultyApi";
import LoadingSpinner from "../components/LoadingSpinner";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function Students() {
  const [filters, setFilters] = useState({
    groupId: null,
    busy: null,
    search: "",
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useGetFacultyStudentsQuery(filters);
  const students = data?.data?.students || [];
  const pagination = data?.data?.pagination || {};

  const columns = [
    {
      title: "Student",
      key: "student",
      fixed: "left",
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.image}
            icon={!record.image && <UserOutlined />}
            size="large"
            className="bg-green-500"
          />
          <div>
            <div className="font-medium">{record.full_name}</div>
            <Text className="text-xs text-gray-500">
              {record.student_id_number}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Guruh",
      dataIndex: ["group", "name"],
      key: "group",
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: "Kurs",
      dataIndex: ["level", "name"],
      key: "level",
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: "To'garaklar",
      key: "clubs",
      render: (_, record) => {
        const activeClubs =
          record.enrolledClubs?.filter((e) => e.status === "approved") || [];
        if (activeClubs.length === 0) {
          return <Tag color="default">Yo'q</Tag>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {activeClubs.map((club, index) => (
              <Tag key={index} color="purple" icon={<BookOutlined />}>
                {club.club?.name || "To'garak"}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: "Tashqi kurslar",
      key: "external",
      render: (_, record) => {
        const count = record.externalCourses?.length || 0;
        if (count === 0) {
          return <Tag color="default">Yo'q</Tag>;
        }
        return (
          <Tag color="orange" icon={<GlobalOutlined />}>
            {count} ta
          </Tag>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const hasClubs =
          record.enrolledClubs?.filter((e) => e.status === "approved").length >
          0;
        const hasExternal = record.externalCourses?.length > 0;

        if (hasClubs || hasExternal) {
          return <Badge status="success" text="Band" />;
        }
        return <Badge status="warning" text="Band emas" />;
      },
    },
  ];

  // Mock groups
  const groups = [
    { id: 1, name: "101-guruh" },
    { id: 2, name: "102-guruh" },
    { id: 3, name: "201-guruh" },
    { id: 4, name: "301-guruh" },
  ];

  const handleTabChange = (key) => {
    setFilters((prev) => ({
      ...prev,
      busy: key === "all" ? null : key,
      page: 1,
    }));
  };

  if (isLoading) return <LoadingSpinner size="large" />;

  // Statistics
  const totalStudents = pagination.total || 0;
  const busyStudents = students.filter(
    (s) =>
      s.enrolledClubs?.filter((e) => e.status === "approved").length > 0 ||
      s.externalCourses?.length > 0
  ).length;
  const notBusyStudents = totalStudents - busyStudents;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <Title level={3} className="!mb-0">
            Fakultet studentlari
          </Title>

          <div className="flex gap-3">
            <Select
              placeholder="Guruh"
              style={{ width: 150 }}
              allowClear
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, groupId: value }))
              }
            >
              {groups.map((g) => (
                <Select.Option key={g.id} value={g.id}>
                  {g.name}
                </Select.Option>
              ))}
            </Select>

            <Input
              placeholder="Qidirish..."
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card
            className="border border-blue-200 bg-blue-50 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleTabChange("all")}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Jami studentlar</Text>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {totalStudents}
                </div>
              </div>
              <TeamOutlined className="text-3xl text-blue-400" />
            </div>
          </Card>

          <Card
            className="border border-green-200 bg-green-50 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleTabChange("true")}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Band studentlar</Text>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {busyStudents}
                </div>
                <Text className="text-xs text-green-500">
                  {totalStudents > 0
                    ? `${((busyStudents / totalStudents) * 100).toFixed(1)}%`
                    : "0%"}
                </Text>
              </div>
              <BookOutlined className="text-3xl text-green-400" />
            </div>
          </Card>

          <Card
            className="border border-orange-200 bg-orange-50 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleTabChange("false")}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Band bo'lmagan</Text>
                <div className="text-2xl font-bold text-orange-600 mt-1">
                  {notBusyStudents}
                </div>
                <Text className="text-xs text-orange-500">
                  {totalStudents > 0
                    ? `${((notBusyStudents / totalStudents) * 100).toFixed(1)}%`
                    : "0%"}
                </Text>
              </div>
              <WarningOutlined className="text-3xl text-orange-400" />
            </div>
          </Card>
        </div>

        <Tabs
          activeKey={filters.busy || "all"}
          onChange={handleTabChange}
          className="mb-4"
        >
          <TabPane
            tab={
              <span>
                Barcha studentlar <Badge count={totalStudents} showZero />
              </span>
            }
            key="all"
          />
          <TabPane
            tab={
              <span>
                Band studentlar{" "}
                <Badge count={busyStudents} showZero className="bg-green-500" />
              </span>
            }
            key="true"
          />
          <TabPane
            tab={
              <span>
                Band bo'lmaganlar{" "}
                <Badge
                  count={notBusyStudents}
                  showZero
                  className="bg-orange-500"
                />
              </span>
            }
            key="false"
          />
        </Tabs>

        <Table
          columns={columns}
          dataSource={students}
          rowKey="_id"
          scroll={{ x: 1000 }}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Jami: ${total} ta`,
            onChange: (page, pageSize) =>
              setFilters((prev) => ({ ...prev, page, limit: pageSize })),
          }}
          className="shadow-sm"
        />
      </Card>
    </div>
  );
}
