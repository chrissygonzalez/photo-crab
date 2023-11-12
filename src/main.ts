import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";
import { open, save } from "@tauri-apps/api/dialog";
import { copyFile } from "@tauri-apps/api/fs";
import UndoQueue from "./UndoQueue";

let originalPath = "";
let undoQueue = new UndoQueue();

function showImage(path: string) {
  const imageEl = document.querySelector("#image");
  imageEl?.setAttribute("src", convertFileSrc(path));
}

async function saveIco(path: string) {
  console.log("About to save ico from path ", path);
  await invoke("save_ico", {
    path: path,
  });
}

async function rotateHue(path: string) {
  console.log("About to rotate hue on path ", path);
  const hueAmount: HTMLInputElement | null =
    document.querySelector("#huerotate-amount");
  const amount = hueAmount ? parseInt(hueAmount.value) : 180;
  const pathSplit = path.split(".");
  const newPath: string = await invoke("rotate_hue", {
    path: path,
    pathEnd: pathSplit[1],
    amount: amount,
  });
  const undoBtn = document.querySelector("#undo-button");
  const resetBtn = document.querySelector("#reset-button");

  showImage(newPath);
  console.log("newPath after rotating hue is ", newPath);
  undoQueue.push(newPath);

  undoBtn?.removeAttribute("disabled");
  resetBtn?.removeAttribute("disabled");
}

function undo() {
  undoQueue.popBack();
  let lastImage = undoQueue.getLast() || originalPath;
  if (lastImage) {
    showImage(lastImage);
  }
  if (undoQueue.getLength() === 0) {
    const undoBtn = document.querySelector("#undo-button");
    undoBtn?.setAttribute("disabled", "true");
  }
}

function resetImage() {
  undoQueue.clear();
  showImage(originalPath);
}

async function saveFile() {
  console.log("original path is ", originalPath);
  const originalPathSplit = originalPath.split(".");

  let filePath =
    (await save({
      defaultPath: `${originalPathSplit[0]}_new.${originalPathSplit[1]}`,
    })) || "";

  let lastImage = undoQueue.getLast();
  try {
    await copyFile(`${lastImage}`, filePath);
  } catch (err) {
    console.log(err);
  }
}

async function openFile() {
  const selected = await open({
    title: "Open Spreadsheet",
    multiple: false,
    directory: false,
    filters: [
      {
        name: "Image",
        extensions: ["png", "jpeg", "gif", "jpg"],
      },
    ],
  });

  if (typeof selected === "string") {
    undoQueue.clear();

    // const imageEl = document.querySelector("#image");
    const undoBtn = document.querySelector("#undo-button");
    const resetBtn = document.querySelector("#reset-button");

    undoBtn?.setAttribute("disabled", "true");
    resetBtn?.setAttribute("disabled", "true");

    originalPath = selected;
    showImage(originalPath);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#image-button")
    ?.addEventListener("click", () => openFile());
  document
    .querySelector("#reset-button")
    ?.addEventListener("click", () => resetImage());
  document
    .querySelector("#huerotate-button")
    ?.addEventListener("click", () =>
      rotateHue(undoQueue.getLast() || originalPath)
    );
  document
    .querySelector("#undo-button")
    ?.addEventListener("click", () => undo());
  document
    .querySelector("#save-button")
    ?.addEventListener("click", () => saveFile());
  document
    .querySelector("#save-ico-button")
    ?.addEventListener("click", () => saveIco(originalPath));
  document.querySelector("#huerotate-amount")?.addEventListener("input", () => {
    let label = document.querySelector("#huerotate-amount-label");
    let amount: HTMLInputElement | null =
      document.querySelector("#huerotate-amount");
    if (label && amount) {
      label.textContent = amount.value;
    }
  });
  let label = document.querySelector("#huerotate-amount-label");
  let amount: HTMLInputElement | null =
    document.querySelector("#huerotate-amount");
  if (label && amount) {
    label.textContent = amount.value;
  }
});
