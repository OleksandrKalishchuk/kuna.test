class IncrementalMap<K, V> {
  private map = new Map<K, V>();

  private snap = new Map<K, V>();
  private snapshots: Map<K, V>[] = [this.snap];
  private snapIndex = 0;

  set(key: K, value: V): void {
    const valueClone = this.copy(value);
    this.map.set(key, valueClone);
    this.snap.set(key, valueClone);
  }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  snapshot(snapIndex: number): void {
    if (snapIndex === this.snapIndex) {
      return;
    }

    if (this.snapshots[snapIndex]) {
      this.loadSnapshot(snapIndex);
      return;
    }

    this.saveSnapshot(snapIndex);
  }

  saveSnapshot(snapIndex: number): void {
    this.snap = new Map<K, V>();
    this.snapshots[snapIndex] = this.snap;
    this.snapIndex = snapIndex;
  }

  loadSnapshot(snapIndex: number): void {
    this.snap = this.snapshots[snapIndex];
    this.map = new Map<K, V>(this.snap);
    this.snapshots = this.snapshots.slice(0, snapIndex);

    const rollback = this.snapshots.reverse();
    for (const snapshot of rollback) {
      snapshot.forEach((value, key): void => {
        if (!this.map.has(key)) {
          this.map.set(key, value);
        }
      });
    }
  }

  copy(value: any): any {
    const copyProperties = <T = { [prop: string]: any }>(original: T): T => {
      const clone = {} as T;
      for (let key in original) {
        clone[key] = this.copy(original[key]);
      }
      return clone;
    };

    if (Array.isArray(value)) {
      return value.map((item) => this.copy(item));
    }

    if (value instanceof Map) {
      let clone = new Map();
      for (const [key, val] of value) {
        clone.set(key, this.copy(val));
      }
      return clone;
    }

    if (value instanceof Set) {
      let clone = new Set();
      for (let item of value) {
        clone.add(this.copy(item));
      }
      return clone;
    }

    if (typeof value === 'function') {
      const clone = value.bind(this);
      copyProperties(clone);
      return clone;
    }

    if (typeof value === 'object') {
      return copyProperties(value);
    }

    return value;
  }
}

const map = new IncrementalMap();

map.snapshot(0);

map.set('key', 10);
console.log(map.get('key'));

map.snapshot(1);

map.set('key', 20);
console.log(map.get('key'));

map.snapshot(0);
console.log(map.get('key'));
