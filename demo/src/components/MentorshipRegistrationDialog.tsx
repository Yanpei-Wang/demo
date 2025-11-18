import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { MentorshipRegistration } from '../types/dashboard';

interface MentorshipRegistrationDialogProps {
  role: 'mentor' | 'mentee';
  currentRegistration?: MentorshipRegistration;
  isLocked: boolean; // If true, the form is locked and can't be edited
  onSave: (registration: MentorshipRegistration) => void;
}

const INDUSTRIES = [
  'SWE',
  'UI / UX',
  'Data Science',
  'Product Management',
  'Marketing',
  'Sales',
  'Finance',
  'Consulting',
  'Other',
];

const SKILLSETS = [
  'Resume/LinkedIn Profile',
  'Career Path Guidance',
  'Experience Sharing',
  'Industry Trends',
  'Technical Skills Development',
  'Soft Skills Enhancement',
  'Networking',
  'Project Management',
  'Leadership',
  'Communication Skills',
];

const MENTEE_CAPACITIES = [
  { value: 1, label: '1 mentee – around 3 hours' },
  { value: 2, label: '2 mentees – around 6 hours' },
  { value: 3, label: '3 mentees – around 9 hours' },
];

export function MentorshipRegistrationDialog({
  role,
  currentRegistration,
  isLocked,
  onSave,
}: MentorshipRegistrationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<MentorshipRegistration>({
    industry: currentRegistration?.industry || '',
    skillsets: currentRegistration?.skillsets || [],
    menteeCapacity: currentRegistration?.menteeCapacity,
    goal: currentRegistration?.goal || '',
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        industry: currentRegistration?.industry || '',
        skillsets: currentRegistration?.skillsets || [],
        menteeCapacity: currentRegistration?.menteeCapacity,
        goal: currentRegistration?.goal || '',
      });
    }
  }, [isOpen, currentRegistration]);

  const handleSkillsetToggle = (skillset: string) => {
    if (isLocked) return;

    setFormData((prev) => {
      const isSelected = prev.skillsets.includes(skillset);
      if (isSelected) {
        return {
          ...prev,
          skillsets: prev.skillsets.filter((s) => s !== skillset),
        };
      } else {
        if (prev.skillsets.length >= 3) {
          toast.error('最多只能选择 3 个技能方向');
          return prev;
        }
        return {
          ...prev,
          skillsets: [...prev.skillsets, skillset],
        };
      }
    });
  };

  const handleSave = () => {
    // Validation
    if (!formData.industry) {
      toast.error(role === 'mentee' ? '请选择Industry of Interest' : '请选择Current Industry');
      return;
    }
    if (formData.skillsets.length === 0) {
      toast.error('请至少选择 1 个技能方向');
      return;
    }
    if (formData.skillsets.length > 3) {
      toast.error('最多只能选择 3 个技能方向');
      return;
    }
    if (role === 'mentor' && !formData.menteeCapacity) {
      toast.error('请选择您可以指导的学员数量');
      return;
    }
    if (formData.goal && formData.goal.length > 200) {
      toast.error('目标描述不能超过 200 字');
      return;
    }

    onSave(formData);
    setIsOpen(false);
    toast.success(isLocked ? '信息已保存' : '注册信息已更新');
  };

  const industryLabel = role === 'mentee' ? 'Industry of Interest' : 'Current Industry';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={
            isLocked && currentRegistration
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-sm border border-gray-300'
              : 'bg-[#6035F3] hover:bg-[#4A28C4] text-white shadow-md hover:shadow-lg transition-all'
          }
        >
          <FileText className="h-4 w-4 mr-2" />
          {currentRegistration ? (isLocked ? '查看注册信息' : '修改注册信息') : '填写注册信息'}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] bg-white border-gray-200 max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Mentorship 注册信息
            {isLocked && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                本轮期间不可修改
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isLocked
              ? '本轮 Mentorship 进行期间，注册信息不可修改。您可以查看当前的注册信息。'
              : '请填写您的 Mentorship 参与信息，这将帮助我们为您匹配合适的导师/学员。'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Locked Notice */}
            {isLocked && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">信息已锁定</p>
                  <p>当前轮次进行期间，注册信息不允许修改。您可以在本轮结束后、下一轮开始前修改这些信息。</p>
                </div>
              </div>
            )}

            {/* Industry Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                {industryLabel} <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.industry}
                onValueChange={(value) => !isLocked && setFormData({ ...formData, industry: value })}
                disabled={isLocked}
                className="space-y-2"
              >
                {INDUSTRIES.map((industry) => {
                  const isSelected = formData.industry === industry;
                  return (
                    <div
                      key={industry}
                      className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                        isSelected && isLocked ? 'bg-purple-50 border border-purple-200' : ''
                      }`}
                    >
                      <RadioGroupItem value={industry} id={`industry-${industry}`} disabled={isLocked} />
                      <Label
                        htmlFor={`industry-${industry}`}
                        className={`text-sm cursor-pointer ${
                          isSelected && isLocked
                            ? 'text-[#6035F3] font-semibold'
                            : isLocked
                            ? 'text-gray-400'
                            : 'text-gray-700'
                        }`}
                      >
                        {industry}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Skillsets Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                您希望通过 Mentorship 重点提升的技能方向 (最多选择 3 个){' '}
                <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                {SKILLSETS.map((skillset) => {
                  const isSelected = formData.skillsets.includes(skillset);
                  return (
                    <div
                      key={skillset}
                      className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                        isSelected && isLocked ? 'bg-purple-50 border border-purple-200' : ''
                      }`}
                    >
                      <Checkbox
                        id={`skillset-${skillset}`}
                        checked={isSelected}
                        onCheckedChange={() => handleSkillsetToggle(skillset)}
                        disabled={isLocked}
                      />
                      <Label
                        htmlFor={`skillset-${skillset}`}
                        className={`text-sm cursor-pointer ${
                          isSelected && isLocked
                            ? 'text-[#6035F3] font-semibold'
                            : isLocked
                            ? 'text-gray-400'
                            : 'text-gray-700'
                        }`}
                      >
                        {skillset}
                      </Label>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500">
                已选择: {formData.skillsets.length} / 3
              </p>
            </div>

            {/* Mentor-only: Mentee Capacity */}
            {role === 'mentor' && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  您可以在本轮指导多少位学员？ <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.menteeCapacity?.toString()}
                  onValueChange={(value) =>
                    !isLocked && setFormData({ ...formData, menteeCapacity: parseInt(value) })
                  }
                  disabled={isLocked}
                  className="space-y-2"
                >
                  {MENTEE_CAPACITIES.map((option) => {
                    const isSelected = formData.menteeCapacity === option.value;
                    return (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                          isSelected && isLocked ? 'bg-purple-50 border border-purple-200' : ''
                        }`}
                      >
                        <RadioGroupItem
                          value={option.value.toString()}
                          id={`capacity-${option.value}`}
                          disabled={isLocked}
                        />
                        <Label
                          htmlFor={`capacity-${option.value}`}
                          className={`text-sm cursor-pointer ${
                            isSelected && isLocked
                              ? 'text-[#6035F3] font-semibold'
                              : isLocked
                              ? 'text-gray-400'
                              : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            )}

            {/* Goal */}
            <div className="space-y-3">
              <Label htmlFor="goal" className="text-sm font-semibold text-gray-700">
                Current Round Mentorship Goal (选填，最多 200 字)
              </Label>
              <div
                className={`${
                  isLocked && formData.goal ? 'bg-purple-50 border-2 border-purple-200 rounded-lg p-4' : ''
                }`}
              >
                <Textarea
                  id="goal"
                  placeholder="例如：希望在本轮中提升技术面试能力，并了解行业最新趋势..."
                  value={formData.goal}
                  onChange={(e) => !isLocked && setFormData({ ...formData, goal: e.target.value })}
                  disabled={isLocked}
                  className={`min-h-[100px] resize-none ${
                    isLocked && formData.goal
                      ? 'bg-transparent border-none text-[#6035F3] font-medium'
                      : 'border-gray-300 focus:border-[#6035F3] focus:ring-[#6035F3]'
                  }`}
                  maxLength={200}
                />
              </div>
              <p className="text-xs text-gray-500 text-right">
                {formData.goal?.length || 0} / 200
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {isLocked ? '关闭' : 'Cancel'}
          </Button>
          {!isLocked && (
            <Button
              type="button"
              onClick={handleSave}
              className="bg-[#6035F3] hover:bg-[#4A28C4] text-white shadow-md"
            >
              保存
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
