"use client";

import { useState } from "react";
import { Bookmark, ChevronDown, Compass, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { EXERCISE_LIBRARY, LibraryExercise } from "@/lib/exerciseLibraryData";
import { EQUIPMENT_LABELS, MUSCLE_GROUPS, muscleGroupColor } from "@/lib/muscleGroups";
import { MuscleGroupId } from "@/lib/types";

type View = "browse" | "favorites" | "tryLater";

export default function DiscoverExercises() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("browse");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupId>(MUSCLE_GROUPS[0].id);

  const favoriteLibraryIds = useStore((s) => s.favoriteLibraryIds);
  const tryLaterLibraryIds = useStore((s) => s.tryLaterLibraryIds);
  const toggleFavoriteLibrary = useStore((s) => s.toggleFavoriteLibrary);
  const toggleTryLaterLibrary = useStore((s) => s.toggleTryLaterLibrary);

  const listExercises: LibraryExercise[] =
    view === "browse"
      ? EXERCISE_LIBRARY.filter((e) => e.muscleGroup === muscleGroup)
      : view === "favorites"
      ? EXERCISE_LIBRARY.filter((e) => favoriteLibraryIds.includes(e.id))
      : EXERCISE_LIBRARY.filter((e) => tryLaterLibraryIds.includes(e.id));

  return (
    <div className="mb-3 rounded-xl border border-base-700/60 bg-base-900/40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3.5 py-3"
      >
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-accent-400" />
          <span className="text-[13.5px] font-medium text-base-100">Discover more exercises</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-base-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-base-700/60 p-3.5">
          <p className="mb-3 text-[11.5px] text-base-500">
            A few starter picks per muscle group, with form cues — save ones you like to
            Favorites or Try Later.
          </p>

          <div className="mb-3 flex gap-1 rounded-full bg-base-800 p-1">
            {(["browse", "favorites", "tryLater"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={[
                  "flex-1 rounded-full py-1.5 text-[11.5px] font-medium transition-colors",
                  view === v ? "bg-accent-400 text-base-950" : "text-base-400 hover:text-base-100",
                ].join(" ")}
              >
                {v === "browse"
                  ? "Browse"
                  : v === "favorites"
                  ? `Favorites (${favoriteLibraryIds.length})`
                  : `Try Later (${tryLaterLibraryIds.length})`}
              </button>
            ))}
          </div>

          {view === "browse" && (
            <div className="mb-3 flex flex-wrap gap-1">
              {MUSCLE_GROUPS.map((mg) => (
                <button
                  key={mg.id}
                  onClick={() => setMuscleGroup(mg.id)}
                  className={[
                    "rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                    muscleGroup === mg.id
                      ? "bg-accent-400 text-base-950"
                      : "bg-base-800 text-base-400 hover:text-base-100",
                  ].join(" ")}
                >
                  {mg.label}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {listExercises.length === 0 && (
              <p className="py-4 text-center text-[12.5px] text-base-500">
                {view === "favorites"
                  ? "No favorites yet — star an exercise below to save it here."
                  : view === "tryLater"
                  ? "Nothing saved for later yet."
                  : "No starter exercises for this group yet."}
              </p>
            )}
            {listExercises.map((ex) => (
              <LibraryExerciseCard
                key={ex.id}
                exercise={ex}
                isFavorite={favoriteLibraryIds.includes(ex.id)}
                isTryLater={tryLaterLibraryIds.includes(ex.id)}
                onToggleFavorite={() => toggleFavoriteLibrary(ex.id)}
                onToggleTryLater={() => toggleTryLaterLibrary(ex.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function LibraryExerciseCard({
  exercise,
  isFavorite,
  isTryLater,
  onToggleFavorite,
  onToggleTryLater,
}: {
  exercise: LibraryExercise;
  isFavorite: boolean;
  isTryLater: boolean;
  onToggleFavorite: () => void;
  onToggleTryLater: () => void;
}) {
  return (
    <div className="rounded-lg border border-base-700/60 bg-base-800/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: muscleGroupColor(exercise.muscleGroup) }}
          />
          <p className="text-[13px] font-medium text-base-100">{exercise.name}</p>
        </div>
        <span className="shrink-0 text-[10px] text-base-500">
          {EQUIPMENT_LABELS[exercise.equipment]}
        </span>
      </div>
      <p className="mt-0.5 text-[11.5px] text-base-500">{exercise.description}</p>

      <ul className="mt-2 list-disc space-y-0.5 pl-5 text-[11.5px] text-base-400">
        {exercise.tips.map((tip, i) => (
          <li key={i}>{tip}</li>
        ))}
      </ul>

      <div className="mt-2.5 flex gap-1.5">
        <button
          onClick={onToggleFavorite}
          className={[
            "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11.5px] font-medium transition-colors",
            isFavorite
              ? "bg-accent-400/15 text-accent-400"
              : "bg-base-900/60 text-base-400 hover:text-base-100",
          ].join(" ")}
        >
          <Star size={12} className={isFavorite ? "fill-current" : ""} />
          Favorite
        </button>
        <button
          onClick={onToggleTryLater}
          className={[
            "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11.5px] font-medium transition-colors",
            isTryLater
              ? "bg-accent-400/15 text-accent-400"
              : "bg-base-900/60 text-base-400 hover:text-base-100",
          ].join(" ")}
        >
          <Bookmark size={12} className={isTryLater ? "fill-current" : ""} />
          Try later
        </button>
      </div>
    </div>
  );
}
