import { Search } from "lucide-react";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchFilter({ value, onChange }: SearchFilterProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--coffee-brown)]" />
      <input
        type="text"
        placeholder="Search coffee shops..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-2 px-12 border border-[var(--coffee-light)] bg-white text-stone-700 focus:outline-none focus:border-[var(--coffee-brown)] transition-colors rounded-none text-sm placeholder:text-stone-400"
      />
    </div>
  );
}
