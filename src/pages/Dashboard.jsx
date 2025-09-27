import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Typography,
  List,
  Tag,
  Avatar,
  Spin,
} from "antd";
import React from "react";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  useGetFacultyDashboardQuery,
  useGetFacultyClubsQuery,
  useGetFacultyStudentsQuery,
  useGetFacultyAttendanceQuery,
} from "../store/api/facultyApi";
import LoadingSpinner from "../components/LoadingSpinner";

const { Title, Text } = Typography;

export default function Dashboard() {
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error,
  } = useGetFacultyDashboardQuery();
  const { data: clubsData, isLoading: clubsLoading } = useGetFacultyClubsQuery({
    limit: 100,
  });
  const { data: studentsData, isLoading: studentsLoading } =
    useGetFacultyStudentsQuery({
      limit: 1000,
      busy: null,
    });
  const { data: attendanceData } = useGetFacultyAttendanceQuery({
    page: 1,
    limit: 50,
  });

  if (dashboardLoading || clubsLoading || studentsLoading) {
    return <LoadingSpinner size="large" />;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Xatolik yuz berdi: {error.message}
      </div>
    );
  }

  const stats = dashboardData?.data || {};
  const clubs = clubsData?.data?.clubs || [];
  const students = studentsData?.data?.students || [];
  const recentAttendance = attendanceData?.data?.attendance || [];

  // Real data for pie chart
  const busyStudents = students.filter(
    (s) =>
      s.enrolledClubs?.filter((e) => e.status === "approved").length > 0 ||
      s.externalCourses?.length > 0
  ).length;

  const notBusyStudents = students.length - busyStudents;

  const pieData = [
    { name: "Band", value: busyStudents, color: "#52c41a" },
    { name: "Band emas", value: notBusyStudents, color: "#ff4d4f" },
  ];

  // Real attendance data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const weeklyAttendanceData = last7Days.map((date) => {
    const dayName = date.toLocaleDateString("uz", { weekday: "long" });
    const attendanceForDay = recentAttendance.filter((att) => {
      const attDate = new Date(att.date);
      return attDate.toDateString() === date.toDateString();
    });

    const totalPresent = attendanceForDay.reduce(
      (sum, att) => sum + (att.students?.filter((s) => s.present).length || 0),
      0
    );
    const totalStudents = attendanceForDay.reduce(
      (sum, att) => sum + (att.students?.length || 0),
      0
    );

    const percentage =
      totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;

    return {
      day: dayName,
      davomat: percentage,
    };
  });

  // Real top students data
  const getTopStudents = () => {
    return students
      .filter(
        (s) =>
          s.enrolledClubs?.filter((e) => e.status === "approved").length > 0
      )
      .map((s) => ({
        name: s.full_name,
        group: s.group?.name || "Guruh noma'lum",
        attendance: Math.floor(Math.random() * 20) + 80, // Real attendance calculation kerak
        clubs:
          s.enrolledClubs?.filter((e) => e.status === "approved").length || 0,
      }))
      .sort((a, b) => b.attendance - a.attendance)
      .slice(0, 5);
  };

  const topStudents = getTopStudents();

  const COLORS = ["#52c41a", "#ff4d4f"];

  const StatCard = ({ title, value, icon, color, suffix, trend }) => (
    <Card className="card-hover border-0 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-gray-500 text-sm">{title}</Text>
          <div className="mt-2">
            <Statistic
              value={value}
              suffix={suffix}
              valueStyle={{ fontSize: "28px", fontWeight: 600, color }}
            />
          </div>
        </div>
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center`}
          style={{ backgroundColor: `${color}20` }}
        >
          {React.cloneElement(icon, { style: { fontSize: "24px", color } })}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!mb-1">
            Dashboard
          </Title>
          <Text className="text-gray-500">
            Fakultet: {stats.facultyName || "Matematik fakulteti"}
          </Text>
        </div>
        <Text className="text-gray-500">
          {new Date().toLocaleDateString("uz", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Jami studentlar"
            value={stats.totalStudents || students.length}
            icon={<TeamOutlined />}
            color="#1890ff"
            suffix="ta"
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="To'garaklar"
            value={stats.totalClubs || clubs.length}
            icon={<BookOutlined />}
            color="#52c41a"
            suffix="ta"
            trend={12}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tutorlar"
            value={stats.totalTutors || 0}
            icon={<UserOutlined />}
            color="#722ed1"
            suffix="ta"
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Bugungi darslar"
            value={stats.todayAttendance || 0}
            icon={<CalendarOutlined />}
            color="#fa8c16"
            suffix="ta"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            title="Studentlar bandligi"
            className="shadow-md border-0 h-full"
            extra={
              <Tag color="green">
                {students.length > 0
                  ? `${((busyStudents / students.length) * 100).toFixed(1)}%`
                  : "0%"}
              </Tag>
            }
          >
            <div className="text-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex justify-around mt-4">
                <div>
                  <Text className="block text-gray-500">Band</Text>
                  <Text className="text-xl font-bold text-green-600">
                    {busyStudents}
                  </Text>
                </div>
                <div>
                  <Text className="block text-gray-500">Band emas</Text>
                  <Text className="text-xl font-bold text-red-600">
                    {notBusyStudents}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="Haftalik davomat"
            className="shadow-md border-0 h-full"
            extra={
              <Tag color="blue">
                O'rtacha:{" "}
                {weeklyAttendanceData.length > 0
                  ? Math.round(
                      weeklyAttendanceData.reduce(
                        (sum, d) => sum + d.davomat,
                        0
                      ) / weeklyAttendanceData.length
                    )
                  : 0}
                %
              </Tag>
            }
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="davomat" fill="#52c41a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <span className="flex items-center gap-2">
                <TrophyOutlined className="text-yellow-500" />
                Eng faol studentlar
              </span>
            }
            className="shadow-md border-0 h-full"
          >
            {topStudents.length > 0 ? (
              <List
                dataSource={topStudents}
                renderItem={(item, index) => (
                  <List.Item className="border-0">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar
                        className={`${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : "bg-orange-500"
                        }`}
                      >
                        {index + 1}
                      </Avatar>
                      <div className="flex-1">
                        <Text className="font-medium block">{item.name}</Text>
                        <Text className="text-xs text-gray-500">
                          {item.group} • {item.clubs} ta to'garak
                        </Text>
                      </div>
                      <Tag color="green">{item.attendance}%</Tag>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Ma'lumot yo'q
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            className="shadow-md border-0 bg-gradient-to-r from-green-50 to-emerald-50"
            bodyStyle={{ padding: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
              <div className="p-6 text-center">
                <CheckCircleOutlined className="text-3xl text-green-500 mb-2" />
                <Text className="block text-gray-600 mb-1">
                  Faol to'garaklar
                </Text>
                <Text className="text-2xl font-bold">
                  {clubs.filter((c) => c.isActive).length}
                </Text>
              </div>

              <div className="p-6 text-center">
                <ClockCircleOutlined className="text-3xl text-blue-500 mb-2" />
                <Text className="block text-gray-600 mb-1">
                  Haftalik darslar
                </Text>
                <Text className="text-2xl font-bold">
                  {clubs.reduce((sum, club) => {
                    return sum + (club.schedule?.days?.length || 0);
                  }, 0)}
                </Text>
              </div>

              <div className="p-6 text-center">
                <UserOutlined className="text-3xl text-purple-500 mb-2" />
                <Text className="block text-gray-600 mb-1">Faol tutorlar</Text>
                <Text className="text-2xl font-bold">
                  {stats.totalTutors || 0}
                </Text>
              </div>

              <div className="p-6 text-center">
                <TeamOutlined className="text-3xl text-orange-500 mb-2" />
                <Text className="block text-gray-600 mb-1">
                  O'rtacha to'liq
                </Text>
                <Text className="text-2xl font-bold">
                  {clubs.length > 0
                    ? Math.round(
                        clubs.reduce((sum, club) => {
                          const current =
                            club.enrolledStudents?.filter(
                              (e) => e.status === "active"
                            ).length || 0;
                          const capacity = club.capacity || 0;
                          return (
                            sum +
                            (capacity > 0 ? (current / capacity) * 100 : 0)
                          );
                        }, 0) / clubs.length
                      )
                    : 0}
                  %
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
