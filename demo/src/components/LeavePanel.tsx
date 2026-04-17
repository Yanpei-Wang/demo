import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { CalendarDays, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LeaveRequest, LeaveType, LeaveBalance } from '../types/dashboard';
import { mockLeaveRequests, quarterlyHolidays2026, getEmployeeRoster } from '../utils/mockData';

const LEAVE_LABELS: Record<LeaveType, string> = {
  annual: '年假',
  sick: '病假',
  personal: '事假',
  marriage: '婚假',
  maternity: '产假',
  paternity: '陪产假',
  bereavement: '丧假',
  comp: '调休',
  quarterly: '季度假',
};

const LEAVE_QUOTAS: Partial<Record<LeaveType, { days: number; label: string }>> = {
  marriage:    { days: 3,   label: '一次性' },
  maternity:   { days: 158, label: '一次性' },
  paternity:   { days: 15,  label: '一次性' },
  bereavement: { days: 3,   label: '直系亲属' },
};

const HOURS_PER_DAY = 8;

export function hoursDisplay(days: number): string {
  const totalHours = days * HOURS_PER_DAY;
  const h = Number.isInteger(totalHours) ? totalHours : parseFloat(totalHours.toFixed(1));
  if (Number.isInteger(days) && days > 0) {
    return `${h} 小时 (${days} 天)`;
  }
  return `${h} 小时`;
}

function statusBadge(status: LeaveRequest['status']) {
  if (status === 'approved') return <Badge className="bg-green-100 text-green-700 border-green-200">已批准</Badge>;
  if (status === 'rejected') return <Badge className="bg-red-100 text-red-700 border-red-200">已拒绝</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">待审批</Badge>;
}

interface LeavePanelProps {
  userId?: string;
  userName?: string;
}

const EMPTY_FORM = {
  type: 'annual' as LeaveType,
  mode: 'days' as 'days' | 'hours',
  startDate: '',
  endDate: '',
  startTime: '09:00',
  endTime: '13:00',
};

function calcTimeHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  return mins <= 0 ? 0 : parseFloat((mins / 60).toFixed(2));
}

export function LeavePanel({ userId = 'current-user', userName = 'Current User' }: LeavePanelProps) {
  const roster = getEmployeeRoster();
  const emp = roster.find((e) => e.id === userId) ?? roster.find((e) => e.id === 'current-user')!;
  const [balance] = useState<LeaveBalance>(emp.leaveBalance);

  const [requests, setRequests] = useState<LeaveRequest[]>(
    mockLeaveRequests.filter((r) => r.userId === userId)
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  function calcDays(): number {
    if (form.mode === 'hours') {
      return calcTimeHours(form.startTime, form.endTime) / HOURS_PER_DAY;
    }
    if (!form.startDate || !form.endDate) return 0;
    const diff = (new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24);
    return diff < 0 ? 0 : diff + 1;
  }

  const days = calcDays();

  function handleSubmit() {
    if (form.mode === 'hours') {
      if (!form.startDate) { toast.error('请选择日期'); return; }
      if (calcTimeHours(form.startTime, form.endTime) <= 0) { toast.error('结束时间必须晚于开始时间'); return; }
    } else {
      if (!form.startDate || !form.endDate || days <= 0) { toast.error('请选择有效的请假日期'); return; }
    }
    const req: LeaveRequest = {
      id: `lr-${Date.now()}`,
      userId,
      userName,
      type: form.type,
      startDate: form.startDate,
      endDate: form.mode === 'hours' ? form.startDate : form.endDate,
      ...(form.mode === 'hours' && { startTime: form.startTime, endTime: form.endTime }),
      days,
      reason: '',
      status: 'pending',
      submittedAt: new Date().toISOString().slice(0, 10),
    };
    setRequests((prev) => [req, ...prev]);
    mockLeaveRequests.unshift(req);
    setForm(EMPTY_FORM);
    setDialogOpen(false);
    toast.success('申请已提交，等待 Admin 审批');
  }

  const annualRemaining = balance.annual - balance.annualUsed;
  const sickRemaining = balance.sick - balance.sickUsed;
  const compRemaining = balance.comp - balance.compUsed;
  const quarterlyRemaining = balance.quarterly - balance.quarterlyUsed;

  return (
    <div className="space-y-6">
      {/* Balance cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '年假', remaining: annualRemaining, total: balance.annual, note: `含结转 ${balance.annualCarryover} 天`, color: 'text-purple-600' },
          { label: '病假', remaining: sickRemaining, total: balance.sick, note: '每年 30 天', color: 'text-blue-600' },
          { label: '调休', remaining: compRemaining, total: balance.comp, note: '加班累积', color: 'text-orange-600' },
          { label: '季度假', remaining: quarterlyRemaining, total: balance.quarterly, note: `Q1 已发放 · Q2 ${quarterlyHolidays2026[1].date}`, color: 'text-green-600' },
        ].map((item) => (
          <Card key={item.label} className="border-gray-200 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>
                {item.remaining * HOURS_PER_DAY}
                <span className="text-sm font-normal text-gray-400 ml-1">小时</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{item.remaining} 天 · {item.note}</p>
              <p className="text-xs text-gray-300 mt-0.5">共 {item.total * HOURS_PER_DAY} 小时</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* One-time leave quotas */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-800">一次性假期参考</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(LEAVE_QUOTAS) as [LeaveType, { days: number; label: string }][]).map(([type, q]) => (
              <div key={type} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">{LEAVE_LABELS[type]}</span>
                <span className="text-sm text-gray-500">{hoursDisplay(q.days)}</span>
                <span className="text-xs text-gray-400">({q.label})</span>
              </div>
            ))}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">事假</span>
              <span className="text-xs text-gray-400">(无上限 · 无薪)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests history */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#6035F3]" />
            <CardTitle className="text-base font-semibold text-gray-800">请假记录</CardTitle>
          </div>
          <Button size="sm" className="bg-[#6035F3] hover:bg-[#4f2ccc] text-white" onClick={() => setDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-1.5" />
            提交申请
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">暂无请假记录</p>
          ) : (
            <div className="rounded-b-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">类型</TableHead>
                    <TableHead className="font-semibold text-gray-700">日期</TableHead>
                    <TableHead className="font-semibold text-gray-700">时长</TableHead>
                    <TableHead className="font-semibold text-gray-700">提交时间</TableHead>
                    <TableHead className="font-semibold text-gray-700">状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r.id} className="hover:bg-gray-50">
                      <TableCell className="text-sm font-medium text-gray-800">{LEAVE_LABELS[r.type]}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {r.startDate}
                        {r.startDate !== r.endDate ? ` – ${r.endDate}` : ''}
                        {r.startTime && r.endTime && (
                          <span className="text-gray-400 ml-1">{r.startTime}–{r.endTime}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{hoursDisplay(r.days)}</TableCell>
                      <TableCell className="text-sm text-gray-500">{r.submittedAt}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {statusBadge(r.status)}
                          {r.status === 'rejected' && r.rejectionReason && (
                            <p className="text-xs text-red-500">{r.rejectionReason}</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>提交请假申请</DialogTitle>
            <DialogDescription>申请将发送给 Admin 审批</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Leave type */}
            <div className="space-y-1.5">
              <Label>假期类型</Label>
              <Select value={form.type} onValueChange={set('type') as (v: string) => void}>
                <SelectTrigger className="border-gray-300"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(LEAVE_LABELS) as [LeaveType, string][]).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mode toggle */}
            <div className="space-y-1.5">
              <Label>请假方式</Label>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden w-fit">
                {(['days', 'hours'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, mode: m, endDate: '' }))}
                    className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                      form.mode === m
                        ? 'bg-[#6035F3] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {m === 'days' ? '按天' : '按小时'}
                  </button>
                ))}
              </div>
            </div>

            {form.mode === 'days' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>开始日期</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => set('startDate')(e.target.value)} className="border-gray-300" />
                </div>
                <div className="space-y-1.5">
                  <Label>结束日期</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => set('endDate')(e.target.value)} className="border-gray-300" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>日期</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => set('startDate')(e.target.value)} className="border-gray-300" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>开始时间</Label>
                    <Input type="time" value={form.startTime} onChange={(e) => set('startTime')(e.target.value)} className="border-gray-300" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>结束时间</Label>
                    <Input type="time" value={form.endTime} onChange={(e) => set('endTime')(e.target.value)} className="border-gray-300" />
                  </div>
                </div>
              </div>
            )}

            {days > 0 && (
              <p className="text-sm text-gray-500">
                共 <span className="font-semibold text-gray-800">{hoursDisplay(days)}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setForm(EMPTY_FORM); setDialogOpen(false); }}>取消</Button>
            <Button className="bg-[#6035F3] hover:bg-[#4f2ccc] text-white" onClick={handleSubmit}>提交</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
