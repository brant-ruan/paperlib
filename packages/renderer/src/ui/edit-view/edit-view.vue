<script setup lang="ts">
import { PropType, ref, watch } from "vue";

import InputBox from "./components/input-box.vue";
import InputField from "./components/input-field.vue";
import SelectBox from "./components/select-box.vue";
import MultiselectBox from "./components/multiselect-box.vue";

import {
  PaperFolder,
  PaperTag,
} from "../../../../preload/models/PaperCategorizer";
import { PaperEntityDraft } from "../../../../preload/models/PaperEntityDraft";
import { RendererStateStore } from "../../../../state/appstate";

defineProps({
  tags: {
    type: Array as PropType<PaperTag[]>,
    required: true,
  },
  folders: {
    type: Array as PropType<PaperFolder[]>,
    required: true,
  },
});

const viewState = RendererStateStore.useViewState();
const bufferState = RendererStateStore.useBufferState();

const editingEntityDraft = ref<PaperEntityDraft>(new PaperEntityDraft(false));

watch(
  () => bufferState.editingEntityDraft,
  (draft) => {
    editingEntityDraft.value.initialize(draft);
  }
);

const wideMode = ref(false);

const pubTypes = ["Article", "Conference", "Others", "Book"];

const keyDownListener = (e: KeyboardEvent) => {
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  ) {
    if (e.key === "Escape") {
      onCloseClicked();
    }
    return true;
  }

  e.preventDefault();
  if (e.key === "Escape") {
    onCloseClicked();
  }
};

watch(
  () => viewState.isEditViewShown,
  (value) => {
    if (value) {
      window.addEventListener("keydown", keyDownListener, { once: true });
    }
  }
);

const onCloseClicked = () => {
  viewState.isEditViewShown = false;
};

const onSaveClicked = async () => {
  window.entityInteractor.update(JSON.stringify([editingEntityDraft.value]));
  viewState.isEditViewShown = false;
};
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-75"
    enter-from-class="transform opacity-0"
    enter-to-class="transform opacity-100"
    leave-active-class="transition ease-in duration-75"
    leave-from-class="transform opacity-100"
    leave-to-class="transform opacity-0"
  >
    <div
      class="fixed top-0 right-0 left-0 z-50 w-screen h-screen bg-neutral-800 dark:bg-neutral-900 bg-opacity-50 dark:bg-opacity-80"
      v-if="viewState.isEditViewShown"
    >
      <div class="flex flex-col justify-center items-center w-full h-full">
        <div
          class="m-auto flex flex-col p-2 border-[1px] dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 rounded-lg shadow-lg select-none space-y-2"
          :class="wideMode ? 'w-[800px]' : 'w-[500px]'"
        >
          <div class="flex space-x-2">
            <div
              class="flex flex-col space-y-2"
              :class="wideMode ? 'w-1/2' : 'w-full'"
            >
              <InputBox
                placeholder="Title"
                :value="editingEntityDraft.title"
                @changed="(value) => (editingEntityDraft.title = value)"
              />
              <InputBox
                placeholder="Authors"
                :value="editingEntityDraft.authors"
                @changed="(value) => (editingEntityDraft.authors = value)"
              />
              <InputBox
                placeholder="Publication"
                :value="editingEntityDraft.publication"
                @changed="(value) => (editingEntityDraft.publication = value)"
              />
              <div class="flex w-full space-x-2">
                <InputBox
                  placeholder="Pub Time"
                  class="w-1/2"
                  :value="editingEntityDraft.pubTime"
                  @changed="(value) => (editingEntityDraft.pubTime = value)"
                />
                <SelectBox
                  placeholder="Publication Type"
                  class="w-1/2"
                  :options="pubTypes"
                  :value="pubTypes[editingEntityDraft.pubType]"
                  @changed="
                    (value) => {
                      editingEntityDraft.pubType = pubTypes.indexOf(value);
                    }
                  "
                />
              </div>
              <div
                class="flex flex-row space-x-2"
                v-if="editingEntityDraft.pubType === 0"
              >
                <div class="basis-1/2 flex space-x-2">
                  <InputBox
                    class="basis-1/2 w-8"
                    placeholder="Volumn"
                    :value="editingEntityDraft.volume"
                    @changed="(value) => (editingEntityDraft.volume = value)"
                  />
                  <InputBox
                    class="basis-1/2 w-8"
                    placeholder="Pages"
                    :value="editingEntityDraft.pages"
                    @changed="(value) => (editingEntityDraft.pages = value)"
                  />
                </div>
                <div class="basis-1/2 flex space-x-2">
                  <InputBox
                    class="basis-1/2 w-8"
                    placeholder="Number"
                    :value="editingEntityDraft.number"
                    @changed="(value) => (editingEntityDraft.number = value)"
                  />
                  <InputBox
                    class="basis-1/2 w-8"
                    placeholder="Publisher"
                    :value="editingEntityDraft.publisher"
                    @changed="(value) => (editingEntityDraft.publisher = value)"
                  />
                </div>
              </div>
              <div class="flex w-full space-x-2">
                <InputBox
                  placeholder="arXiv ID"
                  class="w-1/2"
                  :value="editingEntityDraft.arxiv"
                  @changed="(value) => (editingEntityDraft.arxiv = value)"
                />
                <InputBox
                  placeholder="DOI"
                  class="w-1/2"
                  :value="editingEntityDraft.doi"
                  @changed="(value) => (editingEntityDraft.doi = value)"
                />
              </div>
              <MultiselectBox
                placeholder="Tags"
                :options="tags.map((tag) => tag.name)"
                :existValues="
                  editingEntityDraft.tags
                    .split(';')
                    .map((tag) => tag.replaceAll(' ', ''))
                    .filter((tag) => tag.length > 0)
                "
                @changed="
              (values) => {
                editingEntityDraft.tags = values.map((tag: string) => tag.trim()).join('; ');
              }
            "
              />
              <MultiselectBox
                placeholder="Folders"
                :options="folders.map((folder) => folder.name)"
                :existValues="
                  editingEntityDraft.folders
                    .split(';')
                    .map((folder) => folder.replaceAll(' ', ''))
                    .filter((folder) => folder.length > 0)
                "
                @changed="
              (values) => {
                editingEntityDraft.folders = values.map((folder: string) => folder.trim()).join('; ');
              }
            "
              />
              <InputField
                placeholder="Note"
                class="h-28"
                :value="editingEntityDraft.note"
                :is-expanded="wideMode"
                @changed="(value) => (editingEntityDraft.note = value)"
                v-if="!wideMode"
                @expand="(expanded) => (wideMode = expanded)"
              />
            </div>

            <div class="h-full w-full" v-if="wideMode">
              <InputField
                placeholder="Note (start with '<md>' to use markdown)"
                class="h-full w-full"
                :value="editingEntityDraft.note"
                :is-expanded="wideMode"
                @changed="(value) => (editingEntityDraft.note = value)"
                v-if="wideMode"
                @expand="(expanded) => (wideMode = expanded)"
              />
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <div
              class="flex w-24 h-8 rounded-lg bg-neutral-300 dark:bg-neutral-500 dark:text-neutral-300 hover:shadow-sm"
              @click="onCloseClicked"
            >
              <span class="m-auto text-xs">Cancel</span>
            </div>
            <div
              class="flex w-24 h-8 rounded-lg bg-accentlight dark:bg-accentdark hover:shadow-sm"
              @click="onSaveClicked"
            >
              <span class="m-auto text-xs text-white">Save</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
