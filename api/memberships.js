import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL,
  consumerKey: process.env.WOOCOMMERCE_KEY,
  consumerSecret: process.env.WOOCOMMERCE_SECRET,
  version: 'wc/v3'
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch memberships
    const membershipsResponse = await api.get('memberships');
    
    // Fetch membership activity/orders
    const ordersResponse = await api.get('orders', {
      per_page: 100,
      product_type: 'membership'
    });

    // Process the data
    const processedData = processMembershipData(membershipsResponse.data, ordersResponse.data);
    
    res.status(200).json(processedData);
  } catch (error) {
    console.error('WooCommerce API Error:', error);
    res.status(500).json({ message: 'Error fetching data', error: error.message });
  }
}

function processMembershipData(memberships, orders) {
  // Current date for calculations
  const now = new Date();
  
  // Process memberships
  const memberData = memberships.reduce((acc, membership) => {
    const memberEmail = membership.member_email;
    if (!acc[memberEmail]) {
      acc[memberEmail] = {
        memberships: [],
        lastActive: null,
        joinDate: new Date(membership.member_since),
      };
    }
    
    acc[memberEmail].memberships.push({
      id: membership.user_membership_id,
      plan: membership.membership_plan,
      status: membership.membership_status,
      expiration: new Date(membership.membership_expiration),
    });
    
    // Update last active if more recent
    const lastActive = new Date(membership.member_last_active);
    if (!acc[memberEmail].lastActive || lastActive > acc[memberEmail].lastActive) {
      acc[memberEmail].lastActive = lastActive;
    }
    
    return acc;
  }, {});

  // Calculate metrics
  const metrics = {
    totalMemberships: memberships.length,
    uniqueMembers: Object.keys(memberData).length,
    activitySegments: {
      last7days: 0,
      last30days: 0,
      last90days: 0,
      inactive90Plus: 0
    },
    membershipDistribution: {
      singleMembership: 0,
      twoMemberships: 0,
      threePlusMemberships: 0
    }
  };

  // Process activity segments and membership distribution
  Object.values(memberData).forEach(member => {
    const daysSinceActive = (now - member.lastActive) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActive <= 7) metrics.activitySegments.last7days++;
    else if (daysSinceActive <= 30) metrics.activitySegments.last30days++;
    else if (daysSinceActive <= 90) metrics.activitySegments.last90days++;
    else metrics.activitySegments.inactive90Plus++;

    const membershipCount = member.memberships.length;
    if (membershipCount === 1) metrics.membershipDistribution.singleMembership++;
    else if (membershipCount === 2) metrics.membershipDistribution.twoMemberships++;
    else metrics.membershipDistribution.threePlusMemberships++;
  });

  return {
    metrics,
    memberData
  };
}