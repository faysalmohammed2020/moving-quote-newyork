"use client";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { signUpSchema } from "@/validators/authValidators";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, User, Mail, Lock } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormFieldset,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { FormError } from "../../../../components/FormError";
import { signIn } from "@/lib/auth-client";

type SignUpValues = yup.InferType<typeof signUpSchema>;

const SignupForm = () => {
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignUpValues>({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignUpValues) => {
    try {
      setIsLoading(true);
      setFormError("");

      // 1) Create user via your custom API
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error || "Registration failed";
        throw new Error(msg);
      }

      // 2) Auto-login with NextAuth credentials provider
      const signin = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (!signin?.ok) {
        const msg = signin?.error || "Sign in after registration failed";
        throw new Error(msg);
      }

      toast.success("Account Created", {
        description: "Your account has been successfully created!",
      });
      router.push("/admin/dashboard");
    } catch (err: any) {
      const message = err?.message || "Something went wrong";
      setFormError(message);
      toast.error("Registration Failed", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-1">
          <CardHeader className="bg-white pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Create Account
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign up to get started with our platform
            </CardDescription>
          </CardHeader>
        </div>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormFieldset>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Full Name
                      </FormLabel>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            autoComplete="name"
                            className="pl-10 pr-4 py-2 h-11"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Email Address
                      </FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email address"
                            autoComplete="email"
                            className="pl-10 pr-4 py-2 h-11"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Password
                      </FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            autoComplete="new-password"
                            className="pl-10 pr-12 py-2 h-11"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormFieldset>

              <FormError message={formError} />

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Already registered?
            </p>
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="w-full h-11 border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50 py-4 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500 w-full">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignupForm;