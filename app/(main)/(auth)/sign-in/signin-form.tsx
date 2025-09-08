"use client";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { signInSchema } from "@/validators/authValidators";
import { useForm } from "react-hook-form";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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

import { signIn, useSession } from "@/lib/auth-client"; // re-export from next-auth/react
import { FormError } from "../../../../components/FormError";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SignInValues = yup.InferType<typeof signInSchema>;

const SigninForm = () => {
  const [formError, setFormError] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  const form = useForm<SignInValues>({
    resolver: yupResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      // role field থাকলে schema থেকে বাদ দাও, না হলে default রাখলেও ব্যবহার করবো না
      // role: "",
    },
  });

  const onSubmit = async (values: SignInValues) => {
    try {
      setFormError("");

      // NextAuth style sign in
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false, // আমরা নিজে route করব
      });

      // res can be null (rare), or with { ok, error, status, url }
      if (res?.ok) {
        toast.success("Login Successful");
        // console.log(session); // মনে রাখো: এই মুহূর্তে session stale থাকতে পারে
        router.push("/Dashboard"); // নিশ্চিত হও path ছোট হাতের কিনা
        return;
      }

      // handled error
      const message =
        res?.error ||
        "Invalid credentials. Please check your email and password.";
      setFormError(message);
      toast.error(message);
    } catch (e: any) {
      const message = e?.message || "Something went wrong while signing in.";
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle className="text-2xl">Log In</CardTitle>
        <CardDescription>Enter your account details to login</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormFieldset>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        autoComplete="email"
                        {...field}
                      />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormFieldset>

            <FormError message={formError} />

            <Button variant="destructive" type="submit" className="mt-4 w-full">
              Sign In
            </Button>
          </form>
        </Form>

        <div className="mt-5 space-x-1 text-center text-sm">
          <Link
            href="/auth/forgot-password" // আগে sign-up ছিল; টেক্সট অনুযায়ী forgot-password রাখা হলো
            className="text-sm text-muted-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SigninForm;
