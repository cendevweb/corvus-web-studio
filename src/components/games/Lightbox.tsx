"use client";

import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { GameIcon } from "./GameIcon";

interface LightboxProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name of the dialog. */
  label: string;
  /** Top-left text ("2 / 6", "Trailer"). */
  counter: string;
  caption: string;
  closeLabel: string;
  /** Previous / next controls; omit both for a single media (video). */
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  video?: boolean;
  /** The media itself (<Image> or <video>), only rendered while open. */
  children: ReactNode;
}

/**
 * Full-screen viewer built on the native <dialog>: focus trap, Escape and focus return come for free.
 * Arrow keys navigate; nothing is animated on keyboard navigation.
 */
export function Lightbox({
  open,
  onClose,
  label,
  counter,
  caption,
  closeLabel,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
  video,
  children,
}: LightboxProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    const target = event.target as HTMLElement;
    if (target === ref.current || target.classList.contains("lb-fig")) onClose();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowLeft") onPrev?.();
    if (event.key === "ArrowRight") onNext?.();
  };

  return (
    <dialog
      ref={ref}
      className={cn("lb", video && "is-video")}
      aria-label={label}
      onClose={onClose}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <div className="lb-top">
        <span aria-live="polite">{counter}</span>
        <button className="lb-x" type="button" aria-label={closeLabel} onClick={onClose}>
          <GameIcon name="close" />
        </button>
      </div>
      <figure className="lb-fig">{open && children}</figure>
      <div className="lb-bot">
        <button className="lb-a prev" type="button" aria-label={prevLabel} onClick={onPrev} disabled={!onPrev}>
          <Icon name="arrow" />
        </button>
        <p className="lb-cap">{caption}</p>
        <button className="lb-a" type="button" aria-label={nextLabel} onClick={onNext} disabled={!onNext}>
          <Icon name="arrow" />
        </button>
      </div>
    </dialog>
  );
}
