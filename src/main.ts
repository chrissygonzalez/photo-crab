import { invoke, convertFileSrc } from "@tauri-apps/api/tauri";
import { open, save } from "@tauri-apps/api/dialog";

// let greetInputEl: HTMLInputElement | null;
// let greetMsgEl: HTMLElement | null;
let imagePath = "";
// let image: HTMLImageElement | null;

// async function greet() {
//   if (greetMsgEl && greetInputEl) {
//     // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
//     greetMsgEl.textContent = await invoke("greet", {
//       name: greetInputEl.value,
//     });
//   }
// }

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
  imagePath = newPath; // does not work
  // const filePath = await save({
  //   filters: [
  //     {
  //       name: "Image",
  //       extensions: ["png", "jpeg"],
  //     },
  //   ],
  // });
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
    imagePath = selected;
    imageEl?.setAttribute("src", convertFileSrc(imagePath));
  }
  console.log(selected);
}

window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#image-button")
    ?.addEventListener("click", () => openFile());
  document
    .querySelector("#huerotate-button")
    ?.addEventListener("click", () => rotateHue(imagePath));
});
