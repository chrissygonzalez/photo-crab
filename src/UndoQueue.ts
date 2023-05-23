import { invoke } from "@tauri-apps/api/tauri";

type Image = { path?: string };

class UndoQueue {
  data: Image;
  head: number;
  tail: number;
  index: number;
  length: number;

  constructor() {
    this.data = {} as Image;
    this.head = 0;
    this.tail = 0;
    this.index = 0;
    this.length = 0;
    console.log("called constructor!", this);
  }

  push(item: string) {
    let newIndex = this.index.toString();
    this.data[newIndex as keyof Image] = item;
    this.tail = this.index;
    this.length++;
    this.index++;
    while (this.length >= 10) {
      this.pop();
    }
    console.log(this);
  }

  pop() {
    let prevHead = this.head.toString();
    this.head++;
    invoke("delete_file", { path: this.data[prevHead as keyof Image] });
    delete this.data[prevHead as keyof Image];
    this.length--;
    console.log(this);
  }

  popBack() {
    let prevTail = this.tail.toString();
    this.tail--;
    this.index--;
    this.length--;
    invoke("delete_file", { path: this.data[prevTail as keyof Image] });
    delete this.data[prevTail as keyof Image];
    console.log(this);
  }

  getLast() {
    let tailIndex = this.tail.toString();
    return this.data[tailIndex as keyof Image] || "";
  }

  getLength() {
    return this.length;
  }

  clear() {
    // delete all images in rust, reset to constructor values
  }
}

export default UndoQueue;
