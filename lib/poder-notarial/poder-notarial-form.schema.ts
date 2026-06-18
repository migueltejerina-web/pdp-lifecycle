import {
  isCompanyTrustBuyerType,
  isMyselfAndSomeoneElseBuyerType,
} from "@/lib/poder-notarial/buyer-type";
import { z } from "zod";

export const MARITAL_STATUS_OPTIONS = [
  "Soltero/a",
  "Casado/a",
  "Divorciado/a",
  "Viudo/a",
  "Pareja de hecho",
] as const;

export const ECONOMIC_REGIME_OPTIONS = [
  "Sociedad de gananciales",
  "Separación de bienes",
  "Participación",
  "Otro",
] as const;

export const YES_NO_OPTIONS = ["Sí", "No"] as const;

export const poderNotarialFormSchema = z
  .object({
    fullName: z.string().min(1, "El nombre es obligatorio"),
    nif: z.string().min(1, "El DNI/NIE o NIF es obligatorio"),
    email: z.string().email("Email no válido"),
    phone: z.string().min(1, "El teléfono es obligatorio"),
    contactAddress: z.string().min(1, "La dirección es obligatoria"),
    profession: z.string().min(1, "La profesión es obligatoria"),
    maritalStatus: z.enum(MARITAL_STATUS_OPTIONS, {
      message: "Selecciona el estado civil",
    }),
    economicRegime: z.enum(ECONOMIC_REGIME_OPTIONS, {
      message: "Selecciona el régimen económico matrimonial",
    }),
    economicRegimeOther: z.string().optional(),
    taxlandNumber: z.string().optional(),
    buyerType: z.string().min(1, "Selecciona el régimen de compra"),
    buyingAlone: z.enum(YES_NO_OPTIONS).optional(),
    ownershipPercentage: z.string().optional(),
    essentialCompanyAsset: z.enum(YES_NO_OPTIONS).optional(),
    notaSimpleFromHubSpot: z.boolean().optional(),
    notaSimpleUploaded: z.boolean().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.economicRegime === "Otro" && !values.economicRegimeOther?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["economicRegimeOther"],
        message: "Indica el régimen económico",
      });
    }

    if (isMyselfAndSomeoneElseBuyerType(values.buyerType)) {
      if (!values.buyingAlone) {
        ctx.addIssue({
          code: "custom",
          path: ["buyingAlone"],
          message: "Indica si compras solo/a",
        });
      } else if (values.buyingAlone === "No" && !values.ownershipPercentage?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["ownershipPercentage"],
          message: "Indica el porcentaje de cada comprador",
        });
      }
    }

    if (isCompanyTrustBuyerType(values.buyerType) && !values.essentialCompanyAsset) {
      ctx.addIssue({
        code: "custom",
        path: ["essentialCompanyAsset"],
        message: "Selecciona una opción",
      });
    }
  });

export type PoderNotarialFormValues = z.infer<typeof poderNotarialFormSchema>;
