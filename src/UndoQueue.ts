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
    if (this.length >= 1) {
      let prevHead = this.head.toString();
      this.head++;
      invoke("delete_file", { path: this.data[prevHead as keyof Image] });
      delete this.data[prevHead as keyof Image];
      this.length--;
    }
    console.log(this);
  }

  popBack() {
    if (this.length >= 1) {
      let prevTail = this.tail.toString();
      this.tail--;
      this.index--;
      this.length--;
      invoke("delete_file", { path: this.data[prevTail as keyof Image] });
      delete this.data[prevTail as keyof Image];
    }
    console.log(this);
  }

  getLast() {
    if (this.length >= 1) {
      let tailIndex = this.tail.toString();
      return this.data[tailIndex as keyof Image] || "";
    } else {
      return null;
    }
  }

  getLength() {
    return this.length;
  }

  clear() {
    for (let image in this.data) {
      invoke("delete_file", { path: this.data[image as keyof Image] });
    }
    this.data = {} as Image;
    this.head = 0;
    this.tail = 0;
    this.index = 0;
    this.length = 0;
  }
}

export default UndoQueue;
