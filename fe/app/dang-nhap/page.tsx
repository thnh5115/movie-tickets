'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { authApi } from '@/lib/mockApi/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Film } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  remember: z.boolean().default(false),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const user = await authApi.login(data.email, data.password, data.remember);
      setUser(user);
      toast({
        title: 'Đăng nhập thành công',
        description: `Chào mừng ${user.name}!`,
      });
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Đăng nhập thất bại',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const seedAccounts = authApi.getSeedAccounts();

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="text-center mb-8">
        <Film className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Đăng nhập</h1>
        <p className="text-muted-foreground mt-2">Đăng nhập để đặt vé và quản lý tài khoản</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin đăng nhập</CardTitle>
          <CardDescription>Nhập email và mật khẩu của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@demo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Ghi nhớ đăng nhập</FormLabel>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="mt-6 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Tài khoản Demo</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {seedAccounts.map((account) => (
            <div key={account.id} className="flex justify-between items-center">
              <span className="font-mono">{account.email}</span>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2">Mật khẩu: 123456</p>
        </CardContent>
      </Card>
    </div>
  );
}
