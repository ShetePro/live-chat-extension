import { SearchType } from "../content/searchBox";
import { setConfig } from "../utils/util";

export class BasicIndexDb {
  constructor() {
    this.indexDb = null;
    this.objectStoreNames = "message";
    this.idIndex = "";
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
        // 开启自动清除逻辑
        if (requestIdleCallback) {
          requestIdleCallback(() => {
            this.autoClearStrategy();
          });
        } else {
          setTimeout(() => {
            this.autoClearStrategy();
          });
        }
        resolve(this.indexDb);
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
        this.createIndex(objectStore, "listType", ["siteType", "liveId"], {
          unique: false,
        });
        this.createIndex(objectStore, "createTime", ["timestamp"], {
          unique: false,
        });
      };
    });
  }
  createIndex(objectStore, name, keyPath, option) {
    // 创建索引，如果不存在的话
    if (!objectStore.indexNames.contains(name)) {
      objectStore.createIndex(name, keyPath, option);
    }
  }
  getObjectStore() {
    return this.indexDb
      ?.transaction(this.objectStoreNames, "readwrite")
      .objectStore(this.objectStoreNames);
  }
  // 判断该条消息是否存在
  has(item) {}
  push(item) {
    return new Promise((resolve, reject) => {
      try {
        const objectStore = this.getObjectStore();
        const request = objectStore.add(item);
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        request.onerror = (event) => {
          reject(event);
        };
      } catch (e) {
        if (e.name === "QuotaExceededError") {
          // 处理存储空间不足的情况，例如删除旧数据或提示用户
          console.error("Storage limit exceeded! Cannot add more data.");
          setConfig({ QuotaExceededError: true });
        } else {
          console.error("Unexpected error:", e);
        }
      }
    });
  }

  getPageBySiteType({
    pageIndex,
    pageSize,
    siteType,
    liveId = "",
    text = "",
    type = SearchType.message,
  }) {
    return new Promise((resolve, reject) => {
      let keyRange = IDBKeyRange.only([siteType, liveId]);
      const objectStore = this.getObjectStore();
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
      let skipCount = (pageIndex - 1) * pageSize;
      request.onsuccess = function (e) {
        let cursor = event.target.result;
        if (cursor) {
          const { value } = cursor;
          const content = type === SearchType.message ? value.text : value.user;
          if (content.indexOf(text) >= 0) {
            if (skipCount > 0) {
              // 如果需要跳过当前记录，减少 skipCount 并继续
              skipCount--;
              count++;
            }
            if (count >= start && count < end) {
              result.push(cursor.value);
              count++;
            }
            if (count < end) {
              cursor.continue();
            } else {
              resolve(result);
            }
          } else {
            cursor.continue();
          }
        } else {
          resolve(result);
        }
      };
    });
  }
  autoClearStrategy() {
    const objectStore = this.getObjectStore();
    const index = objectStore.index("createTime");
    // 获取当前时间戳
    const currentTime = Date.now();
    // 计算24小时之前的时间戳
    const timeThreshold = currentTime - 24 * 60 * 60 * 1000;
    // 定义删除范围
    const keyRange = IDBKeyRange.upperBound([timeThreshold]);
    const cursorRequest = index.openCursor(keyRange);
    cursorRequest.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue(); // 继续到下一个记录
      }
    };

    cursorRequest.onerror = function (event) {
      console.error("Cursor error:", event.target.error);
    };
  }
  clearBySearch({ liveId, siteType }) {
    const db = this.indexDb;
    let keyRange = IDBKeyRange.only([siteType, liveId]);
    // 开启一个读写事务
    const objectStore = this.getObjectStore();
    let index = objectStore.index("listType"); //索引的意义在于，可以让你搜索任意字段，也就是说从任意字段拿到数据记录
    let request = index.openCursor(keyRange);
    request.onsuccess = function (e) {
      let cursor = event.target.result;
      cursor?.delete();
    };
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
