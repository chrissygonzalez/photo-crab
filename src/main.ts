import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";
import { open, save } from "@tauri-apps/api/dialog";
import { copyFile } from "@tauri-apps/api/fs";
import UndoQueue from "./UndoQueue";

// TODO: replace this array with an implementation of a queue
let imagePaths: string[] = [];
let originalPath = "";
let undoQueue = new UndoQueue();

async function rotateHue(path: string) {
  console.log("About to rotate hue on path ", path);
  const amount = 155;
  const pathSplit = path.split(".");
  const newPath: string = await invoke("rotate_hue", {
    path: path,
    pathBase: pathSplit[0],
    pathEnd: pathSplit[1],
    amount: amount,
  });
  const imageEl = document.querySelector("#image");
  imageEl?.setAttribute("src", convertFileSrc(newPath));
  console.log("newPath after rotating hue is ", newPath);
  // imagePath = newPath;
  // imagePaths.push(newPath);
  undoQueue.push(newPath);
  const undoBtn = document.querySelector("#undo-button");
  undoBtn?.removeAttribute("disabled");
  // const filePath = await save({
  //   filters: [
  //     {
  //       name: "Image",
  //       extensions: ["png", "jpeg"],
  //     },
  //   ],
  // });
}

function undo() {
  undoQueue.popBack();
  let lastImage = undoQueue.getLast();
  const imageEl = document.querySelector("#image");
  imageEl?.setAttribute("src", convertFileSrc(lastImage));
  if (undoQueue.getLength() === 1) {
    const undoBtn = document.querySelector("#undo-button");
    undoBtn?.setAttribute("disabled", "true");
  }
}

function deleteFile() {
  undoQueue.popBack();
  // invoke("delete_file", { path });
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
  /* show open file dialog */
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
    const imageEl = document.querySelector("#image");
    const undoBtn = document.querySelector("#undo-button");
    // imagePath = selected;
    imagePaths = [];
    undoBtn?.setAttribute("disabled", "true");
    // TODO: tell Rust to dump all of the temporary images whose paths are in the array
    originalPath = selected;
    imagePaths.push(selected);
    undoQueue.push(selected);
    imageEl?.setAttribute("src", convertFileSrc(imagePaths[0]));
  }
  // console.log(selected);
}

window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#image-button")
    ?.addEventListener("click", () => openFile());
  document
    .querySelector("#huerotate-button")
    ?.addEventListener("click", () => rotateHue(undoQueue.getLast()));
  document
    .querySelector("#undo-button")
    ?.addEventListener("click", () => undo());
  document
    .querySelector("#save-button")
    ?.addEventListener("click", () => saveFile());
});
