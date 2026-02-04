import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { PartnerDetails } from "../types/dashboard";
import { User, Mail, Sparkles } from "lucide-react";

interface MatchingResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partners: PartnerDetails[];
  userRole: 'mentor' | 'mentee';
}

export function MatchingResultModal({ open, onOpenChange, partners, userRole }: MatchingResultModalProps) {
  const isMentor = userRole === 'mentor';
  const partnerLabel = isMentor ? "Mentees" : "Mentor";
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Matching Results</DialogTitle>
          <DialogDescription>
            Here are your matched {partnerLabel.toLowerCase()} details for this round.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {partners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No matching results available yet.
            </div>
          ) : (
            partners.map((partner, index) => (
              <div key={index} className="flex flex-col gap-3 p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{partner.name}</h4>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{partner.email}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {isMentor ? "Mentee" : "Mentor"}
                  </Badge>
                </div>
                
                <div className="mt-2 bg-muted/50 p-3 rounded-md text-sm">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">Why you matched: </span>
                      <span className="text-muted-foreground">{partner.matchReason}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
