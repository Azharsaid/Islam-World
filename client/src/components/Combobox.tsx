import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type ComboItem = {
  value: string;
  label: string;
};

export function Combobox({
  items,
  value,
  onChange,
  placeholder = "اختر…",
  searchPlaceholder = "ابحث…",
  disabled,
  className,
}: {
  items: ComboItem[];
  value?: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(() => items.find((i) => i.value === value), [items, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-card/60 backdrop-blur border-border/60 hover:border-accent/40 rounded-xl",
            className
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>لا توجد نتائج.</CommandEmpty>
          <CommandGroup className="max-h-72 overflow-auto">
            {items.map((item) => (
              <CommandItem
                key={item.value}
                value={item.label}
                onSelect={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <Check className={cn("mr-2 h-4 w-4", value === item.value ? "opacity-100" : "opacity-0")} />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
