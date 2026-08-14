import {
  faBaby,
  faChartLine,
  faClockRotateLeft,
  faShieldHeart,
  faStethoscope,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

export type NavItem = {
  href: string;
  label: string;
  icon: IconDefinition;
  available: boolean;
  color: string;
  bg: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/cek-status-gizi",
    label: "Cek Gizi",
    icon: faStethoscope,
    available: true,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/50",
  },
  {
    href: "/balita",
    label: "Balita",
    icon: faBaby,
    available: true,
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-950/50",
  },
  {
    href: "/riwayat",
    label: "Riwayat",
    icon: faClockRotateLeft,
    available: true,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
  },
  {
    href: "/grafik",
    label: "Grafik",
    icon: faChartLine,
    available: true,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
  },
  {
    href: "/prediksi",
    label: "Prediksi",
    icon: faShieldHeart,
    available: true,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/50",
  },
];
