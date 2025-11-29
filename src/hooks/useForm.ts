"use client";

import { useState, useCallback } from "react";

export interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setServerError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (validate) {
        const errs = validate(values);
        if (Object.keys(errs).length > 0) {
          setErrors(errs);
          return;
        }
      }
      setLoading(true);
      setServerError(null);
      setSuccess(false);
      try {
        await onSubmit(values);
        setSuccess(true);
      } catch (err: any) {
        setServerError(err?.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [values, validate, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setServerError(null);
    setSuccess(false);
  }, [initialValues]);

  return { values, errors, loading, serverError, success, setValue, handleSubmit, reset };
}
