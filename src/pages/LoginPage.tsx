// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { login, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  React.useEffect(() => {
    if (user && user.role !== 'guest') { // Assuming 'guest' is the logged-out/default unauth state
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsSubmittingForm(true);
    const success = await login(data); // login now expects {email, password}
    setIsSubmittingForm(false);
    if (success) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
      toast.success("Login Successful", { description: `Welcome back, ${data.email}!`});
    } else {
      // Error toast should be handled by useAuth or apiService interceptor if it's an API error.
      // If login function itself returns false for other reasons (e.g. client-side check), handle here.
      // toast.error("Login Failed", { description: "Please check your credentials or try again later."});
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 logistics-gradient rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-3xl">LP</span>
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">LogiPilot Login</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
                autoComplete="email"
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
                autoComplete="current-password"
              />
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full text-lg py-3" disabled={isSubmittingForm || authLoading}>
              {(isSubmittingForm || authLoading) ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} LogiPilot. For authorized personnel only.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
