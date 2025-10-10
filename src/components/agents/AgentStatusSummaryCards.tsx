import React from 'react';
import { Activity, XCircle, Ban, Trash2 } from 'lucide-react';
import { AgentStatusSummary } from '../../types/agent';

interface AgentStatusSummaryCardsProps {
  summary: AgentStatusSummary;
}

const AgentStatusSummaryCards: React.FC<AgentStatusSummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      label: 'Total Agents',
      value: summary.total,
      icon: Activity,
      bgColor: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Active',
      value: summary.active,
      icon: Activity,
      bgColor: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
    },
    {
      label: 'Disconnected',
      value: summary.disconnected,
      icon: XCircle,
      bgColor: 'from-orange-500/20 to-orange-600/20',
      borderColor: 'border-orange-500/30',
      iconColor: 'text-orange-400',
    },
    {
      label: 'Disabled',
      value: summary.disabled,
      icon: Ban,
      bgColor: 'from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
    },
    {
      label: 'Decommissioned',
      value: summary.decommissioned,
      icon: Trash2,
      bgColor: 'from-red-500/20 to-red-600/20',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.bgColor} border ${card.borderColor} rounded-xl p-4 backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#A7B0C0] mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </div>
              <Icon className={`w-8 h-8 ${card.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AgentStatusSummaryCards;
