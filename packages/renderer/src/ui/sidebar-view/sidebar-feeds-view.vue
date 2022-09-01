<script setup lang="ts">
import { ref, watch } from "vue";

import {
  BIconRss,
  BIconAppIndicator,
  BIconBroadcast,
} from "bootstrap-icons-vue";

import SectionItem from "./components/section-item.vue";
import CollopseGroup from "./components/collopse-group.vue";
import { Feed } from "../../../../preload/models/Feed";
import { FeedDraft } from "../../../../preload/models/FeedDraft";
import { RendererStateStore } from "../../../../state/appstate";

const props = defineProps({
  feeds: Array as () => Array<Feed>,
  showSidebarCount: Boolean,
  compact: Boolean,
});

const viewState = RendererStateStore.useViewState();
const selectionState = RendererStateStore.useSelectionState();
const bufferState = RendererStateStore.useBufferState();

const isSpinnerShown = ref(false);

const onSelectFeed = (feed: string) => {
  selectionState.selectedFeed = feed;
};

const onAddNewFeedClicked = () => {
  bufferState.editingFeedDraft = new FeedDraft(true);
  viewState.isFeedEditViewShown = true;
};

const deleteFeed = (feed: string) => {
  window.feedInteractor.delete(feed.replaceAll("feed-", ""));
};

const refreshFeed = (feed: string) => {
  window.feedInteractor.refresh(feed);
};

const colorizeFeed = (feed: string, color: string) => {
  window.feedInteractor.colorizeFeed(feed.replaceAll("feed-", ""), color);
};

const onItemRightClicked = (event: MouseEvent, feed: string) => {
  window.appInteractor.showContextMenu("show-sidebar-context-menu", feed);
};

window.appInteractor.registerMainSignal(
  "sidebar-context-menu-delete",
  (args) => {
    deleteFeed(args);
    onSelectFeed("feed-all");
  }
);

window.appInteractor.registerMainSignal(
  "sidebar-context-menu-feed-refresh",
  (args) => {
    refreshFeed(args.replaceAll("feed-", ""));
  }
);

window.appInteractor.registerMainSignal(
  "sidebar-context-menu-color",
  (args) => {
    colorizeFeed(args[0], args[1]);
  }
);

watch(
  () => viewState.processingQueueCount,
  (value) => {
    if (value > 0) {
      isSpinnerShown.value = true;
    } else {
      isSpinnerShown.value = false;
    }
  }
);
</script>

<template>
  <div>
    <SectionItem
      name="All Feeds"
      :count="viewState.feedEntitiesCount"
      :with-counter="showSidebarCount"
      :with-spinner="isSpinnerShown"
      :compact="compact"
      :active="selectionState.selectedFeed === 'feed-all'"
      @click="onSelectFeed('feed-all')"
    >
      <BIconRss class="text-sm my-auto text-blue-500 min-w-[1em]" />
    </SectionItem>
    <SectionItem
      name="Unread"
      :with-counter="false"
      :with-spinner="false"
      :compact="compact"
      :active="selectionState.selectedFeed === 'feed-unread'"
      @click="onSelectFeed('feed-unread')"
    >
      <BIconAppIndicator class="text-sm my-auto text-blue-500 min-w-[1em]" />
    </SectionItem>
    <CollopseGroup title="Feeds" :with-add="true" @add="onAddNewFeedClicked">
      <SectionItem
        :name="feed.name"
        :count="feed.count"
        :with-counter="showSidebarCount"
        :with-spinner="false"
        :compact="compact"
        v-for="feed in feeds"
        :active="selectionState.selectedFeed === `feed-${feed.name}`"
        @click="onSelectFeed(`feed-${feed.name}`)"
        @contextmenu="(e: MouseEvent) => {onItemRightClicked(e, `feed-${feed.name}`)}"
      >
        <BIconBroadcast
          class="text-sm my-auto min-w-[1em]"
          :class="{
            'text-blue-500': feed.color === 'blue' || feed.color === null,
            'text-red-500': feed.color === 'red',
            'text-green-500': feed.color === 'green',
            'text-yellow-500': feed.color === 'yellow',
          }"
        />
      </SectionItem>
    </CollopseGroup>
  </div>
</template>
