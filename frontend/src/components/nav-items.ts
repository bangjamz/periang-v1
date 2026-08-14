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
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/cek-status-gizi",
    label: "Cek Gizi",
    icon: faStethoscope,
    available: true,
    color: "text-sky-500",
  },
  {
    href: "/balita",
    label: "Balita",
    icon: faBaby,
    available: true,
    color: "text-pink-500",
  },
  {
    href: "/riwayat",
    label: "Riwayat",
    icon: faClockRotateLeft,
    available: true,
    color: "text-amber-500",
  },
  {
    href: "/grafik",
    label: "Grafik",
    icon: faChartLine,
    available: true,
    color: "text-emerald-500",
  },
  {
    href: "/prediksi",
    label: "Prediksi",
    icon: faShieldHeart,
    available: true,
    color: "text-violet-500",
  },
];
