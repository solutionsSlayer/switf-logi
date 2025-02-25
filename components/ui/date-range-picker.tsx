'use client';

import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateRangePickerProps {
  from: Date | undefined;
  to: Date | undefined;
  onSelect: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export function DateRangePicker({ from, to, onSelect }: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[300px] justify-start text-left">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {from ? (
            to ? (
              <>
                {format(from, 'P', { locale: fr })} - {format(to, 'P', { locale: fr })}
              </>
            ) : (
              format(from, 'P', { locale: fr })
            )
          ) : (
            <span>Sélectionner une période</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={from}
          selected={{ from, to }}
          onSelect={onSelect}
          locale={fr}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
} 