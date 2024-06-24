export class BasicIndexDb {
  constructor() {
  
  }
  init () {
    return new Promise((resolve, reject) => {
      this.request = window.indexedDB.open("LiveChatExtension", 7);
      this.request.onerror = (event) => {
        console.error("为什么不允许我的 web 应用使用 IndexedDB！");
        reject(event)
      };
      this.request.onsuccess = (event) => {
        this.indexDb = event.target.result;
        resolve(this.indexDb)
        console.log(this.indexDb, 'indexDb')
      };
      this.request.onupgradeneeded = (event) => {
        const db = event.target.result;
        let objectStore;
        if (!db.objectStoreNames.contains("message")) {
          objectStore = db.createObjectStore("message", { keyPath: "id", autoIncrement: true });
        } else {
          objectStore = event.target.transaction.objectStore("message");
        }
        // 创建索引，如果不存在的话
        if (!objectStore.indexNames.contains("listType")) {
          objectStore.createIndex("listType", ["siteType", 'liveId'], { unique: false });
        }
      };
    })
  }
  push (item) {
    return new Promise((resolve, reject) => {
      const request = this.indexDb.transaction('message', 'readwrite').objectStore('message').add(item)
      request.onsuccess = (event) => {
        resolve(event.target.result)
        console.log(item, 'push')
      }
      request.onerror = (event) => {
        reject(event)
      }
    })
  }
  
  getPageBySiteType ({pageIndex, pageSize, siteType, liveId = "5194110"}) {
    return new Promise((resolve, reject) => {
      let keyRange = IDBKeyRange.only([siteType, liveId]);
      let transaction = this.indexDb.transaction('message');
      let objectStore = transaction.objectStore('message');
      let index = objectStore.index('listType'); //索引的意义在于，可以让你搜索任意字段，也就是说从任意字段拿到数据记录
      let request = index.openCursor(keyRange);
      
      request.onerror = function(event) {
        console.log('readSourceLibRecord 事务失败');
        reject(event);
      };
      const result = []
      const start = (pageIndex - 1) * pageSize
      const end = pageIndex * pageSize
      let count = 0
      request.onsuccess = function(e) {
        let cursor = event.target.result;
        console.log(cursor)
        if (cursor) {
          if (count >= start && count < end) {
            result.push(cursor.value);
          }
          count++;
          if (count < end) {
            cursor.continue();
          }else {
            resolve(result)
          }
        } else {
          console.log('readSourceLibRecord 未获得数据记录');
          resolve(null);
        }
      };
    });
  }
}
