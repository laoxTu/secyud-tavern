interface Action {
  execute: () => Promise<void>;
  reject: (err: any) => void;
  resolve: (res: any) => void;
}

// 一个简单的锁，适用于单线程
export class Mutex {
  queue: Action[] = [];
  current: Action | undefined;

  private async run() {
    this.current = this.queue.shift();
    while (this.current) {
      try {
        await this.current.execute();
        this.current.resolve('success');
      } catch (err) {
        this.current.reject(err);
      }
      this.current = this.queue.shift();
    }
  }
  lock(action: () => Promise<void>) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        execute: action,
        resolve,
        reject,
      });
      if (!this.current) this.run();
    });
  }
}
