import { useEffect, useRef } from "react";

export function useKeyboardShortcuts(shortcuts, enabled = true) {
  const shortcutsRef = useRef(shortcuts);

  // sempre a versão mais recente, sem recriar o listener a cada render
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  });

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e) {
      // não atrapalha Ctrl+R (recarregar), Ctrl+H, Cmd+U etc.
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // não age enquanto o usuário interage com um campo
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const action = shortcutsRef.current[key];
      if (!action) return;

      // segurar a tecla só repete nas setas (para percorrer o histórico)
      if (e.repeat && !key.startsWith("Arrow")) return;

      e.preventDefault();
      action();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
