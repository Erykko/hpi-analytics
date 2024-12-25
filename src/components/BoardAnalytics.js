import React from 'react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';

// Simple Card components since we don't have access to shadcn/ui
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

// Simple Alert components
const Alert = ({ children, variant = 'default' }) => (
  <div className={`p-4 rounded-lg ${
    variant === 'destructive' 
      ? 'bg-red-50 text-red-900' 
      : 'bg-blue-50 text-blue-900'
  }`}>
    {children}
  </div>
);

const AlertTitle = ({ children }) => (
  <div className="font-bold mb-1">{children}</div>
);

const AlertDescription = ({ children }) => (
  <div className="text-sm">{children}</div>
);

const BoardAnalytics = () => {
  const membershipData = {
    overview: {
      totalMemberships: 792,
      uniqueMembers: 248,
      activeMembers: 128,
      renewalsPending: 660
    },
    membershipDistribution: [
      { name: "Single Membership", value: 3 },
      { name: "Two Memberships", value: 76 },
      { name: "Three+ Memberships", value: 169 }
    ],
    activitySegments: [
      { name: "Last 7 Days", value: 22, color: "#22c55e" },
      { name: "8-30 Days", value: 106, color: "#3b82f6" },
      { name: "31-90 Days", value: 197, color: "#f59e0b" },
      { name: "90+ Days", value: 467, color: "#ef4444" }
    ],
    membershipLength: [
      { name: "6-12 Months", value: 784 },
      { name: "Over 1 Year", value: 8 }
    ]
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Historical Preservation Inc. - Membership Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Enhanced Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-3xl font-bold text-blue-600">{membershipData.overview.uniqueMembers}</div>
              <div className="text-sm text-gray-600">Total Members</div>
              <div className="text-xs text-gray-500 mt-1">Unique Accounts</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-3xl font-bold text-purple-600">{membershipData.overview.totalMemberships}</div>
              <div className="text-sm text-gray-600">Total Memberships</div>
              <div className="text-xs text-gray-500 mt-1">Active Subscriptions</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-3xl font-bold text-green-600">3.2</div>
              <div className="text-sm text-gray-600">Avg. Memberships/Member</div>
              <div className="text-xs text-gray-500 mt-1">Per Unique Account</div>
            </div>
            <div className="bg-amber-50 p-4 rounded">
              <div className="text-3xl font-bold text-amber-600">238</div>
              <div className="text-sm text-gray-600">Avg. Member Age</div>
              <div className="text-xs text-gray-500 mt-1">Days Since Joining</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Membership Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={membershipData.membershipDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {membershipData.membershipDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Member Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={membershipData.activitySegments}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {membershipData.activitySegments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metrics and Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Critical Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Active Engagement Rate</span>
                    <span className="font-bold text-blue-600">16%</span>
                  </li>
                  <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Multiple Membership Rate</span>
                    <span className="font-bold text-green-600">98%</span>
                  </li>
                  <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>30-Day Renewal Risk</span>
                    <span className="font-bold text-red-600">83%</span>
                  </li>
                  <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Member Retention Rate</span>
                    <span className="font-bold text-amber-600">99.6%</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTitle>Immediate (Next 7 Days)</AlertTitle>
                    <AlertDescription>
                      Launch renewal campaign for 660 expiring memberships
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertTitle>Short-term (30 Days)</AlertTitle>
                    <AlertDescription>
                      Implement re-engagement program for 467 inactive members
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertTitle>Strategic (90 Days)</AlertTitle>
                    <AlertDescription>
                      Develop multiple membership incentive program
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoardAnalytics;