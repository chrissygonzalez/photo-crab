import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";
import { open, save } from "@tauri-apps/api/dialog";
import { copyFile } from "@tauri-apps/api/fs";
import UndoQueue from "./UndoQueue";

let originalPath = "";
let undoQueue = new UndoQueue();

async function rotateHue(path: string) {
  console.log("About to rotate hue on path ", path);
  const hueAmount: HTMLInputElement | null =
    document.querySelector("#huerotate-amount");
  const amount = hueAmount ? parseInt(hueAmount.value) : 180;
  const pathSplit = path.split(".");
  const newPath: string = await invoke("rotate_hue", {
    path: path,
    pathBase: pathSplit[0],
    pathEnd: pathSplit[1],
    amount: amount,
  });
  const imageEl = document.querySelector("#image");
  const undoBtn = document.querySelector("#undo-button");
  const resetBtn = document.querySelector("#reset-button");

  imageEl?.setAttribute("src", convertFileSrc(newPath));
  console.log("newPath after rotating hue is ", newPath);
  undoQueue.push(newPath);

  undoBtn?.removeAttribute("disabled");
  resetBtn?.removeAttribute("disabled");
}

function undo() {
  undoQueue.popBack();
  let lastImage = undoQueue.getLast();
  if (lastImage) {
    const imageEl = document.querySelector("#image");
    imageEl?.setAttribute("src", convertFileSrc(lastImage));
  }
  if (undoQueue.getLength() === 1) {
    const undoBtn = document.querySelector("#undo-button");
    undoBtn?.setAttribute("disabled", "true");
  }
}

function resetImage() {
  undoQueue.clear();
  const imageEl = document.querySelector("#image");
  imageEl?.setAttribute("src", convertFileSrc(originalPath));
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

    const imageEl = document.querySelector("#image");
    const undoBtn = document.querySelector("#undo-button");
    const resetBtn = document.querySelector("#reset-button");

    undoBtn?.setAttribute("disabled", "true");
    resetBtn?.setAttribute("disabled", "true");

    originalPath = selected;
    imageEl?.setAttribute("src", convertFileSrc(selected));
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
