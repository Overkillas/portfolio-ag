"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { z } from "zod";
import { useTranslations } from "@/lib/i18n/use-translation";
import s from "./HomeContactForm.module.css";

type Status = "idle" | "sending" | "success" | "error";

/**
 * Formulário da seção de contato da home — o do protótipo (e-mail com asterisco
 * + solicitação com o botão de enviar no canto), mas enviando de verdade pelo
 * mesmo EmailJS do ContactForm (/contato, intocado): mesmas env vars
 * NEXT_PUBLIC_EMAILJS_*, mesmos nomes de variáveis do template. Campos name /
 * phone seguem no template, vazios. Os `name` dos campos são dados.
 */
export function HomeContactForm() {
  const { dict, locale } = useTranslations();
  const t = dict.home.contactForm;
  const f = dict.contact.form;

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  const schema = z.object({
    // e-mail vazio também cai em invalidEmail
    email: z.string().trim().pipe(z.email(f.errors.invalidEmail)),
    mensagem: z.string().trim().min(5, f.errors.messageMinLength),
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    const parsed = schema.safeParse({ email, mensagem: message });
    if (!parsed.success) {
      setStatus("error");
      setFeedback(parsed.error.issues[0]?.message ?? f.errorFallback);
      return;
    }

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) {
      setStatus("error");
      setFeedback(f.emailjsNotConfigured);
      return;
    }

    try {
      setStatus("sending");
      await emailjs.send(
        serviceId,
        templateId,
        {
          // Os nomes precisam bater com as variáveis {{...}} do template no EmailJS
          name: "",
          email: parsed.data.email,
          phone: "",
          message: parsed.data.mensagem,
          time: new Date().toLocaleString(locale),
        },
        { publicKey },
      );
      setStatus("success");
      setFeedback(t.success);
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setFeedback(f.sendFailed);
    }
  }

  // Digitar de novo esconde a mensagem (como no protótipo).
  const clearFeedback = () => {
    if (status === "success" || status === "error") {
      setStatus("idle");
      setFeedback("");
    }
  };

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate>
      <div className={s.fieldWrap}>
        <label htmlFor="home-contact-email" className="sr-only">
          {t.emailLabel}
        </label>
        <input
          id="home-contact-email"
          name="email"
          type="email"
          autoComplete="email"
          className={`${s.field} ${s.email}`}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFeedback();
          }}
          placeholder={t.emailPlaceholder}
        />
        {/* Ícone original da usuária (SVG sem alteração), decorativo. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home/form/asterisco.svg"
          alt=""
          aria-hidden
          width={29}
          height={27}
          className={s.asterisk}
        />
      </div>

      <div className={s.fieldWrap}>
        <label htmlFor="home-contact-message" className="sr-only">
          {t.messageLabel}
        </label>
        <textarea
          id="home-contact-message"
          name="mensagem"
          className={`${s.field} ${s.message}`}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            clearFeedback();
          }}
          placeholder={t.messagePlaceholder}
        />
        <button
          className={s.send}
          type="submit"
          aria-label={t.sendLabel}
          disabled={status === "sending"}
          aria-busy={status === "sending"}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/home/form/enviar.svg"
            alt=""
            aria-hidden
            width={23}
            height={26}
          />
        </button>
      </div>

      {status === "success" && (
        <p className={s.toast} role="status">
          {feedback}
        </p>
      )}
      {status === "error" && (
        <p className={`${s.toast} ${s.error}`} role="alert">
          {feedback}
        </p>
      )}
    </form>
  );
}
