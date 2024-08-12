export class BasicIndexDb {
  constructor() {
    this.objectStoreNames = "message";
  }
  init() {
    return new Promise((resolve, reject) => {
      this.request = window.indexedDB.open("LiveChatExtension", 7);
      this.request.onerror = (event) => {
        console.error("为什么不允许我的 web 应用使用 IndexedDB！");
        reject(event);
      };
      this.request.onsuccess = (event) => {
        this.indexDb = event.target.result;
        resolve(this.indexDb);
        console.log(this.indexDb, "indexDb");
      };
      this.request.onupgradeneeded = (event) => {
        const db = event.target.result;
        let objectStore;
        if (!db.objectStoreNames.contains(this.objectStoreNames)) {
          objectStore = db.createObjectStore(this.objectStoreNames, {
            keyPath: "id",
            autoIncrement: true,
          });
        } else {
          objectStore = event.target.transaction.objectStore(
            this.objectStoreNames,
          );
        }
        // 创建索引，如果不存在的话
        if (!objectStore.indexNames.contains("listType")) {
          objectStore.createIndex("listType", ["siteType", "liveId"], {
            unique: false,
          });
        }
      };
    });
  }
  push(item) {
    return new Promise((resolve, reject) => {
      const request = this.indexDb
        .transaction(this.objectStoreNames, "readwrite")
        .objectStore(this.objectStoreNames)
        .add(item);
      request.onsuccess = (event) => {
        resolve(event.target.result);
        console.log(item, "push");
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  }

  getPageBySiteType({
    pageIndex,
    pageSize,
    siteType,
    liveId = "5194110",
    text = "",
  }) {
    return new Promise((resolve, reject) => {
      let keyRange = IDBKeyRange.only([siteType, liveId]);
      let transaction = this.indexDb.transaction(this.objectStoreNames);
      let objectStore = transaction.objectStore(this.objectStoreNames);
      let index = objectStore.index("listType"); //索引的意义在于，可以让你搜索任意字段，也就是说从任意字段拿到数据记录
      let request = index.openCursor(keyRange);

      request.onerror = function (event) {
        console.log("readSourceLibRecord 事务失败");
        reject(event);
      };
      const result = [];
      const start = (pageIndex - 1) * pageSize;
      const end = pageIndex * pageSize;
      let count = 0;
      request.onsuccess = function (e) {
        let cursor = event.target.result;
        if (cursor) {
          if (count >= start && count < end) {
            const { value } = cursor;
            if (value.text.indexOf(text) >= 0) {
              result.push(cursor.value);
              count++;
            }
          }
          if (count < end) {
            cursor.continue();
          } else {
            resolve(result);
          }
        } else {
          resolve(result);
        }
      };
    });
  }
  clear() {
    // 获取所有对象存储的名称
    const objectStoreNames = Array.from(this.indexDb.objectStoreNames);
    // 开启事务并删除所有对象存储的数据
    objectStoreNames.forEach((storeName) => {
      const transaction = this.indexDb.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);

      const clearRequest = objectStore.clear();

      clearRequest.onsuccess = function () {
        console.log(`清理数据库: ${storeName}`);
      };

      clearRequest.onerror = function (event) {
        console.error(`数据库清理失败: ${storeName}`, event);
      };
    });
  }
}
