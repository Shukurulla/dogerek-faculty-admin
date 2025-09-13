import { useState } from "react";
import {
  Table,
  Card,
  DatePicker,
  Select,
  Tag,
  Typography,
  Progress,
  Empty,
  Tooltip,
  Badge,
  Button,
  message,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  useGetFacultyAttendanceQuery,
  useGetFacultyClubsQuery,
} from "../store/api/facultyApi";
import LoadingSpinner from "../components/LoadingSpinner";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function Attendance() {
  const [filters, setFilters] = useState({
    clubId: null,
    startDate: null,
    endDate: null,
    page: 1,
    limit: 20,
  });

  const { data: attendanceData, isLoading: loadingAttendance } =
    useGetFacultyAttendanceQuery(filters);
  const { data: clubsData } = useGetFacultyClubsQuery({ limit: 100 });

  const attendance = attendanceData?.data?.attendance || [];
  const pagination = attendanceData?.data?.pagination || {};
  const clubs = clubsData?.data?.clubs || [];

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setFilters((prev) => ({
        ...prev,
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
        page: 1,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        startDate: null,
        endDate: null,
        page: 1,
      }));
    }
  };

  const handleExportAttendance = () => {
    try {
      // Real export functionality
      const exportData = attendance.map((record) => ({
        sana: dayjs(record.date).format("DD.MM.YYYY"),
        togarak: record.club?.name,
        jami_studentlar: record.students?.length || 0,
        kelganlar: record.students?.filter((s) => s.present).length || 0,
        kelmaganlar: record.students?.filter((s) => !s.present).length || 0,
        tutor: record.markedBy?.profile?.fullName,
      }));

      // CSV formatida eksport qilish
      const csvContent = [
        [
          "Sana",
          "To'garak",
          "Jami studentlar",
          "Kelganlar",
          "Kelmaganlar",
          "Tutor",
        ],
        ...exportData.map((row) => [
          row.sana,
          row.togarak,
          row.jami_studentlar,
          row.kelganlar,
          row.kelmaganlar,
          row.tutor,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `davomat_${dayjs().format("YYYY-MM-DD")}.csv`;
      link.click();

      message.success("Ma'lumotlar muvaffaqiyatli eksport qilindi");
    } catch (error) {
      message.error("Eksport qilishda xatolik yuz berdi");
    }
  };

  const columns = [
    {
      title: "Sana",
      dataIndex: "date",
      key: "date",
      width: 140,
      render: (date) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-gray-400" />
          <div>
            <div className="font-medium">
              {dayjs(date).format("DD.MM.YYYY")}
            </div>
            <Text className="text-xs text-gray-500">
              {dayjs(date).format("dddd")}
            </Text>
          </div>
        </div>
      ),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "To'garak",
      key: "club",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <BookOutlined className="text-green-500" />
          <div>
            <Text className="font-medium">
              {record.club?.name || "Noma'lum"}
            </Text>
            {record.club?.tutor?.profile?.fullName && (
              <div className="text-xs text-gray-500">
                Tutor: {record.club.tutor.profile.fullName}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Davomat",
      key: "attendance",
      render: (_, record) => {
        const present = record.students?.filter((s) => s.present).length || 0;
        const total = record.students?.length || 0;
        const percentage = total > 0 ? (present / total) * 100 : 0;

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-green-500" />
                <Text className="font-medium">{present}</Text>
              </div>
              <div className="flex items-center gap-2">
                <CloseCircleOutlined className="text-red-500" />
                <Text className="font-medium">{total - present}</Text>
              </div>
              <Text className="text-xs text-gray-500">/ {total}</Text>
            </div>
            <Progress
              percent={percentage}
              size="small"
              strokeColor={
                percentage > 80
                  ? "#52c41a"
                  : percentage > 60
                  ? "#faad14"
                  : "#ff4d4f"
              }
              format={(percent) => `${percent.toFixed(0)}%`}
            />
          </div>
        );
      },
    },
    {
      title: "Studentlar",
      key: "students",
      render: (_, record) => {
        const students = record.students || [];
        const presentCount = students.filter((s) => s.present).length;
        const absentCount = students.length - presentCount;

        return (
          <Tooltip
            title={
              <div className="space-y-2 max-w-sm">
                <div className="font-medium mb-2">Davomat tafsilotlari:</div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {students.slice(0, 15).map((s, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {s.present ? (
                        <CheckCircleOutlined className="text-green-400" />
                      ) : (
                        <CloseCircleOutlined className="text-red-400" />
                      )}
                      <span className="text-xs">
                        {s.student?.full_name || `Student ${index + 1}`}
                      </span>
                    </div>
                  ))}
                  {students.length > 15 && (
                    <div className="text-gray-400 mt-1 text-xs">
                      +{students.length - 15} ta boshqa student
                    </div>
                  )}
                </div>
              </div>
            }
            overlayStyle={{ maxWidth: "400px" }}
          >
            <div className="cursor-pointer">
              <Badge
                count={students.length}
                style={{ backgroundColor: "#52c41a" }}
                overflowCount={999}
              >
                <Tag icon={<UserOutlined />} className="px-2">
                  {presentCount}/{students.length}
                </Tag>
              </Badge>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Belgilagan",
      dataIndex: "markedBy",
      key: "markedBy",
      render: (user) => (
        <div>
          <Text className="font-medium">
            {user?.profile?.fullName || "Noma'lum"}
          </Text>
          {user?.profile?.fullName && (
            <div className="text-xs text-gray-500">
              @{user?.username || "username"}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Vaqt",
      dataIndex: "createdAt",
      key: "time",
      width: 100,
      render: (date) => (
        <div className="flex items-center gap-1">
          <ClockCircleOutlined className="text-gray-400" />
          <Text className="text-sm text-gray-500">
            {dayjs(date).format("HH:mm")}
          </Text>
        </div>
      ),
    },
    {
      title: "Telegram",
      dataIndex: "telegramPostLink",
      key: "telegram",
      width: 100,
      render: (link) =>
        link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <Tag color="blue" className="cursor-pointer" icon={<EyeOutlined />}>
              Post
            </Tag>
          </a>
        ) : (
          <Tag color="default">Yo'q</Tag>
        ),
    },
  ];

  if (loadingAttendance) return <LoadingSpinner size="large" />;

  // Real statistics calculation
  const stats = {
    totalSessions: attendance.length,
    totalPresent: attendance.reduce(
      (sum, a) => sum + (a.students?.filter((s) => s.present).length || 0),
      0
    ),
    totalAbsent: attendance.reduce(
      (sum, a) => sum + (a.students?.filter((s) => !s.present).length || 0),
      0
    ),
    totalStudents: attendance.reduce(
      (sum, a) => sum + (a.students?.length || 0),
      0
    ),
  };

  stats.averageAttendance =
    stats.totalStudents > 0
      ? ((stats.totalPresent / stats.totalStudents) * 100).toFixed(1)
      : 0;

  // Eng yaxshi va eng yomon davomatni hisoblash
  const sessionStats = attendance
    .map((a) => {
      const present = a.students?.filter((s) => s.present).length || 0;
      const total = a.students?.length || 0;
      const percentage = total > 0 ? (present / total) * 100 : 0;
      return {
        date: a.date,
        club: a.club?.name,
        percentage,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  const bestSession = sessionStats[0];
  const worstSession = sessionStats[sessionStats.length - 1];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <Title level={3} className="!mb-0">
            Davomatlar
          </Title>

          <div className="flex gap-3">
            <Select
              placeholder="To'garak tanlang"
              style={{ width: 200 }}
              allowClear
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, clubId: value, page: 1 }))
              }
              value={filters.clubId}
              showSearch
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {clubs.map((club) => (
                <Select.Option key={club._id} value={club._id}>
                  {club.name}
                </Select.Option>
              ))}
            </Select>

            <RangePicker
              format="DD.MM.YYYY"
              placeholder={["Boshlanish", "Tugash"]}
              onChange={handleDateChange}
              value={
                filters.startDate && filters.endDate
                  ? [dayjs(filters.startDate), dayjs(filters.endDate)]
                  : [null, null]
              }
            />

            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportAttendance}
              disabled={attendance.length === 0}
            >
              Eksport
            </Button>
          </div>
        </div>

        {/* Real Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border border-blue-200 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Jami darslar</Text>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {stats.totalSessions}
                </div>
                {bestSession && (
                  <Text className="text-xs text-blue-500">
                    Eng yaxshi: {bestSession.percentage.toFixed(0)}%
                  </Text>
                )}
              </div>
              <CalendarOutlined className="text-3xl text-blue-400" />
            </div>
          </Card>

          <Card className="border border-green-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Kelganlar</Text>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {stats.totalPresent}
                </div>
                <Text className="text-xs text-green-500">
                  Jami: {stats.totalStudents} dan
                </Text>
              </div>
              <CheckCircleOutlined className="text-3xl text-green-400" />
            </div>
          </Card>

          <Card className="border border-red-200 bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">Kelmaganlar</Text>
                <div className="text-2xl font-bold text-red-600 mt-1">
                  {stats.totalAbsent}
                </div>
                {worstSession && (
                  <Text className="text-xs text-red-500">
                    Eng yomon: {worstSession.percentage.toFixed(0)}%
                  </Text>
                )}
              </div>
              <CloseCircleOutlined className="text-3xl text-red-400" />
            </div>
          </Card>

          <Card className="border border-purple-200 bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-gray-600">O'rtacha</Text>
                <div className="text-2xl font-bold text-purple-600 mt-1">
                  {stats.averageAttendance}%
                </div>
                <Text className="text-xs text-purple-500">
                  {stats.totalSessions} darsda
                </Text>
              </div>
              <Progress
                type="circle"
                percent={parseFloat(stats.averageAttendance)}
                width={50}
                strokeColor="#9333ea"
                format={() => ""}
              />
            </div>
          </Card>
        </div>

        {attendance.length > 0 ? (
          <Table
            columns={columns}
            dataSource={attendance}
            rowKey="_id"
            pagination={{
              current: filters.page,
              pageSize: filters.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dan ${total} ta`,
              onChange: (page, pageSize) =>
                setFilters((prev) => ({ ...prev, page, limit: pageSize })),
            }}
            className="shadow-sm"
            scroll={{ x: 1200 }}
          />
        ) : (
          <Empty
            description={
              <div>
                <div>Davomat ma'lumotlari topilmadi</div>
                <div className="text-sm text-gray-400 mt-1">
                  {filters.clubId || filters.startDate
                    ? "Filtrlarni o'zgartirib ko'ring"
                    : "Hali davomat belgilanmagan"}
                </div>
              </div>
            }
            className="py-12"
          />
        )}
      </Card>
    </div>
  );
}
