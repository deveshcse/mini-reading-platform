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
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema, ResetPasswordInput } from "@/features/auth/schema/auth-schema"
import { Eye, EyeOff, LockKeyhole, Lock } from "lucide-react"
import { useSearchParams } from "next/navigation"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  
  const { resetPassword, isResetting } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    resetPassword(data);
  };

  if (!token) {
    return (
      <Card className={cn("w-full max-w-md mx-auto rounded-none border-2 shadow-none", className)}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-destructive">Invalid Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired. Please request a new one.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-md mx-auto rounded-none border-2 shadow-none">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-primary/10 text-primary border-2 border-primary/20">
            <LockKeyhole className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Set a new, secure password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="space-y-4">
              <input type="hidden" {...register("token")} />
              
              <Field>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="rounded-none pl-10 pr-10 focus-visible:ring-0 focus-visible:border-primary transition-colors"
                    {...register("password")}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <FieldError>{errors.password?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                   <Input
                    id="confirm-password"
                    type="password"
                    className="rounded-none pl-10 focus-visible:ring-0 focus-visible:border-primary transition-colors"
                    {...register("confirm-password")}
                    aria-invalid={!!errors["confirm-password"]}
                  />
                </div>
                <FieldError>{errors["confirm-password"]?.message}</FieldError>
              </Field>

              <Field className="pt-2">
                <Button type="submit" size="sm" disabled={isResetting} className="w-full rounded-md font-medium">
                  {isResetting ? "Updating..." : "Reset password"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
