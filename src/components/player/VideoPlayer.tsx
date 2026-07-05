import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "../../stores/appStore";

import Hls from "hls.js";

interface Props {
  url: string;
}

function isHlsUrl(url: string) {
  const cleanUrl = url.toLowerCase().split("?")[0].split("#")[0];

  return cleanUrl.endsWith(".m3u8");
}

export default function VideoPlayer({ url }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { proxyUrl, serverPort } = useAppStore();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const streamUrl = useMemo(() => {
    if (proxyUrl && serverPort) {
      return `http://127.0.0.1:${serverPort}/stream?url=${encodeURIComponent(url)}`;
    }
    return url;
  }, [url, proxyUrl, serverPort]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    setError(null);
    setIsLoading(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.pause();
    video.removeAttribute("src");
    video.load();

    const hlsUrl = isHlsUrl(streamUrl);

    if (hlsUrl && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError("Unable to play this stream.");
          setIsLoading(false);
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    if (video.canPlayType("application/vnd.apple.mpegurl") && hlsUrl) {
      video.src = streamUrl;
      video.addEventListener("canplay", () => setIsLoading(false), { once: true });
      video.addEventListener("error", () => {
        setError("Unable to play this stream.");
        setIsLoading(false);
      }, { once: true });
      return () => {
        video.removeAttribute("src");
      };
    }

    video.src = streamUrl;

    video.addEventListener("canplay", () => setIsLoading(false), { once: true });
    video.addEventListener("playing", () => setIsLoading(false), { once: true });
    video.addEventListener("error", () => {
      setError("Unable to play this stream.");
      setIsLoading(false);
    }, { once: true });

    return () => {
      video.removeAttribute("src");
    };
  }, [streamUrl]);

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  return (
    <div className="player-shell relative h-full w-full overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        controls
        autoPlay
        playsInline
        className={isLoading ? "player-video player-video-loading" : "player-video player-video-ready"}
      />

      {isLoading ? (
        <div className="player-loading-overlay absolute inset-0 flex items-center justify-center rounded-xl">
          <div className="player-loading-card flex items-center gap-3 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm text-zinc-100 shadow-lg backdrop-blur">
            <span className="player-loading-spinner h-4 w-4 rounded-full border-2 border-zinc-400 border-t-transparent" />
            Loading stream
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/80 text-sm text-zinc-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}