import { WebSocketServer, WebSocket } from "ws";

import { DBRepository } from "../repositories/db-repository/db-repository";
import { FileRepository } from "../repositories/file-repository/file-repository";
import { WebImporterRepository } from "../repositories/web-importer-repository/web-importer-repository";
import { WebContentType } from "../repositories/web-importer-repository/importers/importer";

import { PreloadStateStore } from "../../state/appstate";
import { Preference } from "../utils/preference";
import { EntityInteractor } from "./entity-interactor";

export class BrowserExtensionInteractor {
  stateStore: PreloadStateStore;
  preference: Preference;

  dbRepository: DBRepository;
  fileRepository: FileRepository;
  webImporterRepository: WebImporterRepository;

  entityInteractor: EntityInteractor;

  socketServer: WebSocketServer;
  // @ts-ignore
  ws: WebSocket;

  constructor(
    stateStore: PreloadStateStore,
    preference: Preference,
    dbRepository: DBRepository,
    fileRepository: FileRepository,
    webImporterRepository: WebImporterRepository,
    entityInteractor: EntityInteractor
  ) {
    this.stateStore = stateStore;
    this.preference = preference;

    this.dbRepository = dbRepository;
    this.fileRepository = fileRepository;
    this.webImporterRepository = webImporterRepository;

    this.entityInteractor = entityInteractor;

    this.socketServer = new WebSocketServer({ port: 21992 });
    this.socketServer.on("connection", (ws) => {
      this.ws = ws;
      ws.on("message", this.add.bind(this));
    });
  }

  async add(webContent: string) {
    this.stateStore.viewState.processingQueueCount.value += 1;

    const entityDraft = await this.webImporterRepository.parse(
      JSON.parse(webContent) as WebContentType
    );

    if (entityDraft) {
      await this.entityInteractor.scrape(JSON.stringify([entityDraft]));
      this.ws.send(JSON.stringify({ response: "successful" }));
    } else {
      this.ws.send(JSON.stringify({ response: "no-avaliable-importer" }));
    }

    this.stateStore.viewState.processingQueueCount.value -= 1;
  }
}
