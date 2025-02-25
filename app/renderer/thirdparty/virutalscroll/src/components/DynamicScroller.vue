<template>
  <RecycleScroller
    ref="scroller"
    :items="itemsWithSize"
    :min-item-size="minItemSize"
    :direction="direction"
    key-field="id"
    v-bind="$attrs"
    @resize="onScrollerResize"
    @visible="onScrollerVisible"
  >
    <template #default="{ item: itemWithSize, index, active }">
      <slot
        v-bind="{
          item: itemWithSize.item,
          index,
          active,
          itemWithSize,
        }"
      />
    </template>
    <template #before>
      <slot name="before" />
    </template>
    <template #after>
      <slot name="after" />
    </template>
  </RecycleScroller>
</template>

<script lang="ts">
// @ts-nocheck
import mitt from "mitt";
import RecycleScroller from "./RecycleScroller.vue";
import { props, simpleArray } from "./common";

export default {
  name: "DynamicScroller",

  components: {
    RecycleScroller,
  },

  provide() {
    if (typeof ResizeObserver !== "undefined") {
      this.$_resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target) {
            const event = new CustomEvent("resize", {
              detail: {
                contentRect: entry.contentRect,
              },
            });
            entry.target.dispatchEvent(event);
          }
        }
      });
    }

    return {
      vscrollData: this.vscrollData,
      vscrollParent: this,
      vscrollResizeObserver: this.$_resizeObserver,
    };
  },

  inheritAttrs: false,

  props: {
    ...props,

    minItemSize: {
      type: [Number, String],
      required: true,
    },
  },

  emits: ["resize", "visible"],

  data() {
    return {
      vscrollData: {
        active: true,
        sizes: {},
        validSizes: {},
        keyField: this.keyField,
        simpleArray: false,
      },
    };
  },

  computed: {
    simpleArray,

    itemsWithSize() {
      const result = [];
      const { items, keyField, simpleArray } = this;
      const sizes = this.vscrollData.sizes;
      for (let i = 0; i < items.length; i++) {
        const item = JSON.parse(JSON.stringify(items[i]));
        const id = simpleArray ? i : item[keyField];
        let size = sizes[id];
        if (typeof size === "undefined" && !this.$_undefinedMap[id]) {
          size = 0;
        }
        result.push({
          item,
          id,
          size,
        });
      }
      return result;
    },
  },

  watch: {
    items() {
      this.forceUpdate(false);
    },

    simpleArray: {
      handler(value) {
        this.vscrollData.simpleArray = value;
      },
      immediate: true,
    },

    direction(value) {
      this.forceUpdate(true);
    },
  },

  created() {
    this.$_updates = [];
    this.$_undefinedSizes = 0;
    this.$_undefinedMap = {};
    this.$_events = mitt();
  },

  activated() {
    this.vscrollData.active = true;
  },

  deactivated() {
    this.vscrollData.active = false;
  },

  unmounted() {
    this.$_events.all.clear();
  },

  methods: {
    onScrollerResize() {
      const scroller = this.$refs.scroller;
      if (scroller) {
        this.forceUpdate();
      }
      this.$emit("resize");
    },

    onScrollerVisible() {
      this.$_events.emit("vscroll:update", { force: false });
      this.$emit("visible");
    },

    forceUpdate(clear = true) {
      if (clear || this.simpleArray) {
        this.vscrollData.validSizes = {};
      }
      this.$_events.emit("vscroll:update", { force: true });
    },

    scrollToItem(index) {
      const scroller = this.$refs.scroller;
      if (scroller) scroller.scrollToItem(index);
    },

    getItemSize(item, index = undefined) {
      const id = this.simpleArray
        ? index != null
          ? index
          : this.items.indexOf(item)
        : item[this.keyField];
      return this.vscrollData.sizes[id] || 0;
    },

    scrollToBottom() {
      if (this.$_scrollingToBottom) return;
      this.$_scrollingToBottom = true;
      const el = this.$el;
      // Item is inserted to the DOM
      this.$nextTick(() => {
        el.scrollTop = el.scrollHeight + 5000;
        // Item sizes are computed
        const cb = () => {
          el.scrollTop = el.scrollHeight + 5000;
          requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight + 5000;
            if (this.$_undefinedSizes === 0) {
              this.$_scrollingToBottom = false;
            } else {
              requestAnimationFrame(cb);
            }
          });
        };
        requestAnimationFrame(cb);
      });
    },
  },
};
</script>
