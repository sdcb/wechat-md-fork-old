import type { Theme } from "../types";
import { classifyLink, formatLinkAsPlainText } from "./links";
import { getThemeFontFamily } from "./renderMarkdown";

function copyNodesWithoutNestedList(item: HTMLLIElement) {
  const wrapper = document.createElement("span");
  Array.from(item.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && ["UL", "OL"].includes((node as Element).tagName)) return;
    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "P")
      wrapper.append(...Array.from(node.childNodes).map((child) => child.cloneNode(true)));
    else wrapper.append(node.cloneNode(true));
  });
  return wrapper;
}

function flattenList(list: HTMLUListElement | HTMLOListElement, theme: Theme, depth: number, path: number[], output: HTMLElement[]) {
  const ordered = list.tagName === "OL";
  const items = Array.from(list.children).filter((child): child is HTMLLIElement => child.tagName === "LI");
  items.forEach((item, index) => {
    const currentPath = [...path, index + 1];
    const marker = ordered ? `${currentPath.join(".")}. ` : `${depth === 0 ? "•" : depth === 1 ? "◦" : "▪"} `;
    const paragraph = document.createElement("p");
    paragraph.setAttribute(
      "style",
      `margin:0 0 ${theme.listSpacing}px;padding-left:${depth * 20}px;color:${theme.text};font-family:${getThemeFontFamily(theme)};font-size:${theme.bodyFontSize}px;line-height:${theme.bodyLineHeight};text-indent:0;word-break:break-word;`,
    );
    paragraph.append(document.createTextNode(marker), copyNodesWithoutNestedList(item));
    output.push(paragraph);
    Array.from(item.children)
      .filter((child): child is HTMLUListElement | HTMLOListElement => child.tagName === "UL" || child.tagName === "OL")
      .forEach((nested) => flattenList(nested, theme, depth + 1, currentPath, output));
  });
}

export function flattenNestedListsForWechat(root: DocumentFragment, theme: Theme) {
  const lists = Array.from(root.querySelectorAll<HTMLUListElement | HTMLOListElement>("ul,ol")).filter(
    (list) => !list.parentElement?.closest("ul,ol"),
  );
  lists.forEach((list) => {
    if (!list.querySelector(":scope > li > ul, :scope > li > ol")) return;
    const blocks: HTMLElement[] = [];
    flattenList(list, theme, 0, [], blocks);
    list.replaceWith(...blocks);
  });
}

const blockTags = new Set([
  "ADDRESS",
  "BLOCKQUOTE",
  "DETAILS",
  "DIV",
  "DL",
  "DD",
  "DT",
  "FIGCAPTION",
  "FIGURE",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HR",
  "LI",
  "OL",
  "P",
  "PRE",
  "SECTION",
  "SUMMARY",
  "TABLE",
  "TBODY",
  "TD",
  "TFOOT",
  "TH",
  "THEAD",
  "TR",
  "UL",
]);

function isBlock(node: Node | null) {
  return node?.nodeType === Node.ELEMENT_NODE && blockTags.has((node as Element).tagName);
}

/**
 * marked separates blocks with "\n" text nodes. The WeChat editor turns such text nodes next to
 * images, tables and other non-paragraph blocks into empty paragraphs, i.e. visible blank lines.
 */
export function removeInterBlockWhitespace(root: ParentNode) {
  const walker = document.createTreeWalker(root as Node, NodeFilter.SHOW_TEXT);
  const removable: Text[] = [];
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    if (/\S/.test(node.data) || node.parentElement?.closest("pre")) continue;
    const parent = node.parentNode;
    const parentIsBlock = !parent || parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE || isBlock(parent);
    const atBlockEdge = parentIsBlock && (!node.previousSibling || !node.nextSibling);
    if (atBlockEdge || isBlock(node.previousSibling) || isBlock(node.nextSibling)) removable.push(node);
  }
  removable.forEach((node) => node.remove());
}

export function prepareWechatHtml(bodyHtml: string, theme: Theme) {
  const template = document.createElement("template");
  template.innerHTML = bodyHtml;
  template.content.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
    const href = link.getAttribute("href")?.trim() ?? "";
    if (!href || classifyLink(href) !== "wechat-article") {
      link.replaceWith(document.createTextNode(formatLinkAsPlainText(link.textContent ?? "", href)));
      return;
    }
    link.removeAttribute("rel");
  });
  template.content.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((input) => {
    input.replaceWith(document.createTextNode(input.checked ? "☑ " : "☐ "));
  });
  template.content.querySelectorAll<HTMLElement>("*").forEach((element) => {
    [...element.attributes]
      .filter((attribute) => attribute.name.startsWith("data-"))
      .forEach((attribute) => element.removeAttribute(attribute.name));
  });
  flattenNestedListsForWechat(template.content, theme);
  removeInterBlockWhitespace(template.content);
  return template.innerHTML;
}
