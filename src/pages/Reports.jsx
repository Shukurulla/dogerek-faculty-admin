import { useState, useEffect } from "react";
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
  message,
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
  TagsOutlined,
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
  useGetAllCategoriesQuery,
} from "../store/api/facultyApi";
import LoadingSpinner from "../components/LoadingSpinner";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

export default function Reports() {
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allStudents, setAllStudents] = useState([]);

  // API Queries
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: clubsData, isLoading: loadingClubs } = useGetFacultyClubsQuery({
    limit: 100,
    categoryId: selectedCategory,
  });

  // Get ALL students with proper pagination handling
  const { data: studentsData, isLoading: loadingStudents } =
    useGetFacultyStudentsQuery({
      limit: 10000, // Get all students
      page: 1,
    });

  const { data: attendanceData } = useGetFacultyAttendanceQuery({
    clubId: selectedClub,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    limit: 500, // Increased limit for attendance
  });

  const categories = categoriesData?.data || [];
  const clubs = clubsData?.data?.clubs || [];
  const students = studentsData?.data?.students || [];
  const totalStudentsCount =
    studentsData?.data?.pagination?.total || students.length;
  const attendance = attendanceData?.data?.attendance || [];

  if (loadingClubs || loadingStudents) return <LoadingSpinner size="large" />;

  // Real statistics calculation using actual data
  const busyStudents = students.filter(
    (s) =>
      s.enrolledClubs?.filter((e) => e.status === "approved").length > 0 ||
      s.externalCourses?.length > 0
  );

  const stats = {
    totalStudents: totalStudentsCount, // Use the total from pagination
    busyCount: busyStudents.length,
    notBusyCount: totalStudentsCount - busyStudents.length,
    totalClubs: clubs.length,
    activeClubs: clubs.filter((c) => c.isActive).length,
    averageClubSize:
      clubs.length > 0
        ? Math.round(
            clubs.reduce((sum, c) => sum + (c.currentStudents || 0), 0) /
              clubs.length
          )
        : 0,
  };

  // Category statistics with real data
  const categoryStats = categories
    .map((category) => {
      const categoryClubs = clubs.filter(
        (club) => club.category?._id === category._id
      );
      const studentCount = categoryClubs.reduce(
        (sum, club) => sum + (club.currentStudents || 0),
        0
      );
      return {
        _id: category._id,
        name: category.name,
        color: category.color,
        clubs: categoryClubs.length,
        students: studentCount,
      };
    })
    .filter((cat) => cat.clubs > 0);

  // Real chart data from clubs
  const clubsChartData = clubs
    .filter(
      (club) => !selectedCategory || club.category?._id === selectedCategory
    )
    .map((club) => ({
      name:
        club.name.length > 20 ? club.name.substring(0, 20) + "..." : club.name,
      studentlar: club.currentStudents || 0,
      sigim: club.capacity || 0,
      category: club.category?.name || "Kategoriyasiz",
    }));

  const pieData = [
    { name: "Band", value: stats.busyCount, color: "#52c41a" },
    { name: "Band emas", value: stats.notBusyCount, color: "#ff4d4f" },
  ];

  // Real weekly attendance data from attendance records
  const getWeeklyAttendanceData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map((date) => {
      const dayName = date.toLocaleDateString("uz", { weekday: "short" });
      const attendanceForDay = attendance.filter((att) => {
        const attDate = new Date(att.date);
        return attDate.toDateString() === date.toDateString();
      });

      const totalPresent = attendanceForDay.reduce(
        (sum, att) =>
          sum + (att.students?.filter((s) => s.present).length || 0),
        0
      );
      const totalStudents = attendanceForDay.reduce(
        (sum, att) => sum + (att.students?.length || 0),
        0
      );

      const percentage =
        totalStudents > 0
          ? Math.round((totalPresent / totalStudents) * 100)
          : 0;

      return {
        day: dayName,
        davomat: percentage,
      };
    });
  };

  const weeklyAttendanceData = getWeeklyAttendanceData();

  // Real top performing clubs
  const topClubs = clubs
    .map((club) => ({
      ...club,
      studentCount: club.currentStudents || 0,
      fillRate: club.capacity
        ? ((club.currentStudents || 0) / club.capacity) * 100
        : 0,
    }))
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, 5);

  // Real top students calculation from attendance data
  const getTopStudents = () => {
    const studentsWithClubs = students.filter(
      (s) => s.enrolledClubs?.filter((e) => e.status === "approved").length > 0
    );

    const studentsWithAttendance = studentsWithClubs.map((student) => {
      const studentAttendanceRecords = attendance.filter((att) =>
        att.students?.some(
          (s) => s.student?._id === student._id || s.student === student._id
        )
      );

      let totalClasses = 0;
      let presentClasses = 0;

      studentAttendanceRecords.forEach((att) => {
        const studentRecord = att.students?.find(
          (s) => s.student?._id === student._id || s.student === student._id
        );
        if (studentRecord) {
          totalClasses++;
          if (studentRecord.present) {
            presentClasses++;
          }
        }
      });

      const attendanceRate =
        totalClasses > 0
          ? Math.round((presentClasses / totalClasses) * 100)
          : 0;

      return {
        name: student.full_name,
        group: student.group?.name || "Guruh noma'lum",
        attendance: attendanceRate,
        clubs:
          student.enrolledClubs?.filter((e) => e.status === "approved")
            .length || 0,
        totalClasses,
        presentClasses,
      };
    });

    return studentsWithAttendance
      .filter((s) => s.totalClasses > 0)
      .sort((a, b) => b.attendance - a.attendance)
      .slice(0, 10);
  };

  const topStudents = getTopStudents();

  const handleExport = (type) => {
    try {
      // Create CSV content
      const csvContent = [
        ["Hisobot sanasi", new Date().toLocaleDateString("uz")],
        [""],
        ["UMUMIY STATISTIKA"],
        ["Jami studentlar", stats.totalStudents],
        ["Band studentlar", stats.busyCount],
        ["Band bo'lmagan studentlar", stats.notBusyCount],
        ["Faol to'garaklar", stats.activeClubs],
        ["O'rtacha to'garak hajmi", stats.averageClubSize],
        [""],
        ["KATEGORIYALAR BO'YICHA"],
        ["Kategoriya", "To'garaklar", "Studentlar"],
        ...categoryStats.map((cat) => [cat.name, cat.clubs, cat.students]),
        [""],
        ["TOP TO'GARAKLAR"],
        ["To'garak nomi", "Studentlar soni", "Sig'im", "To'liqlik %"],
        ...topClubs.map((club) => [
          club.name,
          club.studentCount,
          club.capacity || "Cheklanmagan",
          club.fillRate ? `${club.fillRate.toFixed(1)}%` : "N/A",
        ]),
      ];

      // Convert to CSV string
      const csv = csvContent.map((row) => row.join(",")).join("\n");

      // Create blob and download
      const blob = new Blob(["\ufeff" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `hisobot_${dayjs().format("YYYY-MM-DD")}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success("Hisobot muvaffaqiyatli yuklandi");
    } catch (error) {
      message.error("Eksport qilishda xatolik yuz berdi");
    }
  };

  const COLORS = ["#52c41a", "#1890ff", "#722ed1", "#fa8c16", "#ff4d4f"];

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Title level={3} className="!mb-0">
              Hisobotlar va Statistika
            </Title>

            <div className="flex gap-2">
              <Button
                icon={<DownloadOutlined />}
                onClick={() => handleExport("csv")}
                size="large"
              >
                CSV yuklash
              </Button>

              <Button
                icon={<PrinterOutlined />}
                onClick={() => window.print()}
                type="primary"
                size="large"
                className="bg-gradient-to-r from-green-500 to-emerald-600 border-0"
              >
                Chop etish
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <Card className="bg-gray-50 border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TagsOutlined className="mr-1" />
                  Kategoriya bo'yicha filter
                </label>
                <Select
                  placeholder="Kategoriyani tanlang"
                  style={{ width: "100%" }}
                  size="large"
                  allowClear
                  onChange={setSelectedCategory}
                  value={selectedCategory}
                  className="shadow-sm"
                >
                  {categories.map((cat) => (
                    <Select.Option key={cat._id} value={cat._id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.name}</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOutlined className="mr-1" />
                  To'garak bo'yicha filter
                </label>
                <Select
                  placeholder="To'garakni tanlang"
                  style={{ width: "100%" }}
                  size="large"
                  allowClear
                  onChange={setSelectedClub}
                  value={selectedClub}
                  className="shadow-sm"
                  showSearch
                  filterOption={(input, option) =>
                    option?.children
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  <Select.Option value={null}>Barcha to'garaklar</Select.Option>
                  {clubs.map((club) => (
                    <Select.Option key={club._id} value={club._id}>
                      {club.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarOutlined className="mr-1" />
                  Sana oralig'i
                </label>
                <RangePicker
                  format="DD.MM.YYYY"
                  placeholder={["Boshlanish", "Tugash"]}
                  onChange={(dates) => setDateRange(dates || [null, null])}
                  style={{ width: "100%" }}
                  size="large"
                  className="shadow-sm"
                />
              </div>
            </div>
          </Card>
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
            {/* Real Statistics */}
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
                    percent={
                      stats.totalStudents > 0
                        ? Math.round(
                            (stats.busyCount / stats.totalStudents) * 100
                          )
                        : 0
                    }
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

            {/* Charts with real data */}
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
                <TagsOutlined /> Kategoriyalar
              </span>
            }
            key="categories"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Kategoriyalar bo'yicha statistika">
                  {categoryStats.length > 0 ? (
                    <>
                      <Row gutter={[16, 16]}>
                        {categoryStats.map((cat, index) => (
                          <Col xs={24} sm={12} md={8} lg={6} key={cat._id}>
                            <Card
                              className="text-center hover:shadow-lg transition-shadow"
                              style={{
                                borderColor: cat.color,
                                borderWidth: 2,
                              }}
                            >
                              <Tag
                                color={cat.color}
                                className="mb-3"
                                style={{
                                  fontSize: "14px",
                                  padding: "4px 12px",
                                  backgroundColor: `${cat.color}20`,
                                }}
                              >
                                {cat.name}
                              </Tag>
                              <div className="space-y-2">
                                <div>
                                  <Text className="text-gray-500 block">
                                    To'garaklar
                                  </Text>
                                  <Text className="text-xl font-bold">
                                    {cat.clubs}
                                  </Text>
                                </div>
                                <div>
                                  <Text className="text-gray-500 block">
                                    Studentlar
                                  </Text>
                                  <Text className="text-xl font-bold">
                                    {cat.students}
                                  </Text>
                                </div>
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>

                      <div className="mt-6">
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={categoryStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="clubs"
                              fill="#1890ff"
                              name="To'garaklar"
                            />
                            <Bar
                              dataKey="students"
                              fill="#52c41a"
                              name="Studentlar"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Kategoriyalar mavjud emas
                    </div>
                  )}
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
                  {clubsChartData.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      To'garaklar mavjud emas
                    </div>
                  )}
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
                  {topClubs.length > 0 ? (
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
                          ellipsis: true,
                        },
                        {
                          title: "Kategoriya",
                          key: "category",
                          render: (_, record) =>
                            record.category ? (
                              <Tag
                                color={record.category.color}
                                style={{
                                  backgroundColor: `${record.category.color}20`,
                                }}
                              >
                                {record.category.name}
                              </Tag>
                            ) : (
                              <Tag>Yo'q</Tag>
                            ),
                        },
                        {
                          title: "Studentlar",
                          dataIndex: "studentCount",
                          key: "studentCount",
                          render: (count) => (
                            <Tag color="green">{count} ta</Tag>
                          ),
                        },
                        {
                          title: "To'liq",
                          dataIndex: "fillRate",
                          key: "fillRate",
                          render: (rate) => (
                            <Progress
                              percent={Math.round(rate)}
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
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      To'garaklar mavjud emas
                    </div>
                  )}
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="Kategoriyalar bo'yicha to'garaklar">
                  {categoryStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryStats}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="clubs"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {categoryStats.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.color || COLORS[index % COLORS.length]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Kategoriyalar mavjud emas
                    </div>
                  )}
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
                <Card title="Eng faol studentlar (davomat asosida)">
                  {topStudents.length > 0 ? (
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
                          render: (attendance, record) => (
                            <div>
                              <Progress
                                percent={attendance}
                                size="small"
                                strokeColor="#52c41a"
                              />
                              <Text className="text-xs text-gray-500">
                                {record.presentClasses}/{record.totalClasses}{" "}
                                dars
                              </Text>
                            </div>
                          ),
                        },
                        {
                          title: "To'garaklar",
                          dataIndex: "clubs",
                          key: "clubs",
                          render: (clubs) => (
                            <Tag color="purple">{clubs} ta</Tag>
                          ),
                        },
                      ]}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Davomat ma'lumotlari mavjud emas
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
