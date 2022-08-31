import { defineStore, Store, MutationType } from "pinia";

// ============================================================
// In Renderer World
// ============================================================

export class RendererStateStore {
  commChannel: BroadcastChannel;
  logState: Store;
  viewState: Store;

  constructor() {
    this.commChannel = new BroadcastChannel("state-store");

    this.logState = RendererStateStore.useLogState();
    this.viewState = RendererStateStore.useViewState();

    this.subscribe(this.logState);
    this.subscribe(this.viewState);

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
      console.log(mutation);
      try {
        if (mutation.type === MutationType.direct) {
          // @ts-ignore
          this.commChannel.postMessage({
            key: `${mutation.storeId}.${mutation.events.key}`,
            // @ts-ignore
            value: mutation.events.newValue,
          });
        }
      } catch (e) {
        console.error(e);
      }
    });
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
        isModalShown: false,
        isEditViewShown: false,
        isPreferenceViewShown: false,
        isFeedEditViewShown: false,
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
  logState: Record<string, State>;
  viewState: Record<string, State>;

  constructor() {
    this.commChannel = new BroadcastChannel("state-store");

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
    };

    this.commChannel.onmessage = (event) => {
      const { key, value } = event.data;
      console.log(event.data);
      getObj(this, key).value_ = value;
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
  }
}

export function getObj(obj: any, dest: string) {
  return dest.split(".").reduce((a, b) => a[b], obj);
}
