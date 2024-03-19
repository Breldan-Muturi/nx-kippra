// import { env } from "@/validation/env.validation";
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
export const domain = process.env.NEXT_PUBLIC_APP_URL;
export const from = "portal@kippra.sohnandsol.com";
