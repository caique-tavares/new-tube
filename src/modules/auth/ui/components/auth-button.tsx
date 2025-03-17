"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { UserCircleIcon } from "lucide-react";
import {
  UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

export const AuthButton = () => {
  return (
    <>
    <SignedIn>
      <UserButton/>
    </SignedIn>
    
      <SignedOut>
        <SignInButton mode="modal">
          <Button
            variant="outline"
            className="px-4 py-2 font-medium bg-white text-blue-600 hover:hover:text-blue-500 border-blue-500/20 rounded-full shadow-none [&_svg]:size-4"
          >
            <UserCircleIcon className="size-5" />
            Sign In
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
};
