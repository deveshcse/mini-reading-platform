"use client"

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
import React, { useState } from "react"
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, RegisterInput } from "@/features/auth/schema/auth-schema"
import { cn } from "@/lib/utils"

export function SignupForm({ className, ...props }: React.ComponentProps<typeof Card>) {
  const { register: registerAction, isRegistering } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "READER"
    }
  });

  const onSubmit = (data: RegisterInput) => {
    registerAction(data);
  };

  const handleSignupAs = (role: "READER" | "AUTHOR") => {
    setValue("role", role);
  };

  return (
    <Card className={cn("rounded-none border-2 shadow-none", className)} {...props}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
        <CardDescription>
          Join our platform and start your reading journey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="firstName">First Name</FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  placeholder="Jane"
                  className="rounded-none pl-10 focus-visible:ring-0 focus-visible:border-primary transition-colors"
                  {...register("firstName")}
                  aria-invalid={!!errors.firstName}
                />
              </div>
              <FieldError>{errors.firstName?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
              <Input
                id="lastName"
                placeholder="Doe"
                className="rounded-none focus-visible:ring-0 focus-visible:border-primary transition-colors"
                {...register("lastName")}
                aria-invalid={!!errors.lastName}
              />
              <FieldError>{errors.lastName?.message}</FieldError>
            </Field>
          </FieldGroup>

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

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
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
                aria-label={showPassword ? "Hide password" : "Show password"}
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
                type={showConfirmPassword ? "text" : "password"}
                className="rounded-none pl-10 pr-10 focus-visible:ring-0 focus-visible:border-primary transition-colors"
                {...register("confirm-password")}
                aria-invalid={!!errors["confirm-password"]}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <FieldError>{errors["confirm-password"]?.message}</FieldError>
          </Field>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
            <Button
              type="submit"
              size="sm"
              disabled={isRegistering}
              onClick={() => handleSignupAs("READER")}
              className="w-full font-medium sm:flex-1"
            >
              {isRegistering ? "Please wait…" : "Sign up as reader"}
            </Button>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isRegistering}
              onClick={() => handleSignupAs("AUTHOR")}
              className="w-full font-medium sm:flex-1"
            >
              {isRegistering ? "Please wait…" : "Sign up as author"}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-primary hover:underline underline-offset-4 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
