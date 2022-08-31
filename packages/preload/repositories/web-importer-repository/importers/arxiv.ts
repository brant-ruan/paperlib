import { WebContentType, WebImporter } from "./importer";
import { SharedState } from "../../../utils/appstate";
import { PreloadStateStore } from "../../../../state/appstate";
import { Preference } from "../../../utils/preference";
import { PaperEntityDraft } from "../../../models/PaperEntityDraft";
import { downloadPDFs } from "../../../utils/got";

export class ArXivWebImporter extends WebImporter {
  constructor(
    sharedState: SharedState,
    stateStore: PreloadStateStore,
    preference: Preference
  ) {
    const urlRegExp = new RegExp(
      "^https?://([^\\.]+\\.)?(arxiv\\.org|xxx\\.lanl\\.gov)/(/\\w|abs/|pdf/)"
    );
    super(sharedState, stateStore, preference, urlRegExp);
  }

  async parsingProcess(
    webContent: WebContentType
  ): Promise<PaperEntityDraft | boolean> {
    let entityDraft: PaperEntityDraft | boolean = false;
    const arXivID = webContent.url.split("/")[4].replace(".pdf", "");

    if (arXivID) {
      entityDraft = new PaperEntityDraft(true);
      const downloadURL = `https://arxiv.org/pdf/${arXivID}.pdf`;

      this.stateStore.logState.processLog.value = `Downloading...`;
      const downloadedFilePath = await downloadPDFs([downloadURL]);

      entityDraft.setValue("arxiv", arXivID);
      entityDraft.setValue("pubType", 0);
      entityDraft.setValue("publication", "arXiv");
      if (downloadedFilePath.length > 0) {
        entityDraft.setValue("mainURL", downloadedFilePath[0]);
      }
    }

    return entityDraft;
  }
}
