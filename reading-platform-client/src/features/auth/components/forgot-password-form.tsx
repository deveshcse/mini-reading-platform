"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/features/auth/hooks/use-auth"
import Link from "next/link"
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, ForgotPasswordInput } from "@/features/auth/schema/auth-schema"
import { ChevronLeft, MailCheck, Mail } from "lucide-react"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { forgotPassword, isForgetting, isForgotSuccess } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPassword(data);
  };

  if (isForgotSuccess) {
    return (
      <Card className={cn("w-full max-w-md mx-auto rounded-none border-2 shadow-none", className)}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-primary/10 text-primary border-2 border-primary/20">
            <MailCheck className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Check your email</CardTitle>
          <CardDescription>
            If an account exists for that email, we have sent a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            The link will expire in 1 hour. Please check your spam folder if you don't see it.
          </p>
          <Button asChild variant="outline" className="mt-2 rounded-none h-11 border-2 font-bold transition-all hover:bg-accent hover:translate-y-[-1px]">
            <Link href="/login">
              <ChevronLeft className="mr-2 size-4" />
              Back to Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-md mx-auto rounded-none border-2 shadow-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    className="rounded-none pl-10 focus-visible:ring-0 focus-visible:border-primary transition-colors"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                </div>
                <FieldError>{errors.email?.message}</FieldError>
              </Field>
              <Field className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isForgetting} 
                  className="w-full rounded-none h-11 font-bold transition-all hover:bg-primary/90 hover:translate-y-[-1px] active:translate-y-[0px]"
                >
                  {isForgetting ? "Sending link..." : "Send Reset Link"}
                </Button>
                <div className="text-center pt-4">
                  <Link 
                    href="/login" 
                    className="text-sm font-bold text-primary hover:underline underline-offset-4 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="mr-1 size-4" />
                    Back to login
                  </Link>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
