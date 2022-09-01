<script setup lang="ts">
import { ref, Ref, watch } from "vue";

import {
  PaperEntity,
  PaperEntityPlaceholder,
} from "../../../../preload/models/PaperEntity";
import { PaperEntityDraft } from "../../../../preload/models/PaperEntityDraft";
import { FeedEntity } from "../../../../preload/models/FeedEntity";
import { FeedEntityDraft } from "../../../../preload/models/FeedEntityDraft";
import WindowMenuBar from "./menubar-view/window-menu-bar.vue";
import PaperDataView from "./data-view/paper-data-view.vue";
import FeedDataView from "./data-view/feed-data-view.vue";
import PaperDetailView from "./detail-view/paper-detail-view.vue";
import FeedDetailView from "./detail-view/feed-detail-view.vue";

import { RendererStateStore } from "../../../../state/appstate";

const props = defineProps({
  entities: Array as () => PaperEntity[],
  feedEntities: Array as () => FeedEntity[],
  showMainYear: Boolean,
  showMainPublication: Boolean,
  showMainPubType: Boolean,
  showMainRating: Boolean,
  showMainFlag: Boolean,
  showMainTags: Boolean,
  showMainFolders: Boolean,
  showMainNote: Boolean,
});

const viewState = RendererStateStore.useViewState();
const bufferState = RendererStateStore.useBufferState();
const dbState = RendererStateStore.useDBState();
const selectionState = RendererStateStore.useSelectionState();

const selectedEntities: Ref<PaperEntity[]> = ref([]);
const selectedFeedEntities: Ref<FeedEntity[]> = ref([]);

const feedEntityAddingStatus = ref(0); // 0: not adding, 1: adding, 2: added

const searchInputFocus = ref(false);

const openSelectedEntities = () => {
  if (viewState.contentType === "library") {
    selectedEntities.value.forEach((entity) => {
      window.appInteractor.open(entity.mainURL);
    });
  } else {
    selectedFeedEntities.value.forEach((entity) => {
      window.appInteractor.open(entity.mainURL);
    });
  }
};

const showInFinderSelectedEntities = () => {
  if (viewState.contentType === "library") {
    selectedEntities.value.forEach((entity) => {
      window.appInteractor.showInFinder(entity.mainURL);
    });
  }
};

const previewSelectedEntities = () => {
  if (viewState.contentType === "library") {
    window.appInteractor.preview(selectedEntities.value[0].mainURL);
  }
};

const reloadSelectedEntities = () => {
  if (viewState.contentType === "library") {
    selectedEntities.value = [];
    selectionState.selectedIndex.forEach((index) => {
      selectedEntities.value.push(props.entities![index]);
    });
    selectionState.selectedIds = selectedEntities.value.map(
      (entity) => entity.id
    );
  } else {
    feedEntityAddingStatus.value = 0;
    selectedFeedEntities.value = [];
    selectionState.selectedIndex.forEach((index) => {
      selectedFeedEntities.value.push(props.feedEntities![index]);
    });
    selectionState.selectedIds = selectedFeedEntities.value.map(
      (entity) => entity.id
    );
  }
};

const clearSelected = () => {
  selectionState.selectedIndex = [];
  selectionState.selectedIds = [];
  selectedEntities.value = [];
  selectedFeedEntities.value = [];
};

const scrapeSelectedEntities = () => {
  if (viewState.contentType === "library") {
    const entityDrafts = selectedEntities.value.map((entity) => {
      const entityDraft = new PaperEntityDraft();
      entityDraft.initialize(entity);
      return entityDraft;
    });
    void window.entityInteractor.scrape(JSON.stringify(entityDrafts));
  }
};

const scrapeSelectedEntitiesFrom = (scraperName: string) => {
  if (viewState.contentType === "library") {
    const entityDrafts = selectedEntities.value.map((entity) => {
      const entityDraft = new PaperEntityDraft();
      entityDraft.initialize(entity);
      return entityDraft;
    });
    void window.entityInteractor.scrapeFrom(
      JSON.stringify(entityDrafts),
      scraperName
    );
  }
};

const deleteSelectedEntities = () => {
  if (viewState.contentType === "library") {
    viewState.isModalShown = true;
  }
};

const editSelectedEntities = () => {
  if (viewState.contentType === "library") {
    const entityDraft = new PaperEntityDraft();
    entityDraft.initialize(selectedEntities.value[0]);
    bufferState.editingEntityDraft = entityDraft;
    viewState.isEditViewShown = true;
  }
};

const flagSelectedEntities = () => {
  if (viewState.contentType === "library") {
    const entityDrafts = selectedEntities.value.map((entity) => {
      const entityDraft = new PaperEntityDraft();
      entityDraft.initialize(entity);
      entityDraft.flag = !entityDraft.flag;
      return entityDraft;
    });

    void window.entityInteractor.update(JSON.stringify(entityDrafts));
  }
};

const exportSelectedEntities = (format: string) => {
  if (viewState.contentType === "library") {
    window.entityInteractor.export(
      JSON.stringify(selectedEntities.value),
      format
    );
  }
};

const addSelectedFeedEntities = async () => {
  if (viewState.contentType === "feed") {
    feedEntityAddingStatus.value = 1;
    const feedEntityDrafts = selectedFeedEntities.value.map((entity) => {
      const feedEntityDraft = new FeedEntityDraft();
      feedEntityDraft.initialize(entity);
      return feedEntityDraft;
    });
    await window.feedInteractor.addFeedEntities(
      JSON.stringify(feedEntityDrafts)
    );
    feedEntityAddingStatus.value = 2;
  }
};

const readSelectedFeedEntities = (read: boolean | null, clear = false) => {
  if (viewState.contentType === "feed") {
    const feedEntityDrafts = selectedFeedEntities.value
      .map((feedEntity) => {
        const feedEntityDraft = new FeedEntityDraft();
        feedEntityDraft.initialize(feedEntity);
        if (feedEntityDraft.read !== read) {
          feedEntityDraft.read = !feedEntityDraft.read;
          return feedEntityDraft;
        } else {
          return null;
        }
      })
      .filter((feedEntityDraft) => feedEntityDraft !== null);
    if (clear) {
      clearSelected();
    }
    void window.feedInteractor.updateFeedEntities(
      JSON.stringify(feedEntityDrafts)
    );
  }
};

const switchViewType = (viewType: string) => {
  viewState.viewType = viewType;
  window.appInteractor.updatePreference("mainviewType", viewType);
};

const switchSortBy = (key: string) => {
  viewState.sortBy = key;
  window.appInteractor.updatePreference("mainviewSortBy", key);
};

const switchSortOrder = (order: string) => {
  viewState.sortOrder = order;
  window.appInteractor.updatePreference("mainviewSortOrder", order);
};

const onMenuButtonClicked = (command: string) => {
  switch (command) {
    case "rescrape":
      scrapeSelectedEntities();
      break;
    case "delete":
      deleteSelectedEntities();
      break;
    case "edit":
      editSelectedEntities();
      break;
    case "flag":
      flagSelectedEntities();
      break;
    case "list-view":
      switchViewType("list");
      break;
    case "table-view":
      switchViewType("table");
      break;
    case "sort-by-title":
    case "sort-by-authors":
    case "sort-by-addTime":
    case "sort-by-publication":
    case "sort-by-pubTime":
      switchSortBy(command.replaceAll("sort-by-", ""));
      break;
    case "sort-order-asce":
    case "sort-order-desc":
      switchSortOrder(command.replaceAll("sort-order-", ""));
      break;
    case "preference":
      viewState.isPreferenceViewShown = true;
      break;
  }
};

// ========================================================
// Register Context Menu

window.appInteractor.registerMainSignal("data-context-menu-edit", () => {
  editSelectedEntities();
});

window.appInteractor.registerMainSignal("data-context-menu-flag", () => {
  flagSelectedEntities();
});

window.appInteractor.registerMainSignal("data-context-menu-delete", () => {
  deleteSelectedEntities();
});

window.appInteractor.registerMainSignal("data-context-menu-scrape", () => {
  scrapeSelectedEntities();
});

window.appInteractor.registerMainSignal(
  "data-context-menu-scrape-from",
  (args) => {
    scrapeSelectedEntitiesFrom(args[0]);
  }
);

window.appInteractor.registerMainSignal("data-context-menu-open", () => {
  openSelectedEntities();
});

window.appInteractor.registerMainSignal(
  "data-context-menu-showinfinder",
  () => {
    showInFinderSelectedEntities();
  }
);

window.appInteractor.registerMainSignal(
  "data-context-menu-export-bibtex",
  () => {
    exportSelectedEntities("BibTex");
  }
);

window.appInteractor.registerMainSignal(
  "data-context-menu-export-bibtex-key",
  () => {
    exportSelectedEntities("BibTex-Key");
  }
);

window.appInteractor.registerMainSignal(
  "data-context-menu-export-plain",
  () => {
    exportSelectedEntities("PlainText");
  }
);

window.appInteractor.registerMainSignal("feed-data-context-menu-add", () => {
  addSelectedFeedEntities();
});

window.appInteractor.registerMainSignal("feed-data-context-menu-read", () => {
  readSelectedFeedEntities(null);
});

// ========================================================
// Register Shortcut
window.appInteractor.registerMainSignal("shortcut-Preference", () => {
  viewState.isPreferenceViewShown = true;
});

window.appInteractor.registerMainSignal("shortcut-Enter", () => {
  if (
    !searchInputFocus.value &&
    (selectedEntities.value.length >= 1 ||
      selectedFeedEntities.value.length >= 1) &&
    !viewState.isModalShown &&
    !viewState.isEditViewShown &&
    !viewState.isPreferenceViewShown
  ) {
    openSelectedEntities();
  }
});

window.appInteractor.registerMainSignal("shortcut-Space", () => {
  if (
    !searchInputFocus.value &&
    selectedEntities.value.length >= 1 &&
    !viewState.isModalShown &&
    !viewState.isEditViewShown &&
    !viewState.isPreferenceViewShown
  ) {
    previewSelectedEntities();
  }
});

const onArrowDownPressed = () => {
  const currentIndex = selectionState.selectedIndex[0] || 0;
  const maxN =
    (viewState.contentType === "library"
      ? viewState.entitiesCount
      : viewState.feedEntitiesCount) - 1;

  let offset = 0;
  if (currentIndex + 1 > maxN) {
    offset = 0;
  } else {
    offset = 1;
  }

  if (!viewState.isEditViewShown && !viewState.isPreferenceViewShown) {
    selectionState.selectedIndex = [currentIndex + offset];
  }
};

const onArrowUpPressed = () => {
  const currentIndex = selectionState.selectedIndex[0] || 0;
  const maxN =
    (viewState.contentType === "library"
      ? viewState.entitiesCount
      : viewState.feedEntitiesCount) - 1;

  let offset = 0;
  if (currentIndex - 1 < 0) {
    offset = 0;
  } else {
    offset = -1;
  }

  if (!viewState.isEditViewShown && !viewState.isPreferenceViewShown) {
    selectionState.selectedIndex = [currentIndex + offset];
  }
};

const preventSpaceArrowScrollEvent = (event: KeyboardEvent) => {
  if (
    event.code === "Space" ||
    event.code === "ArrowDown" ||
    event.code === "ArrowUp"
  ) {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return true;
    }
    if (event.target == document.body) {
      event.preventDefault();
    }

    if (event.code === "ArrowDown") {
      onArrowDownPressed();
    }

    if (event.code === "ArrowUp") {
      onArrowUpPressed();
    }

    if (event.code === "Space" && selectedEntities.value.length >= 1) {
      previewSelectedEntities();
    }
  }
};

window.addEventListener("keydown", preventSpaceArrowScrollEvent, true);

window.appInteractor.registerMainSignal("shortcut-cmd-shift-c", () => {
  if (selectedEntities.value.length >= 1) {
    exportSelectedEntities("BibTex");
  }
});

window.appInteractor.registerMainSignal("shortcut-cmd-shift-k", () => {
  if (selectedEntities.value.length >= 1) {
    exportSelectedEntities("BibTex-Key");
  }
});

window.appInteractor.registerMainSignal("shortcut-cmd-e", () => {
  if (selectedEntities.value.length == 1) {
    editSelectedEntities();
  }
});

window.appInteractor.registerMainSignal("shortcut-cmd-f", () => {
  if (selectedEntities.value.length >= 1) {
    flagSelectedEntities();
  }
});

window.appInteractor.registerMainSignal("shortcut-cmd-r", () => {
  if (selectedEntities.value.length >= 1) {
    scrapeSelectedEntities();
  }
});

window.appInteractor.registerMainSignal("shortcut-arrow-up", () =>
  onArrowUpPressed()
);

window.appInteractor.registerMainSignal("shortcut-arrow-down", () =>
  onArrowDownPressed()
);

// =======================================
// Register state change
watch(
  () => selectionState.selectedIndex,
  (value) => {
    reloadSelectedEntities();
  }
);

watch(
  () => props.entities,
  (value) => {
    reloadSelectedEntities();
  }
);

watch(
  () => props.feedEntities,
  (value) => {
    reloadSelectedEntities();
  }
);

watch(
  () => viewState.contentType,
  (value) => {
    clearSelected();
  }
);

watch(
  () => viewState.sortBy,
  (value) => {
    clearSelected();
  }
);

watch(
  () => viewState.sortOrder,
  (value) => {
    clearSelected();
  }
);

watch(
  () => viewState.searchText,
  (value) => {
    clearSelected();
  }
);

watch(
  () => selectionState.selectedCategorizer,
  (value) => {
    clearSelected();
  }
);

watch(
  () => selectionState.selectedFeed,
  (value) => {
    clearSelected();
  }
);
</script>

<template>
  <div class="grow flex flex-col h-screen bg-white dark:bg-neutral-800">
    <WindowMenuBar
      class="flex-none"
      @click="onMenuButtonClicked"
      :sortBy="viewState.sortBy"
      :sortOrder="viewState.sortOrder"
      :disableSingleBtn="selectedEntities.length !== 1"
      :disableMultiBtn="selectedEntities.length === 0"
      @input-focus="searchInputFocus = true"
      @input-unfocus="searchInputFocus = false"
    />

    <div class="grow flex divide-x dark:divide-neutral-700">
      <PaperDataView
        :entities="entities"
        :sortBy="viewState.sortBy"
        :sortOrder="viewState.sortOrder"
        :show-main-year="showMainYear"
        :show-main-publication="showMainPublication"
        :show-main-pub-type="showMainPubType"
        :show-main-flag="showMainFlag"
        :show-main-tags="showMainTags"
        :show-main-folders="showMainFolders"
        :show-main-rating="showMainRating"
        :show-main-note="showMainNote"
        v-if="viewState.contentType === 'library'"
      />
      <FeedDataView
        :entities="feedEntities"
        :sortBy="viewState.sortBy"
        :sortOrder="viewState.sortOrder"
        :show-main-year="showMainYear"
        :show-main-publication="showMainPublication"
        :show-main-pub-type="showMainPubType"
        v-if="viewState.contentType === 'feed'"
      />
      <PaperDetailView
        :entity="
          selectedEntities.length === 1
            ? selectedEntities[0]
            : PaperEntityPlaceholder
        "
        v-show="selectedEntities.length === 1"
        v-if="viewState.contentType === 'library'"
      />
      <FeedDetailView
        :feedEntity="
          selectedFeedEntities.length === 1 ? selectedFeedEntities[0] : null
        "
        :feedEntityAddingStatus="feedEntityAddingStatus"
        v-show="selectedFeedEntities.length === 1"
        v-if="viewState.contentType === 'feed'"
        @add-clicked="addSelectedFeedEntities"
        @read-timeout="readSelectedFeedEntities(true)"
        @read-timeout-in-unread="readSelectedFeedEntities(true, true)"
      />
    </div>
  </div>
</template>
