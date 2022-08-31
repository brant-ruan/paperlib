import got from "got";
import { JSDOM } from "jsdom";

import { WebImporterType, WebContentType } from "./importers/importer";
import { ArXivWebImporter } from "./importers/arxiv";
import { GoogleScholarWebImporter } from "./importers/google-scholar";
import { IEEEWebImporter } from "./importers/ieee";
import { EmbedWebImporter } from "./importers/embed";
import { PDFUrlWebImporter } from "./importers/pdfurl";

import { Preference } from "../../utils/preference";
import { SharedState } from "../../utils/appstate";
import { PreloadStateStore } from "../../../state/appstate";
import { PaperEntityDraft } from "../../models/PaperEntityDraft";

export class WebImporterRepository {
  sharedState: SharedState;
  stateStore: PreloadStateStore;
  preference: Preference;

  importerList: Record<string, WebImporterType>;

  constructor(
    sharedState: SharedState,
    stateStore: PreloadStateStore,
    preference: Preference
  ) {
    this.sharedState = sharedState;
    this.stateStore = stateStore;
    this.preference = preference;

    this.importerList = {
      arxiv: new ArXivWebImporter(
        this.sharedState,
        this.stateStore,
        this.preference
      ),
      googlescholar: new GoogleScholarWebImporter(
        this.sharedState,
        this.stateStore,
        this.preference
      ),
      ieee: new IEEEWebImporter(
        this.sharedState,
        this.stateStore,
        this.preference
      ),
      embed: new EmbedWebImporter(
        this.sharedState,
        this.stateStore,
        this.preference
      ),
      pdfurl: new PDFUrlWebImporter(
        this.sharedState,
        this.stateStore,
        this.preference
      ),
    };
  }

  async parse(webContent: WebContentType): Promise<PaperEntityDraft | boolean> {
    let parsed: PaperEntityDraft | boolean = false;
    for (const [name, importer] of Object.entries(this.importerList)) {
      try {
        parsed = await importer.parse(webContent);
      } catch (error) {
        this.stateStore.logState.alertLog.value = `Web importer ${name} error: ${
          error as string
        }`;
      }
      if (parsed) {
        break;
      }
    }
    return parsed;
  }

  async getWebContent(url: string): Promise<WebContentType> {
    let webContent: WebContentType = {
      url: url,
      document: "",
      cookies: "",
    };
    let response = await got(url);
    const jsdom = new JSDOM(response.body);

    webContent.document = `${jsdom.window.document}`;
    return webContent;
  }
}
