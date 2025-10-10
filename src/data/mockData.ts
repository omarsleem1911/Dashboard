import { ClientDetails } from '../types';

export const mockClientDetails: ClientDetails[] = [
  {
    id: 1,
    companyName: 'DIFC',
    contactPerson: 'Ahmed Al Mansouri, IT Director',
    email: 'ahmed.almansouri@difc.ae',
    phone: '+971 4 362 2222',
    deploymentEngineer: 'Omar Sleem',
    deploymentEngineerSlack: '@omar.sleem',
    project: 'Financial Trading Platform',
    status: 'production',
    team: 'Alpha',
    lastDeployment: '2 days ago',
    nextMilestone: 'Security compliance audit',
    logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=center',
    industry: 'Financial Services',
    website: 'difc.ae',
    infrastructure: {
      servers: 18,
      databases: 4,
      loadBalancers: 3,
      cdnEndpoints: 12
    },
    deploymentHistory: [
      { date: '2024-01-15', version: 'v3.2.1', status: 'success', deployedBy: 'Omar Hassan' },
      { date: '2024-01-15', version: 'v3.2.1', status: 'success', deployedBy: 'Omar Sleem' },
      { date: '2024-01-10', version: 'v3.2.0', status: 'success', deployedBy: 'Omar Sleem' },
      { date: '2024-01-05', version: 'v3.1.9', status: 'rollback', deployedBy: 'Omar Sleem' }
    ],
    healthChecks: [
      {
        id: 'trading-api',
        name: 'Trading API Gateway',
        status: 'healthy',
        lastCheck: '2 minutes ago',
        responseTime: 89,
        uptime: 99.9,
        endpoint: 'https://trading-api.difc.ae/health',
        description: 'Core trading platform API gateway'
      },
      {
        id: 'financial-db',
        name: 'Financial Database Cluster',
        status: 'healthy',
        lastCheck: '1 minute ago',
        responseTime: 15,
        uptime: 99.8,
        endpoint: 'tcp://findb.difc.ae:5432',
        description: 'Primary financial data PostgreSQL cluster'
      },
      {
        id: 'market-cache',
        name: 'Market Data Cache',
        status: 'warning',
        lastCheck: '3 minutes ago',
        responseTime: 156,
        uptime: 97.8,
        endpoint: 'redis://market-cache.difc.ae:6379',
        description: 'Real-time market data caching layer'
      },
      {
        id: 'compliance-service',
        name: 'Compliance Service',
        status: 'healthy',
        lastCheck: '1 minute ago',
        responseTime: 234,
        uptime: 99.5,
        endpoint: 'https://compliance.difc.ae/status',
        description: 'Regulatory compliance monitoring'
      },
      {
        id: 'risk-engine',
        name: 'Risk Management Engine',
        status: 'critical',
        lastCheck: '5 minutes ago',
        responseTime: 3200,
        uptime: 94.1,
        endpoint: 'https://risk.difc.ae/health',
        description: 'Real-time risk assessment system'
      },
      {
        id: 'settlement-system',
        name: 'Settlement System',
        status: 'healthy',
        lastCheck: '1 minute ago',
        responseTime: 178,
        uptime: 99.9,
        endpoint: 'https://settlement.difc.ae/ping',
        description: 'Trade settlement processing'
      }
    ],
    epsData: [
      { timestamp: '2024-01-17T10:00:00Z', eventsPerSecond: 2850, totalEvents: 8500000, errorRate: 0.1 },
      { timestamp: '2024-01-17T10:05:00Z', eventsPerSecond: 3120, totalEvents: 8501850, errorRate: 0.2 },
      { timestamp: '2024-01-17T10:10:00Z', eventsPerSecond: 2940, totalEvents: 8503790, errorRate: 0.1 },
      { timestamp: '2024-01-17T10:15:00Z', eventsPerSecond: 3380, totalEvents: 8506170, errorRate: 0.3 },
      { timestamp: '2024-01-17T10:20:00Z', eventsPerSecond: 3250, totalEvents: 8508420, errorRate: 0.2 },
      { timestamp: '2024-01-17T10:25:00Z', eventsPerSecond: 2890, totalEvents: 8510310, errorRate: 0.1 },
      { timestamp: '2024-01-17T10:30:00Z', eventsPerSecond: 3450, totalEvents: 8512760, errorRate: 0.2 },
      { timestamp: '2024-01-17T10:35:00Z', eventsPerSecond: 3620, totalEvents: 8515380, errorRate: 0.1 },
      { timestamp: '2024-01-17T10:40:00Z', eventsPerSecond: 3180, totalEvents: 8517560, errorRate: 0.3 },
      { timestamp: '2024-01-17T10:45:00Z', eventsPerSecond: 3750, totalEvents: 8520310, errorRate: 0.1 }
    ]
  },
  {
    id: 2,
    companyName: 'Agthia',
    contactPerson: 'Fatima Al Zahra, CTO',
    email: 'fatima.alzahra@agthia.com',
    phone: '+971 2 505 8000',
    deploymentEngineer: 'Khalid Ahmed',
    deploymentEngineerSlack: '@khalid.ahmed',
    project: 'Supply Chain Management System',
    status: 'testing',
    team: 'Beta',
    lastDeployment: '5 days ago',
    nextMilestone: 'Load testing completion',
    logo: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=center',
    industry: 'Food & Beverage',
    website: 'agthia.com',
    infrastructure: {
      servers: 8,
      databases: 2,
      loadBalancers: 1,
      cdnEndpoints: 6
    },
    deploymentHistory: [
      { date: '2024-01-12', version: 'v2.1.0-beta', status: 'success', deployedBy: 'Khalid Ahmed' },
      { date: '2024-01-08', version: 'v2.0.5', status: 'success', deployedBy: 'Khalid Ahmed' }
    ],
    healthChecks: [
      {
        id: 'supply-api',
        name: 'Supply Chain API',
        status: 'healthy',
        lastCheck: '1 minute ago',
        responseTime: 124,
        uptime: 99.5,
        endpoint: 'https://supply-api.agthia.com/health',
        description: 'Supply chain management API'
      },
      {
        id: 'inventory-db',
        name: 'Inventory Database',
        status: 'healthy',
        lastCheck: '2 minutes ago',
        responseTime: 45,
        uptime: 99.7,
        endpoint: 'tcp://inventory.agthia.com:5432',
        description: 'Product inventory database'
      },
      {
        id: 'warehouse-system',
        name: 'Warehouse Management',
        status: 'offline',
        lastCheck: '15 minutes ago',
        responseTime: 0,
        uptime: 85.2,
        endpoint: 'https://warehouse.agthia.com/status',
        description: 'Warehouse operations system'
      }
    ],
    epsData: [
      { timestamp: '2024-01-17T10:00:00Z', eventsPerSecond: 680, totalEvents: 2100000, errorRate: 0.8 },
      { timestamp: '2024-01-17T10:05:00Z', eventsPerSecond: 750, totalEvents: 2101350, errorRate: 0.6 },
      { timestamp: '2024-01-17T10:10:00Z', eventsPerSecond: 620, totalEvents: 2102730, errorRate: 1.2 },
      { timestamp: '2024-01-17T10:15:00Z', eventsPerSecond: 890, totalEvents: 2104340, errorRate: 0.4 },
      { timestamp: '2024-01-17T10:20:00Z', eventsPerSecond: 820, totalEvents: 2105920, errorRate: 0.7 }
    ]
  }
];

export const getClientDetails = (id: number): ClientDetails | undefined => {
  return mockClientDetails.find(client => client.id === id);
};