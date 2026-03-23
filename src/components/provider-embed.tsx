"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { Post } from "@/lib/db/schema";

interface ProviderEmbedProps {
  post: Post;
  lazy?: boolean;
}

export function ProviderEmbed({ post, lazy = true }: ProviderEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [hydrated, setHydrated] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    if (!lazy || isVisible) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy, isVisible]);

  // Load HTML embeds (TikTok/Instagram)
  const loadHtmlEmbed = useCallback(() => {
    if (!containerRef.current || !post.embedHtml) return;

    containerRef.current.innerHTML = post.embedHtml;

    if (post.provider === "tiktok") {
      const existing = document.querySelector(
        'script[src*="tiktok.com/embed.js"]'
      );
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      script.onload = () => setHydrated(true);
      document.body.appendChild(script);
    } else if (post.provider === "instagram") {
      const existing = document.querySelector(
        'script[src*="instagram.com/embed.js"]'
      );
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://www.instagram.com/embed.js";
        script.async = true;
        script.onload = () => {
          window.instgrm?.Embeds.process();
          setHydrated(true);
        };
        document.body.appendChild(script);
      } else {
        window.instgrm?.Embeds.process();
        setHydrated(true);
      }
    }
  }, [post.embedHtml, post.provider]);

  useEffect(() => {
    if (!isVisible) return;
    if (post.embedKind === "html") {
      loadHtmlEmbed();
    } else if (post.embedKind === "iframe_url") {
      setHydrated(true);
    }
  }, [isVisible, post.embedKind, loadHtmlEmbed]);

  // Timeout fallback
  useEffect(() => {
    if (hydrated || post.embedKind === "iframe_url") return;
    const timer = setTimeout(() => {
      if (!hydrated) setTimedOut(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [hydrated, post.embedKind]);

  // Unsupported or timed out — show link card
  if (post.embedKind === "unsupported" || (!post.isEmbeddable) || timedOut) {
    const hostname = (() => {
      try { return new URL(post.canonicalUrl).hostname.replace("www.", ""); } catch { return ""; }
    })();

    return (
      <a
        href={post.canonicalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 transition-colors hover:border-gray-700 hover:bg-gray-900"
      >
        {post.sourceThumbnailUrl && (
          <div className="relative aspect-[2/1] w-full overflow-hidden bg-gray-800">
            <img
              src={post.sourceThumbnailUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        )}
        <div className="p-4">
          {hostname && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-600">
              {hostname}
            </p>
          )}
          <p className="text-sm font-medium text-gray-300 group-hover:text-gray-100">
            {post.sourceTitle || post.localTitle || "Open original"}
          </p>
          {post.sourceDescription && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
              {post.sourceDescription}
            </p>
          )}
        </div>
      </a>
    );
  }

  // YouTube iframe
  if (post.embedKind === "iframe_url" && post.embedUrl) {
    return (
      <div ref={containerRef} className="relative w-full overflow-hidden rounded-xl bg-gray-900">
        {isVisible ? (
          <div className="relative w-full" style={{ paddingTop: post.contentType === "short" ? "177.78%" : "56.25%" }}>
            <iframe
              src={post.embedUrl}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              title={post.sourceTitle || "Embedded video"}
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center bg-gray-900">
            <div className="h-6 w-6 animate-pulse rounded-full bg-gray-800" />
          </div>
        )}
      </div>
    );
  }

  // HTML embed (TikTok/Instagram)
  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div
        ref={containerRef}
        className="flex min-h-[400px] items-center justify-center bg-gray-900/30"
        style={{ minHeight: post.provider === "tiktok" ? "740px" : "500px" }}
      >
        {!isVisible && (
          <div className="h-6 w-6 animate-pulse rounded-full bg-gray-800" />
        )}
      </div>
    </div>
  );
}
