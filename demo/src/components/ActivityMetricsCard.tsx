import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ActivityMetrics, DateRange } from '../types/dashboard';
import { 
  CheckCircle2, 
  GitMerge, 
  Code, 
  Clock, 
  MessageSquare 
} from 'lucide-react';
import { DateRangeFilter } from './DateRangeFilter';

interface ActivityMetricsCardProps {
  metrics: ActivityMetrics;
  title?: string;
}

export function ActivityMetricsCard({ metrics, title = '工作活动数据' }: ActivityMetricsCardProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '2024-01-01',
    end: '2024-12-31',
  });

  const metricsConfig = [
    { label: 'Jira Tickets (Done)', value: metrics.jiraTickets, icon: CheckCircle2, color: 'text-[#6035F3]' },
    { label: 'Merged CLs', value: metrics.mergedCLs, icon: GitMerge, color: 'text-[#7C5CF5]' },
    { label: 'Merged LOC', value: metrics.mergedLoc.toLocaleString(), icon: Code, color: 'text-[#9883F7]' },
    { label: 'Meeting Hours', value: metrics.meetingHours, icon: Clock, color: 'text-[#4E2AC4]' },
    { label: 'Chat Messages Sent', value: metrics.chatMessages, icon: MessageSquare, color: 'text-[#6035F3]' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>{title}</CardTitle>
          <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {metricsConfig.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gray-50 ${metric.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                  <div className="text-2xl mt-1">{metric.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
