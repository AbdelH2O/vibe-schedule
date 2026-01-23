'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LogOut, Loader2 } from 'lucide-react';

interface SignOutDialogProps {
  trigger?: React.ReactNode;
}

type DataChoice = 'keep' | 'clear';

export function SignOutDialog({ trigger }: SignOutDialogProps) {
  const { signOut, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataChoice, setDataChoice] = useState<DataChoice>('keep');

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut(dataChoice === 'clear');
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign out</DialogTitle>
          <DialogDescription>
            {user?.email && (
              <span className="block mb-2">
                Signed in as <strong>{user.email}</strong>
              </span>
            )}
            Choose what happens to your local data when you sign out.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={dataChoice}
          onValueChange={(value) => setDataChoice(value as DataChoice)}
          className="space-y-3 pt-4"
        >
          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="keep" id="keep" className="mt-0.5" />
            <div className="space-y-1">
              <Label htmlFor="keep" className="font-medium cursor-pointer">
                Keep local data
              </Label>
              <p className="text-sm text-muted-foreground">
                Your data stays on this device. You can continue using the app offline.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="clear" id="clear" className="mt-0.5" />
            <div className="space-y-1">
              <Label htmlFor="clear" className="font-medium cursor-pointer">
                Clear local data
              </Label>
              <p className="text-sm text-muted-foreground">
                Remove all data from this device. Your data remains safe in the cloud.
              </p>
            </div>
          </div>
        </RadioGroup>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={dataChoice === 'clear' ? 'destructive' : 'default'}
            onClick={handleSignOut}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
