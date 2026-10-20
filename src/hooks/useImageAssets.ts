import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent as ReactDragEvent, Dispatch, SetStateAction } from "react";
import { compressImageFile, deleteImageAsset, describeStorageError, getAllImageAssets, putImageAsset } from "../imageAssets";
import type { ImageAsset } from "../imageAssets";
import { getLocalAssetReferences } from "../markdown/assets";
import type { Notify } from "./useToast";

export const draftAssetOwner = "draft";

type UseImageAssetsOptions = {
  markdown: string;
  setMarkdown: Dispatch<SetStateAction<string>>;
  insertBlock: (content: string) => void;
  notify: Notify;
};

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function useImageAssets({ markdown, setMarkdown, insertBlock, notify }: UseImageAssetsOptions) {
  const assetUrlsRef = useRef<Record<string, string>>({});
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllImageAssets()
      .then((items) => {
        if (cancelled) return;
        const urls = Object.fromEntries(items.map((asset) => [asset.id, URL.createObjectURL(asset.blob)]));
        assetUrlsRef.current = urls;
        setAssets(items);
        setAssetUrls(urls);
      })
      .catch((error) => {
        if (!cancelled) notify(describeStorageError(error, "读取本地图片"), "error");
      });
    return () => {
      cancelled = true;
      Object.values(assetUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
      assetUrlsRef.current = {};
    };
  }, [notify]);

  const referencedAssets = useMemo(() => {
    const byId = new Map(assets.map((asset) => [asset.id, asset]));
    return getLocalAssetReferences(markdown)
      .map((reference) => byId.get(reference.id))
      .filter((asset): asset is ImageAsset => Boolean(asset));
  }, [assets, markdown]);

  async function addImageFiles(files: File[]) {
    const selected = files.filter((file) => file.type.startsWith("image/")).slice(0, 10);
    if (!selected.length) return;
    setProcessing(true);
    try {
      const added: ImageAsset[] = [];
      for (const file of selected) {
        const alt = file.name.replace(/\.[^.]+$/, "").trim();
        const asset = await compressImageFile(file, draftAssetOwner, file.name || "粘贴图片", {}, undefined, alt === "image" ? "" : alt);
        await putImageAsset(asset);
        added.push(asset);
      }
      const urls = { ...assetUrlsRef.current };
      added.forEach((asset) => (urls[asset.id] = URL.createObjectURL(asset.blob)));
      assetUrlsRef.current = urls;
      setAssetUrls(urls);
      setAssets((items) => [...items, ...added]);
      insertBlock(added.map((asset) => `![${asset.alt}](asset://${asset.id})`).join("\n\n"));
      const before = added.reduce((total, asset) => total + asset.originalSize, 0);
      const after = added.reduce((total, asset) => total + asset.compressedSize, 0);
      notify(`已添加 ${added.length} 张图片（${formatBytes(before)} → ${formatBytes(after)}）`);
    } catch (error) {
      notify(describeStorageError(error, "添加图片"), "error");
    } finally {
      setProcessing(false);
    }
  }

  function handleDrop(event: ReactDragEvent<HTMLTextAreaElement>) {
    setDragActive(false);
    const files = Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;
    event.preventDefault();
    void addImageFiles(files);
  }

  async function removeImage(asset: ImageAsset) {
    if (!window.confirm(`删除图片 ${asset.id}？正文中的引用也会一并移除。`)) return;
    try {
      await deleteImageAsset(asset.id);
      const url = assetUrlsRef.current[asset.id];
      if (url) URL.revokeObjectURL(url);
      const urls = { ...assetUrlsRef.current };
      delete urls[asset.id];
      assetUrlsRef.current = urls;
      setAssetUrls(urls);
      setAssets((items) => items.filter((item) => item.id !== asset.id));
      const pattern = new RegExp(`\\n{0,2}!\\[[^\\]]*\\]\\(asset:\\/\\/${escapeRegExp(asset.id)}\\)\\n{0,2}`, "g");
      setMarkdown((content) => content.replace(pattern, "\n\n").replace(/\n{3,}/g, "\n\n"));
    } catch (error) {
      notify(describeStorageError(error, "删除图片"), "error");
    }
  }

  function downloadImage(asset: ImageAsset) {
    const url = assetUrlsRef.current[asset.id] ?? URL.createObjectURL(asset.blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = asset.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    if (!assetUrlsRef.current[asset.id]) URL.revokeObjectURL(url);
  }

  return { assetUrls, referencedAssets, processing, dragActive, setDragActive, addImageFiles, handleDrop, removeImage, downloadImage };
}
