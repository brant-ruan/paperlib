<script setup lang="ts">
import { ref, watch } from "vue";

import {
  BIconCollection,
  BIconFlag,
  BIconTag,
  BIconFolder,
  BIconFolderSymlink,
} from "bootstrap-icons-vue";

import SectionItem from "./components/section-item.vue";
import CollopseGroup from "./components/collopse-group.vue";
import {
  PaperTag,
  PaperFolder,
  Categorizers,
} from "../../../../preload/models/PaperCategorizer";
import { RendererStateStore } from "../../../../state/appstate";

const props = defineProps({
  tags: Array as () => Array<PaperTag>,
  folders: Array as () => Array<PaperFolder>,
  showSidebarCount: Boolean,
  compact: Boolean,
});

const viewState = RendererStateStore.useViewState();
const selectionState = RendererStateStore.useSelectionState();

const isSpinnerShown = ref(false);

const onSelectCategorizer = (categorizer: string) => {
  selectionState.selectedCategorizer = categorizer;
};

const deleteCategorizer = (categorizer: string) => {
  if (categorizer.startsWith("tag-")) {
    window.entityInteractor.deleteCategorizer(
      categorizer.replaceAll("tag-", ""),
      "PaperTag"
    );
  } else {
    window.entityInteractor.deleteCategorizer(
      categorizer.replaceAll("folder-", ""),
      "PaperFolder"
    );
  }
};

const colorizeCategorizer = (categorizer: string, color: string) => {
  if (categorizer.startsWith("tag-")) {
    window.entityInteractor.colorizeCategorizers(
      categorizer.replaceAll("tag-", ""),
      "PaperTag",
      color
    );
  } else {
    window.entityInteractor.colorizeCategorizers(
      categorizer.replaceAll("folder-", ""),
      "PaperFolder",
      color
    );
  }
};

const onItemRightClicked = (event: MouseEvent, categorizer: string) => {
  window.appInteractor.showContextMenu(
    "show-sidebar-context-menu",
    categorizer
  );
};

const onFileDroped = (
  categorizerName: string,
  categorizerType: Categorizers,
  filePaths: string[]
) => {
  window.entityInteractor.addToCategorizer(
    filePaths,
    categorizerName,
    categorizerType
  );
};

const onItemDroped = (
  categorizerName: string,
  categorizerType: Categorizers
) => {
  if (selectionState.selectedIds.includes(selectionState.dragedIds[0])) {
    selectionState.dragedIds = selectionState.selectedIds;
  }

  window.entityInteractor.updateWithCategorizer(
    selectionState.dragedIds as string[],
    categorizerName,
    categorizerType
  );
};

const onCategorizerNameChanged = (name: string) => {
  if (
    selectionState.editingCategorizer &&
    selectionState.editingCategorizer
      .replace("folder-", "")
      .replace("tag-", "") !== name
  ) {
    window.entityInteractor.renameCategorizer(
      selectionState.editingCategorizer
        .replace("folder-", "")
        .replace("tag-", ""),
      name,
      selectionState.editingCategorizer.startsWith("tag-")
        ? "PaperTag"
        : "PaperFolder"
    );
  }
  selectionState.editingCategorizer = "";
};

const onCategorizerNameInputBlured = () => {
  selectionState.editingCategorizer = "";
};

window.appInteractor.registerMainSignal(
  "sidebar-context-menu-delete",
  (args) => {
    deleteCategorizer(args);
  }
);

window.appInteractor.registerMainSignal("sidebar-context-menu-edit", (args) => {
  selectionState.editingCategorizer = args;
});

window.appInteractor.registerMainSignal(
  "sidebar-context-menu-color",
  (args) => {
    colorizeCategorizer(args[0], args[1]);
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

watch(
  () => selectionState.editingCategorizer,
  (value) => {
    if (value) {
      selectionState.selectedCategorizer = value;
    }
  }
);
</script>

<template>
  <div>
    <SectionItem
      name="All Papers"
      :count="viewState.entitiesCount"
      :with-counter="showSidebarCount"
      :with-spinner="isSpinnerShown"
      :compact="compact"
      :active="selectionState.selectedCategorizer === 'lib-all'"
      @click="onSelectCategorizer('lib-all')"
    >
      <BIconCollection class="text-sm my-auto text-blue-500 min-w-[1em]" />
    </SectionItem>
    <SectionItem
      name="Flags"
      :with-counter="false"
      :with-spinner="false"
      :compact="compact"
      :active="selectionState.selectedCategorizer === 'lib-flaged'"
      @click="onSelectCategorizer('lib-flaged')"
    >
      <BIconFlag class="text-sm my-auto text-blue-500 min-w-[1em]" />
    </SectionItem>

    <CollopseGroup title="Tags">
      <SectionItem
        :name="tag.name"
        :count="tag.count"
        :with-counter="showSidebarCount"
        :with-spinner="false"
        :compact="compact"
        :editing="selectionState.editingCategorizer === `tag-${tag.name}`"
        v-for="tag in tags"
        :active="selectionState.selectedCategorizer === `tag-${tag.name}`"
        @click="onSelectCategorizer(`tag-${tag.name}`)"
        @contextmenu="(e: MouseEvent) => {onItemRightClicked(e, `tag-${tag.name}`)}"
        @droped="
          (filePaths) => {
            onFileDroped(tag.name, 'PaperTag', filePaths);
          }
        "
        @item-droped="
          () => {
            onItemDroped(tag.name, 'PaperTag');
          }
        "
        @name-changed="
          (name) => {
            onCategorizerNameChanged(name);
          }
        "
        @name-input-blured="onCategorizerNameInputBlured"
      >
        <BIconTag
          class="text-sm my-auto min-w-[1em]"
          :class="{
            'text-blue-500': tag.color === 'blue' || tag.color === null,
            'text-red-500': tag.color === 'red',
            'text-green-500': tag.color === 'green',
            'text-yellow-500': tag.color === 'yellow',
          }"
        />
      </SectionItem>
    </CollopseGroup>

    <CollopseGroup title="Folders">
      <SectionItem
        :name="folder.name"
        :count="folder.count"
        :with-counter="showSidebarCount"
        :with-spinner="false"
        :compact="compact"
        :editing="selectionState.editingCategorizer === `folder-${folder.name}`"
        v-for="folder in folders"
        :active="selectionState.selectedCategorizer === `folder-${folder.name}`"
        @click="onSelectCategorizer(`folder-${folder.name}`)"
        @contextmenu="(e: MouseEvent) => {onItemRightClicked(e, `folder-${folder.name}`)}"
        @droped="
          (filePaths) => {
            onFileDroped(folder.name, 'PaperFolder', filePaths);
          }
        "
        @item-droped="
          () => {
            onItemDroped(folder.name, 'PaperFolder');
          }
        "
        @name-changed="
          (name) => {
            onCategorizerNameChanged(name);
          }
        "
        @name-input-blured="onCategorizerNameInputBlured"
      >
        <BIconFolder
          class="text-sm my-auto min-w-[1em]"
          :class="{
            'text-blue-500': folder.color === 'blue' || folder.color === null,
            'text-red-500': folder.color === 'red',
            'text-green-500': folder.color === 'green',
            'text-yellow-500': folder.color === 'yellow',
          }"
          v-if="folder.name !== selectionState.pluginLinkedFolder"
        />
        <BIconFolderSymlink
          class="text-sm my-auto min-w-[1em]"
          :class="{
            'text-blue-500': folder.color === 'blue' || folder.color === null,
            'text-red-500': folder.color === 'red',
            'text-green-500': folder.color === 'green',
            'text-yellow-500': folder.color === 'yellow',
          }"
          v-if="folder.name === selectionState.pluginLinkedFolder"
        />
      </SectionItem>
    </CollopseGroup>
  </div>
</template>
