"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileCheck, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitGoogleFormFromBrowser } from "@/lib/google-forms/submit-google-form-browser";
import { openGoogleFormPrefillPlaceholder } from "@/lib/google-forms/open-google-form-prefill";
import type { BuyerTypeSelectOption } from "@/lib/poder-notarial/buyer-type";
import {
  isCompanyTrustBuyerType,
  isMyselfAndSomeoneElseBuyerType,
} from "@/lib/poder-notarial/buyer-type";
import { PODER_NOTARIAL_FORM_LABELS } from "@/lib/poder-notarial/poder-notarial-form.labels";
import {
  ECONOMIC_REGIME_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  poderNotarialFormSchema,
  YES_NO_OPTIONS,
  type PoderNotarialFormValues,
} from "@/lib/poder-notarial/poder-notarial-form.schema";
import { cn } from "@/lib/utils";

interface PoderNotarialFormDialogProps {
  investmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EMPTY_DEFAULTS: PoderNotarialFormValues = {
  fullName: "",
  nif: "",
  email: "",
  phone: "",
  contactAddress: "",
  profession: "",
  taxlandNumber: "",
  maritalStatus: "Soltero/a",
  economicRegime: "Sociedad de gananciales",
  economicRegimeOther: "",
  buyerType: "",
  buyingAlone: undefined,
  ownershipPercentage: "",
};

function RequiredMark() {
  return <span className="text-[#B42318]"> *</span>;
}

interface ExistingNotaSimpleState {
  available: boolean;
  label: string;
  viewUrl: string | null;
  documentCount: number;
}

export function PoderNotarialFormDialog({
  investmentId,
  open,
  onOpenChange,
  onSuccess,
}: PoderNotarialFormDialogProps) {
  const [loadingPrefill, setLoadingPrefill] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notaSimpleFile, setNotaSimpleFile] = useState<File | null>(null);
  const [existingNotaSimple, setExistingNotaSimple] = useState<ExistingNotaSimpleState | null>(
    null
  );
  const [buyerTypeOptions, setBuyerTypeOptions] = useState<BuyerTypeSelectOption[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PoderNotarialFormValues>({
    resolver: zodResolver(poderNotarialFormSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  const buyerType = form.watch("buyerType");
  const buyingAlone = form.watch("buyingAlone");
  const economicRegime = form.watch("economicRegime");
  const showEssentialCompanyAsset = isCompanyTrustBuyerType(buyerType);
  const showCoBuyerQuestions = isMyselfAndSomeoneElseBuyerType(buyerType);
  const hasExistingNotaSimple = existingNotaSimple?.available === true;
  const requiresNotaSimpleUpload = !hasExistingNotaSimple;

  useEffect(() => {
    if (!showEssentialCompanyAsset) {
      form.setValue("essentialCompanyAsset", undefined);
    }
  }, [showEssentialCompanyAsset, form]);

  useEffect(() => {
    if (!showCoBuyerQuestions) {
      form.setValue("buyingAlone", undefined);
      form.setValue("ownershipPercentage", "");
    }
  }, [showCoBuyerQuestions, form]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoadingPrefill(true);
    setLoadError(null);
    setNotaSimpleFile(null);
    setExistingNotaSimple(null);

    fetch(`/api/investments/${investmentId}/poder-notarial-form`)
      .then(async (response) => {
        const data = (await response.json()) as {
          values?: Partial<PoderNotarialFormValues>;
          existingNotaSimple?: ExistingNotaSimpleState;
          buyerTypeOptions?: BuyerTypeSelectOption[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "No se pudo cargar el formulario");
        }

        if (cancelled || !data.values) return;

        setBuyerTypeOptions(data.buyerTypeOptions ?? []);
        setExistingNotaSimple(data.existingNotaSimple ?? null);

        form.reset({
          ...EMPTY_DEFAULTS,
          ...data.values,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(
          error instanceof Error ? error.message : "No se pudo cargar el formulario"
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingPrefill(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, investmentId, form]);

  async function onSubmit(values: PoderNotarialFormValues) {
    if (requiresNotaSimpleUpload && !notaSimpleFile) {
      toast.error("Falta la nota simple", {
        description: `Sube el archivo en «${PODER_NOTARIAL_FORM_LABELS.notaSimpleFile}».`,
      });
      return;
    }

    const googlePrefillWindow = openGoogleFormPrefillPlaceholder();

    try {
      const formData = new FormData();
      formData.append(
        "payload",
        JSON.stringify({
          ...values,
          notaSimpleFromHubSpot: hasExistingNotaSimple,
        })
      );
      if (notaSimpleFile) {
        formData.append("notaSimpleFile", notaSimpleFile);
      }

      const response = await fetch(`/api/investments/${investmentId}/poder-notarial-form`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        error?: string;
        message?: string;
        formUrl?: string;
        formActionUrl?: string;
        googlePrefillUrl?: string;
        fbzx?: string | null;
        googleEntries?: Record<string, string>;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo enviar la solicitud");
      }

      let googleTabOpened = false;
      if (data.formActionUrl && data.googleEntries && data.formUrl) {
        try {
          const result = await submitGoogleFormFromBrowser({
            formActionUrl: data.formActionUrl,
            fields: data.googleEntries,
            formViewUrl: data.formUrl,
            fbzx: data.fbzx,
            openPrefillTab: true,
            prefillWindow: googlePrefillWindow,
          });
          googleTabOpened = result.prefillTabOpened;
        } catch (googleError) {
          console.warn("[PoderNotarialFormDialog] Google submit helper failed", googleError);
          if (data.googlePrefillUrl && googlePrefillWindow && !googlePrefillWindow.closed) {
            googlePrefillWindow.location.href = data.googlePrefillUrl;
            googleTabOpened = true;
          }
        }
      } else if (googlePrefillWindow && !googlePrefillWindow.closed) {
        googlePrefillWindow.close();
      }

      toast.success("Solicitud guardada", {
        description: googleTabOpened
          ? "Se abrió Google Forms con tus datos. Pulsa Enviar allí para completar el registro."
          : data.message ?? "Hemos recibido tus datos para el poder notarial.",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (submitError) {
      googlePrefillWindow?.close();
      console.error("[PoderNotarialFormDialog]", submitError);
      toast.error("Error al enviar", {
        description:
          submitError instanceof Error
            ? submitError.message
            : "Inténtalo de nuevo en unos minutos.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[min(92vh,860px)] max-w-2xl overflow-y-auto border-[#E4E4E7] p-0",
          "gap-0 sm:rounded-2xl"
        )}
      >
        {loadError ? (
          <div className="px-6 py-8">
            <p className="text-sm text-[#B42318]">{loadError}</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-6">
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {PODER_NOTARIAL_FORM_LABELS.fullName}
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} fullWidth disabled={loadingPrefill} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nif"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {PODER_NOTARIAL_FORM_LABELS.nif}
                          <RequiredMark />
                        </FormLabel>
                        <FormControl>
                          <Input {...field} fullWidth disabled={loadingPrefill} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {PODER_NOTARIAL_FORM_LABELS.phone}
                          <RequiredMark />
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" fullWidth disabled={loadingPrefill} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {PODER_NOTARIAL_FORM_LABELS.email}
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" fullWidth disabled={loadingPrefill} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {PODER_NOTARIAL_FORM_LABELS.profession}
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} fullWidth disabled={loadingPrefill} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {PODER_NOTARIAL_FORM_LABELS.contactAddress}
                        <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} fullWidth disabled={loadingPrefill} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {PODER_NOTARIAL_FORM_LABELS.maritalStatus}
                        <RequiredMark />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[1200]">
                          {MARITAL_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="economicRegime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {PODER_NOTARIAL_FORM_LABELS.economicRegime}
                        <RequiredMark />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[1200]">
                          {ECONOMIC_REGIME_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {economicRegime === "Otro" ? (
                  <FormField
                    control={form.control}
                    name="economicRegimeOther"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especifica el régimen económico</FormLabel>
                        <FormControl>
                          <Input {...field} fullWidth />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                <FormField
                  control={form.control}
                  name="taxlandNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{PODER_NOTARIAL_FORM_LABELS.taxlandNumber}</FormLabel>
                      <FormControl>
                        <Input {...field} fullWidth placeholder="" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--vistral-semantic-text-primary)]">
                    {PODER_NOTARIAL_FORM_LABELS.notaSimpleFile}
                    {requiresNotaSimpleUpload ? <RequiredMark /> : null}
                  </p>

                  {hasExistingNotaSimple ? (
                    <div className="flex items-start gap-3 rounded-lg border border-[#ABEFC6] bg-[#ECFDF3] px-4 py-3">
                      <FileCheck className="mt-0.5 size-4 shrink-0 text-[#067647]" aria-hidden />
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium text-[#067647]">
                          {existingNotaSimple?.label ?? "Nota simple"} ya disponible
                        </p>
                        <p className="text-xs text-[#344054]">
                          PropHero ya subió el documento en el listing (Land registry doc DD).
                        </p>
                        {existingNotaSimple?.viewUrl ? (
                          <a
                            href={existingNotaSimple.viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs font-medium text-[#162EB7] hover:opacity-80"
                          >
                            Ver documento
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setNotaSimpleFile(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#D4D4D8] bg-[#FAFAFA] px-4 text-sm font-medium text-[#162EB7] transition-colors hover:bg-[#F4F4F5]"
                  >
                    <Upload className="size-4" aria-hidden />
                    {notaSimpleFile
                      ? notaSimpleFile.name
                      : hasExistingNotaSimple
                        ? "Subir otra versión (opcional)"
                        : "Subir archivo"}
                  </button>
                </div>

                <FormField
                  control={form.control}
                  name="buyerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {PODER_NOTARIAL_FORM_LABELS.buyerType}
                        <RequiredMark />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[1200]">
                          {buyerTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showCoBuyerQuestions ? (
                  <>
                    <FormField
                      control={form.control}
                      name="buyingAlone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {PODER_NOTARIAL_FORM_LABELS.buyingAlone}
                            <RequiredMark />
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="z-[1200]">
                              {YES_NO_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {buyingAlone === "No" ? (
                      <FormField
                        control={form.control}
                        name="ownershipPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {PODER_NOTARIAL_FORM_LABELS.ownershipPercentage}
                              <RequiredMark />
                            </FormLabel>
                            <FormControl>
                              <Input {...field} fullWidth placeholder="Ej. 50% / 50%" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : null}
                  </>
                ) : null}

                {showEssentialCompanyAsset ? (
                  <FormField
                    control={form.control}
                    name="essentialCompanyAsset"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {PODER_NOTARIAL_FORM_LABELS.essentialCompanyAsset}
                          <RequiredMark />
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[1200]">
                            {YES_NO_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
              </div>

              <DialogFooter className="mt-6 gap-2 border-t border-[#E4E4E7] pt-5 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={form.formState.isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loadingPrefill || form.formState.isSubmitting}
                  className="rounded-full bg-[#2050F6] px-6 hover:bg-[#2050F6]/90"
                >
                  {form.formState.isSubmitting ? "Enviando…" : "Enviar solicitud"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
