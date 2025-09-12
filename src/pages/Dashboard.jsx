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
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  RiseOutlined,
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
import { useGetFacultyDashboardQuery } from "../store/api/facultyApi";
import LoadingSpinner from "../components/LoadingSpinner";

const { Title, Text } = Typography;

export default function Dashboard() {
  const { data, isLoading, error } = useGetFacultyDashboardQuery();

  if (isLoading) return <LoadingSpinner size="large" />;
  if (error)
    return (
      <div className="text-center py-12 text-red-500">Xatolik yuz berdi</div>
    );

  const stats = data?.data || {};

  // Mock data for charts
  const pieData = [
    { name: "Band", value: stats.enrolledStudents || 0 },
    {
      name: "Band emas",
      value: stats.totalStudents - stats.enrolledStudents || 0,
    },
  ];

  const barData = [
    { name: "Dushanba", davomat: 85 },
    { name: "Seshanba", davomat: 92 },
    { name: "Chorshanba", davomat: 78 },
    { name: "Payshanba", davomat: 88 },
    { name: "Juma", davomat: 95 },
  ];

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
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <RiseOutlined className="text-green-500" />
              <Text className="text-green-500 text-sm">
                +{trend}% o'tgan oyga nisbatan
              </Text>
            </div>
          )}
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

  // Mock top students
  const topStudents = [
    { name: "Aliyev Jasur", group: "101-guruh", attendance: 98 },
    { name: "Karimova Dilnoza", group: "102-guruh", attendance: 96 },
    { name: "Rashidov Azizbek", group: "201-guruh", attendance: 95 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!mb-1">
            Dashboard
          </Title>
          <Text className="text-gray-500">
            Fakultet: {data?.data?.facultyName || "Matematika fakulteti"}
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
            value={stats.totalStudents || 0}
            icon={<TeamOutlined />}
            color="#1890ff"
            suffix="ta"
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="To'garaklar"
            value={stats.totalClubs || 0}
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
            extra={<Tag color="green">{stats.enrollmentPercentage || 0}%</Tag>}
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
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex justify-around mt-4">
                <div>
                  <Text className="block text-gray-500">Band</Text>
                  <Text className="text-xl font-bold text-green-600">
                    {stats.enrolledStudents || 0}
                  </Text>
                </div>
                <div>
                  <Text className="block text-gray-500">Band emas</Text>
                  <Text className="text-xl font-bold text-red-600">
                    {stats.totalStudents - stats.enrolledStudents || 0}
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
            extra={<Tag color="blue">O'rtacha: 87%</Tag>}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
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
                        {item.group}
                      </Text>
                    </div>
                    <Tag color="green">{item.attendance}%</Tag>
                  </div>
                </List.Item>
              )}
            />
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
                  {stats.totalClubs || 0}
                </Text>
              </div>

              <div className="p-6 text-center">
                <ClockCircleOutlined className="text-3xl text-blue-500 mb-2" />
                <Text className="block text-gray-600 mb-1">
                  Haftalik darslar
                </Text>
                <Text className="text-2xl font-bold">45</Text>
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
                <Text className="text-2xl font-bold">78%</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
