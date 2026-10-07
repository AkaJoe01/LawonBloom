"use client";

import { useEffect } from "react";

const ALLOWED_HOSTS = ["www.youtube-nocookie.com", "player.vimeo.com"];

function buildPlayButton(title: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "embed-play";
  button.setAttribute("aria-label", `Play video: ${title}`);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M8 5v14l11-7z");
  path.setAttribute("fill", "currentColor");
  svg.appendChild(path);
  button.appendChild(svg);
  button.addEventListener("click", onClick, { once: true });
  return button;
}

export default function PostEmbeds() {
  useEffect(() => {
    const roots = document.querySelectorAll<HTMLDivElement>("[data-embed-src]");
    roots.forEach((root) => {
      if (root.getAttribute("data-embed-ready") === "true") return;
      root.setAttribute("data-embed-ready", "true");
      const src = root.getAttribute("data-embed-src") ?? "";
      const title = root.getAttribute("data-embed-title") ?? "Video";

      let parsed: URL;
      try {
        parsed = new URL(src);
      } catch {
        return;
      }
      if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.includes(parsed.hostname)) {
        return;
      }

      const activate = () => {
        const iframe = document.createElement("iframe");
        iframe.src = parsed.toString();
        iframe.title = title;
        iframe.loading = "lazy";
        iframe.allow = "accelerometer; encrypted-media; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.className = "post-embed-frame";
        root.replaceChildren(iframe);
        root.setAttribute("data-embed-playing", "true");
      };

      root.replaceChildren(buildPlayButton(title, activate));
    });
  }, []);

  return null;
}
