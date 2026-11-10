"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
export function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    const mm = gsap.matchMedia();
    gsap.registerPlugin(ScrollTrigger);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        if (document.querySelector(".hero-title")) {
          gsap.fromTo(
            ".hero-title span",
            { y: 65, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              stagger: 0.13,
              ease: "power3.out",
              delay: 0.12,
            },
          );
        }
        gsap.to(".navigation", {
          "--nav-scroll": 1,
          ease: "none",
          scrollTrigger: { start: 0, end: 240, scrub: 0.5 },
        });
        if (document.querySelector(".hero-poster")) {
          gsap.to(".hero-poster", {
            yPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
        }
        const journey = document.querySelector<HTMLElement>("[data-journey-card]");
        if (journey) {
          gsap.fromTo(
            journey,
            { y: () => Math.min(140, window.innerHeight * 0.18) },
            {
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: "[data-journey-stage]",
                start: "top bottom",
                end: "top 55%",
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            },
          );
        }
        gsap.fromTo(
          ".footer-main > *",
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: ".footer-main", start: "top 98%", once: true },
          },
        );
        if (document.querySelector(".footer-invitation")) {
          const invitation = gsap.timeline({
            scrollTrigger: {
              trigger: ".footer-invitation",
              start: "top 92%",
              once: true,
            },
          });
          invitation
            .fromTo(
              ".invitation-heading",
              { y: 14 },
              { y: 0, duration: 0.7, ease: "power2.out" },
              0,
            )
            .fromTo(
              ".invitation-char",
              { opacity: 0, y: 2 },
              { opacity: 1, y: 0, duration: 0.035, stagger: 0.035, ease: "none" },
              0.1,
            )
            .fromTo(
              ".footer-invitation p",
              { opacity: 0, y: 12 },
              { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" },
              0.45,
            )
            .fromTo(
              ".footer-cta",
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
              0.8,
            );
        }
        document
          .querySelectorAll<HTMLElement>("[data-reveal]")
          .forEach((el) =>
            gsap.fromTo(
              el,
              { y: 34, opacity: 0.35 },
              {
                y: 0,
                opacity: 1,
                duration: 0.95,
                ease: "power2.out",
                scrollTrigger: { trigger: el, start: "top 93%", once: true },
              },
            ),
          );
        document
          .querySelectorAll<HTMLElement>("[data-parallax]")
          .forEach((el) =>
            gsap.to(el, {
              yPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
              },
            }),
          );
      });
      return () => ctx.revert();
    });
    const fine = matchMedia(
      "(pointer:fine) and (prefers-reduced-motion:no-preference)",
    ).matches;
    const targets = [...document.querySelectorAll<HTMLElement>(".magnetic")];
    const moves = targets.map((el) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * 0.1,
          y: (e.clientY - r.top - r.height / 2) * 0.16,
          duration: 0.35,
        });
      };
      const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.5 });
      if (fine) {
        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
      }
      return () => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      };
    });
    return () => {
      mm.revert();
      moves.forEach((f) => f());
    };
  }, [pathname]);
  return null;
}
