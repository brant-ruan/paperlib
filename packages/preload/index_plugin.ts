import { contextBridge } from "electron";

import { PluginPreloadStateStore } from "../state/appstate";
import { Preference } from "./utils/preference";

import { PluginSideInteractor } from "./interactors/plugin-side-interactor";
import { createInteractorProxy } from "./utils/misc";

// ============================================================
// State and Preference
const preference = new Preference();
const stateStore = new PluginPreloadStateStore(preference);

const pluginInteractor = new PluginSideInteractor(stateStore, preference);

const pluginInteractorProxy = createInteractorProxy(pluginInteractor);

contextBridge.exposeInMainWorld("pluginInteractor", pluginInteractorProxy);
