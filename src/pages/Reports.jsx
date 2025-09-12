import { useState } from "react";
import {
  Card,
  DatePicker,
  Select,
  Button,
  Table,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Tabs,
} from "antd";
import {
  FileTextOutlined,
  DownloadOutlined,
  PrinterOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  useGetFacultyClubsQuery,
  useGetFacultyStudentsQuery,
  useGetFacultyAttendanceQuery,
} from "../store/api/facultyApi";
import LoadingSpinner from "../components/LoadingSpinner";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

export default function Reports() {
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedClub, setSelectedClub] = useState(null);

  const { data: clubsData, isLoading: loadingClubs } = useGetFacultyClubsQuery({
    limit: 100,
  });
  const { data: studentsData, isLoading: loadingStudents } =
    useGetFacultyStudentsQuery({ limit: 1000 });
  const { data: attendanceData } = useGetFacultyAttendanceQuery({
    clubId: selectedClub,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
  });

  const clubs = clubsData?.data?.clubs || [];
  const students = studentsData?.data?.students || [];
  const attendance = attendanceData?.data?.attendance || [];

  if (loadingClubs || loadingStudents) return <LoadingSpinner size="large" />;

  // Calculate statistics
  const busyStudents = students.filter(
    (s) =>
      s.enrolledClubs?.filter((e) => e.status === "approved").length > 0 ||
      s.externalCourses?.length > 0
  );

  const stats = {
    totalStudents: students.length,
    busyCount: busyStudents.length,
    notBusyCount: students.length - busyStudents.length,
    totalClubs: clubs.length,
    activeClubs: clubs.filter((c) => c.isActive).length,
    averageClubSize:
      clubs.length > 0
        ? Math.round(
            clubs.reduce(
              (sum, c) =>
                sum +
                c.enrolledStudents?.filter((e) => e.status === "active").length,
              0
            ) / clubs.length
          )
        : 0,
  };

  // Prepare chart data
  const clubsChartData = clubs.map((club) => ({
    name: club.name,
    studentlar:
      club.enrolledStudents?.filter((e) => e.status === "active").length || 0,
    sigim: club.capacity || 0,
  }));

  const pieData = [
    { name: "Band", value: stats.busyCount, color: "#52c41a" },
    { name: "Band emas", value: stats.notBusyCount, color: "#ff4d4f" },
  ];

  const weeklyAttendanceData = [
    { day: "Dushanba", davomat: 85 },
    { day: "Seshanba", davomat: 92 },
    { day: "Chorshanba", davomat: 78 },
    { day: "Payshanba", davomat: 88 },
    { day: "Juma", davomat: 95 },
    { day: "Shanba", davomat: 82 },
  ];

  // Top performing clubs
  const topClubs = clubs
    .map((club) => ({
      ...club,
      studentCount:
        club.enrolledStudents?.filter((e) => e.status === "active").length || 0,
      fillRate: club.capacity
        ? ((club.enrolledStudents?.filter((e) => e.status === "active")
            .length || 0) /
            club.capacity) *
          100
        : 0,
    }))
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, 5);

  // Top students by attendance (mock data)
  const topStudents = [
    { name: "Aliyev Jasur", group: "101-guruh", attendance: 98, clubs: 2 },
    { name: "Karimova Dilnoza", group: "102-guruh", attendance: 96, clubs: 1 },
    { name: "Rashidov Azizbek", group: "201-guruh", attendance: 95, clubs: 2 },
    { name: "Ergashev Sardor", group: "301-guruh", attendance: 94, clubs: 1 },
    { name: "Nazarova Malika", group: "202-guruh", attendance: 93, clubs: 3 },
  ];

  const handleExport = (type) => {
    // Mock export functionality
    console.log(`Exporting ${type} report...`);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <Title level={3} className="!mb-0">
            Hisobotlar va Statistika
          </Title>

          <div className="flex gap-3">
            <RangePicker
              format="DD.MM.YYYY"
              placeholder={["Boshlanish", "Tugash"]}
              onChange={(dates) => setDateRange(dates || [null, null])}
            />
            <Select
              placeholder="To'garak tanlang"
              style={{ width: 200 }}
              allowClear
              onChange={setSelectedClub}
            >
              <Select.Option value={null}>Barcha to'garaklar</Select.Option>
              {clubs.map((club) => (
                <Select.Option key={club._id} value={club._id}>
                  {club.name}
                </Select.Option>
              ))}
            </Select>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExport("pdf")}
            >
              PDF
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
              type="primary"
              className="bg-gradient-to-r from-green-500 to-emerald-600 border-0"
            >
              Chop etish
            </Button>
          </div>
        </div>

        <Tabs defaultActiveKey="overview">
          <TabPane
            tab={
              <span>
                <BarChartOutlined /> Umumiy ko'rinish
              </span>
            }
            key="overview"
          >
            {/* Overview Statistics */}
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Jami studentlar"
                    value={stats.totalStudents}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Band studentlar"
                    value={stats.busyCount}
                    suffix={`/ ${stats.totalStudents}`}
                    valueStyle={{ color: "#52c41a" }}
                  />
                  <Progress
                    percent={(stats.busyCount / stats.totalStudents) * 100}
                    strokeColor="#52c41a"
                    showInfo={false}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="Faol to'garaklar"
                    value={stats.activeClubs}
                    suffix={`/ ${stats.totalClubs}`}
                    prefix={<BookOutlined />}
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="O'rtacha to'garak hajmi"
                    value={stats.averageClubSize}
                    suffix="student"
                    valueStyle={{ color: "#fa8c16" }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Studentlar bandligi" className="h-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="Haftalik davomat tendensiyasi" className="h-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyAttendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="davomat"
                        stroke="#52c41a"
                        strokeWidth={2}
                        dot={{ fill: "#52c41a" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <BookOutlined /> To'garaklar
              </span>
            }
            key="clubs"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="To'garaklar bo'yicha studentlar taqsimoti">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={clubsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="studentlar"
                        fill="#52c41a"
                        name="Studentlar"
                      />
                      <Bar dataKey="sigim" fill="#1890ff" name="Sig'im" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span>
                      <TrophyOutlined className="text-yellow-500" /> Top 5
                      to'garak
                    </span>
                  }
                >
                  <Table
                    dataSource={topClubs}
                    rowKey="_id"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: "#",
                        key: "index",
                        width: 50,
                        render: (_, __, index) => (
                          <Tag color={index === 0 ? "gold" : "default"}>
                            {index + 1}
                          </Tag>
                        ),
                      },
                      {
                        title: "To'garak",
                        dataIndex: "name",
                        key: "name",
                      },
                      {
                        title: "Studentlar",
                        dataIndex: "studentCount",
                        key: "studentCount",
                        render: (count) => <Tag color="green">{count} ta</Tag>,
                      },
                      {
                        title: "To'liq",
                        dataIndex: "fillRate",
                        key: "fillRate",
                        render: (rate) => (
                          <Progress
                            percent={rate}
                            size="small"
                            strokeColor={
                              rate > 90
                                ? "#ff4d4f"
                                : rate > 70
                                ? "#faad14"
                                : "#52c41a"
                            }
                          />
                        ),
                      },
                    ]}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  title={
                    <span>
                      <CalendarOutlined /> To'garaklar jadvali
                    </span>
                  }
                >
                  <div className="space-y-3">
                    {[
                      "Dushanba",
                      "Seshanba",
                      "Chorshanba",
                      "Payshanba",
                      "Juma",
                    ].map((day, index) => (
                      <div
                        key={day}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <Text className="font-medium">{day}</Text>
                        <div className="flex gap-1">
                          {clubs
                            .filter((c) =>
                              c.schedule?.days?.includes(index + 1)
                            )
                            .slice(0, 3)
                            .map((club, i) => (
                              <Tag key={i} color="purple">
                                {club.name}
                              </Tag>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <TeamOutlined /> Studentlar
              </span>
            }
            key="students"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Eng faol studentlar">
                  <Table
                    dataSource={topStudents}
                    pagination={false}
                    columns={[
                      {
                        title: "O'rin",
                        key: "rank",
                        width: 80,
                        render: (_, __, index) => (
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <TrophyOutlined className="text-yellow-500 text-xl" />
                            )}
                            {index === 1 && (
                              <TrophyOutlined className="text-gray-400 text-xl" />
                            )}
                            {index === 2 && (
                              <TrophyOutlined className="text-orange-500 text-xl" />
                            )}
                            <Text className="font-bold text-lg">
                              {index + 1}
                            </Text>
                          </div>
                        ),
                      },
                      {
                        title: "Student",
                        dataIndex: "name",
                        key: "name",
                        render: (name) => (
                          <Text className="font-medium">{name}</Text>
                        ),
                      },
                      {
                        title: "Guruh",
                        dataIndex: "group",
                        key: "group",
                        render: (group) => <Tag color="green">{group}</Tag>,
                      },
                      {
                        title: "Davomat",
                        dataIndex: "attendance",
                        key: "attendance",
                        render: (attendance) => (
                          <Progress
                            percent={attendance}
                            size="small"
                            strokeColor="#52c41a"
                          />
                        ),
                      },
                      {
                        title: "To'garaklar",
                        dataIndex: "clubs",
                        key: "clubs",
                        render: (clubs) => <Tag color="purple">{clubs} ta</Tag>,
                      },
                    ]}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
