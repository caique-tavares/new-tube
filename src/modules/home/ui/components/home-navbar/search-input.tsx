"use client";

import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export const SearchInput = () => {
  const [value, setValue] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = new URL(
      "/search",
      process.env.VERCEL_URL ? process.env.VERCEL_URL : "http://localhost:3000"
    );
    const newQuery = value.trim();

    url.searchParams.set("query", encodeURIComponent(newQuery));

    if (newQuery === "") {
      url.searchParams.delete("query");
    }

    setValue(newQuery);
    router.push(url.toString());
  };

  return (
    <form className="flex w-full max-w-[600px]" onSubmit={handleSearch}>
      <div className="relative w-full">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="text"
          placeholder="Search"
          className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500"
        />
        {value && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setValue("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
          >
            <XIcon className="text-gray-500" />
          </Button>
        )}
      </div>
      <button
        disabled={!value.trim()}
        type="submit"
        className="px-5 py-2.5 bg-gray-100 border border-l-0 rounded-r-full hover:bg-gray-200 disable:opacity-50 disabled:cursor"
      >
        <SearchIcon className="size-5" />
      </button>
    </form>
  );
};
