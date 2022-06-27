const task = async <T>(value: T) => {
  if (typeof value === 'string') {
    throw new Error(`${value}`);
  }

  await new Promise((r) => setTimeout(r, 100 * Math.random()));
  console.log(value);
};

type AsyncQueueTask = () => Promise<void>;

class AsyncQueue {
  private queue: AsyncQueueTask[] = [];
  private isPending = false;

  add(task: AsyncQueueTask): Promise<void> {
    return new Promise(() => {
      this.queue.push(task);
      this.run();
    });
  }

  run() {
    if (this.isPending) {
      return false;
    }

    const item = this.queue.shift();
    if (!item) {
      return false;
    }

    this.isPending = true;

    item()
      .catch(console.log)
      .then(() => {
        this.isPending = false;
        this.run();
      });
  }
}

const queue = new AsyncQueue();
Promise.all([
  queue.add(() => task(1)),
  queue.add(() => task(2)),
  queue.add(() => task(3)),
  queue.add(() => task('Error handling test')),
  queue.add(() => task(4)),
]);
