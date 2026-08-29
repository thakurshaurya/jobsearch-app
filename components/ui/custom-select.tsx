"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string;
    triggerClassName?: string;
    optionsClassName?: string;
    hideChevron?: boolean;
}

export function CustomSelect({
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    icon,
    className,
    triggerClassName,
    optionsClassName,
    hideChevron = false,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    triggerClassName || "flex h-14 w-full items-center justify-between rounded-xl border border-slate-300/80 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-slate-800 text-left cursor-pointer",
                    disabled && "cursor-not-allowed bg-slate-100 dark:disabled:bg-slate-900/40 opacity-70"
                )}
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className="flex items-center gap-1.5 opacity-80 shrink-0">
                    {icon}
                    {!hideChevron && (
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isOpen && "rotate-180"
                            )}
                        />
                    )}
                </span>
            </button>

            {isOpen && !disabled && (
                <div className={cn("absolute left-0 z-[100] mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg outline-none dark:border-slate-800 dark:bg-slate-950 min-w-[120px]", optionsClassName)}>
                    {placeholder && placeholder !== "Select target role" && placeholder !== "Select target country" && placeholder !== "Select target role..." && placeholder !== "Select target country..." && (
                        <button
                            type="button"
                            onClick={() => handleSelect("")}
                            className={cn(
                                "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-medium outline-none select-none hover:bg-slate-100 dark:hover:bg-slate-900 text-left text-slate-500 dark:text-slate-400",
                                value === "" && "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10"
                            )}
                        >
                            <span>{placeholder}</span>
                            {value === "" && <Check className="h-4 w-4" />}
                        </button>
                    )}
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={cn(
                                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-medium outline-none select-none hover:bg-slate-100 dark:hover:bg-slate-900 text-left text-slate-700 dark:text-slate-200",
                                    isSelected && "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10"
                                )}
                            >
                                <span>{option.label}</span>
                                {isSelected && <Check className="h-4 w-4" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
