import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CloudStuff — Аксессуары для устройств",
    short_name: "CloudStuff",
    description: "Интернет-магазин аксессуаров для электронных устройств и вейпов: чехлы, кейсы, зарядки, кабели и powerbank",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F6F8",
    theme_color: "#2196F3",
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
