## v2.2.1 09/04 2023

1. 支持模糊搜索，比如论文标题为 Semi-supervised Classification via AABBCC，那么可以通过输入 "semi" / "semi sup" / "classi" / "semi classi" / "AA CC" 等等来搜索到这篇论文。
2. 改进了一点文件导入逻辑。

## v2.2.0 17/03 2023

1. 新的官方 metadata 检索服务 Paperlib official metadata service 以及新的搜刮逻辑让元数据检索更快更稳定。
2. 新搜刮器 PubMed.
3. 修复 bug: Title including MathML will be scraped incorrectly.
4. 修复 bug: Chrome extension to import papers on IEEE Xplore. 
5. 修复 bug: Multiselection by pressing ctrl/cmd.
6. 修复 UI 问题。


## v2.1.5 07/01 2023

1. 优化 DBLP scaper 对部分 workshop 论文的检索结果。
2. 修复 BibTex 输出中一些特殊字符的问题。
3. 修复一些 Bug。

## v2.1.4 31/12 2022

1. 修复 Bug。
2. 优化 DBLP scaper 对 ICLR 2016 的检索结果。

## v2.1.3 23/12 2022

1. 更新 Word 插件证书。

## v2.1.2 20/11 2022

1. 浏览器插件支持 CNKI (中国知网)。
2. 如果 DBLP 返回元数据带有 DOI，那么优先使用此 DOI 获取其余元数据。
3. 修复搜索栏动画的问题。
4. 修复在 PDF 浏览器里点击链接时，无法在外部浏览器打开的问题。

## v2.1.1 06/11 2022

1. 修复了一个 Bug。

## v2.1.0 05/11 2022

1. 文章详情面板添加了引用计数。
2. 从 adsabs.harvard.edu 导入时可以自动下载 PDF。
3. 一个新的 PDF 下载器: semanticscholar.org.
4. 在表格视图添加 AddTime 列。
5. 标签 / 组在主视图中排序显示。
6. 表格试图的列宽可以调整了！


## v2.0.7 29/10 2022

1. 优化中文 PDF 文件的读取和显示。
2. 一个新的选项使得导入论文时可以链接文件而不是复制或者剪切文件。使用户可以保持源 PDF 位置不变。


## v2.0.6 23/10 2022

1. 新的元数据搜寻器: bioRxiv, medRxiv, and chemRxiv。
2. 优化 DOI 正则表达式。
3. 新的图标。
4. 修复漏洞。
## v2.0.5 18/10 2022

1. Microsoft Word 插件的测试版发布了。
2. 支持了 Linux 系统。
3. 代码仓库元数据现在可以编辑了。
4. 更好的搜索栏鼠标悬浮体验。
5. 修复漏洞。

## v2.0.4 08/10 2022

1. 全文搜索的高亮结果可以显示在 PDF 预览视图下。
2. 可调整详情面板的宽度。
3. 优化了对于预印本论文的判断规则。
4. 修复了内置 PDF 浏览视图下可能出现的遮挡 Bug。
5. 修复了 Markdown 渲染超出视图，以及无法渲然 HTML 图片的 Bug。
6. 修复了 MacOS Catalina 的兼容性 Bug。

## v2.0.3 02/10 2022

1. 为物理学和地球科学增添优化了元数据搜寻器以及预设推荐选择。Springer Nature, Elseivier Scopus, NASA Astrophysics Data System, SPIE: Inte. Society for Optics and Photonics.
2. 一个新的视图，可以直接在 Paperlib 内浏览 PDF。
3. 优化了 Crossref 的搜寻速度。
4. 优化了 RSS 订阅的解析效果，支持更多格式。
5. 优化了 添加附件拖拽时的 UI。
6. 一次性导入大量论文时分批次进行，防止超出 API 请求速率限制。
7. 编辑界面添加了直接重新搜寻元数据的按钮。

## v2.0.2 26/09 2022

1. 现在可以配置表格视图下显示哪些列了。
2. 增加了元数据搜寻结果缓存，每个成功的搜寻结果（仅公共数据库返回结果）将会对其他用户共享缓存，加快热门文章搜寻的速度。
3. DBLP 搜寻器增加了一个备用 API 地址。
4. 修复一个在使用 Onedrive 作为文件夹时候删除文件的 Bug。
5. 修复一个 RSS 订阅刷新时的 Bug。

## v2.0.1 20/09 2022

1. 修复一个小 Bug。

## v2.0.0 19/09 2022

1. 重写数据库代码，优化响应时间。例如，对于 10K 篇文献，排序时间从 3s 降低到 30ms。
2. 优化预览渲染速度，缓存文献预览图。
3. 多语言支持，目前支持英文和中文。
4. 重新设计了部分 Windows 版本的 UI。
5. 自动检测和使用系统默认代理。中国大陆地区推荐设置代理来加速个别数据库的访问速度。我们会持续尽力优化对于无代理的大陆用户的体验。
6. 增加了导引界面。
7. 重新设计了元数据搜寻器的流程以及设置界面。对于已经使用了自定义搜寻器的用户，您可能需要稍微修改一下您的自定义代码。详情请见 Github。
8. 增加了两个新的元数据搜寻器：Paperlib Query Service (后端仍在设计实现中), Semantic Scholar。我们仍在不断添加新的搜寻器，如果你想为你的学科优化 Paperlib 的元数据搜索能力，请直接联系我。
9. 优化程序启动速度、占用内存等。
10. 优化部分元数据搜寻器的性能。
11. 删除的文件会首先移入回收站而不是直接删除。
12. 添加了一个进度条来显示如下载的进度。
13. 添加一个 RSS 订阅的论文到库的时候不会自动下载论文了，以此来提高添加速度。
14. 修复了很多 Bug。

## v1.10.2 05/09 2022

1. 新的元数据搜刮器: crossref.org
2. 修复漏洞。

## v1.10.1 01/09 2022

1. 修复漏洞。

## v1.10.0 27/08 2022

1. 更好的引用快速复制插件：复制引用 Key，链接一个文件夹等。
2. 支持选择 CSL style。
3. 支持选择自定义 PDF 阅读器。
4. 支持编辑 tags 和 folders。
5. 修复漏洞。


## v1.9.7 21/08 2022

1. 修复了 ACL 会议元数据匹配的 Bug。

## v1.9.6 20/08 2022

1. 详情面板渲染 LaTex。
2. 支持从 arXiv, unpaywall, and xxx-hub 搜索 PDF。
3. 导入 BibTex 文件。
4. 浏览器插件支持所有以 .pdf 结尾的 URL。
5. 对于开启云同步的用户支持离线使用。
6. 修复漏洞。 


## v1.9.5 14/08 2022

1. 可以在详情界面删除标签/文件夹了。
2. 快速复制插件支持两种模式，按下 Tab 键或者点击来切换。


## v1.9.4 08/08 2022

1. 保存主视图类型和排序等设置。 #124
2. 优化代码仓库抓取器。现在抓取 star 前三名的仓库并显示。 #125
3. 修复部分输入框按键 Bug。 #123

## v1.9.3 03/08 2022

1. 减少内存消耗。
2. 修复元数据更新时的 Bug。
3. 修复缩略图渲染 Bug。


## v1.9.2 27/07 2022

1. 修复 macOS 快捷键关闭之后无法打开的 Bug。

## v1.9.1 27/07 2022

1. 支持 arXiv 更多的 RSS 格式。
2. 修复 Windows 下数据库初始化 Bug。
3. 修复 macOS 快捷键关闭之后无法打开的 Bug。
4. 修复 Tooltip 文字 Bug。

## v1.9.0 23/07 2022

1. RSS 订阅。
2. Markdown 笔记。
3. 修复漏洞。

## v1.8.2 17/07 2022

1. 支持在主列表展示自定义的详情信息。在这里你可以选择展示发表相关信息，标签文件夹，打分和笔记等。
2. 直接拖动 PDF 文件或者已有的论文条目到侧边栏直接添加到对应标签或文件夹。
3. 右键菜单添加了从某一特定搜刮器搜刮 metadata 的选项。
4. 修复漏洞。


## v1.8.1 10/07 2022

1. Firefox 插件。
2. 支持自定义搜刮器。
3. 对话框可以使用一些快捷键操作。
4. 修复诸多漏洞。


## v1.7.8 05/07 2022

1. 支持侧边栏调整。
2. 支持自定义的重命名规则。


## v1.7.7 29/06 2022

1. 修复漏洞。

## v1.7.6 26/06 2022

1. 修复漏洞。
2. 支持方向键切换选定论文。
3. 支持自定义快捷键。

## v1.7.5 25/06 2022

1. 修复漏洞。
2. 支持三种重命名格式。
3. 支持代理。
4. 支持从文件夹或者Zotero CSV导入。

## v1.7.4 24/06 2022

1. 修复漏洞。

## v1.7.3 21/06 2022

1. 修复漏洞。

## v1.7.2 19/06 2022

1. 修复漏洞。

## v1.7.1 19/06 2022

1. 支持 Google Scholar 搜刮器。
2. 清楚搜索按钮。
3. Chrome Extension 的 IEEE 和 Google Scholar 支持。

## v1.7.0 13/06 2022

1. 支持彩色标签。
2. 侧边栏支持紧凑模式。

## v1.6.5 05/06 2022

1. 修复了 Windows 系统的窗口控制问题。

## v1.6.4 05/06 2022

1. 修复了暗黑模式下的背景颜色问题。

## v1.6.3 30/05 2022

1. 支持右键缩略图替换论文 PDF 文件。
2. 支持 Show in Finder/Explorer。

## v1.6.2 11/05 2022

1. 搜刮更详细的发表信息。
2. 修复 Bug。

## v1.6.1 05/05 2022

1. 修复 Bug。

## v1.6.0 05/05 2022

1. Paperlib 插件，方便快速复制粘贴 BibTex。
2. 更好的 UI。
3. 可点击的作者标签。
4. 支持新版 Chrome 插件。

## v1.5.9 16/04/2022

1. 更好的 Tag Folder 界面，自动提示。


## v1.5.8 12/04/2022

1. 自定义 Mongodb Atlas APP id。

## v1.5.7 11/04/2022

1. 修复右键菜单的动画。

## v1.5.6 10/04/2022

1. 删除无用的动画。


## v1.5.5 06/04/2022

1. 自动删除源文件 Bug 修复。

## v1.5.4 05/04/2022

1. 自动定时搜索 Bug 修复。

## v1.5.3 03/04/2022

1. 表格 UI Bug 修复。

## v1.5.2 03/04/2022

1. 搜刮器 Bug 修复。
2. 表格 UI Bug 修复。

## v1.5.1 24/03/2022

1. Bug 修复。

## v1.5.0 24/03/2022

1. Electron 版本支持了高级搜索和全文搜索和暗黑模式。
2. 自动搜索代码仓库。
3. 也许今后可能会倾向于更新 Electron 版本，因为科研压力导致空闲时间实在是太少了。虽然 native 的 Mac 版精简流畅，但是精力实在是不够。

## v1.4.3 12/03/2022

1. 支持了高级搜索和全文搜索。

## v1.4.2 11/03/2022

1. 支持了删除 Supplementary。
2. 修复了 Bugs。

## v1.4.1 24/02/2022

1. 使用了新的 Domain URL。

## v1.4.0 22/02/2022

1. 修复了 Bugs。
2. 增加了错误处理与日志。
3. 增加了拖拽添加标签和文件夹的功能。
4. 增加了侧边栏数量统计。

## v1.3.10 18/02/2022

1. 增加了 CVF Scraper 来搜集如 ICCV2021 的论文。

## v1.3.9 16/02/2022

1. 修复 Bugs。

## v1.3.8 12/02/2022

1. 修复了从 arXiv 导入崩溃的 Bug。

## v1.3.7 07/02/2022

1. 修复了一个在同步迁移时的 Bug。

## v1.3.6 07/02/2022

1. 新的库图标。

## v1.3.5 17/01/2022

1. 修复定时检索 Bug。

## v1.3.4 17/01/2022

1. 修复云同步 Bug。

## v1.3.3 15/01/2022

1. 修复老 Mac 机器预览的漏洞。

## v1.3.2 15/01/2022

1. 修复 IEEE Xplore 获取元数据的漏洞。

## v1.3.1 06/01/2022

1. 每隔一定时间自动重新匹配预印本论文的元数据。
2. 修复漏洞。

## v1.3.0 25/12/2021

1. 支持数据库云同步 (BETA)。

## v1.2.6 22/12/2021

1. 升级数据库模型以支持 Windows。
2. 修复预览漏洞.

## v1.2.5 17/12/2021

1. 支持 Chrome Extension。

## v1.2.4 15/12/2021

1. 升级数据库。
2. 支持自定义论文发表替换，例如将长会议名替换为缩写以便倒出更简洁的 Bibtex。
3. 修复漏洞。

## v1.2.3 14/12/2021

1. 添加选项控制是否删除源文件。
2. 进度条显示。
3. 添加论文标题提取引擎的支持。
4. 将文件读取放入背景线程。

## v1.2.2

1. 支持添加和搜索 Note。
2. 添加快捷键。
3. 支持从 IEEE Explorer 获取元数据。
4. 添加元数据获取相关选项。
5. 更好的 DBLP 解析。
6. 修复特殊字符导致的崩溃。
7. 修复单作者导致的问题。

## v1.2.1

1. 修复无网络时的漏洞。

## v1.2.0

1. 重构项目。
2. 支持 Table view。
3. 修复漏洞。
4. 添加一些可选选项。
