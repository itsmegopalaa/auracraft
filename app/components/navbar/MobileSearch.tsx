"use client";

import SearchBox from "../search/SearchBox";

type Props = {
  onOpen?: () => void;
};

export default function MobileSearch({ onOpen }: Props) {
  return <SearchBox mobile onOpen={onOpen} />;
}
