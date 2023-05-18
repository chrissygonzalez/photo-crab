import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";
import { open, save } from "@tauri-apps/api/dialog";

// TODO: replace this array with an implementation of a queue
let imagePaths: string[] = [];
// let imagePath = "";

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
  imagePaths.push(newPath);
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
  let lastImage = imagePaths.pop();
  if (lastImage) {
    deleteFile(lastImage);
  }
  const imageEl = document.querySelector("#image");
  imageEl?.setAttribute(
    "src",
    convertFileSrc(imagePaths[imagePaths.length - 1])
  );
  if (imagePaths.length === 1) {
    const undoBtn = document.querySelector("#undo-button");
    undoBtn?.setAttribute("disabled", "true");
  }
}

function deleteFile(path: string) {
  invoke("delete_file", { path });
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
    imagePaths.push(selected);
    imageEl?.setAttribute("src", convertFileSrc(imagePaths[0]));
  }
  console.log(selected);
}

window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#image-button")
    ?.addEventListener("click", () => openFile());
  document
    .querySelector("#huerotate-button")
    ?.addEventListener("click", () =>
      rotateHue(imagePaths[imagePaths.length - 1])
    );
  document
    .querySelector("#undo-button")
    ?.addEventListener("click", () => undo());
});
