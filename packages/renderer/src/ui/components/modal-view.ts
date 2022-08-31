import { createApp } from "vue";
import ConfirmationDialog from "./modal-view.vue";

export function createModalView(
  title: string,
  info: string,
  onConfirm: (() => void) | null,
  onCancel: (() => void) | null
) {
  const div = document.getElementById("modal-view") as HTMLDivElement;

  const dialog = createApp(ConfirmationDialog, {
    title: title,
    info: info,
    cancelBtn: onCancel !== null,
    okBtn: onConfirm !== null,
    onConfirm: onConfirm,
    onCancel: onCancel,
  });
  dialog.mount(div);
  window.appInteractor.setStateStore("viewState.isModalShown", true);
}
