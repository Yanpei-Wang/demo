import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Plus, Pencil, Trash2, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { MentorshipRound } from '../types/dashboard';
import { mentorshipRounds as initialRounds } from '../utils/mockData';

export function MentorshipManagementPage() {
  const [rounds, setRounds] = useState<MentorshipRound[]>(initialRounds);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<MentorshipRound | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'active' as 'active' | 'completed',
    requiredMeetings: 8,
  });

  const handleOpenDialog = (round?: MentorshipRound) => {
    if (round) {
      setEditingRound(round);
      setFormData({
        name: round.name,
        startDate: round.startDate,
        endDate: round.endDate,
        status: round.status,
        requiredMeetings: round.requiredMeetings,
      });
    } else {
      setEditingRound(null);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        status: 'active',
        requiredMeetings: 8,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRound(null);
  };

  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('请输入轮次名称');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('请选择开始时间和结束时间');
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('结束时间必须晚于开始时间');
      return;
    }
    if (formData.requiredMeetings < 1) {
      toast.error('应完成会议次数必须大于0');
      return;
    }

    if (editingRound) {
      // Update existing round
      setRounds(rounds.map(round =>
        round.id === editingRound.id
          ? { ...round, ...formData }
          : round
      ));
      toast.success('轮次信息已更新');
    } else {
      // Create new round
      const newRound: MentorshipRound = {
        id: `round-${Date.now()}`,
        ...formData,
      };
      setRounds([newRound, ...rounds]);
      toast.success('新轮次已创建');
    }

    handleCloseDialog();
  };

  const handleDelete = (round: MentorshipRound) => {
    if (window.confirm(`确定要删除 "${round.name}" 吗？此操作无法撤销。`)) {
      setRounds(rounds.filter(r => r.id !== round.id));
      toast.success('轮次已删除');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ color: '#171717' }}>
            Mentorship 轮次管理
          </h1>
          <p className="text-gray-600 mt-2">管理所有导师项目轮次的基本信息和要求</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#6035F3] hover:bg-[#4A28C4] text-white shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          创建新轮次
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">总轮次数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Calendar className="h-6 w-6 text-[#6035F3]" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{rounds.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">进行中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-xl">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {rounds.filter(r => r.status === 'active').length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {rounds.filter(r => r.status === 'completed').length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rounds Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">所有轮次</CardTitle>
          <CardDescription>查看和管理所有 Mentorship 项目轮次</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">轮次名称</TableHead>
                  <TableHead className="font-semibold text-gray-700">开始时间</TableHead>
                  <TableHead className="font-semibold text-gray-700">结束时间</TableHead>
                  <TableHead className="font-semibold text-gray-700">应完成会议次数</TableHead>
                  <TableHead className="font-semibold text-gray-700">状态</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rounds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      暂无轮次数据，点击上方按钮创建第一个轮次
                    </TableCell>
                  </TableRow>
                ) : (
                  rounds.map((round) => (
                    <TableRow
                      key={round.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900">{round.name}</TableCell>
                      <TableCell className="text-gray-600">{formatDate(round.startDate)}</TableCell>
                      <TableCell className="text-gray-600">{formatDate(round.endDate)}</TableCell>
                      <TableCell className="text-gray-900 font-semibold">
                        {round.requiredMeetings} 次
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="font-semibold"
                          style={{
                            backgroundColor: round.status === 'active' ? '#D1FAE5' : '#F5F5F5',
                            color: round.status === 'active' ? '#065F46' : '#525252',
                          }}
                        >
                          {round.status === 'active' ? '进行中' : 'Completed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(round)}
                            className="hover:bg-purple-50 hover:text-[#6035F3] transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(round)}
                            className="hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingRound ? '编辑轮次' : '创建新轮次'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingRound
                ? '修改 Mentorship 轮次的基本信息'
                : '填写新 Mentorship 轮次的基本信息'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Round Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                轮次名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="例如：2025年春季"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">
                  开始时间 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700">
                  结束时间 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
                />
              </div>
            </div>

            {/* Required Meetings */}
            <div className="space-y-2">
              <Label htmlFor="requiredMeetings" className="text-sm font-semibold text-gray-700">
                应完成会议次数 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="requiredMeetings"
                type="number"
                min="1"
                placeholder="8"
                value={formData.requiredMeetings}
                onChange={(e) =>
                  setFormData({ ...formData, requiredMeetings: parseInt(e.target.value) || 0 })
                }
                className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]"
              />
              <p className="text-sm text-gray-500">
                参与者需要完成的最少会议次数
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                状态
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'completed') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">进行中</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDialog}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-[#6035F3] hover:bg-[#4A28C4] text-white shadow-md"
            >
              {editingRound ? '保存修改' : '创建轮次'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
