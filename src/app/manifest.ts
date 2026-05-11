import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VapeLabHIT — Вейп-магазин",
    short_name: "VapeLabHIT",
    description: "Интернет-магазин вейп-продукции: испарители, картриджи, аккумуляторы и аксессуары",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F3F7",
    theme_color: "#7B2D8E",
    icons: [
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
