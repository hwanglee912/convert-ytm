import { Innertube, UniversalCache } from "youtubei.js";

let innertubeInstance: Innertube | null = null;
let initPromise: Promise<Innertube> | null = null;

export async function getInnertube(cookie?: string): Promise<Innertube> {
  // If a custom cookie is provided, create a fresh authenticated instance
  if (cookie && cookie.trim().length > 0) {
    return await Innertube.create({
      cookie: cookie.trim(),
      cache: new UniversalCache(false),
      generate_session_locally: true,
    });
  }

  // Otherwise, use cached anonymous instance
  if (innertubeInstance) {
    return innertubeInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const yt = await Innertube.create({
        cache: new UniversalCache(false),
        generate_session_locally: true,
      });
      innertubeInstance = yt;
      return yt;
    } catch (err) {
      console.error("[Innertube Init Error]:", err);
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}
