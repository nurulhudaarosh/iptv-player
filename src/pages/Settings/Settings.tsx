import { useEffect, useState } from "react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../../stores/appStore";

type ProxyType = "none" | "http" | "socks5";

function parseProxyUrl(url: string | null): {
  type: ProxyType;
  host: string;
  port: string;
} {
  if (!url) {
    return { type: "none", host: "", port: "" };
  }

  try {
    const parsedUrl = new URL(url);
    const type = parsedUrl.protocol.replace(":", "") as ProxyType;
    const host = parsedUrl.hostname;
    const port = parsedUrl.port;

    if (type === "http" || type === "socks5") {
      return { type, host, port };
    }
  } catch (error) {
    // Ignore parsing errors for malformed URLs
  }

  return { type: "none", host: "", port: "" };
}

const RadioButton = ({
  label,
  value,
  checked,
  onChange,
}: {
  label: string;
  value: ProxyType;
  checked: boolean;
  onChange: (value: ProxyType) => void;
}) => {
  const { isDark } = useAppStore();
  return (
    <label
      className={clsx(
        "cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium transition",
        checked
          ? "border-sky-500 bg-sky-500/10 text-sky-500"
          : isDark
          ? "border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800"
          : "border-slate-300 bg-slate-100/50 hover:bg-slate-200"
      )}
    >
      <input
        type="radio"
        name="proxy-type"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {label}
    </label>
  );
};

export default function SettingsPage() {
  const { isDark, proxyUrl, setProxyUrl } = useAppStore();

  const [proxyType, setProxyType] = useState<ProxyType>("none");
  const [proxyHost, setProxyHost] = useState("");
  const [proxyPort, setProxyPort] = useState("");

  useEffect(() => {
    const { type, host, port } = parseProxyUrl(proxyUrl);
    setProxyType(type);
    setProxyHost(host);
    setProxyPort(port);
  }, [proxyUrl]);

  function handleSave() {
    if (proxyType === "none") {
      setProxyUrl(null);
      invoke("set_proxy_url", { proxyUrl: null });
      toast.success("Proxy settings saved!");
      return;
    }

    const host = proxyHost.trim();
    const port = proxyPort.trim();

    if (!host || !port) {
      toast.error("Host and port cannot be empty.");
      return;
    }

    if (!/^\d+$/.test(port) || +port < 1 || +port > 65535) {
      toast.error("Please enter a valid port number (1-65535).");
      return;
    }

    const nextProxyUrl = `${proxyType}://${host}:${port}`;
    setProxyUrl(nextProxyUrl);
    invoke("set_proxy_url", { proxyUrl: nextProxyUrl });
    toast.success("Proxy settings saved!");
  }

  return (
    <div className={clsx("min-h-full p-4 lg:p-6", isDark ? "text-zinc-100" : "text-slate-900")}>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className={clsx("mt-2 text-sm", isDark ? "text-zinc-400" : "text-slate-600")}>
          Manage application-wide settings and preferences.
        </p>

        <div className={clsx("mt-8 border-t", isDark ? "border-zinc-800" : "border-slate-200")}>
          <div className="grid grid-cols-1 gap-y-8 py-8 md:grid-cols-3 md:gap-x-8">
            {/* Left Column: Title/Description */}
            <div>
              <h2 className="text-lg font-semibold">Network Proxy</h2>
              <p className={clsx("mt-1 text-sm", isDark ? "text-zinc-400" : "text-slate-600")}>
                Configure an HTTP or SOCKS5 proxy for playlist downloads and video streams.
              </p>
            </div>

            {/* Right Column: Controls */}
            <div className="md:col-span-2">
              <div className="flex flex-col gap-6 rounded-xl border p-6" style={isDark ? {
                background: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
                backgroundSize: '20px 20px',
                borderColor: 'rgb(39 39 42 / 1)',
              } : {
                background: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
                backgroundSize: '20px 20px',
                borderColor: 'rgb(226 232 240 / 1)',
              }}>
                {/* Proxy Type Radio Buttons */}
                <div className="flex items-center gap-4">
                  <p className="flex-shrink-0 text-sm font-medium">Type</p>
                  <div className="flex items-center gap-2">
                    <RadioButton value="none" label="None" checked={proxyType === "none"} onChange={setProxyType} />
                    <RadioButton value="http" label="HTTP" checked={proxyType === "http"} onChange={setProxyType} />
                    <RadioButton value="socks5" label="SOCKS5" checked={proxyType === "socks5"} onChange={setProxyType} />
                  </div>
                </div>

                {/* Proxy Host/Port Inputs */}
                {proxyType !== "none" && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label htmlFor="proxy-host" className="block text-sm font-medium">
                        Host
                      </label>
                      <input
                        id="proxy-host"
                        type="text"
                        value={proxyHost}
                        onChange={(e) => setProxyHost(e.target.value)}
                        placeholder="127.0.0.1"
                        className={clsx(
                          "mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none transition",
                          isDark
                            ? "border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
                            : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                        )}
                      />
                    </div>
                    <div>
                      <label htmlFor="proxy-port" className="block text-sm font-medium">
                        Port
                      </label>
                      <input
                        id="proxy-port"
                        type="text"
                        value={proxyPort}
                        onChange={(e) => setProxyPort(e.target.value)}
                        placeholder="8080"
                        className={clsx(
                          "mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none transition",
                          isDark
                            ? "border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500"
                            : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className={clsx("mt-2 flex justify-end border-t pt-6", isDark ? "border-zinc-800" : "border-slate-200")}>
          <button
            onClick={handleSave}
            className={clsx(
              "rounded-lg px-5 py-2 text-sm font-semibold transition",
              isDark
                ? "bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700"
                : "bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800"
            )}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
