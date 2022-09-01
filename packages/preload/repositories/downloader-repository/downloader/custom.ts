import {
  Downloader,
  DownloaderType,
  DownloaderRequestType,
} from "./downloader";
import { PaperEntityDraft } from "../../../models/PaperEntityDraft";
import { Preference, DownloaderPreference } from "../../../utils/preference";
import { downloadPDFs } from "../../../utils/got";
import { PreloadStateStore } from "../../../../state/appstate";

export class CustomDownloader extends Downloader {
  name = "";

  constructor(
    stateStore: PreloadStateStore,
    preference: Preference,
    name: string
  ) {
    super(stateStore, preference);

    this.name = name;
  }

  preProcess(entityDraft: PaperEntityDraft): DownloaderRequestType {
    let enable = this.getEnable(this.name);
    let queryUrl = "";
    let headers = {};

    const preProcessCode = (
      this.preference.get("downloaders") as Array<DownloaderPreference>
    ).find(
      (downloaderPref) => downloaderPref.name === this.name
    )?.preProcessCode;

    if (preProcessCode) {
      eval(preProcessCode);
    } else {
      enable = false;
    }

    if (enable) {
      this.stateStore.logState.processLog.value = `Download PDF from ${this.name}...`;
    }

    return { queryUrl, headers, enable };
  }

  async queryProcess(
    queryUrl: string,
    headers: Record<string, string>,
    entityDraft: PaperEntityDraft | null
  ): Promise<string> {
    let downloadUrl = "";
    const queryProcessCode = (
      this.preference.get("downloaders") as Array<DownloaderPreference>
    ).find(
      (downloaderPref) => downloaderPref.name === this.name
    )?.queryProcessCode;

    if (queryProcessCode) {
      eval(queryProcessCode);
      eval("downloadUrl = queryUrl;");
    }
    return downloadUrl;
  }

  downloadImpl = downloadImpl;
}

async function downloadImpl(
  this: DownloaderType,
  entityDraft: PaperEntityDraft
): Promise<PaperEntityDraft | null> {
  let entityDraftWithDownloaded = null;

  const downloadImplCode =
    (this.preference.get("downloaders") as Array<DownloaderPreference>).find(
      // @ts-ignore
      (downloaderPref) => downloaderPref.name === this.name
    )?.downloadImplCode || "";

  if (downloadImplCode) {
    // @ts-ignore
    eval(downloadImplCode);
  } else {
    const { queryUrl, headers, enable } = this.preProcess(
      entityDraft
    ) as DownloaderRequestType;

    if (enable) {
      const agent = this.getProxyAgent();
      const downloadUrl = await this.queryProcess(
        queryUrl,
        headers,
        entityDraft
      );
      if (downloadUrl) {
        this.stateStore.logState.processLog.value = `Downloading...`;
        const downloadedUrl = await downloadPDFs([downloadUrl], agent);

        if (downloadedUrl.length > 0) {
          entityDraft.mainURL = downloadedUrl[0];
          return entityDraft;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  return entityDraftWithDownloaded;
}
