import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CheckCircle2, XCircle, SlidersHorizontal, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { LeaveRequest, LeaveBalance, LeaveType } from '../types/dashboard';
import { mockLeaveRequests, getEmployeeRoster, EmployeeLeaveProfile, quarterlyHolidays2026 } from '../utils/mockData';
import { hoursDisplay } from './LeavePanel';

const LEAVE_LABELS: Record<LeaveType, string> = {
  annual: '年假', sick: '病假', personal: '事假', marriage: '婚假',
  maternity: '产假', paternity: '陪产假', bereavement: '丧假', comp: '调休', quarterly: '季度假',
};

const HOURS_PER_DAY = 8;

function statusBadge(status: LeaveRequest['status']) {
  if (status === 'approved') return <Badge className="bg-green-100 text-green-700 border-green-200">已批准</Badge>;
  if (status === 'rejected') return <Badge className="bg-red-100 text-red-700 border-red-200">已拒绝</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">待审批</Badge>;
}

interface AdjustDialogState {
  open: boolean;
  emp: EmployeeLeaveProfile | null;
  field: keyof LeaveBalance | '';
  delta: string;
  reason: string;
}

export function AdminLeavePanel() {
  const [requests, setRequests] = useState<LeaveRequest[]>([...mockLeaveRequests]);
  const [employees, setEmployees] = useState<EmployeeLeaveProfile[]>(getEmployeeRoster());
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; reqId: string; reason: string }>({ open: false, reqId: '', reason: '' });
  const [adjustDialog, setAdjustDialog] = useState<AdjustDialogState>({ open: false, emp: null, field: '', delta: '', reason: '' });

  const pending = requests.filter((r) => r.status === 'pending');
  const resolved = requests.filter((r) => r.status !== 'pending');

  function approve(id: string) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'approved', reviewedAt: new Date().toISOString().slice(0, 10) } : r));
    const req = requests.find((r) => r.id === id);
    if (req) toast.success(`已批准 ${req.userName} 的${LEAVE_LABELS[req.type]}申请`);
  }

  function openReject(id: string) {
    setRejectDialog({ open: true, reqId: id, reason: '' });
  }

  function confirmReject() {
    const { reqId, reason } = rejectDialog;
    setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: 'rejected', rejectionReason: reason, reviewedAt: new Date().toISOString().slice(0, 10) } : r));
    const req = requests.find((r) => r.id === reqId);
    if (req) toast.success(`已拒绝 ${req.userName} 的申请`);
    setRejectDialog({ open: false, reqId: '', reason: '' });
  }

  function openAdjust(emp: EmployeeLeaveProfile) {
    setAdjustDialog({ open: true, emp, field: '', delta: '', reason: '' });
  }

  function confirmAdjust() {
    const { emp, field, delta, reason } = adjustDialog;
    if (!emp || !field || !reason.trim()) { toast.error('请填写完整信息'); return; }
    const num = parseInt(delta, 10);
    if (isNaN(num)) { toast.error('调整天数必须为整数'); return; }
    setEmployees((prev) => prev.map((e) => {
      if (e.id !== emp.id) return e;
      const b = { ...e.leaveBalance };
      (b as any)[field] = Math.max(0, ((b as any)[field] as number) + num);
      return { ...e, leaveBalance: b };
    }));
    toast.success(`已调整 ${emp.name} 的余额：${field} ${num > 0 ? '+' : ''}${num} 天`);
    setAdjustDialog({ open: false, emp: null, field: '', delta: '', reason: '' });
  }

  const BALANCE_FIELDS: { key: keyof LeaveBalance; label: string }[] = [
    { key: 'annual', label: '年假配额' },
    { key: 'annualUsed', label: '年假已用' },
    { key: 'annualCarryover', label: '年假结转' },
    { key: 'sick', label: '病假配额' },
    { key: 'sickUsed', label: '病假已用' },
    { key: 'comp', label: '调休余额' },
    { key: 'compUsed', label: '调休已用' },
    { key: 'quarterly', label: '季度假已发' },
    { key: 'quarterlyUsed', label: '季度假已用' },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:text-[#6035F3]">
            待审批
            {pending.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">{pending.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-[#6035F3]">全部记录</TabsTrigger>
          <TabsTrigger value="balances" className="data-[state=active]:bg-white data-[state=active]:text-[#6035F3]">员工余额</TabsTrigger>
          <TabsTrigger value="quarterly" className="data-[state=active]:bg-white data-[state=active]:text-[#6035F3]">季度假配置</TabsTrigger>
        </TabsList>

        {/* Pending approvals */}
        <TabsContent value="pending" className="mt-4">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-[#6035F3]" />
                <CardTitle className="text-base font-semibold">待审批申请</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pending.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">暂无待审批申请</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">员工</TableHead>
                      <TableHead className="font-semibold text-gray-700">类型</TableHead>
                      <TableHead className="font-semibold text-gray-700">日期</TableHead>
                      <TableHead className="font-semibold text-gray-700">时长</TableHead>
                      <TableHead className="font-semibold text-gray-700">提交时间</TableHead>
                      <TableHead className="font-semibold text-gray-700 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.map((r) => (
                      <TableRow key={r.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900 text-sm">{r.userName}</TableCell>
                        <TableCell className="text-sm text-gray-700">{LEAVE_LABELS[r.type]}</TableCell>
                        <TableCell className="text-sm text-gray-600">{r.startDate}{r.startDate !== r.endDate ? ` – ${r.endDate}` : ''}{r.startTime && r.endTime ? <span className="text-gray-400 ml-1">{r.startTime}–{r.endTime}</span> : null}</TableCell>
                        <TableCell className="text-sm text-gray-600">{hoursDisplay(r.days)}</TableCell>
                        <TableCell className="text-sm text-gray-500">{r.submittedAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" className="h-7 px-2.5 bg-green-600 hover:bg-green-700 text-white text-xs" onClick={() => approve(r.id)}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />批准
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 px-2.5 border-red-300 text-red-600 hover:bg-red-50 text-xs" onClick={() => openReject(r.id)}>
                              <XCircle className="h-3.5 w-3.5 mr-1" />拒绝
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All records */}
        <TabsContent value="all" className="mt-4">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">全部请假记录</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">员工</TableHead>
                    <TableHead className="font-semibold text-gray-700">类型</TableHead>
                    <TableHead className="font-semibold text-gray-700">日期</TableHead>
                    <TableHead className="font-semibold text-gray-700">时长</TableHead>
                    <TableHead className="font-semibold text-gray-700">状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900 text-sm">{r.userName}</TableCell>
                      <TableCell className="text-sm text-gray-700">{LEAVE_LABELS[r.type]}</TableCell>
                      <TableCell className="text-sm text-gray-600">{r.startDate}{r.startDate !== r.endDate ? ` – ${r.endDate}` : ''}{r.startTime && r.endTime ? <span className="text-gray-400 ml-1">{r.startTime}–{r.endTime}</span> : null}</TableCell>
                      <TableCell className="text-sm text-gray-600">{hoursDisplay(r.days)}</TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee balances */}
        <TabsContent value="balances" className="mt-4">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-[#6035F3]" />
                <CardTitle className="text-base font-semibold">员工假期余额</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">姓名</TableHead>
                    <TableHead className="font-semibold text-gray-700">职级</TableHead>
                    <TableHead className="font-semibold text-gray-700">入职日期</TableHead>
                    <TableHead className="font-semibold text-gray-700">年假余 (h)</TableHead>
                    <TableHead className="font-semibold text-gray-700">病假余 (h)</TableHead>
                    <TableHead className="font-semibold text-gray-700">调休余 (h)</TableHead>
                    <TableHead className="font-semibold text-gray-700">季度假余 (h)</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => {
                    const b = emp.leaveBalance;
                    return (
                      <TableRow key={emp.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900 text-sm">{emp.name}</TableCell>
                        <TableCell><Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 text-xs">{emp.level}</Badge></TableCell>
                        <TableCell className="text-sm text-gray-600">{emp.hireDate}</TableCell>
                        <TableCell className="text-sm text-gray-700">{(b.annual - b.annualUsed) * HOURS_PER_DAY}h / {b.annual * HOURS_PER_DAY}h</TableCell>
                        <TableCell className="text-sm text-gray-700">{(b.sick - b.sickUsed) * HOURS_PER_DAY}h / {b.sick * HOURS_PER_DAY}h</TableCell>
                        <TableCell className="text-sm text-gray-700">{(b.comp - b.compUsed) * HOURS_PER_DAY}h / {b.comp * HOURS_PER_DAY}h</TableCell>
                        <TableCell className="text-sm text-gray-700">{(b.quarterly - b.quarterlyUsed) * HOURS_PER_DAY}h / {b.quarterly * HOURS_PER_DAY}h</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs border-gray-300 hover:bg-gray-50" onClick={() => openAdjust(emp)}>
                            调整余额
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quarterly holidays config */}
        <TabsContent value="quarterly" className="mt-4">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">2026 季度假日期</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quarterlyHolidays2026.map((q) => (
                  <div key={q.quarter} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 w-8">{q.quarter}</span>
                      <span className="text-sm text-gray-600">{q.date}</span>
                    </div>
                    {q.issued ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">已发放</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500 border-gray-200">待发放</Badge>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">季度假由 Admin 在固定日期统一发放，每次 1 天，全员适用。</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(o) => setRejectDialog((p) => ({ ...p, open: o }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>拒绝申请</DialogTitle>
            <DialogDescription>请填写拒绝原因，员工将收到通知</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog((p) => ({ ...p, reason: e.target.value }))}
              placeholder="请输入拒绝原因…"
              className="border-gray-300 resize-none"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, reqId: '', reason: '' })}>取消</Button>
            <Button variant="destructive" onClick={confirmReject}>确认拒绝</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust balance dialog */}
      <Dialog open={adjustDialog.open} onOpenChange={(o) => setAdjustDialog((p) => ({ ...p, open: o }))}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>调整余额 — {adjustDialog.emp?.name}</DialogTitle>
            <DialogDescription>正数增加天数，负数扣减天数</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>调整字段</Label>
              <Select value={adjustDialog.field} onValueChange={(v) => setAdjustDialog((p) => ({ ...p, field: v as keyof LeaveBalance }))}>
                <SelectTrigger className="border-gray-300"><SelectValue placeholder="选择字段…" /></SelectTrigger>
                <SelectContent>
                  {BALANCE_FIELDS.map((f) => (
                    <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>调整天数（正/负整数）</Label>
              <Input
                type="number"
                value={adjustDialog.delta}
                onChange={(e) => setAdjustDialog((p) => ({ ...p, delta: e.target.value }))}
                placeholder="例如 +3 或 -1"
                className="border-gray-300"
              />
            </div>
            <div className="space-y-1.5">
              <Label>调整原因 <span className="text-red-500">*</span></Label>
              <Textarea
                value={adjustDialog.reason}
                onChange={(e) => setAdjustDialog((p) => ({ ...p, reason: e.target.value }))}
                placeholder="请说明调整原因…"
                className="border-gray-300 resize-none"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialog({ open: false, emp: null, field: '', delta: '', reason: '' })}>取消</Button>
            <Button className="bg-[#6035F3] hover:bg-[#4f2ccc] text-white" onClick={confirmAdjust}>确认调整</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
