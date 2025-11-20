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
import { Switch } from './ui/switch';
import { FileText, AlertCircle, Edit3 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { MentorshipRegistration } from '../types/dashboard';

interface MentorshipRegistrationDialogProps {
  role: 'mentor' | 'mentee';
  currentRegistration?: MentorshipRegistration;
  isLocked: boolean; // If true, the form is locked and can't be edited
  onSave: (registration: MentorshipRegistration) => void;
  currentPartnerNames?: string[]; // Current mentee/mentor names
}

const INDUSTRIES = [
  'SWE',
  'UI / UX',
  'Data Science',
  'Product Management',
  // 'Marketing',
  // 'Sales',
  // 'Finance',
  // 'Consulting',
  // 'Other',
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
  currentPartnerNames,
}: MentorshipRegistrationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tryEditMode, setTryEditMode] = useState(false); // Try edit mode for locked forms
  const [formData, setFormData] = useState<MentorshipRegistration>({
    industry: currentRegistration?.industry || '',
    skillsets: currentRegistration?.skillsets || [],
    menteeCapacity: currentRegistration?.menteeCapacity,
    goal: currentRegistration?.goal || '',
    mentorPreference: currentRegistration?.mentorPreference || 'no-preference',
    continueMenteeNames: currentRegistration?.continueMenteeNames || [],
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTryEditMode(false); // Reset try edit mode
      setFormData({
        industry: currentRegistration?.industry || '',
        skillsets: currentRegistration?.skillsets || [],
        menteeCapacity: currentRegistration?.menteeCapacity,
        goal: currentRegistration?.goal || '',
        mentorPreference: currentRegistration?.mentorPreference || 'no-preference',
        continueMenteeNames: currentRegistration?.continueMenteeNames || [],
      });
    }
  }, [isOpen, currentRegistration]);

  const handleSkillsetToggle = (skillset: string) => {
    if (isLocked && !tryEditMode) return;

    setFormData((prev) => {
      const isSelected = prev.skillsets.includes(skillset);
      if (isSelected) {
        return {
          ...prev,
          skillsets: prev.skillsets.filter((s) => s !== skillset),
        };
      } else {
        if (prev.skillsets.length >= 3) {
          toast.error('Maximum of 3 skillsets allowed');
          return prev;
        }
        return {
          ...prev,
          skillsets: [...prev.skillsets, skillset],
        };
      }
    });
  };

  const handleMenteeToggle = (menteeName: string) => {
    if (isLocked && !tryEditMode) return;

    setFormData((prev) => {
      const isSelected = prev.continueMenteeNames?.includes(menteeName);
      if (isSelected) {
        return {
          ...prev,
          continueMenteeNames: prev.continueMenteeNames?.filter((name) => name !== menteeName),
        };
      } else {
        return {
          ...prev,
          continueMenteeNames: [...(prev.continueMenteeNames || []), menteeName],
        };
      }
    });
  };

  const handleSave = () => {
    // Validation
    if (!formData.industry) {
      toast.error(role === 'mentee' ? 'Please select your industry of interest' : 'Please select your current industry');
      return;
    }
    if (formData.skillsets.length === 0) {
      toast.error('Please select at least 1 skillset');
      return;
    }
    if (formData.skillsets.length > 3) {
      toast.error('Maximum of 3 skillsets allowed');
      return;
    }
    if (role === 'mentor' && !formData.menteeCapacity) {
      toast.error('Please select the number of mentees you can guide');
      return;
    }
    if (formData.goal && formData.goal.length > 200) {
      toast.error('Goal description cannot exceed 200 characters');
      return;
    }
    // Validate mentor preference - if continue is selected, at least one mentee should be selected
    if (role === 'mentor' && formData.mentorPreference === 'continue' && currentPartnerNames && currentPartnerNames.length > 0) {
      if (!formData.continueMenteeNames || formData.continueMenteeNames.length === 0) {
        toast.error('Please select at least one mentee to continue with, or choose a different preference');
        return;
      }
    }

    onSave(formData);
    setIsOpen(false);
    toast.success(isLocked ? 'Information saved' : 'Registration information updated');
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
          {currentRegistration ? (isLocked ? 'View Registration' : 'Edit Registration') : 'Fill Registration Form'}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] bg-white border-gray-200 max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Mentorship Registration
            {isLocked && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                Cannot be modified during current round
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isLocked
              ? 'During the current Mentorship round, registration information cannot be modified. You can view your current registration information.'
              : 'Please fill in your Mentorship participation information. This will help us match you with suitable mentors/mentees.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Locked Notice */}
            {isLocked && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Information Locked</p>
                    <p>During the current round, registration information cannot be modified. You can modify this information after the current round ends and before the next round begins.</p>
                  </div>
                </div>

                {/* Try Edit Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Edit3 className="h-5 w-5 text-[#6035F3]" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Try Edit Mode</p>
                      <p className="text-xs text-gray-600">Experience form interactions without saving changes</p>
                    </div>
                  </div>
                  <Switch
                    checked={tryEditMode}
                    onCheckedChange={setTryEditMode}
                    className="data-[state=checked]:bg-[#6035F3]"
                  />
                </div>

                {/* Try Edit Mode Active Notice */}
                {tryEditMode && (
                  <div className="flex items-start gap-2 p-3 bg-blue-100 border border-blue-300 rounded-lg animate-in fade-in duration-200">
                    <AlertCircle className="h-4 w-4 text-blue-700 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-900">
                      <strong>Try Edit Mode Active:</strong> You can now interact with the form. Changes will not be saved - this is for preview only.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Industry Selection */}
            {/* Industry Selection — mentee only */}
            {role === 'mentee' && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  {industryLabel} <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.industry}
                  onValueChange={(value) => (!isLocked || tryEditMode) && setFormData({ ...formData, industry: value })}
                  disabled={isLocked && !tryEditMode}
                  className="space-y-2"
                >
                  {INDUSTRIES.map((industry) => {
                    const isSelected = formData.industry === industry;
                    return (
                      <div
                        key={industry}
                        className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${isSelected && (isLocked && !tryEditMode) ? 'bg-purple-50 border border-purple-200' : ''
                          }`}
                      >
                        <RadioGroupItem value={industry} id={`industry-${industry}`} disabled={isLocked && !tryEditMode} />
                        <Label
                          htmlFor={`industry-${industry}`}
                          className={`text-sm cursor-pointer ${isSelected && (isLocked && !tryEditMode)
                              ? 'text-[#6035F3] font-semibold'
                              : (isLocked && !tryEditMode)
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
            )}

            {/* Skillsets Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Key skillsets you hope to improve through Mentorship (select up to 3){' '}
                <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2">
                {SKILLSETS.map((skillset) => {
                  const isSelected = formData.skillsets.includes(skillset);
                  return (
                    <div
                      key={skillset}
                      className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${isSelected && (isLocked && !tryEditMode) ? 'bg-purple-50 border border-purple-200' : ''
                        }`}
                    >
                      <Checkbox
                        id={`skillset-${skillset}`}
                        checked={isSelected}
                        onCheckedChange={() => handleSkillsetToggle(skillset)}
                        disabled={isLocked && !tryEditMode}
                      />
                      <Label
                        htmlFor={`skillset-${skillset}`}
                        className={`text-sm cursor-pointer ${isSelected && (isLocked && !tryEditMode)
                            ? 'text-[#6035F3] font-semibold'
                            : (isLocked && !tryEditMode)
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
                Selected: {formData.skillsets.length} / 3
              </p>
            </div>

            {/* Mentor-only: Mentee Capacity */}
            {role === 'mentor' && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  How many mentees can you guide in this round? <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.menteeCapacity?.toString()}
                  onValueChange={(value) =>
                    (!isLocked || tryEditMode) && setFormData({ ...formData, menteeCapacity: parseInt(value) })
                  }
                  disabled={isLocked && !tryEditMode}
                  className="space-y-2"
                >
                  {MENTEE_CAPACITIES.map((option) => {
                    const isSelected = formData.menteeCapacity === option.value;
                    return (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${isSelected && (isLocked && !tryEditMode) ? 'bg-purple-50 border border-purple-200' : ''
                          }`}
                      >
                        <RadioGroupItem
                          value={option.value.toString()}
                          id={`capacity-${option.value}`}
                          disabled={isLocked && !tryEditMode}
                        />
                        <Label
                          htmlFor={`capacity-${option.value}`}
                          className={`text-sm cursor-pointer ${isSelected && (isLocked && !tryEditMode)
                              ? 'text-[#6035F3] font-semibold'
                              : (isLocked && !tryEditMode)
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
                Current Round Mentorship Goal (optional, max 200 characters)
              </Label>
              <div
                className={`${(isLocked && !tryEditMode) && formData.goal ? 'bg-purple-50 border-2 border-purple-200 rounded-lg p-4' : ''
                  }`}
              >
                <Textarea
                  id="goal"
                  placeholder="e.g., I hope to improve my technical interview skills and learn about the latest industry trends in this round..."
                  value={formData.goal}
                  onChange={(e) => (!isLocked || tryEditMode) && setFormData({ ...formData, goal: e.target.value })}
                  disabled={isLocked && !tryEditMode}
                  className={`min-h-[100px] resize-none ${(isLocked && !tryEditMode) && formData.goal
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

            {/* Mentor/Mentee Preference for Next Round */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                {role === 'mentee'
                  ? 'Would you prefer to continue with your current mentor or be matched with a different mentor?'
                  : 'Would you prefer to continue with your current mentee(s) or be matched with different mentee(s)?'}
              </Label>
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> This preference will only take effect if both you and your current {role === 'mentee' ? 'mentor' : 'mentee(s)'} register for the next round.
                </p>
              </div>
              <RadioGroup
                value={formData.mentorPreference}
                onValueChange={(value) => (!isLocked || tryEditMode) && setFormData({ ...formData, mentorPreference: value as 'continue' | 'different' | 'no-preference' })}
                disabled={isLocked && !tryEditMode}
                className="space-y-2"
              >
                <div
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${formData.mentorPreference === 'continue' && (isLocked && !tryEditMode) ? 'bg-purple-50 border border-purple-200' : ''
                    }`}
                >
                  <RadioGroupItem value="continue" id="preference-continue" disabled={isLocked && !tryEditMode} />
                  <Label
                    htmlFor="preference-continue"
                    className={`text-sm cursor-pointer ${formData.mentorPreference === 'continue' && (isLocked && !tryEditMode)
                        ? 'text-[#6035F3] font-semibold'
                        : (isLocked && !tryEditMode)
                          ? 'text-gray-400'
                          : 'text-gray-700'
                      }`}
                  >
                    Continue with my current {role === 'mentee' ? 'mentor' : 'mentee(s)'}
                  </Label>
                </div>
                <div
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${formData.mentorPreference === 'different' && (isLocked && !tryEditMode) ? 'bg-purple-50 border border-purple-200' : ''
                    }`}
                >
                  <RadioGroupItem value="different" id="preference-different" disabled={isLocked && !tryEditMode} />
                  <Label
                    htmlFor="preference-different"
                    className={`text-sm cursor-pointer ${formData.mentorPreference === 'different' && (isLocked && !tryEditMode)
                        ? 'text-[#6035F3] font-semibold'
                        : (isLocked && !tryEditMode)
                          ? 'text-gray-400'
                          : 'text-gray-700'
                      }`}
                  >
                    Be matched with a different {role === 'mentee' ? 'mentor' : 'mentee(s)'}
                  </Label>
                </div>
                <div
                  className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${formData.mentorPreference === 'no-preference' && (isLocked && !tryEditMode) ? 'bg-purple-50 border border-purple-200' : ''
                    }`}
                >
                  <RadioGroupItem value="no-preference" id="preference-no-preference" disabled={isLocked && !tryEditMode} />
                  <Label
                    htmlFor="preference-no-preference"
                    className={`text-sm cursor-pointer ${formData.mentorPreference === 'no-preference' && (isLocked && !tryEditMode)
                        ? 'text-[#6035F3] font-semibold'
                        : (isLocked && !tryEditMode)
                          ? 'text-gray-400'
                          : 'text-gray-700'
                      }`}
                  >
                    No preference
                  </Label>
                </div>
              </RadioGroup>

              {/* Mentor-only: Select specific mentees to continue with */}
              {role === 'mentor' && formData.mentorPreference === 'continue' && currentPartnerNames && currentPartnerNames.length > 0 && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Select which mentee(s) you'd like to continue with:
                  </Label>
                  <div className="space-y-2">
                    {currentPartnerNames.map((menteeName) => {
                      const isSelected = formData.continueMenteeNames?.includes(menteeName);
                      return (
                        <div
                          key={menteeName}
                          className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${isSelected && (isLocked && !tryEditMode) ? 'bg-white border border-[#6035F3]' : ''
                            }`}
                        >
                          <Checkbox
                            id={`mentee-${menteeName}`}
                            checked={isSelected}
                            onCheckedChange={() => handleMenteeToggle(menteeName)}
                            disabled={isLocked && !tryEditMode}
                          />
                          <Label
                            htmlFor={`mentee-${menteeName}`}
                            className={`text-sm cursor-pointer ${isSelected && (isLocked && !tryEditMode)
                                ? 'text-[#6035F3] font-semibold'
                                : (isLocked && !tryEditMode)
                                  ? 'text-gray-400'
                                  : 'text-gray-700'
                              }`}
                          >
                            {menteeName}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                  {(!isLocked || tryEditMode) && (
                    <p className="text-xs text-gray-500 italic">
                      Select at least one mentee. You can continue with all or only some of your current mentees.
                    </p>
                  )}
                </div>
              )}
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
            {isLocked ? 'Close' : 'Cancel'}
          </Button>
          {!isLocked && (
            <Button
              type="button"
              onClick={handleSave}
              className="bg-[#6035F3] hover:bg-[#4A28C4] text-white shadow-md"
            >
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}