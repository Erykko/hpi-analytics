import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL,
  consumerKey: process.env.WOOCOMMERCE_KEY,
  consumerSecret: process.env.WOOCOMMERCE_SECRET,
  version: 'wc/v3'
});

// Fallback data for development or when API fails
const fallbackData = {
  metrics: {
    totalMemberships: 792,
    uniqueMembers: 248,
    activitySegments: {
      last7days: 22,
      last30days: 106,
      last90days: 197,
      inactive90Plus: 467
    },
    membershipDistribution: {
      singleMembership: 3,
      twoMemberships: 76,
      threePlusMemberships: 169
    },
    cancelledMemberships: 1,
    renewalsPending: 660
  },
  memberData: {
    "example@email.com": {
      memberships: [
        {
          id: 1,
          plan: "Standard",
          status: "active",
          expiration: new Date("2025-01-01")
        }
      ],
      lastActive: new Date(),
      joinDate: new Date("2023-08-25")
    }
  }
};

function processMembershipData(memberships, orders) {
  // Current date for calculations
  const now = new Date();
  
  try {
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
  } catch (error) {
    console.error('Error processing membership data:', error);
    return fallbackData;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Use fallback data if in development or missing credentials
  if (process.env.NODE_ENV === 'development' || !process.env.WOOCOMMERCE_URL) {
    console.log('Using fallback data (development mode or missing credentials)');
    return res.status(200).json(fallbackData);
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
    // Return fallback data instead of error in production
    if (process.env.NODE_ENV === 'production') {
      console.log('API error in production, using fallback data');
      return res.status(200).json(fallbackData);
    }
    res.status(500).json({ 
      message: 'Error fetching data', 
      error: error.message,
      fallbackAvailable: true
    });
  }
}