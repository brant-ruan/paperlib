import * as pdfjs from 'pdfjs-dist';
import {formatString} from '../utils/misc';
import {PaperEntityDraft} from '../models/PaperEntity';
import {promises as fsPromise, createWriteStream, existsSync} from 'fs';
import path from 'path';
import os from 'os';
import got from 'got';
const stream = require('stream');
const {promisify} = require('util');

export class FileRepository {
  constructor(preference) {
    const pdfjsWorker = import('pdfjs-dist/build/pdf.worker.entry');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    this.preference = preference;
  }

  // ============================================================
  // Read file from local storage
  constructURL(url, joined, withProtocol = true) {
    let outURL;
    if (path.isAbsolute(url)) {
      outURL = url;
    } else {
      if (joined) {
        outURL = path.join(this.preference.get('appLibFolder'), url);
      } else {
        outURL = url;
      }
    }
    if (os.platform().startsWith('win')) {
      return outURL;
    } else {
      if (withProtocol) {
        if (outURL.startsWith('file://')) {
          return outURL;
        } else {
          return 'file://' + outURL;
        }
      } else {
        return outURL.replace('file://', '');
      }
    }
  }

  async read(url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return await this.readFromWeb(url);
    } else {
      return await this.readFromLocal(url);
    }
  }

  // ============================================================
  // Read file from local
  async readFromLocal(url) {
    if (url.endsWith('.pdf')) {
      return await this.readPDF(url);
    } else {
      throw new Error('Unsupported file type.');
    }
  }

  // ============================================================
  // PDF files
  async readPDF(url) {
    try {
      const pdf = await pdfjs.getDocument(
          this.constructURL(url, false, true),
      ).promise;

      const entity = new PaperEntityDraft();

      if (this.preference.get('pdfBuiltinScraper')) {
        const metaData = await pdf.getMetadata();
        const title = metaData.info.Title;
        const authors = metaData.info.Author;
        entity.setValue('title', title, false);
        entity.setValue('authors', authors, false);
      }

      // extract doi
      const firstPageText = await this.getPDFText(pdf);
      const doi = this.extractDOI(firstPageText);
      entity.setValue('doi', doi, false);
      const arxivId = this.extractArxivId(firstPageText);
      entity.setValue('arxiv', arxivId, false);

      entity.setValue('mainURL', url, false);
      return entity;
    } catch (error) {
      this.sharedState.set('viewState.alertInformation', `Could not read PDF file: ${error}`);
      throw error;
    }
  }

  renderPage(pageData) {
    const renderOptions = {
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    };
    return pageData
        .getTextContent(renderOptions)
        .then(function(textContent) {
          let lastY;
          let text = '';
          for (const item of textContent.items) {
            if (lastY === item.transform[5] || !lastY) {
              text += item.str;
            } else {
              text += '\n' + item.str;
            }
            lastY = item.transform[5];
          }
          return text;
        });
  }

  async getPDFText(pdfData) {
    let firstPageText = '';
    const pageData = await pdfData.getPage(1);
    const pageText = await this.renderPage(pageData);
    firstPageText = `${firstPageText}\n\n${pageText}`;
    return firstPageText;
  }

  extractDOI(pdfText) {
    const doiRegex = new RegExp(
        '(?:' + '(10[.][0-9]{4,}(?:[.][0-9]+)*/(?:(?![%"#? ])\\S)+)' + ')',
        'g',
    );
    const doi = pdfText.match(doiRegex);
    if (doi) {
      return formatString({str: doi[0], removeWhite: true});
    } else {
      return null;
    }
  }

  extractArxivId(pdfText) {
    const arxivRegex = new RegExp(
        'arXiv:(\\d{4}.\\d{4,5}|[a-z\\-] (\\.[A-Z]{2})?\\/\\d{7})(v\\d )?',
        'g',
    );
    const arxiv = pdfText.match(arxivRegex);
    if (arxiv) {
      return formatString({str: arxiv[0], removeWhite: true});
    } else {
      return null;
    }
  }

  // ============================================================
  // Read file from web
  async readFromWeb(url) {
    try {
      const filename = url.split('/').pop();
      const targetUrl = path.join(os.homedir(), 'Downloads', filename);
      const pipeline = promisify(stream.pipeline);

      await pipeline(
          got.stream(url),
          createWriteStream(this.constructURL(targetUrl, false, false)),
      );
      return await this.readFromLocal(targetUrl);
    } catch (error) {
      this.sharedState.set('viewState.alertInformation', `Could not download PDF file: ${error}`);
      throw error;
    }
  }

  // ============================================================
  // Move local file to destination
  async _move(sourcePath, targetPath) {
    const _sourcePath = JSON.parse(JSON.stringify(sourcePath)).replace(
        'file://',
        '',
    );
    const _targetPath = JSON.parse(JSON.stringify(targetPath)).replace(
        'file://',
        '',
    );

    try {
      await fsPromise.copyFile(_sourcePath, _targetPath);
      if (this.preference.get('deleteSourceFile')) {
        await fsPromise.unlink(sourcePath);
      }
      return true;
    } catch (error) {
      this.sharedState.set('viewState.alertInformation', `Could not copy file: ${error}`);
      return false;
    }
  }

  // Move to DB folder
  async move(entity) {
    const targetFileName =
            entity.title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s/g, '_') +
            '_' +
            entity._id.toString();

    // 1. Move main file.
    const sourceMainURL = this.constructURL(entity.mainURL, true, false);
    let targetMainURL = this.constructURL(targetFileName + '_main', true, false);
    targetMainURL += path.extname(sourceMainURL);
    const mainSuccess = this._move(sourceMainURL, targetMainURL);
    if (mainSuccess) {
      entity.setValue('mainURL', path.basename(targetMainURL), false);
    } else {
      throw new Error('Move main file error.');
    }

    // 2. Move supplementary files.
    const sourceSupURLs = entity.supURLs.map((url) => this.constructURL(url));
    const targetSupURLs = [];
    sourceSupURLs.forEach((sourceSupURL, i) => {
      let targetSupURL = this.constructURL(targetFileName + `_sup${i}`, true, false);
      targetSupURL += path.extname(sourceSupURL);

      const supSuccess = this._move(sourceSupURL, targetSupURL);
      if (supSuccess) {
        targetSupURLs.push(path.basename(targetSupURL));
      } else {
        throw new Error('Move supplementary file error.');
      }
    });
    entity.setValue('supURLs', targetSupURLs, true);
    return entity;
  }

  // Remove local file
  async _remove(sourcePath) {
    try {
      const _sourcePath = sourcePath.replace('file://', '');
      await fsPromise.unlink(_sourcePath);
      return true;
    } catch (error) {
      this.sharedState.set('viewState.alertInformation', `Could not remove file: ${error}`);
      return false;
    }
  }

  async remove(entity) {
    try {
      const sourceUrls = [];
      for (const url of entity.supURLs) {
        sourceUrls.push(this.constructURL(url, true, false));
      }
      sourceUrls.push(this.constructURL(entity.mainURL, true, false));

      const promiseList = [];
      for (const url of sourceUrls) {
        promiseList.push(this._remove(url));
      }

      const successes = await Promise.all(promiseList);
      const success = successes.every((success) => success);
      return success;
    } catch (error) {
      this.sharedState.set('viewState.alertInformation', `Could not remove file: ${error}`);
      return false;
    }
  }

  async removeFile(url) {
    try {
      if (existsSync(this.constructURL(url, true, false))) {
        return await this._remove(this.constructURL(url, true, false));
      } else {
        return true;
      }
    } catch (error) {
      this.sharedState.set('viewState.alertInformation', `Could not remove file: ${error}`);
      return false;
    }
  }
}
