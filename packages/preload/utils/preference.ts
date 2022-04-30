import path from "path";
import os from "os";
import Store from "electron-store";

export interface PreferenceStore {
  appLibFolder: string;
  deleteSourceFile: boolean;
  showSidebarCount: boolean;
  preferedTheme: "light" | "dark" | "system";
  invertColor: boolean;

  enableExportReplacement: boolean;
  exportReplacement: Array<{ from: string; to: string }>;

  useSync: boolean;
  syncCloudBackend: string;
  syncAPPID: "";
  syncAPIKey: string;
  syncEmail: string;

  syncFileStorage: string;
  webdavURL: string;
  webdavUsername: string;
  webdavPassword: string;

  allowRoutineMatch: boolean;
  lastRematchTime: number;
  rematchInterval: number;

  pdfBuiltinScraper: boolean;
  arXivScraper: boolean;
  doiScraper: boolean;
  dblpScraper: boolean;
  openreviewScraper: boolean;
  cvfScraper: boolean;
  ieeeScraper: boolean;
  ieeeAPIKey: string;
  pwcScraper: boolean;

  [Key: string]: unknown;
}

const defaultPreferences: PreferenceStore = {
  appLibFolder: path.join(os.homedir(), "Documents", "paperlib"),
  deleteSourceFile: false,
  showSidebarCount: true,
  preferedTheme: "light",
  invertColor: true,

  enableExportReplacement: true,
  exportReplacement: [],

  useSync: false,
  syncCloudBackend: "official",
  syncAPPID: "",
  syncAPIKey: "",
  syncEmail: "",

  syncFileStorage: "local",
  webdavURL: "",
  webdavUsername: "",
  webdavPassword: "",

  allowRoutineMatch: true,
  lastRematchTime: Math.round(Date.now() / 1000),
  rematchInterval: 7,

  pdfBuiltinScraper: true,
  arXivScraper: true,
  doiScraper: true,
  dblpScraper: true,
  openreviewScraper: true,
  cvfScraper: true,
  ieeeScraper: true,
  ieeeAPIKey: "",
  pwcScraper: true,
};

export class Preference {
  store: Store<PreferenceStore>;

  constructor() {
    this.store = new Store<PreferenceStore>({});
    for (const key in defaultPreferences) {
      if (!this.store.has(key)) {
        this.store.set(key, defaultPreferences[key]);
      }
    }
  }

  get(key: string) {
    if (this.store.has(key)) {
      return this.store.get(key);
    } else {
      this.set(key, defaultPreferences[key]);
      return defaultPreferences[key];
    }
  }

  set(key: string, value: unknown) {
    this.store.set(key, value);
  }
}
