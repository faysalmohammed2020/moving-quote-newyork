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
import { signIn, useSession } from "@/lib/auth-client";
import { FormError } from "../../../../components/FormError";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from 'next/link';


const SigninForm = () => {
  const [formError, setFormError] = useState("");
  const router = useRouter();
  const session = useSession();

  const form = useForm<yup.InferType<typeof signInSchema>>({
    resolver: yupResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "",
    },
  });

  const onSubmit = async (values: yup.InferType<typeof signInSchema>) => {
    await signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onRequest: () => {
          setFormError("");
        },
        onSuccess: () => {
          console.log(session.data);
          toast.success("Login Successful");
          router.push("/Dashboard");
        },
        onError: (ctx) => {
          setFormError(ctx.error.message);
        },
      }
    );
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
            href="/auth/sign-up"
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
