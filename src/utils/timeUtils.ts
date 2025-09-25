
export function generateTimeSlots(
  start: string,
  end: string,
  interval: number
): string[] {
  const slots: string[] = [];
  let [sh, sm] = start.split(":").map(Number);
  let [eh, em] = end.split(":").map(Number);

  let startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;

  for (let m = startMinutes; m < endMinutes; m += interval) {
    const h = Math.floor(m / 60)
      .toString()
      .padStart(2, "0");
    const min = (m % 60).toString().padStart(2, "0");
    slots.push(`${h}:${min}`);
  }

  return slots;
}
