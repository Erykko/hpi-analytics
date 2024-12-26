import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { RefreshCw } from 'lucide-react';

// Static fallback data
const fallbackData = {
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

// Card components
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

// Alert components
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
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Enhanced calculations
  const calculateMetrics = (rawData) => {
    const now = new Date();
    
    // Calculate average membership age
    const membershipAges = rawData.memberData ? Object.values(rawData.memberData).map(member => {
      return Math.floor((now - new Date(member.joinDate)) / (1000 * 60 * 60 * 24));
    }) : [];
    const avgMembershipAge = membershipAges.length ? 
      Math.round(membershipAges.reduce((acc, age) => acc + age, 0) / membershipAges.length) : 0;

    // Calculate renewal risk score (0-100)
    const renewalRiskScore = rawData.metrics ? Math.round(
      (rawData.metrics.activitySegments.inactive90Plus / rawData.metrics.uniqueMembers) * 100
    ) : 0;

    // Calculate engagement score (0-100)
    const engagementScore = rawData.metrics ? Math.round(
      ((rawData.metrics.activitySegments.last7days * 1.0 + 
        rawData.metrics.activitySegments.last30days * 0.7 +
        rawData.metrics.activitySegments.last90days * 0.3) / 
        rawData.metrics.uniqueMembers) * 100
    ) : 0;

    return {
      overview: {
        totalMemberships: rawData.metrics?.totalMemberships || 0,
        uniqueMembers: rawData.metrics?.uniqueMembers || 0,
        activeMembers: rawData.metrics?.activitySegments.last30days || 0,
        renewalsPending: rawData.metrics?.renewalsPending || 0,
        avgMembershipAge,
        engagementScore,
        renewalRiskScore
      },
      membershipDistribution: [
        { name: "Single Membership", value: rawData.metrics?.membershipDistribution.singleMembership || 0 },
        { name: "Two Memberships", value: rawData.metrics?.membershipDistribution.twoMemberships || 0 },
        { name: "Three+ Memberships", value: rawData.metrics?.membershipDistribution.threePlusMemberships || 0 }
      ],
      activitySegments: [
        { name: "Last 7 Days", value: rawData.metrics?.activitySegments.last7days || 0, color: "#22c55e" },
        { name: "8-30 Days", value: rawData.metrics?.activitySegments.last30days || 0, color: "#3b82f6" },
        { name: "31-90 Days", value: rawData.metrics?.activitySegments.last90days || 0, color: "#f59e0b" },
        { name: "90+ Days", value: rawData.metrics?.activitySegments.inactive90Plus || 0, color: "#ef4444" }
      ],
      trends: {
        retentionRate: rawData.metrics ? (1 - (rawData.metrics.cancelledMemberships || 0) / rawData.metrics.totalMemberships) * 100 : 99.6,
        growthRate: rawData.metrics?.growthRate || 0,
        conversionRate: rawData.metrics?.conversionRate || 0
      }
    };
  };

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }
    try {
      const response = await fetch('/api/memberships');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      const processedData = calculateMetrics(result);
      setData(processedData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to fetch latest updates');
      if (!data) {
        setData(calculateMetrics({ metrics: fallbackData }));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [data]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Logo and Header Section */}
      <div className="flex flex-col items-center mb-8">
        <img 
          src="/images/logo.png" 
          alt="Heritage Hills Historical Preservation Inc." 
          className="h-32 w-auto mb-4"
        />
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Membership Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Enhanced Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-3xl font-bold text-blue-600">{data.overview.uniqueMembers}</div>
              <div className="text-sm text-gray-600">Total Members</div>
              <div className="text-xs text-gray-500 mt-1">Unique Accounts</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-3xl font-bold text-purple-600">{data.overview.totalMemberships}</div>
              <div className="text-sm text-gray-600">Total Memberships</div>
              <div className="text-xs text-gray-500 mt-1">Active Subscriptions</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-3xl font-bold text-green-600">
                {data.overview.engagementScore}%
              </div>
              <div className="text-sm text-gray-600">Engagement Score</div>
              <div className="text-xs text-gray-500 mt-1">Weighted Activity Rate</div>
            </div>
            <div className="bg-amber-50 p-4 rounded">
              <div className="text-3xl font-bold text-amber-600">
                {data.overview.avgMembershipAge}
              </div>
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
                        data={data.membershipDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {data.membershipDistribution.map((entry, index) => (
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
                    <BarChart data={data.activitySegments}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {data.activitySegments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics and Priority Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Engagement Score</span>
                    <span className="font-bold text-blue-600">{data.overview.engagementScore}%</span>
                  </li>
                  <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Member Retention</span>
                    <span className="font-bold text-green-600">{data.trends.retentionRate.toFixed(1)}%</span>
                  </li>
                  <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Renewal Risk Score</span>
                    <span className="font-bold text-red-600">{data.overview.renewalRiskScore}%</span>
                  </li>
                  <li className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Multiple Membership Rate</span>
                    <span className="font-bold text-amber-600">
                      {Math.round(((data.overview.totalMemberships - data.overview.uniqueMembers) / data.overview.uniqueMembers) * 100)}%
                    </span>
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
                    <AlertTitle>High Risk (Next 7 Days)</AlertTitle>
                    <AlertDescription>
                      {data.overview.renewalRiskScore > 30 
                        ? `Urgent: ${data.activitySegments[3].value} members need immediate attention`
                        : 'No immediate high-risk issues'}
                    </AlertDescription>
                  </Alert>
      
                  <Alert>
                    <AlertTitle>Engagement Opportunity</AlertTitle>
                    <AlertDescription>
                      {data.overview.engagementScore < 50 
                        ? `Target ${data.activitySegments[2].value + data.activitySegments[3].value} low-engagement members`
                        : 'Maintain current engagement strategies'}
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertTitle>Growth Strategy</AlertTitle>
                    <AlertDescription>
                      {data.membershipDistribution[0].value > 0 
                        ? `Convert ${data.membershipDistribution[0].value} single-membership users to multiple memberships`
                        : 'Focus on new member acquisition'}
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
{/* API CHECKS AND TROUBLESHOOT */}
const fetchData = useCallback(async (isRefresh = false) => {
  if (isRefresh) {
    setRefreshing(true);
  }
  try {
    console.log('Fetching data...');
    const response = await fetch('/api/memberships');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Data received:', result);
    
    const processedData = calculateMetrics(result);
    setData(processedData);
    setLastUpdated(new Date());
    setError(null);
  } catch (err) {
    console.error('Fetch error:', err);
    setError(`Unable to fetch latest updates: ${err.message}`);
    if (!data) {
      setData(calculateMetrics({ metrics: fallbackData }));
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);
export default BoardAnalytics;