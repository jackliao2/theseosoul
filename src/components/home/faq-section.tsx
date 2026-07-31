"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HOME_FAQS } from "@/lib/home-faqs";

export function FaqSection() {
  return (
    <section
      id="faq"
      className="border-t border-slate-200 bg-[color:var(--surface)] dark:border-slate-700"
    >
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">
          FAQ
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Short list. Straight answers.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Four questions covering free vs Pro, how the crawl works, positioning,
          and indexing.
        </p>
        <Accordion type="single" collapsible className="mt-10">
          {HOME_FAQS.map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`}>
              <AccordionTrigger className="font-display text-base text-slate-900 dark:text-slate-50">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
