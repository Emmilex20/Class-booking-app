"use client";

import type Hls from "hls.js";
import type { ErrorData } from "hls.js";
import { useEffect, useRef, useState } from "react";

interface LiveStreamVideoPlayerProps {
  src: string;
  title: string;
  className?: string;
}

function isHlsStream(url: string): boolean {
  return /\.m3u8(\?|$)/i.test(url);
}

export function LiveStreamVideoPlayer({
  src,
  title,
  className,
}: LiveStreamVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: Hls | null = null;
    let cancelled = false;

    const attachDirectSource = () => {
      video.src = src;
      video.load();
    };

    const attachStream = async () => {
      setError(null);

      if (!isHlsStream(src)) {
        attachDirectSource();
        return;
      }

      const supportsNativeHls = video.canPlayType(
        "application/vnd.apple.mpegurl",
      );
      if (supportsNativeHls) {
        attachDirectSource();
        return;
      }

      try {
        const { default: HlsJs } = await import("hls.js");
        if (cancelled) return;

        if (!HlsJs.isSupported()) {
          setError("HLS is not supported in this browser.");
          return;
        }

        hlsInstance = new HlsJs({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hlsInstance.on(
          HlsJs.Events.ERROR,
          (_event: string, data: ErrorData) => {
            if (!data.fatal) return;
            setError(
              "Unable to play live HLS stream. Please refresh or open externally.",
            );
          },
        );

        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } catch {
        setError("Could not initialize HLS player.");
      }
    };

    attachStream();

    return () => {
      cancelled = true;
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        className={className ?? "h-full w-full"}
        controls
        autoPlay
        playsInline
        title={title}
      >
        <track
          kind="captions"
          srcLang="en"
          label="English captions"
          src="data:text/vtt,WEBVTT"
        />
      </video>

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-6 text-center text-white">
          {error}
        </div>
      ) : null}
    </div>
  );
}
