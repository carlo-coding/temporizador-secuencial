import { useEffect, useRef } from "react";

export function useEffectOnce(callback: Function) {
  const ejecutado = useRef(false);

  useEffect(() => {
    if (!ejecutado.current) {
      ejecutado.current = true;
      callback();
    }
  }, [ejecutado.current]);
}
