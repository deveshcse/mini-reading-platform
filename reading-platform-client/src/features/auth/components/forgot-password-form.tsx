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
import { ChevronLeft, MailCheck } from "lucide-react"

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
      <Card className={cn("w-full max-w-md mx-auto", className)}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="size-6" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            If an account exists for that email, we have sent a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            The link will expire in 1 hour. Please check your spam folder if you don't see it.
          </p>
          <Button asChild variant="outline" className="mt-2">
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
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />

                {/* use field error component */}
                <FieldError>{errors.email?.message}</FieldError>
              </Field>
              <Field>
                <Button type="submit" disabled={isForgetting} className="w-full">
                  {isForgetting ? "Sending link..." : "Send Reset Link"}
                </Button>
                <div className="text-center">
                  <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center">
                    <ChevronLeft className="mr-1 size-3" />
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
