import React, {
  ChangeEvent,
  FocusEvent,
  forwardRef,
  InputHTMLAttributes,
  MouseEvent,
  Ref,
  useCallback,
  useMemo,
  useState,
} from "react";
import moment, { Moment } from "moment";
import { t } from "ttag";
import {
  getDateStyleFromSettings,
  getTimeStyleFromSettings,
  hasTimePart,
} from "metabase/lib/time";
import Input from "metabase/core/components/Input";

const DATE_FORMAT = "MM/DD/YYYY";
const TIME_FORMAT = "HH:mm";

export type DateInputAttributes = Omit<
  InputHTMLAttributes<HTMLDivElement>,
  "value" | "onChange"
>;

export interface DateInputProps extends DateInputAttributes {
  value?: Moment;
  inputRef?: Ref<HTMLInputElement>;
  hasTime?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  hasCalendar?: boolean;
  onChange?: (value?: Moment) => void;
  onCalendarClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const DateInput = forwardRef(function DateInput(
  {
    value,
    inputRef,
    placeholder,
    hasTime,
    error,
    fullWidth,
    hasCalendar,
    onFocus,
    onBlur,
    onChange,
    onCalendarClick,
    ...props
  }: DateInputProps,
  ref: Ref<HTMLDivElement>,
) {
  const [inputText, setInputText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const dateFormat = getDateStyleFromSettings() || DATE_FORMAT;
  const timeFormat = getTimeStyleFromSettings() || TIME_FORMAT;
  const dateTimeFormat = `${dateFormat}, ${timeFormat}`;

  const now = useMemo(() => {
    return moment();
  }, []);

  const nowText = useMemo(() => {
    return now.format(dateFormat);
  }, [now, dateFormat]);

  const valueText = useMemo(() => {
    if (!value) {
      return "";
    } else if (hasTime && hasTimePart(value)) {
      return value.format(dateTimeFormat);
    } else {
      return value.format(dateFormat);
    }
  }, [value, hasTime, dateFormat, dateTimeFormat]);

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      setInputText(valueText);
      onFocus?.(event);
    },
    [valueText, onFocus],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newText = event.target.value;
      setInputText(newText);

      const formats = hasTime ? [dateTimeFormat, dateFormat] : [dateFormat];
      const newValue = moment(newText, formats);

      if (newValue.isValid()) {
        onChange?.(newValue);
      } else {
        onChange?.(undefined);
      }
    },
    [hasTime, dateFormat, dateTimeFormat, onChange],
  );

  return (
    <Input
      {...props}
      ref={ref}
      value={isFocused ? inputText : valueText}
      placeholder={nowText}
      error={error}
      fullWidth={fullWidth}
      rightIcon={hasCalendar ? "calendar" : undefined}
      rightIconTooltip={t`Show calendar`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      onRightIconClick={onCalendarClick}
    />
  );
});

export default DateInput;
