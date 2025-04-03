import Signin from "@/components/Auth/Signin";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <>
      <Breadcrumb pageName="Sign In" />

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex flex-wrap items-center justify-center">
          <div className="w-full max-w-[600px]">
            <div className="w-full p-4 sm:p-12.5">
              <Signin />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}