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
    mentorPreference: currentRegistration?.mentorPreference || 'no-preference', // Will be overridden on save
    continueMenteeNames: currentRegistration?.continueMenteeNames || [], // Will be overridden on save
  });

  // New state for individual partner preferences (always used now)
  const [individualPartnerPreferences, setIndividualPartnerPreferences] = useState<
    { name: string; preference: 'continue' | 'different' | 'no-preference'; type: 'current' | 'future' }[]
  >([]);

  // Reset form and initialize individual partner preferences when dialog opens or registration changes
  useEffect(() => {
    if (isOpen) {
      setTryEditMode(false); // Reset try edit mode
      setFormData({
        industry: currentRegistration?.industry || '',
        skillsets: currentRegistration?.skillsets || [],
        menteeCapacity: currentRegistration?.menteeCapacity,
        goal: currentRegistration?.goal || '',
        mentorPreference: 'no-preference', // Placeholder, actual value derived on save
        continueMenteeNames: [], // Placeholder, actual value derived on save
      });

      let partnersForTable: { name: string; type: 'current' }[] = [];
      let placeholderPartner: { name: string; type: 'future' } | undefined;

      // Determine partners for the table
      if (currentPartnerNames && currentPartnerNames.length > 0) {
        partnersForTable = currentPartnerNames.map(name => ({ name, type: 'current' }));
      } else {
        // No current partners, create a placeholder for global preference
        if (role === 'mentee') {
          placeholderPartner = { name: '我下一轮的导师偏好', type: 'future' };
        } else { // role === 'mentor' with no current mentees
          placeholderPartner = { name: '我下一轮的学员偏好', type: 'future' };
        }
      }

      const initialIndividualPrefs = (partnersForTable.length > 0 ? partnersForTable : (placeholderPartner ? [placeholderPartner] : []))
        .map(p => {
          let preference: 'continue' | 'different' | 'no-preference' = 'no-preference';

          // Initialize preference based on currentRegistration, respecting 'future' type
          if (p.type === 'current' && currentRegistration?.mentorPreference === 'continue') {
            if (role === 'mentor' && currentRegistration.continueMenteeNames?.includes(p.name)) {
              preference = 'continue';
            } else if (role === 'mentee' && currentPartnerNames?.includes(p.name)) {
              // For a mentee, if global preference was continue, and this is their current mentor
              preference = 'continue';
            } else {
              preference = 'different'; // Global continue, but this specific current partner wasn't explicitly chosen
            }
          } else if (currentRegistration?.mentorPreference === 'different') {
            preference = 'different';
          } else if (currentRegistration?.mentorPreference === 'no-preference') {
            preference = 'no-preference';
          }

          // '继续合作'选项在逻辑上不适用于'future'类型的占位符
          if (p.type === 'future' && preference === 'continue') {
            preference = 'no-preference'; // Default to no-preference if continue was somehow set
          }

          return { ...p, preference };
        });

      setIndividualPartnerPreferences(initialIndividualPrefs);
    }
  }, [isOpen, currentRegistration, role, currentPartnerNames]);

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

  const handlePartnerPreferenceChange = (
    partnerName: string,
    preference: 'continue' | 'different' | 'no-preference'
  ) => {
    if (isLocked && !tryEditMode) return;

    setIndividualPartnerPreferences((prev) =>
      prev.map((p) => (p.name === partnerName ? { ...p, preference } : p))
    );
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

    let finalMentorPreference: 'continue' | 'different' | 'no-preference' = 'no-preference';
    let finalContinueMenteeNames: string[] = [];

    const hasCurrentPartnersInTable = individualPartnerPreferences.some(p => p.type === 'current');

    if (hasCurrentPartnersInTable) {
      // Logic for existing partners (mentor or mentee with current mentor)
      const selectedToContinue = individualPartnerPreferences.filter(
        (p) => p.type === 'current' && p.preference === 'continue'
      );

      if (selectedToContinue.length > 0) {
        finalMentorPreference = 'continue';
        finalContinueMenteeNames = selectedToContinue.map((p) => p.name);
      } else {
        const allDifferent = individualPartnerPreferences.every(
          (p) => p.type === 'current' && p.preference === 'different'
        );
        if (allDifferent) {
          finalMentorPreference = 'different';
        } else {
          finalMentorPreference = 'no-preference';
        }
      }

      // Specific validation for 'continue' preference for mentors:
      if (role === 'mentor' && finalMentorPreference === 'continue' && finalContinueMenteeNames.length === 0) {
        toast.error('请选择至少一位学员以继续合作，或选择其他偏好');
        return;
      }
    } else {
      // Logic for no current partners (using the placeholder row)
      // There should be exactly one entry of type 'future'
      const placeholderPref = individualPartnerPreferences[0]?.preference;
      if (placeholderPref) {
        // 'continue' is not a valid global preference without existing partners,
        // if it was somehow selected (though disabled), treat it as 'no-preference'
        finalMentorPreference = placeholderPref === 'continue' ? 'no-preference' : placeholderPref;
      } else {
        finalMentorPreference = 'no-preference'; // Fallback
      }
      finalContinueMenteeNames = []; // No specific mentees to continue with
    }

    onSave({
      ...formData,
      mentorPreference: finalMentorPreference,
      continueMenteeNames: finalContinueMenteeNames,
    });
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

            {/* Mentor/Mentee Preference for Next Round - Always table-based */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                {/* 动态显示标题 */}
                {individualPartnerPreferences.some(p => p.type === 'current')
                  ? (role === 'mentee'
                    ? 'Do you want to continue working with your current mentor, or be matched with a different mentor?'
                    : 'What is your next-round preference regarding your current mentee?')
                  : (role === 'mentee'
                    ? 'What is your next-round mentor preference?'
                    : 'What is your next-round mentee preference?')}

              </Label>
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> This preference will only take effect if both you and your current {role === 'mentee' ? 'mentor' : 'mentee(s)'} register for the next round.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {/* 动态显示列名 */}
                        {individualPartnerPreferences.some(p => p.type === 'current')
                          ? (role === 'mentee' ? 'Mentor' : 'Mentee')
                          : '偏好类型' // For placeholder row
                        }
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Continue
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Different
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No Preference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {individualPartnerPreferences.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center italic">
                          无可用选项。请联系管理员。
                        </td>
                      </tr>
                    ) : (
                      individualPartnerPreferences.map((partner) => (
                        <tr key={partner.name}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {partner.name}
                          </td>
                          {/* Each row has its own RadioGroup */}
                          <RadioGroup
                            value={partner.preference}
                            onValueChange={(value: 'continue' | 'different' | 'no-preference') =>
                              handlePartnerPreferenceChange(partner.name, value)
                            }
                            disabled={isLocked && !tryEditMode}
                            className="flex w-full" // Use flex to align radio items horizontally within the table row
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              <RadioGroupItem
                                value="continue"
                                id={`continue-${partner.name}`}
                                disabled={isLocked && !tryEditMode || partner.type === 'future'} // Disable for 'future' type
                                className="mx-auto"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              <RadioGroupItem
                                value="different"
                                id={`different-${partner.name}`}
                                disabled={isLocked && !tryEditMode}
                                className="mx-auto"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              <RadioGroupItem
                                value="no-preference"
                                id={`no-preference-${partner.name}`}
                                disabled={isLocked && !tryEditMode}
                                className="mx-auto"
                              />
                            </td>
                          </RadioGroup>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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