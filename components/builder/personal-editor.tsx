"use client";

import { useState } from "react";
import {
  User, Briefcase, Mail, Phone, MapPin, Link2, FolderGit2, Globe,
  Image as ImageIcon, type LucideIcon,
} from "lucide-react";
import type { PersonalInfo } from "@/types";
import { FloatingField, validatePersonalField } from "./floating-field";

type FieldKey = keyof PersonalInfo;

type FieldDef = {
  key: FieldKey;
  label: string;
  icon: LucideIcon;
  type?: string;
  full?: boolean;
  autoComplete?: string;
};

const FIELDS: FieldDef[] = [
  { key: "fullName", label: "Full name", icon: User, full: true, autoComplete: "name" },
  { key: "title", label: "Professional title", icon: Briefcase, full: true },
  { key: "email", label: "Email", icon: Mail, type: "email", autoComplete: "email" },
  { key: "phone", label: "Phone", icon: Phone, type: "tel", autoComplete: "tel" },
  { key: "location", label: "Location", icon: MapPin },
  { key: "linkedin", label: "LinkedIn", icon: Link2 },
  { key: "github", label: "GitHub", icon: FolderGit2 },
  { key: "portfolio", label: "Portfolio", icon: Globe },
  { key: "website", label: "Website", icon: Globe },
  { key: "photo", label: "Photo URL", icon: ImageIcon, full: true },
];

export function PersonalEditor({
  value,
  onChange,
}: {
  value: PersonalInfo;
  onChange: (p: PersonalInfo) => void;
}) {
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});

  const markTouched = (key: FieldKey) => setTouched((t) => ({ ...t, [key]: true }));

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {FIELDS.map((f) => {
        const error = validatePersonalField(f.key, value[f.key]);
        const isTouched = touched[f.key];
        const status = error
          ? "invalid"
          : isTouched && value[f.key]
            ? "valid"
            : ("idle" as const);

        return (
          <FloatingField
            key={f.key}
            className={f.full ? "sm:col-span-2" : undefined}
            label={f.label}
            icon={f.icon}
            type={f.type}
            autoComplete={f.autoComplete}
            value={value[f.key]}
            onChange={(v) => onChange({ ...value, [f.key]: v })}
            onBlur={() => markTouched(f.key)}
            status={status}
            error={error ?? undefined}
          />
        );
      })}
    </div>
  );
}
