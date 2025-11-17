"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function ConfettiBlast({ trigger, difficulty }) {
  useEffect(() => {
    if (!trigger) return;

    // Base burst
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Extra burst for harder levels
    if (difficulty >= 6) {
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.4 }
        });
      }, 400);
    }

    if (difficulty >= 8) {
      setTimeout(() => {
        confetti({
          particleCount: 250,
          spread: 140,
          origin: { y: 0.8 }
        });
      }, 800);
    }
  }, [trigger, difficulty]);

  return null;
}
