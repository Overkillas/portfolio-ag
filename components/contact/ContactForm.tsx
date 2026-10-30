"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { z } from "zod";
import { useTranslations } from "@/lib/i18n/use-translation";
import type { Dictionary } from "@/i18n/dictionaries";

const isValidEmail = (v: string) => z.email().safeParse(v).success;

// Aceita formatos comuns (DDD, +55, espaços, traços, parênteses) e exige de 8 a
// 13 dígitos (fixo c/ DDD até celular com +55).
function isValidPhone(v: string) {
  const digits = v.replace(/\D/g, "");
  return /^[+()\d\s.-]+$/.test(v) && digits.length >= 8 && digits.length <= 13;
}

type FormDict = Dictionary["contact"]["form"];

// email e telefone são opcionais (chegam como ""), mas pelo menos um precisa vir
// preenchido pra Ágatha conseguir responder — e quando preenchidos, têm que ser
// válidos. Cada erro tem mensagem própria, traduzida pelo dicionário.
const makeSchema = (f: FormDict) =>
  z
    .object({
      nome: z.string().min(1, f.errors.nameRequired),
      email: z.string(),
      telefone: z.string(),
      mensagem: z.string().min(5, f.errors.messageMinLength),
    })
    .refine((d) => d.email.trim() !== "" || d.telefone.trim() !== "", {
      message: f.errors.contactRequired,
      path: ["email"],
    })
    .refine((d) => d.email === "" || isValidEmail(d.email), {
      message: f.errors.invalidEmail,
      path: ["email"],
    })
    .refine((d) => d.telefone === "" || isValidPhone(d.telefone), {
      message: f.errors.invalidPhone,
      path: ["telefone"],
    });

type FormState = "idle" | "sending" | "success" | "error";

// font-normal: o Figma usa Clother Regular (400) no input/placeholder; o peso
// global virou 300, então fixo o 400 aqui.
const fieldClass =
  "w-full rounded-lg border border-[color:var(--color-blue-soft)] bg-white/70 px-3 py-2 font-normal text-[color:var(--color-blue-deep)] outline-none placeholder:text-[color:var(--color-blue-soft)] focus:border-[color:var(--color-blue)] focus:ring-2 focus:ring-[color:var(--color-blue)]/20";

const EMPTY = { nome: "", email: "", telefone: "", mensagem: "" };

export function ContactForm() {
  const { dict, locale } = useTranslations();
  const f = dict.contact.form;
  const schema = makeSchema(f);

  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [fields, setFields] = useState(EMPTY);

  // Validade reativa — controla a COR do botão de enviar (azul = pode enviar;
  // azul-gelo "apagado" = ainda não dá). Continua clicável p/ revelar o que falta.
  const canSend = schema.safeParse(fields).success;

  const update =
    (name: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(fields);

    if (!parsed.success) {
      setState("error");
      setErrorMsg(parsed.error.issues[0]?.message ?? f.errorFallback);
      return;
    }

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setState("error");
      setErrorMsg(f.emailjsNotConfigured);
      return;
    }

    try {
      setState("sending");
      await emailjs.send(
        serviceId,
        templateId,
        {
          // Os nomes precisam bater com as variáveis {{...}} do template no EmailJS
          name: parsed.data.nome,
          email: parsed.data.email,
          phone: parsed.data.telefone,
          message: parsed.data.mensagem,
          time: new Date().toLocaleString(locale),
        },
        { publicKey },
      );
      setState("success");
      setFields(EMPTY);
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : f.sendFailed);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shadow-card flex w-full max-w-[520px] flex-col gap-3 rounded-[8px] bg-[color:var(--color-cream)] p-5"
      noValidate
    >
      {/* Nome (full) + contato (email/telefone, pelo menos um) */}
      <input
        name="nome"
        type="text"
        autoComplete="name"
        placeholder={f.namePlaceholder}
        value={fields.nome}
        onChange={update("nome")}
        className={fieldClass}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder={f.emailPlaceholder}
          value={fields.email}
          onChange={update("email")}
          className={fieldClass}
        />
        <input
          name="telefone"
          type="tel"
          autoComplete="tel"
          placeholder={f.phonePlaceholder}
          value={fields.telefone}
          onChange={update("telefone")}
          className={fieldClass}
        />
      </div>
      <p className="-mt-1 text-xs text-[color:var(--color-blue)]/70">
        {f.minContactHint}
      </p>

      {/* Campo de solicitação — o protagonista, com o botão de enviar DENTRO da
          caixa (canto inferior direito), como no Figma. */}
      <div className="relative">
        <textarea
          name="mensagem"
          rows={8}
          placeholder={f.messagePlaceholder}
          value={fields.mensagem}
          onChange={update("mensagem")}
          className={`${fieldClass} resize-none pb-16`}
        />
        <button
          type="submit"
          aria-label={f.submitAriaLabel}
          disabled={state === "sending"}
          className={`absolute bottom-3 right-3 grid h-12 w-12 place-items-center rounded-full text-[color:var(--color-cream)] transition-all disabled:opacity-60 ${
            canSend
              ? "bg-[color:var(--color-blue)] hover:bg-[color:var(--color-blue-deep)]"
              : "bg-[color:var(--color-blue-soft)]"
          }`}
        >
          {state === "sending" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden
            >
              {/* mingcute:send-fill — mesmo ícone do Figma */}
              <path d="M20.235 5.686c.432-1.195-.726-2.353-1.921-1.92L3.709 9.048c-1.199.434-1.344 2.07-.241 2.709l4.662 2.699l4.163-4.163a1 1 0 0 1 1.414 1.414L9.544 15.87l2.7 4.662c.638 1.103 2.274.957 2.708-.241z" />
            </svg>
          )}
        </button>
      </div>

      <p
        className={`text-sm ${state === "error" ? "text-red-600" : "text-[color:var(--color-blue)]"}`}
        role="status"
      >
        {state === "success" ? f.successMessage : state === "error" ? errorMsg : ""}
      </p>
    </form>
  );
}