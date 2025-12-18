import { useState, useEffect, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { FileText, AlertCircle, Edit3, UserCheck, UserX, ChevronDown, X, Check, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { MentorshipRegistration } from '../types/dashboard';

// --- Types & Constants ---

interface MentorshipRegistrationDialogProps {
  role: 'mentor' | 'mentee';
  currentRegistration?: MentorshipRegistration;
  isLocked: boolean;
  onSave: (registration: MentorshipRegistration) => void;
  currentPartnerNames?: string[];
}

const INDUSTRIES = [
  'SWE', 'UI / UX', 'Data Science', 'Product Management',
];

const SKILLSETS = [
  'Resume/LinkedIn Profile', 'Career Path Guidance', 'Experience Sharing',
  'Industry Trends', 'Technical Skills Development', 'Soft Skills Enhancement',
  'Networking', 'Project Management', 'Leadership', 'Communication Skills',
];

const MENTEE_CAPACITIES = [
  { value: 1, label: '1 mentee – around 3 hours' },
  { value: 2, label: '2 mentees – around 6 hours' },
  { value: 3, label: '3 mentees – around 9 hours' },
];

const MOCK_PAST_PARTNERS_POOL = ['Alex Johnson', 'Sarah Lee', 'Michael Chen', 'Emily Davis', 'David Wilson'];

// --- Helper Component: MultiSelect Dropdown ---

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  max?: number;
  disabled?: boolean;
  label?: string;
}

function MultiSelect({ options, selected, onChange, placeholder, max, disabled, label }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      if (max && selected.length >= max) {
        toast.error(`You can only select up to ${max} ${label || 'options'}.`);
        return;
      }
      onChange([...selected, option]);
    }
  };

  const handleRemove = (e: React.MouseEvent, option: string) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selected.filter((item) => item !== option));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Area */}
      <div
        className={`min-h-[42px] w-full border rounded-md px-3 py-2 flex items-center justify-between cursor-pointer bg-white transition-all ${
          disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'hover:border-gray-400'
        } ${isOpen ? 'ring-2 ring-[#6035F3] border-transparent' : 'border-gray-300'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1.5 w-full pr-2">
          {selected.length === 0 && (
            <span className="text-gray-500 text-sm">{placeholder || 'Select...'}</span>
          )}
          {selected.map((item) => (
            <Badge key={item} variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200 gap-1 pr-1 font-normal">
              {item}
              <div
                role="button"
                className="rounded-full p-0.5 hover:bg-gray-300 text-gray-500 transition-colors"
                onClick={(e) => handleRemove(e, item)}
              >
                <X className="h-3 w-3" />
              </div>
            </Badge>
          ))}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''} flex-shrink-0`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg animate-in fade-in zoom-in-95 duration-100">
          <ScrollArea className="max-h-[200px] p-1">
            {options.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center italic">No options available</div>
            ) : (
              options.map((option) => {
                const isSelected = selected.includes(option);
                // Disable item if max reached and not selected
                const itemDisabled = max ? (!isSelected && selected.length >= max) : false;

                return (
                  <div
                    key={option}
                    onClick={() => !itemDisabled && handleSelect(option)}
                    className={`flex items-center justify-between px-3 py-2 rounded-sm text-sm cursor-pointer transition-colors ${
                      itemDisabled 
                        ? 'opacity-50 cursor-not-allowed text-gray-400' 
                        : isSelected 
                          ? 'bg-purple-50 text-[#6035F3] font-medium' 
                          : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected && <Check className="h-4 w-4 text-[#6035F3]" />}
                  </div>
                );
              })
            )}
          </ScrollArea>
          {max && (
            <div className="p-2 bg-gray-50 text-xs text-gray-500 border-t border-gray-100 text-center">
              Selected: {selected.length} / {max}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Main Component ---

export function MentorshipRegistrationDialog({
  role,
  currentRegistration,
  isLocked,
  onSave,
  currentPartnerNames,
}: MentorshipRegistrationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tryEditMode, setTryEditMode] = useState(false);
  
  const [formData, setFormData] = useState<MentorshipRegistration>({
    industry: currentRegistration?.industry || '',
    skillsets: currentRegistration?.skillsets || [],
    menteeCapacity: currentRegistration?.menteeCapacity,
    goal: currentRegistration?.goal || '',
    mentorPreference: currentRegistration?.mentorPreference || 'no-preference',
    continueMenteeNames: currentRegistration?.continueMenteeNames || [],
  });

  // Calculate all past partners
  const allPastPartners = useMemo(() => {
    const current = currentPartnerNames || [];
    return Array.from(new Set([...current, ...MOCK_PAST_PARTNERS_POOL]));
  }, [currentPartnerNames]);

  // Preference Lists
  const [selectedContinue, setSelectedContinue] = useState<string[]>([]);
  const [selectedAvoid, setSelectedAvoid] = useState<string[]>([]);

  // Init Form
  useEffect(() => {
    if (isOpen) {
      setTryEditMode(false);
      setFormData({
        industry: currentRegistration?.industry || '',
        skillsets: currentRegistration?.skillsets || [],
        menteeCapacity: currentRegistration?.menteeCapacity,
        goal: currentRegistration?.goal || '',
        mentorPreference: 'no-preference',
        continueMenteeNames: [],
      });

      if (currentRegistration?.continueMenteeNames) {
        setSelectedContinue(currentRegistration.continueMenteeNames);
      } else {
        setSelectedContinue([]);
      }
      setSelectedAvoid([]);
    }
  }, [isOpen, currentRegistration]);

  // Max capacity logic
  const maxContinueCapacity = role === 'mentee' 
    ? 1 
    : (formData.menteeCapacity || 1);

  // Auto-trim selection if capacity reduces (Mentor only)
  useEffect(() => {
    if (role === 'mentor' && formData.menteeCapacity) {
      if (selectedContinue.length > formData.menteeCapacity) {
        setSelectedContinue(prev => prev.slice(0, formData.menteeCapacity));
        toast.info(`Selection adjusted to match capacity of ${formData.menteeCapacity}`);
      }
    }
  }, [formData.menteeCapacity, role, selectedContinue.length]);

  const handleSave = () => {
    // Basic Validation
    if (!formData.industry) {
      toast.error(role === 'mentee' ? 'Please select your industry' : 'Please select your current industry');
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
      toast.error('Please select mentee capacity');
      return;
    }
    if (formData.goal && formData.goal.length > 200) {
      toast.error('Goal too long (max 200 chars)');
      return;
    }

    // Logic for Preferences
    let finalMentorPreference: 'continue' | 'different' | 'no-preference' = 'no-preference';
    if (selectedContinue.length > 0) {
      finalMentorPreference = 'continue';
    } else if (selectedAvoid.length > 0 && selectedAvoid.length === allPastPartners.length) {
      finalMentorPreference = 'different';
    } else {
      finalMentorPreference = 'no-preference';
    }

    onSave({
      ...formData,
      mentorPreference: finalMentorPreference,
      continueMenteeNames: selectedContinue,
    });
    setIsOpen(false);
    toast.success(isLocked ? 'Information saved' : 'Registration updated');
  };

  const industryLabel = role === 'mentee' ? 'Industry of Interest' : 'Current Industry';
  const targetPartnerLabel = role === 'mentee' ? 'mentor' : 'mentee'; // 动态 Label
  const targetPartnerLabelTitle = role === 'mentee' ? 'Mentor' : 'Mentee'; // 动态 Label
  const isFormDisabled = isLocked && !tryEditMode;

  // Filter lists to prevent selecting the same person in both
  const availableForContinue = allPastPartners.filter(p => !selectedAvoid.includes(p));
  const availableForAvoid = allPastPartners.filter(p => !selectedContinue.includes(p));

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
                Locked
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isLocked ? 'Information cannot be modified currently.' : 'Fill in your Mentorship details.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6 py-4">
            
            {/* Locked Notice & Try Edit Mode */}
            {isLocked && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Information Locked</p>
                    <p>Modifications are disabled during the active round.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Edit3 className="h-5 w-5 text-[#6035F3]" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Try Edit Mode</p>
                      <p className="text-xs text-gray-600">Preview form interactions</p>
                    </div>
                  </div>
                  <Switch checked={tryEditMode} onCheckedChange={setTryEditMode} className="data-[state=checked]:bg-[#6035F3]" />
                </div>
              </div>
            )}

            {/* Industry */}
            {role === 'mentee' && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">{industryLabel} <span className="text-red-500">*</span></Label>
                <RadioGroup
                  value={formData.industry}
                  onValueChange={(value) => !isFormDisabled && setFormData({ ...formData, industry: value })}
                  disabled={isFormDisabled}
                  className="space-y-2"
                >
                  {INDUSTRIES.map((industry) => (
                    <div key={industry} className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${formData.industry === industry && isFormDisabled ? 'bg-purple-50 border border-purple-200' : ''}`}>
                      <RadioGroupItem value={industry} id={`ind-${industry}`} disabled={isFormDisabled} />
                      <Label htmlFor={`ind-${industry}`} className="text-sm cursor-pointer text-gray-700">{industry}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Skillsets */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Key skillsets (max 3) <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SKILLSETS.map((skillset) => {
                  const isSelected = formData.skillsets.includes(skillset);
                  const handleToggle = () => {
                     if (isFormDisabled) return;
                     if (isSelected) setFormData({ ...formData, skillsets: formData.skillsets.filter(s => s !== skillset) });
                     else {
                       if (formData.skillsets.length >= 3) { toast.error('Max 3 skillsets'); return; }
                       setFormData({ ...formData, skillsets: [...formData.skillsets, skillset] });
                     }
                  };
                  return (
                    <div key={skillset} className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${isSelected ? 'border-purple-200 bg-purple-50' : 'border-transparent hover:bg-gray-50'}`}>
                      <Checkbox id={`skill-${skillset}`} checked={isSelected} onCheckedChange={handleToggle} disabled={isFormDisabled} />
                      <Label htmlFor={`skill-${skillset}`} className="text-sm cursor-pointer text-gray-700">{skillset}</Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Capacity */}
            {role === 'mentor' && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Max Mentees <span className="text-red-500">*</span></Label>
                <RadioGroup
                  value={formData.menteeCapacity?.toString()}
                  onValueChange={(value) => !isFormDisabled && setFormData({ ...formData, menteeCapacity: parseInt(value) })}
                  disabled={isFormDisabled}
                  className="space-y-2"
                >
                  {MENTEE_CAPACITIES.map((opt) => (
                    <div key={opt.value} className={`flex items-center space-x-2 p-2 rounded-lg ${formData.menteeCapacity === opt.value && isFormDisabled ? 'bg-purple-50 border border-purple-200' : ''}`}>
                      <RadioGroupItem value={opt.value.toString()} id={`cap-${opt.value}`} disabled={isFormDisabled} />
                      <Label htmlFor={`cap-${opt.value}`} className="text-sm cursor-pointer text-gray-700">{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Goal */}
            <div className="space-y-3">
              <Label htmlFor="goal" className="text-sm font-semibold text-gray-700">Goal (Optional)</Label>
              <Textarea
                id="goal"
                placeholder="Briefly describe your goals..."
                value={formData.goal}
                onChange={(e) => !isFormDisabled && setFormData({ ...formData, goal: e.target.value })}
                disabled={isFormDisabled}
                className="min-h-[80px] resize-none"
                maxLength={200}
              />
            </div>

            {/* PARTNER PREFERENCES */}
            <div className="space-y-6 pt-4">
              <h3 className="text-base font-semibold text-gray-900">{targetPartnerLabelTitle} Preferences</h3>
              
              {/* NEW: No Preference Hint - Dynamic Role */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-100">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Leaving these fields empty indicates you have <strong>no preference</strong> and are open to matching with any suitable {targetPartnerLabel}.
                </p>
              </div>

              {/* Question A: Continue */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span>Who do you <span className="text-green-700 font-bold">WANT</span> to continue with?</span>
                  </div>
                  <span className="text-xs font-normal text-gray-500">
                    Max: {maxContinueCapacity}
                  </span>
                </Label>
                
                <MultiSelect 
                  options={availableForContinue}
                  selected={selectedContinue}
                  onChange={setSelectedContinue}
                  placeholder="Select partners..."
                  max={maxContinueCapacity}
                  disabled={isFormDisabled}
                  label="partners"
                />
                
                <p className="text-xs text-gray-500">
                  {role === 'mentee' 
                    ? 'Note: You can only match with 1 mentor.' 
                    : `Note: Limited to ${maxContinueCapacity} based on your capacity.`}
                </p>
              </div>

              {/* Question B: Avoid */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserX className="h-4 w-4 text-red-600" />
                  <span>Who do you <span className="text-red-600 font-bold">NOT</span> want to continue with?</span>
                </Label>
                
                <MultiSelect 
                  options={availableForAvoid}
                  selected={selectedAvoid}
                  onChange={setSelectedAvoid}
                  placeholder="Select partners to avoid..."
                  disabled={isFormDisabled}
                  label="partners"
                />
                
                <p className="text-xs text-gray-500">
                  Select partners you prefer not to match with. No limit.
                </p>
              </div>
            </div>

          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-gray-300">
            {isLocked ? 'Close' : 'Cancel'}
          </Button>
          {!isLocked && (
            <Button type="button" onClick={handleSave} className="bg-[#6035F3] hover:bg-[#4A28C4] text-white">
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}