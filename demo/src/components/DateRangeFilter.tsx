import { useState } from 'react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DateRange } from '../types/dashboard';

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState<Date>(new Date(dateRange.start));
  const [endDate, setEndDate] = useState<Date>(new Date(dateRange.end));

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      onDateRangeChange({
        start: format(date, 'yyyy-MM-dd'),
        end: dateRange.end,
      });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setEndDate(date);
      onDateRangeChange({
        start: dateRange.start,
        end: format(date, 'yyyy-MM-dd'),
      });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">开始日期:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(startDate, 'PPP', { locale: zhCN })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={handleStartDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">结束日期:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(endDate, 'PPP', { locale: zhCN })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={handleEndDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
