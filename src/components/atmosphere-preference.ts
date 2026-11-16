export type Lighting = "day" | "night";
export type AtmospherePreference = { version: 1; mode: "manual" | "automatic"; lighting: Lighting };
export const atmosphereKey = "ivector-atmosphere-v1";
export const defaultAtmosphere: AtmospherePreference = { version: 1, mode: "manual", lighting: "day" };

export function readAtmosphere(value: string | null): AtmospherePreference {
  try {
    const saved = JSON.parse(value || "null");
    if (saved?.version === 1 && ["manual", "automatic"].includes(saved.mode) && ["day", "night"].includes(saved.lighting)) {
      return { version: 1, mode: saved.mode, lighting: saved.lighting };
    }
  } catch {}
  return defaultAtmosphere;
}

const taiwanHour = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Taipei", hour: "numeric", hourCycle: "h23" });
export function taiwanLighting(date: Date): Lighting {
  const hour = Number(taiwanHour.format(date));
  return hour >= 6 && hour < 18 ? "day" : "night";
}
