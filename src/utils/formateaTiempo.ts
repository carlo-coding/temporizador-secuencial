export function formateaTiempo(
  minutos: number,
  corto: boolean = false
): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;

  if (corto) {
    const partes: string[] = [];
    if (horas > 0) partes.push(`${horas}h`);
    if (mins > 0 || horas === 0) partes.push(`${mins}min`);
    return partes.join(" ");
  } else {
    const partes: string[] = [];
    if (horas > 0) partes.push(`${horas} hora${horas !== 1 ? "s" : ""}`);
    if (mins > 0 || horas === 0)
      partes.push(`${mins} minuto${mins !== 1 ? "s" : ""}`);
    return partes.join(" ");
  }
}
