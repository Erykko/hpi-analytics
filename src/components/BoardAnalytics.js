import React, { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <h2 className="text-xl font-bold text-gray-800">
    {children}
  </h2>
);

const CardContent = ({ children }) => (
  <div className="p-6">
    {children}
  </div>
);

const Alert = ({ children, variant = 'default' }) => (
  <div className={`p-4 rounded-lg ${variant === 'destructive' ? 'bg-red-50 text-red-900' : 'bg-blue-50 text-blue-900'}`}>
    {children}
  </div>
);

const AlertTitle = ({ children }) => (
  <h3 className="font-bold mb-2">{children}</h3>
);

const AlertDescription = ({ children }) => (
  <p>{children}</p>
);

const BoardAnalytics = () => {
  const [data, setData] = useState({
    monthlyGrowth: [
      { month: "2023-08", new_members: 2 },
      { month: "2023-09", new_members: 1 },
      { month: "2023-11", new_members: 4 },
      { month: "2023-12", new_members: 1 },
      { month: "2024-01", new_members: 21 },
      { month: "2024-02", new_members: 10 },
      { month: "2024-03", new_members: 7 },
      { month: "2024-04", new_members: 242 },
      { month: "2024-05", new_members: 504 }
    ],
    engagementSegments: [
      { name: "Highly Engaged", value: 22 },
      { name: "Moderately Engaged", value: 106 },
      { name: "At Risk", value: 664 }
    ],
    planEngagement: [
      { name: "Social + Member", total: 172, active_30d: 32 },
      { name: "One Time", total: 130, active_30d: 27 },
      { name: "Social + Member (OT)", total: 244, active_30d: 34 },
      { name: "Member", total: 246, active_30d: 35 }
    ],
    upcomingRenewals: 660,
    totalMembers: 792
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Theme>
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Historical Preservation Inc. - Board Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Critical Alerts */}
            <div className="mb-6">
              <Alert variant="destructive">
                <AlertTitle>Critical Attention Required</AlertTitle>
                <AlertDescription>
                  660 memberships (83%) require renewal in the next 30 days
                </AlertDescription>
              </Alert>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-3xl font-bold text-blue-600">792</div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <div className="text-3xl font-bold text-red-600">83%</div>
                <div className="text-sm text-gray-600">Renewal Risk</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <div className="text-3xl font-bold text-yellow-600">16%</div>
                <div className="text-sm text-gray-600">30-Day Engagement</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-3xl font-bold text-green-600">504</div>
                <div className="text-sm text-gray-600">New Members (Last Month)</div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Growth Trend */}
              <div className="h-64">
                <h3 className="text-lg font-semibold mb-4">Member Growth Trend</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyGrowth}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="new_members" stroke="#0088FE" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Engagement Segments */}
              <div className="h-64">
                <h3 className="text-lg font-semibold mb-4">Member Engagement</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.engagementSegments}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {data.engagementSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Key Findings and Recommendations */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Critical Findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Explosive growth in April-May 2024 (746 new members)</li>
                    <li>83% of memberships need renewal within 30 days</li>
                    <li>Only 16% of members actively engaged in last 30 days</li>
                    <li>Equal distribution across membership plans, suggesting good product-market fit</li>
                    <li>Current retention risk: 664 members (84%) showing low engagement</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Improvement Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Immediate:</strong> Implement renewal campaign for 660 upcoming expirations</li>
                    <li><strong>Engagement:</strong> Develop re-engagement strategy for 664 at-risk members</li>
                    <li><strong>Product:</strong> Investigate low utilization of installment plans (only 1 user)</li>
                    <li><strong>Growth:</strong> Analyze April-May growth drivers for replication</li>
                    <li><strong>Retention:</strong> Create early warning system for member disengagement</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </Theme>
  );
};

export default BoardAnalytics;