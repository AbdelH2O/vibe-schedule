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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Mail, Loader2, CheckCircle } from 'lucide-react';

interface SignInDialogProps {
  trigger?: React.ReactNode;
}

export function SignInDialog({ trigger }: SignInDialogProps) {
  const { signInWithMagicLink, signInWithGoogle } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    const { error: signInError } = await signInWithGoogle();
    // Note: If successful, user will be redirected to Google
    // so we don't need to handle success state here
    if (signInError) {
      setIsGoogleLoading(false);
      setError(signInError.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await signInWithMagicLink(email);

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message);
    } else {
      setSuccess(true);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when dialog closes
      setEmail('');
      setError(null);
      setSuccess(false);
      setIsGoogleLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign in to sync your data</DialogTitle>
          <DialogDescription>
            Sign in with Google or receive a magic link via email.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Check your email</h3>
            <p className="text-muted-foreground">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Click the link in the email to sign in. The link expires in 1 hour.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Magic Link Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !email}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending link...
                </>
              ) : (
                'Send magic link'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By signing in, your data will sync across all your devices.
            </p>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
