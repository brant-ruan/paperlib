import { createApp } from "vue";
import Plugin from "./Plugin.vue";
import "./css/index.css";
// @ts-ignore
import { RecycleScroller } from "vue-virtual-scroller";
import { createPinia } from "pinia";
import { PluginRendererStateStore } from "../../state/appstate";

const pinia = createPinia();

const plugin = createApp(Plugin);
plugin.use(pinia);

const pluginRendererStateStore = new PluginRendererStateStore();

plugin.component("RecycleScroller", RecycleScroller);

plugin.mount("#plugin");
