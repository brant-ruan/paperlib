import { defineStore, Store, MutationType } from "pinia";
import { ObjectId } from "bson";

import { PaperEntityDraft } from "../preload/models/PaperEntityDraft";
import { FeedDraft } from "../preload/models/FeedDraft";
import { Preference } from "../preload/utils/preference";

// ============================================================
// In Renderer World
// ============================================================

export class RendererStateStore {
  commChannel: BroadcastChannel;
  logState: Store;
  viewState: Store;
  bufferState: Store;
  dbState: Store;
  selectionState: Store;

  constructor() {
    this.commChannel = new BroadcastChannel("state-store");

    this.logState = RendererStateStore.useLogState();
    this.viewState = RendererStateStore.useViewState();
    this.bufferState = RendererStateStore.useBufferState();
    this.dbState = RendererStateStore.useDBState();
    this.selectionState = RendererStateStore.useSelectionState();

    this.subscribe(this.logState);
    this.subscribe(this.viewState);
    this.subscribe(this.bufferState);
    this.subscribe(this.dbState);
    this.subscribe(this.selectionState);

    this.commChannel.onmessage = (event) => {
      const { key, value } = event.data as { key: string; value: any };
      const [storeKey, stateKey] = key.split(".");

      try {
        let obj: Record<string, any> = {};
        obj[stateKey as keyof typeof obj] = JSON.parse(value);
        // @ts-ignore
        this[storeKey].$patch(obj);
      } catch (e) {
        console.error(e);
      }
    };

    this.initFromPreload(this.viewState);
    this.initFromPreload(this.dbState);
  }

  subscribe(store: Store) {
    store.$subscribe((mutation, state) => {
      try {
        if (mutation.type === MutationType.direct) {
          // @ts-ignore
          this.commChannel.postMessage({
            op: "update",
            key: `${mutation.storeId}.${mutation.events.key}`,
            // @ts-ignore
            value: JSON.stringify(mutation.events.newValue),
          });
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  initFromPreload(store: Store) {
    try {
      // @ts-ignore
      this.commChannel.postMessage({
        op: "init",
        key: store.$id,
        value: "",
      });
    } catch (e) {
      console.error(e);
    }
  }

  static useLogState = defineStore("logState", {
    state: () => {
      return {
        processLog: "",
        alertLog: "",
        infoLog: "",
      };
    },
  });

  static useViewState = defineStore("viewState", {
    state: () => {
      return {
        // View Shown
        isModalShown: false,
        isEditViewShown: false,
        isPreferenceViewShown: false,
        isFeedEditViewShown: false,

        // Count
        processingQueueCount: 0,
        entitiesCount: 0,
        feedEntitiesCount: 0,

        //
        sortBy: "addTime",
        sortOrder: "desc",
        viewType: "list",
        contentType: "library",
        searchText: "",
        searchMode: "general",

        // Update Signal
        preferenceUpdated: "",
        realmReinited: "",
        storageBackendReinited: "",
        renderRequired: "",

        //
        syncFileStorageAvaliable: false,
      };
    },
  });

  static useBufferState = defineStore("bufferState", {
    state: () => {
      return {
        editingEntityDraft: new PaperEntityDraft(false),
        editingFeedDraft: new FeedDraft(false),
      };
    },
  });

  static useDBState = defineStore("dbState", {
    state: () => {
      return {
        entitiesUpdated: "",
        tagsUpdated: "",
        foldersUpdated: "",
        feedsUpdated: "",
        feedEntitiesUpdated: "",
        defaultPath: "",
      };
    },
  });

  static useSelectionState = defineStore("selectionState", {
    state: () => {
      return {
        selectedIndex: [] as number[],
        selectedIds: [] as (string | ObjectId)[],
        selectedCategorizer: "lib-all",
        selectedFeed: "feed-all",
        dragedIds: [] as (string | ObjectId)[],
        pluginLinkedFolder: "",
        editingCategorizer: "",
      };
    },
  });
}

export class PluginRendererStateStore {
  commChannel: BroadcastChannel;
  selectionState: Store;

  constructor() {
    this.commChannel = new BroadcastChannel("plugin-state-store");

    this.selectionState = RendererStateStore.useSelectionState();

    this.subscribe(this.selectionState);

    this.commChannel.onmessage = (event) => {
      const { key, value } = event.data as { key: string; value: any };
      const [storeKey, stateKey] = key.split(".");

      try {
        let obj: Record<string, any> = {};
        obj[stateKey as keyof typeof obj] = JSON.parse(value);
        // @ts-ignore
        this[storeKey].$patch(obj);
      } catch (e) {
        console.error(e);
      }
    };
  }

  subscribe(store: Store) {
    store.$subscribe((mutation, state) => {
      try {
        if (mutation.type === MutationType.direct) {
          // @ts-ignore
          this.commChannel.postMessage({
            op: "update",
            key: `${mutation.storeId}.${mutation.events.key}`,
            // @ts-ignore
            value: JSON.stringify(mutation.events.newValue),
          });
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  initFromPreload(store: Store) {
    try {
      // @ts-ignore
      this.commChannel.postMessage({
        op: "init",
        key: store.$id,
        value: "",
      });
    } catch (e) {
      console.error(e);
    }
  }

  static useSelectionState = defineStore("selectionState", {
    state: () => {
      return {
        selectedIndex: [] as number[],
        selectedIds: [] as (string | ObjectId)[],
        selectedCategorizer: "lib-all",
        selectedFeed: "feed-all",
        dragedIds: [] as (string | ObjectId)[],
        pluginLinkedFolder: "",
        editingCategorizer: "",
      };
    },
  });
}

// ============================================================
// In Preload World
// ============================================================

class State {
  private key: string;
  private _value: any;
  private publishChannel: BroadcastChannel | null;
  private checkDuplicated: boolean;

  constructor(
    key: string,
    value: any,
    publishChannel: BroadcastChannel | null,
    checkDuplicated: boolean = true
  ) {
    this.key = key;
    this._value = value;
    this.publishChannel = publishChannel;
    this.checkDuplicated = checkDuplicated;
  }

  public get value() {
    return this._value;
  }

  public set value(theValue: any) {
    let changed;
    if (this.checkDuplicated) {
      changed = this._value !== theValue;
    } else {
      changed = true;
    }
    this._value = theValue;
    if (this.publishChannel && changed) {
      this.publishChannel.postMessage({
        key: this.key,
        value: JSON.stringify(this._value),
      });
    }
  }
}

export class PreloadStateStore {
  commChannel: BroadcastChannel;
  preference: Preference;

  registerHandler: Record<string, (value: any) => void>;

  logState: Record<string, State>;
  viewState: Record<string, State>;
  bufferState: Record<string, State>;
  dbState: Record<string, State>;
  selectionState: Record<string, State>;

  constructor(preference: Preference) {
    const electron = require("electron");
    this.commChannel = new BroadcastChannel("state-store");
    this.preference = preference;

    this.registerHandler = {};

    this.logState = {
      processLog: new State("logState.processLog", "", this.commChannel, false),
      alertLog: new State("logState.alertLog", "", this.commChannel, false),
      infoLog: new State("logState.infoLog", "", this.commChannel, false),
    };
    this.viewState = {
      isModalShown: new State(
        "viewState.isModalShown",
        false,
        this.commChannel
      ),
      isEditViewShown: new State(
        "viewState.isEditViewShown",
        false,
        this.commChannel
      ),
      isPreferenceViewShown: new State(
        "viewState.isPreferenceViewShown",
        false,
        this.commChannel
      ),
      isFeedEditViewShown: new State(
        "viewState.isFeedEditViewShown",
        false,
        this.commChannel
      ),

      processingQueueCount: new State(
        "viewState.processingQueueCount",
        0,
        this.commChannel,
        false
      ),
      entitiesCount: new State("viewState.entitiesCount", 0, this.commChannel),
      feedEntitiesCount: new State(
        "viewState.feedEntitiesCount",
        0,
        this.commChannel
      ),

      sortBy: new State(
        "viewState.sortBy",
        preference.get("mainviewSortBy") as string,
        this.commChannel
      ),
      sortOrder: new State(
        "viewState.sortOrder",
        preference.get("mainviewSortOrder") as string,
        this.commChannel
      ),
      viewType: new State(
        "viewState.viewType",
        preference.get("mainviewType") as string,
        this.commChannel
      ),
      contentType: new State(
        "viewState.contentType",
        "library",
        this.commChannel
      ),
      searchText: new State("viewState.searchText", "", this.commChannel),
      searchMode: new State(
        "viewState.searchMode",
        "general",
        this.commChannel
      ),

      preferenceUpdated: new State(
        "viewState.preferenceUpdated",
        `${Date.now()}`,
        this.commChannel
      ),
      realmReinited: new State(
        "viewState.realmReinited",
        `${Date.now()}`,
        this.commChannel
      ),
      storageBackendReinited: new State(
        "viewState.storageBackendReinited",
        `${Date.now()}`,
        this.commChannel
      ),
      renderRequired: new State(
        "viewState.renderRequired",
        `${Date.now()}`,
        this.commChannel
      ),

      syncFileStorageAvaliable: new State(
        "viewState.syncFileStorageAvaliable",
        false,
        this.commChannel
      ),
    };
    this.bufferState = {
      editingEntityDraft: new State(
        "bufferState.editingEntityDraft",
        new PaperEntityDraft(false),
        this.commChannel
      ),
      editingFeedDraft: new State(
        "bufferState.editingFeedDraft",
        new FeedDraft(false),
        this.commChannel
      ),
    };
    this.dbState = {
      entitiesUpdated: new State(
        "dbState.entitiesUpdated",
        `${Date.now()}`,
        this.commChannel
      ),
      tagsUpdated: new State(
        "dbState.tagsUpdated",
        `${Date.now()}`,
        this.commChannel
      ),
      foldersUpdated: new State(
        "dbState.foldersUpdated",
        `${Date.now()}`,
        this.commChannel
      ),
      feedsUpdated: new State(
        "dbState.feedsUpdated",
        `${Date.now()}`,
        this.commChannel
      ),
      feedEntitiesUpdated: new State(
        "dbState.feedEntitiesUpdated",
        `${Date.now()}`,
        this.commChannel
      ),

      defaultPath: new State(
        "dbState.defaultPath",
        electron.ipcRenderer.sendSync("userData"),
        this.commChannel
      ),
    };
    this.selectionState = {
      selectedIndex: new State(
        "selectionState.selectedIndex",
        [] as number[],
        this.commChannel
      ),
      selectedIds: new State(
        "selectionState.selectedIds",
        [] as (string | ObjectId)[],
        this.commChannel
      ),
      selectedCategorizer: new State(
        "selectionState.selectedCategorizer",
        "lib-all",
        this.commChannel
      ),
      selectedFeed: new State(
        "selectionState.selectedFeed",
        "feed-all",
        this.commChannel
      ),
      dragedIds: new State(
        "selectionState.dragedIds",
        [] as (string | ObjectId)[],
        this.commChannel
      ),
      pluginLinkedFolder: new State(
        "selectionState.pluginLinkedFolder",
        "",
        this.commChannel
      ),
      editingCategorizer: new State(
        "selectionState.editingCategorizer",
        "",
        this.commChannel
      ),
    };

    this.commChannel.onmessage = (event) => {
      const { op, key, value } = event.data;
      if (op === "init") {
        for (const storeKey in getObj(this, key)) {
          this.commChannel.postMessage({
            key: `${key}.${storeKey}`,
            value: JSON.stringify(getObj(this, key)[storeKey].value),
          });
        }
      } else if (op === "update") {
        getObj(this, key).value_ = JSON.parse(value);
        if (this.registerHandler[key]) {
          this.registerHandler[key](JSON.parse(value));
        }
      }
    };
  }

  set(key: string, value: any, publish = true) {
    getObj(this, key).value_ = value;
    if (publish) {
      this.commChannel.postMessage({
        key: key,
        value: JSON.stringify(value),
      });
    }
    if (this.registerHandler[key]) {
      this.registerHandler[key](value);
    }
  }

  register(key: string, callback: (value: any) => void) {
    this.registerHandler[key] = callback;
  }
}

export class PluginPreloadStateStore {
  commChannel: BroadcastChannel;
  preference: Preference;

  registerHandler: Record<string, (value: any) => void>;

  selectionState: Record<string, State>;

  constructor(preference: Preference) {
    this.commChannel = new BroadcastChannel("plugin-state-store");
    this.preference = preference;

    this.registerHandler = {};

    this.selectionState = {
      pluginLinkedFolder: new State(
        "selectionState.pluginLinkedFolder",
        "",
        this.commChannel
      ),
    };

    this.commChannel.onmessage = (event) => {
      const { op, key, value } = event.data;
      if (op === "init") {
        for (const storeKey in getObj(this, key)) {
          this.commChannel.postMessage({
            key: `${key}.${storeKey}`,
            value: JSON.stringify(getObj(this, key)[storeKey].value),
          });
        }
      } else if (op === "update") {
        getObj(this, key).value_ = JSON.parse(value);
        if (this.registerHandler[key]) {
          this.registerHandler[key](JSON.parse(value));
        }
      }
    };
  }

  set(key: string, value: any, publish = true) {
    getObj(this, key).value_ = value;
    if (publish) {
      this.commChannel.postMessage({
        key: key,
        value: JSON.stringify(value),
      });
    }
    if (this.registerHandler[key]) {
      this.registerHandler[key](value);
    }
  }

  register(key: string, callback: (value: any) => void) {
    this.registerHandler[key] = callback;
  }
}

export function getObj(obj: any, dest: string) {
  return dest.split(".").reduce((a, b) => a[b], obj);
}
