"use client";

import { useEffect, useRef } from "react";

type Props = {
  symbol: string;
  interval?: string; // e.g. "15" for 15m
  theme?: "dark" | "light";
  height?: number;
};

export default function TradingViewChart({
  symbol,
  interval = "15",
  theme = "dark",
  height = 600,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use iframe embed for simplicity & zero extra deps.
    // Construct the TradingView widget URL:
    const base = "https://s.tradingview.com/widgetembed/";
    const params = new URLSearchParams({
      frameElementId: "tradingview_widget",
      symbol,
      interval,
      theme,
      timezone: "Etc/UTC",
      style: "1",
      hide_side_toolbar: "false",
      allow_symbol_change: "true",
      withdateranges: "true",
      studies: "",
      toolbarbg: "#222",
      hideideas: "true",
      enable_publishing: "false",
      details: "true",
      hotlist: "false",
      calendar: "false",
      autosize: "true"
    }).toString();

    const url = `${base}?${params}`;

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      const iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.style.width = "100%";
      iframe.style.height = `${height}px`;
      iframe.style.border = "0";
      iframe.sandbox.add("allow-same-origin", "allow-scripts", "allow-popups", "allow-forms");
      containerRef.current.appendChild(iframe);
    }
  }, [symbol, interval, theme, height]);

  return <div ref={containerRef} />;
}