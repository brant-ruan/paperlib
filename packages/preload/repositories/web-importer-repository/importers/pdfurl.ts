import { WebContentType, WebImporter } from "./importer";
import { SharedState } from "../../../utils/appstate";
import { PreloadStateStore } from "../../../../state/appstate";
import { Preference } from "../../../utils/preference";
import { PaperEntityDraft } from "../../../models/PaperEntityDraft";
import { downloadPDFs } from "../../../utils/got";

export class PDFUrlWebImporter extends WebImporter {
  constructor(
    sharedState: SharedState,
    stateStore: PreloadStateStore,
    preference: Preference
  ) {
    const urlRegExp = new RegExp(".*.pdf$");
    super(sharedState, stateStore, preference, urlRegExp);
  }

  async parsingProcess(
    webContent: WebContentType
  ): Promise<PaperEntityDraft | boolean> {
    let entityDraft: PaperEntityDraft | boolean = false;
    const downloadURL = webContent.url;

    if (downloadURL) {
      entityDraft = new PaperEntityDraft(true);

      this.stateStore.logState.processLog.value = `Downloading...`;
      const downloadedFilePath = await downloadPDFs([downloadURL]);
      if (downloadedFilePath.length > 0) {
        entityDraft.setValue("mainURL", downloadedFilePath[0]);
      }
    }

    return entityDraft;
  }
}
