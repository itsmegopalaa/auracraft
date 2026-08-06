"use client";

import SearchBox from "../search/SearchBox";

export default function MobileSearch() {
  return (
    <div className="md:hidden">
      <SearchBox />
    </div>
  );
}