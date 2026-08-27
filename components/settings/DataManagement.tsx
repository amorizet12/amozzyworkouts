"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { Download, RefreshCw, Trash2, Upload } from "lucide-react";
import { useStore } from "@/lib/store";
import { refreshApp } from "@/lib/refreshApp";

export default function DataManagement() {
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const clearAllData = useStore((s) => s.clearAllData);
  const weightUnit = useStore((s) => s.weightUnit);
  const setWeightUnit = useStore((s) => s.setWeightUnit);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amozzy-workouts-backup-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus({ type: "ok", message: "Backup downloaded." });
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importData(String(reader.result));
      setStatus(
        result.ok
          ? { type: "ok", message: "Backup imported." }
          : { type: "error", message: result.error ?? "Import failed." }
      );
    };
    reader.readAsText(file);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshApp();
  };

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-base-700/60 bg-base-900/40 p-4">
        <p className="text-[13.5px] font-semibold text-base-100">Weight unit</p>
        <div className="mt-2 flex gap-1.5">
          {(["lbs", "kg"] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => setWeightUnit(unit)}
              className={[
                "rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                weightUnit === unit
                  ? "bg-accent-400 text-base-950"
                  : "bg-base-800 text-base-400 hover:text-base-100",
              ].join(" ")}
            >
              {unit}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-base-700/60 bg-base-900/40 p-4">
        <p className="text-[13.5px] font-semibold text-base-100">Backup your log</p>
        <p className="mt-0.5 text-[12px] text-base-500">
          Everything — exercises, plans, and logged lifts — lives only in this browser's local
          storage. Export a backup file now and then, and import it to restore or move to another
          device.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg bg-accent-400 px-3 py-2 text-[12.5px] font-semibold text-base-950 hover:bg-accent-300"
          >
            <Download size={14} strokeWidth={2.5} />
            Export backup
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-1.5 rounded-lg bg-base-800 px-3 py-2 text-[12.5px] font-medium text-base-100 hover:bg-base-700"
          >
            <Upload size={14} />
            Import backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFile}
            className="hidden"
          />
        </div>
        {status && (
          <p
            className={`mt-2 text-[12px] ${
              status.type === "ok" ? "text-accent-400" : "text-red-400"
            }`}
          >
            {status.message}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-base-700/60 bg-base-900/40 p-4">
        <p className="text-[13.5px] font-semibold text-base-100">App updates</p>
        <p className="mt-0.5 text-[12px] text-base-500">
          Installed as an app, Amozzy can hang on to an older cached version. Tap this after a new
          deployment to force-fetch the latest one.
        </p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-base-800 px-3 py-2 text-[12.5px] font-medium text-base-100 hover:bg-base-700 disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh app data"}
        </button>
      </section>

      <section className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
        <p className="text-[13.5px] font-semibold text-red-400">Danger zone</p>
        <p className="mt-0.5 text-[12px] text-base-500">
          Wipes all exercises, plans, and logged lifts on this device. Export a backup first if you
          want to keep it.
        </p>
        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-base-800 px-3 py-2 text-[12.5px] font-medium text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={14} />
            Clear all data
          </button>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                clearAllData();
                setConfirmClear(false);
                setStatus({ type: "ok", message: "All data cleared." });
              }}
              className="rounded-lg bg-red-500 px-3 py-2 text-[12.5px] font-semibold text-white hover:bg-red-600"
            >
              Yes, erase everything
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="rounded-lg bg-base-800 px-3 py-2 text-[12.5px] font-medium text-base-100 hover:bg-base-700"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
