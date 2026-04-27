// Component: HabitRow
// Purpose: Single habit row — 7-day toggle circles, streak, edit, delete.
import { useState } from "react";
import Modal from "../ui/Modal";
import EmojiPicker from "../ui/EmojiPicker";
import Input from "../ui/Input";
import { getDateKey } from "../../utils/dateUtils";
import { isToday } from "date-fns";
import { HABIT_ICONS } from "../../utils/constants";

const FREQUENCIES = [
  { id: "daily", label: "Every day" },
  { id: "3", label: "3× / week" },
  { id: "4", label: "4× / week" },
  { id: "5", label: "5× / week" },
];

function EditHabitModal({ habit, onSave, onClose }) {
  const [name, setName] = useState(habit.name);
  const [icon, setIcon] = useState(habit.icon);
  const [frequency, setFrequency] = useState(
    habit.frequency === "daily" ? "daily" : String(habit.frequency),
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      icon,
      frequency: frequency === "daily" ? "daily" : Number(frequency),
    });
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit Habit">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Habit name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div>
          <p
            className="text-xs font-medium uppercase tracking-wide mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Frequency
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFrequency(f.id)}
                className="py-2 rounded-xl text-sm font-medium transition-all border"
                style={
                  frequency === f.id
                    ? {
                        backgroundColor: "var(--accent)",
                        borderColor: "var(--accent)",
                        color: "white",
                      }
                    : {
                        borderColor: "var(--border)",
                        color: "var(--text-muted)",
                      }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p
            className="text-xs font-medium uppercase tracking-wide mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Icon
          </p>
          <EmojiPicker value={icon} onChange={setIcon} />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Save changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function HabitRow({
  habit,
  weekDays,
  isHabitDone,
  toggleHabitDay,
  streak,
  weeklyCount,
  onDelete,
  onEdit,
}) {
  const [editing, setEditing] = useState(false);
  const freqLabel =
    habit.frequency === "daily"
      ? "daily"
      : `${weeklyCount}/${habit.frequency}× wk`;

  return (
    <>
      <div
        className="group grid items-center gap-2 px-5 py-3 transition-colors"
        style={{ gridTemplateColumns: "1fr repeat(7, 2rem)", gap: "0.5rem" }}
        onMouseOver={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        <div className="flex items-center gap-2 min-w-0 pr-1">
          <span className="text-lg flex-shrink-0">{habit.icon}</span>
          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-medium truncate"
              style={{ color: "var(--text)" }}
            >
              {habit.name}
            </p>
            <div className="flex items-center gap-2">
              {streak > 0 && (
                <p className="text-[10px] text-amber-500">{streak}🔥</p>
              )}
              <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                {freqLabel}
              </p>
            </div>
          </div>
          {/* Edit + delete — visible on hover */}
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors"
              style={{ color: "var(--text-faint)" }}
              title="Edit habit"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(habit.id)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors"
              style={{ color: "var(--text-faint)" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseOut={(e) =>
                (e.currentTarget.style.color = "var(--text-faint)")
              }
              title="Delete habit"
            >
              ✕
            </button>
          </div>
        </div>

        {weekDays.map((day) => {
          const dateKey = getDateKey(day);
          const done = isHabitDone(habit.id, dateKey);
          const today = isToday(day);
          return (
            <button
              key={dateKey}
              onClick={() => toggleHabitDay(habit.id, dateKey)}
              className="w-7 h-7 mx-auto rounded-full border-2 flex items-center justify-center text-[10px] transition-all"
              style={
                done
                  ? {
                      backgroundColor: "var(--accent)",
                      borderColor: "var(--accent)",
                      color: "white",
                    }
                  : today
                    ? { borderColor: "var(--accent-mid)" }
                    : { borderColor: "var(--border)" }
              }
            >
              {done && "✓"}
            </button>
          );
        })}
      </div>

      {editing && (
        <EditHabitModal
          habit={habit}
          onSave={(updates) => onEdit(habit.id, updates)}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
