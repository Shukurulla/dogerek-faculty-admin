import { useState, useEffect } from "react";
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
  Tooltip,
  Empty,
  Spin,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  BookOutlined,
  GlobalOutlined,
  WarningOutlined,
  TeamOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import {
  useGetFacultyStudentsQuery,
  useGetAllGroupsQuery,
} from "../store/api/facultyApi";
import LoadingSpinner from "../components/LoadingSpinner";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function Students() {
  const [filters, setFilters] = useState({
    groupId: null,
    busy: null,
    search: "",
    page: 1,
    limit: 20,
  });

  // Get groups data
  const { data: groupsData } = useGetAllGroupsQuery();
  const groups = groupsData?.data || [];

  // Get students data with filters - NULL VALUES FIXED
  const queryParams = {
    page: filters.page,
    limit: filters.limit,
  };

  // Only add filters if they have actual values
  if (filters.groupId) {
    queryParams.groupId = filters.groupId;
  }
  if (filters.busy !== null) {
    queryParams.busy = filters.busy;
  }
  if (filters.search) {
    queryParams.search = filters.search;
  }

  const { data, isLoading, error, isFetching } =
    useGetFacultyStudentsQuery(queryParams);

  const students = data?.data?.students || [];
  const pagination = data?.data?.pagination || {};

  // Debug log
  useEffect(() => {
    console.log("Students data:", data);
    console.log("Loading:", isLoading);
    console.log("Error:", error);
  }, [data, isLoading, error]);

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
      title: "Fakultet",
      dataIndex: ["department", "name"],
      key: "faculty",
      ellipsis: true,
      render: (text) =>
        text ? (
          <Tooltip title={text}>
            <Tag color="blue" className="max-w-32 truncate">
              {text}
            </Tag>
          </Tooltip>
        ) : (
          <Tag>Noma'lum</Tag>
        ),
    },
    {
      title: "Guruh",
      dataIndex: ["group", "name"],
      key: "group",
      render: (text) =>
        text ? <Tag color="green">{text}</Tag> : <Tag>Noma'lum</Tag>,
    },
    {
      title: "Kurs",
      dataIndex: ["level", "name"],
      key: "level",
      render: (text) => (text ? <Tag>{text}</Tag> : <Tag>Noma'lum</Tag>),
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
            {activeClubs.slice(0, 2).map((club, index) => (
              <Tag key={index} color="purple" icon={<BookOutlined />}>
                {club.club?.name || "To'garak"}
              </Tag>
            ))}
            {activeClubs.length > 2 && (
              <Tooltip
                title={
                  <div>
                    {activeClubs.slice(2).map((club, index) => (
                      <div key={index}>{club.club?.name || "To'garak"}</div>
                    ))}
                  </div>
                }
              >
                <Tag color="purple">+{activeClubs.length - 2}</Tag>
              </Tooltip>
            )}
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

  const handleTabChange = (key) => {
    setFilters((prev) => ({
      ...prev,
      busy: key === "all" ? null : key === "busy" ? "true" : "false",
      page: 1,
    }));
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
      page: 1,
    }));
  };

  const handleGroupChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      groupId: value,
      page: 1,
    }));
  };

  const handleTableChange = (newPagination) => {
    setFilters((prev) => ({
      ...prev,
      page: newPagination.current,
      limit: newPagination.pageSize,
    }));
  };

  // Calculate statistics from current data
  const totalStudents = pagination.total || 0;
  const currentPageStudents = students.length;

  const busyStudents = students.filter(
    (s) =>
      s.enrolledClubs?.filter((e) => e.status === "approved").length > 0 ||
      s.externalCourses?.length > 0
  ).length;

  const notBusyStudents = currentPageStudents - busyStudents;

  // Calculate percentages based on total
  const busyPercentage =
    totalStudents > 0
      ? ((busyStudents / currentPageStudents) * 100).toFixed(1)
      : "0";
  const notBusyPercentage =
    totalStudents > 0
      ? ((notBusyStudents / currentPageStudents) * 100).toFixed(1)
      : "0";

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="text-center">
          <WarningOutlined className="text-4xl text-red-500 mb-4" />
          <Title level={4}>Ma'lumotlarni yuklashda xatolik</Title>
          <Text className="text-gray-500">
            {error?.data?.message || error?.message || "Noma'lum xatolik"}
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <Title level={3} className="!mb-0">
            Studentlar
          </Title>

          <div className="flex gap-3 items-center">
            <Select
              placeholder="Guruhni tanlang"
              style={{ width: 200 }}
              allowClear
              onChange={handleGroupChange}
              value={filters.groupId}
              loading={!groupsData}
              showSearch
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
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
              style={{ width: 250 }}
              onChange={(e) => handleSearch(e.target.value)}
              value={filters.search}
              allowClear
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card
            className="border border-blue-200 bg-blue-50 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleTabChange("all")}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Jami studentlar</Text>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {isLoading ? (
                    <Spin indicator={<LoadingOutlined />} />
                  ) : (
                    totalStudents
                  )}
                </div>
                <Text className="text-xs text-gray-500">
                  Sahifada: {currentPageStudents} ta
                </Text>
              </div>
              <TeamOutlined className="text-3xl text-blue-400" />
            </div>
          </Card>

          <Card
            className="border border-green-200 bg-green-50 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleTabChange("busy")}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Band studentlar</Text>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {isLoading ? (
                    <Spin indicator={<LoadingOutlined />} />
                  ) : (
                    busyStudents
                  )}
                </div>
                <Text className="text-xs text-green-500">
                  Sahifada: {busyPercentage}%
                </Text>
              </div>
              <BookOutlined className="text-3xl text-green-400" />
            </div>
          </Card>

          <Card
            className="border border-orange-200 bg-orange-50 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleTabChange("notBusy")}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Band bo'lmagan</Text>
                <div className="text-2xl font-bold text-orange-600 mt-1">
                  {isLoading ? (
                    <Spin indicator={<LoadingOutlined />} />
                  ) : (
                    notBusyStudents
                  )}
                </div>
                <Text className="text-xs text-orange-500">
                  Sahifada: {notBusyPercentage}%
                </Text>
              </div>
              <WarningOutlined className="text-3xl text-orange-400" />
            </div>
          </Card>
        </div>

        <Tabs
          activeKey={
            filters.busy === null
              ? "all"
              : filters.busy === "true"
              ? "busy"
              : "notBusy"
          }
          onChange={handleTabChange}
          className="mb-4"
        >
          <TabPane tab={<span>Barcha studentlar</span>} key="all" />
          <TabPane tab={<span>Band studentlar</span>} key="busy" />
          <TabPane tab={<span>Band bo'lmaganlar</span>} key="notBusy" />
        </Tabs>

        {isLoading && !students.length ? (
          <LoadingSpinner size="large" />
        ) : students.length > 0 ? (
          <Table
            columns={columns}
            dataSource={students}
            rowKey="_id"
            scroll={{ x: 1200 }}
            loading={isFetching}
            pagination={{
              current: filters.page,
              pageSize: filters.limit,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dan ${total} ta ko'rsatilmoqda`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            onChange={handleTableChange}
            className="shadow-sm"
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <div className="text-lg font-medium mb-1">
                  Studentlar topilmadi
                </div>
                {filters.search && (
                  <Text className="text-gray-500">
                    "{filters.search}" bo'yicha natija yo'q
                  </Text>
                )}
                {filters.groupId && (
                  <Text className="text-gray-500 block">
                    Tanlangan guruhda studentlar yo'q
                  </Text>
                )}
                {filters.busy !== null && (
                  <Text className="text-gray-500 block">
                    Bu kategoriyada studentlar yo'q
                  </Text>
                )}
              </div>
            }
          />
        )}
      </Card>
    </div>
  );
}
