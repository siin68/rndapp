'use client';

import { CalendarIcon } from 'lucide-react';

import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

import { format } from 'date-fns';
import { cn } from '../../lib/utils';

interface DatePickerProps {
  className?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: Date;
  onChange: (date: Date) => void;
}

export function DatePicker({
  label,
  className,
  placeholder,
  disabled,
  value,
  onChange,
}: DatePickerProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <Label htmlFor="date" className="px-1">
          {label}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn('w-full pl-3 text-left font-normal', value && 'text-muted-foreground')}
            disabled={disabled}
          >
            {value ? format(value, 'yyyy/MM/dd') : <span>{placeholder}</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={disabled}
            required
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
